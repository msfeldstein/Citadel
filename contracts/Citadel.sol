//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Citadel {
    constructor() {}

    function deactivateSecurityApparatus(uint256 tokenId, string memory key)
        public
        view
        returns (bool)
    {
        // Get the hash of the senders address, the runners tokenId, and the key passed
        // This way the key will be different for everyone and they can't just share
        bytes32 sig = keccak256(abi.encodePacked(msg.sender, tokenId, key));
        uint256 bits = uint256(sig);
        // With a difficulty of 2 we require the last 2 bits to be 0 which gives a 25% hit rate
        uint256 mask = 0x03; // 0x03 is 00000011, aka a bytte with the last 2 bits set to true
        return bits & mask == 0;
    }
}
