//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IRunners {
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function balanceOf(address owner) external view returns (uint256 balance);
}

contract Citadel {
    constructor() {}

    address private constant RUNNER_CONTRACT =
        0x97597002980134beA46250Aa0510C9B90d87A587;
    address private constant DNA_CONTRACT =
        0xfDac77881ff861fF76a83cc43a1be3C317c6A1cC;

    function deactivateSecurityApparatus(uint256 runnerId, string memory key)
        public
        view
        returns (bool)
    {
        require(
            IRunners(RUNNER_CONTRACT).ownerOf(runnerId) == msg.sender,
            "Runner Impersonation"
        );
        // Get the hash of the senders address, the runners tokenId, and the key passed
        // This way the key will be different for everyone and they can't just share
        bytes32 sig = keccak256(abi.encodePacked(msg.sender, runnerId, key));
        uint256 bits = uint256(sig);
        // With a difficulty of 2 we require the last 2 bits to be 0 which gives a 25% hit rate
        uint256 mask = 0x03; // 0x03 is 00000011, aka a bytte with the last 2 bits set to true
        return bits & mask == 0;
    }
}
