// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract MPX is MintableBaseToken {
    constructor() public MintableBaseToken("MPX", "MPX", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "MPX";
    }
}
