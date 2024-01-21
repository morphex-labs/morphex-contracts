// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/IGlpManager.sol";
import "../access/Governable.sol";

/**
 * @title RewardRouterV4
 * @dev Implements reward handling for staking and providing liquidity.
 */
contract RewardRouterV4 is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;
    address public bmx;
    address public opBmx; // option-BMX or oBMX
    address public bnBmx; // multiplier points
    address public blt; // BMX Liquidity Provider token

    address public stakedBmxTracker;
    address public bonusBmxTracker;
    address public feeBmxTracker;
    address public stakedBltTracker;
    address public feeBltTracker;

    address public bltManager;

    // Keeping original event names so subgraphs don't need to be updated
    event StakeGmx(address account, address token, uint256 amount);
    event UnstakeGmx(address account, address token, uint256 amount);
    event StakeGlp(address account, uint256 amount);
    event UnstakeGlp(address account, uint256 amount);

    /**
     * @notice Handles receiving ETH directly to the contract.
     * Reverts if the sender is not the wETH contract.
     */
    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    /**
     * @notice Initializes the contract with provided addresses.
     * Can only be called once by governance.
     * @param _weth Address of the Wrapped ETH token.
     * @param _bmx Address of the BMX token.
     * @param _opBmx Address of the option-BMX token.
     * @param _bnBmx Address of the multiplier points token.
     * @param _blt Address of the BMX Liquidity Provider token.
     * @param _stakedBmxTracker Address of the staked BMX tracker contract.
     * @param _bonusBmxTracker Address of the bonus BMX tracker contract.
     * @param _feeBmxTracker Address of the fee BMX tracker contract.
     * @param _feeBltTracker Address of the fee BLT tracker contract.
     * @param _stakedBltTracker Address of the staked BLT tracker contract.
     * @param _bltManager Address of the BLT manager contract.
     */
    function initialize(
        address _weth,
        address _bmx,
        address _opBmx,
        address _bnBmx,
        address _blt,
        address _stakedBmxTracker,
        address _bonusBmxTracker,
        address _feeBmxTracker,
        address _feeBltTracker,
        address _stakedBltTracker,
        address _bltManager
    ) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = _weth;
        bmx = _bmx;
        opBmx = _opBmx;
        bnBmx = _bnBmx;
        blt = _blt;

        stakedBmxTracker = _stakedBmxTracker;
        bonusBmxTracker = _bonusBmxTracker;
        feeBmxTracker = _feeBmxTracker;
        feeBltTracker = _feeBltTracker;
        stakedBltTracker = _stakedBltTracker;

        bltManager = _bltManager;
    }

    /**
     * @notice Allows governance to withdraw tokens sent to this contract.
     * Example: To help users who accidentally send their tokens to this contract
     * @param _token The address of the token to withdraw.
     * @param _account The address to send the token to.
     * @param _amount The amount of tokens to withdraw.
     */
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    /**
     * @notice Stakes BMX for multiple accounts.
     * @dev This function allows batch staking of BMX for different accounts. Can only be called by governance.
     * @param _accounts Array of addresses for which BMX tokens are to be staked.
     * @param _amounts Array of amounts of BMX tokens to be staked for each corresponding account in `_accounts`.
     */
    function batchStakeBmxForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _bmx = bmx;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeBmx(msg.sender, _accounts[i], _bmx, _amounts[i]);
        }
    }

    /**
     * @notice Stakes BMX on behalf of a specified account.
     * @dev This function allows governance to stake BMX for a specified account. Can only be called by governance.
     * @param _account The address of the account for which BMX tokens are to be staked.
     * @param _amount The amount of BMX tokens to stake.
     */
    function stakeBmxForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeBmx(msg.sender, _account, bmx, _amount);
    }

    /**
     * @notice Allows a user to stake their BMX.
     * @dev This function lets an account stake BMX tokens for itself.
     * Calls `_stakeBmx` internally.
     * @param _amount The amount of BMX tokens the user wishes to stake.
     */
    function stakeBmx(uint256 _amount) external nonReentrant {
        _stakeBmx(msg.sender, msg.sender, bmx, _amount);
    }

    /**
     * @notice Allows a user to unstake their BMX.
     * @dev This function lets an account unstake BMX tokens that it has previously staked.
     * Calls `_unstakeBmx` internally.
     * @param _amount The amount of BMX tokens the user wishes to unstake.
     */
    function unstakeBmx(uint256 _amount) external nonReentrant {
        _unstakeBmx(msg.sender, bmx, _amount, true);
    }

    /**
     * @notice Mints and stakes BLT.
     * @dev Allows a user to mint BLT using an underlying token and then stakes the resulting BLT.
     * @param _token The address of the token to be used for minting BLT.
     * @param _amount The amount of the token to mint BLT with.
     * @param _minUsd The minimum USD value expected to receive.
     * @param _minBlt The minimum BLT tokens expected to receive.
     * @return bltAmount The amount of BLT tokens staked.
     */
    function mintAndStakeBlt(address _token, uint256 _amount, uint256 _minUsd, uint256 _minBlt) external nonReentrant returns (uint256) {
        require(_amount > 0, "RewardRouter: invalid _amount");

        address account = msg.sender;
        uint256 bltAmount = IGlpManager(bltManager).addLiquidityForAccount(account, account, _token, _amount, _minUsd, _minBlt);
        IRewardTracker(feeBltTracker).stakeForAccount(account, account, blt, bltAmount);
        IRewardTracker(stakedBltTracker).stakeForAccount(account, account, feeBltTracker, bltAmount);

        emit StakeGlp(account, bltAmount);

        return bltAmount;
    }

    /**
     * @notice Mints and stakes BLT with ETH.
     * @dev Allows a user to mint BLT with ETH and then stakes the resulting BLT.
     * @param _minUsd The minimum USD value expected to receive.
     * @param _minBlt The minimum BLT tokens expected to receive.
     * @return bltAmount The amount of BLT tokens staked.
     */
    function mintAndStakeBltETH(uint256 _minUsd, uint256 _minBlt) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "RewardRouter: invalid msg.value");

        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(bltManager, msg.value);

        address account = msg.sender;
        uint256 bltAmount = IGlpManager(bltManager).addLiquidityForAccount(address(this), account, weth, msg.value, _minUsd, _minBlt);

        IRewardTracker(feeBltTracker).stakeForAccount(account, account, blt, bltAmount);
        IRewardTracker(stakedBltTracker).stakeForAccount(account, account, feeBltTracker, bltAmount);

        emit StakeGlp(account, bltAmount);

        return bltAmount;
    }

    /**
     * @notice Unstakes and redeems BLT for an underlying token.
     * @dev Allows a user to unstake BLT tokens and redeem them for an underlying token.
     * @param _tokenOut The address of the underlying token to receive.
     * @param _bltAmount The amount of BLT tokens to unstake and redeem.
     * @param _minOut The minimum amount of the underlying token expected to receive.
     * @param _receiver The address that will receive the underlying tokens.
     * @return amountOut The amount of the underlying tokens received.
     */
    function unstakeAndRedeemBlt(address _tokenOut, uint256 _bltAmount, uint256 _minOut, address _receiver) external nonReentrant returns (uint256) {
        require(_bltAmount > 0, "RewardRouter: invalid _bltAmount");

        address account = msg.sender;
        IRewardTracker(stakedBltTracker).unstakeForAccount(account, feeBltTracker, _bltAmount, account);
        IRewardTracker(feeBltTracker).unstakeForAccount(account, blt, _bltAmount, account);
        uint256 amountOut = IGlpManager(bltManager).removeLiquidityForAccount(account, _tokenOut, _bltAmount, _minOut, _receiver);

        emit UnstakeGlp(account, _bltAmount);

        return amountOut;
    }

    /**
     * @notice Unstakes and redeems BLT for ETH.
     * @dev Allows a user to unstake BLT tokens and redeem them for ETH.
     * @param _bltAmount The amount of BLT tokens to unstake and redeem.
     * @param _minOut The minimum amount of ETH expected to receive.
     * @param _receiver The address that will receive the ETH.
     * @return amountOut The amount of ETH received.
     */
    function unstakeAndRedeemBltETH(uint256 _bltAmount, uint256 _minOut, address payable _receiver) external nonReentrant returns (uint256) {
        require(_bltAmount > 0, "RewardRouter: invalid _bltAmount");

        address account = msg.sender;
        IRewardTracker(stakedBltTracker).unstakeForAccount(account, feeBltTracker, _bltAmount, account);
        IRewardTracker(feeBltTracker).unstakeForAccount(account, blt, _bltAmount, account);
        uint256 amountOut = IGlpManager(bltManager).removeLiquidityForAccount(account, weth, _bltAmount, _minOut, address(this));

        IWETH(weth).withdraw(amountOut);

        _receiver.sendValue(amountOut);

        emit UnstakeGlp(account, _bltAmount);

        return amountOut;
    }

    /**
     * @notice Claims wETH and oBMX rewards from staking BMX and/or BLT.
     * @dev This function allows a user to claim their rewards from all staked (oBMX) and fee (wETH) reward trackers.
     */
    function claim() external nonReentrant {
        address account = msg.sender;

        // Claim wETH
        IRewardTracker(feeBmxTracker).claimForAccount(account, account);
        IRewardTracker(feeBltTracker).claimForAccount(account, account);

        // Claim oBMX
        IRewardTracker(stakedBmxTracker).claimForAccount(account, account);
        IRewardTracker(stakedBltTracker).claimForAccount(account, account);
    }

    /**
     * @notice Claims oBMX rewards from staking BMX and/or BLT.
     * @dev This function allows a user to claim their rewards from all staked reward trackers.
     */
    function claimOpBmx() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedBmxTracker).claimForAccount(account, account);
        IRewardTracker(stakedBltTracker).claimForAccount(account, account);
    }

    /**
     * @notice Claims wETH rewards from staking BMX and/or BLT.
     * @dev This function allows a user to claim their rewards from all fee reward trackers.
     */
    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeBmxTracker).claimForAccount(account, account);
        IRewardTracker(feeBltTracker).claimForAccount(account, account);
    }

    /**
     * @notice Handles various reward claims based on the provided params.
     * @dev This function provides a consolidated way to handle multiple actions like claiming oBMX, staking multiplier points, claiming wETH, and converting wETH to ETH.
     * @param _shouldClaimOpBmx If oBMX rewards should be claimed.
     * @param _shouldStakeMultiplierPoints If multiplier points should be staked.
     * @param _shouldClaimWeth If wETH rewards should be claimed.
     * @param _shouldConvertWethToEth If claimed wETH should be converted to ETH.
     */
    function handleRewards(
        bool _shouldClaimOpBmx,
        bool _shouldStakeMultiplierPoints,
        bool _shouldClaimWeth,
        bool _shouldConvertWethToEth
    ) external nonReentrant {
        address account = msg.sender;

        if (_shouldClaimOpBmx) {
            IRewardTracker(stakedBmxTracker).claimForAccount(account, account);
            IRewardTracker(stakedBltTracker).claimForAccount(account, account);
        }
        if (_shouldStakeMultiplierPoints) {
            uint256 bnBmxAmount = IRewardTracker(bonusBmxTracker).claimForAccount(account, account);
            if (bnBmxAmount > 0) {
                IRewardTracker(feeBmxTracker).stakeForAccount(account, account, bnBmx, bnBmxAmount);
            }
        }
        if (_shouldClaimWeth) {
            if (_shouldConvertWethToEth) {
                uint256 weth0 = IRewardTracker(feeBmxTracker).claimForAccount(account, address(this));
                uint256 weth1 = IRewardTracker(feeBltTracker).claimForAccount(account, address(this));

                uint256 wethAmount = weth0.add(weth1);
                IWETH(weth).withdraw(wethAmount);

                payable(account).sendValue(wethAmount);
            } else {
                IRewardTracker(feeBmxTracker).claimForAccount(account, account);
                IRewardTracker(feeBltTracker).claimForAccount(account, account);
            }
        }
    }

    // Internal functions to stake and unstake BMX

    function _stakeBmx(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedBmxTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusBmxTracker).stakeForAccount(_account, _account, stakedBmxTracker, _amount);
        IRewardTracker(feeBmxTracker).stakeForAccount(_account, _account, bonusBmxTracker, _amount);

        emit StakeGmx(_account, _token, _amount);
    }

    function _unstakeBmx(address _account, address _token, uint256 _amount, bool _shouldReduceBnBmx) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedBmxTracker).stakedAmounts(_account);

        IRewardTracker(feeBmxTracker).unstakeForAccount(_account, bonusBmxTracker, _amount, _account);
        IRewardTracker(bonusBmxTracker).unstakeForAccount(_account, stakedBmxTracker, _amount, _account);
        IRewardTracker(stakedBmxTracker).unstakeForAccount(_account, _token, _amount, _account);

        if (_shouldReduceBnBmx) {
            uint256 bnBmxAmount = IRewardTracker(bonusBmxTracker).claimForAccount(_account, _account);
            if (bnBmxAmount > 0) {
                IRewardTracker(feeBmxTracker).stakeForAccount(_account, _account, bnBmx, bnBmxAmount);
            }

            uint256 stakedBnBmx = IRewardTracker(feeBmxTracker).depositBalances(_account, bnBmx);
            if (stakedBnBmx > 0) {
                uint256 reductionAmount = stakedBnBmx.mul(_amount).div(balance);
                IRewardTracker(feeBmxTracker).unstakeForAccount(_account, bnBmx, reductionAmount, _account);
                IMintable(bnBmx).burn(_account, reductionAmount);
            }
        }

        emit UnstakeGmx(_account, _token, _amount);
    }
}
