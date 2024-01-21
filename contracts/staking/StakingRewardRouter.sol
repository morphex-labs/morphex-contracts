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
import "../access/Governable.sol";

contract StakingRewardRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;
    address public bmx;
    address public opBmx;
    address public bnBmx;

    address public stakedBmxTracker;
    address public bonusBmxTracker;
    address public feeBmxTracker;

    event StakeBmx(address account, address token, uint256 amount);
    event UnstakeBmx(address account, address token, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    function initialize(
        address _weth,
        address _bmx,
        address _opBmx,
        address _bnBmx,
        address _stakedBmxTracker,
        address _bonusBmxTracker,
        address _feeBmxTracker
    ) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = _weth;
        bmx = _bmx;
        opBmx = _opBmx;
        bnBmx = _bnBmx;

        stakedBmxTracker = _stakedBmxTracker;
        bonusBmxTracker = _bonusBmxTracker;
        feeBmxTracker = _feeBmxTracker;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    function batchStakeBmxForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _bmx = bmx;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeBmx(msg.sender, _accounts[i], _bmx, _amounts[i]);
        }
    }

    function stakeBmxForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeBmx(msg.sender, _account, bmx, _amount);
    }

    function stakeBmx(uint256 _amount) external nonReentrant {
        _stakeBmx(msg.sender, msg.sender, bmx, _amount);
    }

    function unstakeBmx(uint256 _amount) external nonReentrant {
        _unstakeBmx(msg.sender, bmx, _amount, true);
    }

    function claim() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeBmxTracker).claimForAccount(account, account);
        IRewardTracker(stakedBmxTracker).claimForAccount(account, account);
    }

    function claimOpBmx() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedBmxTracker).claimForAccount(account, account);
    }

    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeBmxTracker).claimForAccount(account, account);
    }

    function compound() external nonReentrant {
        _compound(msg.sender);
    }

    function compoundForAccount(address _account) external nonReentrant onlyGov {
        _compound(_account);
    }

    function handleRewards(
        bool _shouldClaimOpBmx,
        bool _shouldStakeMultiplierPoints,
        bool _shouldClaimWeth,
        bool _shouldConvertWethToEth
    ) external nonReentrant {
        address account = msg.sender;

        uint256 opBmxAmount = 0;
        if (_shouldClaimOpBmx) {
            opBmxAmount = IRewardTracker(stakedBmxTracker).claimForAccount(account, account);
        }

        if (_shouldStakeMultiplierPoints) {
            uint256 bnBmxAmount = IRewardTracker(bonusBmxTracker).claimForAccount(account, account);
            if (bnBmxAmount > 0) {
                IRewardTracker(feeBmxTracker).stakeForAccount(account, account, bnBmx, bnBmxAmount);
            }
        }

        if (_shouldClaimWeth) {
            if (_shouldConvertWethToEth) {
                uint256 wethAmount = IRewardTracker(feeBmxTracker).claimForAccount(account, address(this));

                IWETH(weth).withdraw(wethAmount);

                payable(account).sendValue(wethAmount);
            } else {
                IRewardTracker(feeBmxTracker).claimForAccount(account, account);
            }
        }
    }

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
    }

    function _compound(address _account) private {
        uint256 opBmxAmount = IRewardTracker(stakedBmxTracker).claimForAccount(_account, _account);
        if (opBmxAmount > 0) {
            _stakeBmx(_account, _account, opBmx, opBmxAmount);
        }

        uint256 bnBmxAmount = IRewardTracker(bonusBmxTracker).claimForAccount(_account, _account);
        if (bnBmxAmount > 0) {
            IRewardTracker(feeBmxTracker).stakeForAccount(_account, _account, bnBmx, bnBmxAmount);
        }
    }

    function _stakeBmx(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedBmxTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusBmxTracker).stakeForAccount(_account, _account, stakedBmxTracker, _amount);
        IRewardTracker(feeBmxTracker).stakeForAccount(_account, _account, bonusBmxTracker, _amount);

        emit StakeBmx(_account, _token, _amount);
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

        emit UnstakeBmx(_account, _token, _amount);
    }
}
