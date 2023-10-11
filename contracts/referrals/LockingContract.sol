// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import '../libraries/token/MORPHSafeERC20.sol';
import '../libraries/utils/ReentrancyGuard.sol';
// import '../libraries/utils/Address.sol';
// import '../libraries/math/SafeMath.sol';
import './interfaces/IReferralStorage.sol';

contract LockingContract is ReentrancyGuard {
    using MORPHSafeERC20 for MORPHIERC20;
    using SafeMath for uint256;
    using Address for address;

    struct Tranche {
        uint256 depositedUsers; // Total amount of users who locked
        uint256 requiredLockAmount;
        uint256 capacity; // How many users can lock
        uint256 lockDuration;
        bool depositEnabled; // Governance-controlled switch
        bytes32 masterCode; // Referral code specifically created for use by this contract
    }

    MORPHIERC20 public bmx;

    address public gov;
    address public referralStorage;
    
    mapping(uint256 => mapping(address => bool)) public userDeposited;
    mapping(uint256 => mapping(address => uint256)) public userLockEndTime;
    mapping(uint256 => Tranche) public tranches;

    event Deposited(address user, uint256 tranche);
    event Withdrawn(address user, uint256 tranche);
    event SetDepositState(bool depositEnabled, uint256 tranche);
    event SetGov(address gov);
    event SetTranche(
        uint256 id,
        uint256 requiredLockAmount,
        uint256 capacity,
        uint256 lockDuration,
        bool depositEnabled,
        bytes32 masterCode
    );
    
    constructor(address _bmx, address _gov, address _referralStorage) public {
        require(_bmx != address(0), "Invalid BMX address");
        require(_gov != address(0), "Invalid gov address");
        require(_referralStorage != address(0), "Invalid storage address");

        bmx = MORPHIERC20(_bmx);
        gov = _gov;
        referralStorage = _referralStorage;
    }

    receive() external payable {
        revert();
    }

    function deposit(uint256 _tranche) external nonReentrant {
        require(userDeposited[_tranche][msg.sender] == false, "Already locked");

        Tranche storage tranche = tranches[_tranche];

        require(tranche.depositEnabled , "Locking is disabled");
        require(tranche.depositedUsers < tranche.capacity, "Tranche capacity is full");
        require(bmx.balanceOf(msg.sender) >= tranche.requiredLockAmount, "Not enough BMX to deposit");

        userLockEndTime[_tranche][msg.sender] = block.timestamp.add(tranche.lockDuration);
        userDeposited[_tranche][msg.sender] = true;
        tranche.depositedUsers = tranche.depositedUsers.add(1);

        bmx.safeTransferFrom(msg.sender, address(this), tranche.requiredLockAmount);
        IReferralStorage(referralStorage).setTraderReferralCodeByLocker(msg.sender, tranche.masterCode);

        emit Deposited(msg.sender, _tranche);
    }

    function withdraw(uint256 _tranche) external nonReentrant {
        require(userDeposited[_tranche][msg.sender] == true, "User hasn't locked");
        require(userLockEndTime[_tranche][msg.sender] < block.timestamp, "Lock period hasn't ended");

        userDeposited[_tranche][msg.sender] = false;
        userLockEndTime[_tranche][msg.sender] = 0;

        Tranche memory tranche = tranches[_tranche];

        bmx.safeTransfer(msg.sender, tranche.requiredLockAmount);

        emit Withdrawn(msg.sender, _tranche);
    }

    function setTranche(
        uint256 _id,
        uint256 _requiredLockAmount,
        uint256 _capacity,
        uint256 _lockDuration,
        bool _depositEnabled,
        bytes32 _masterCode
    ) external {
        require(msg.sender == gov , "Only governor");

        Tranche storage tranche = tranches[_id];

        tranche.requiredLockAmount = _requiredLockAmount;
        tranche.capacity = _capacity;
        tranche.lockDuration = _lockDuration;
        tranche.depositEnabled = _depositEnabled;
        tranche.masterCode = _masterCode;

        emit SetTranche(
            _id,
            _requiredLockAmount,
            _capacity,
            _lockDuration,
            _depositEnabled,
            _masterCode
        );
    }

    function setDepositState(uint256 _tranche, bool _depositEnabled) external {
        require(msg.sender == gov , "Only governor");
        
        Tranche storage tranche = tranches[_tranche];

		tranche.depositEnabled = _depositEnabled;

        emit SetDepositState(_depositEnabled, _tranche);
    }
    
    function setGov(address _gov) external {
        require(msg.sender == gov , "Only governor");
        require(_gov != address(0), "Invalid governor address");
        
		gov = _gov ;

        emit SetGov(_gov);
    }
}