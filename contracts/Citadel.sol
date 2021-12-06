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

    struct SecurityState {
        uint8 camerasActive;
        bool securityApparatusActive;
        bool gasDeployed;
        bool securityForcesDeployed;
    }

    mapping(uint256 => bool) cameraJammers;

    SecurityState public securityState = SecurityState(10, true, true, true);

    function jamCamera(uint256 runnerId) public {
        require(
            IRunners(RUNNER_CONTRACT).ownerOf(runnerId) == msg.sender,
            "Runner Impersonation"
        );
        require(!cameraJammers[runnerId], "Camera is already down");
        require(securityState.camerasActive > 0, "LFG already!");
        securityState.camerasActive--;
    }

    function camerasJammed() public view returns (bool) {
        return securityState.camerasActive == 0;
    }

    function deactivateSecurityApparatus(uint256 runnerId, string calldata key)
        public
    {
        require(
            IRunners(RUNNER_CONTRACT).ownerOf(runnerId) == msg.sender,
            "Runner Impersonation"
        );
        // Get the hash of the senders address, the runners tokenId, and the key passedp
        // This way the key will be different for everyone and they can't just share
        bytes32 sig = keccak256(abi.encodePacked(msg.sender, runnerId, key));
        uint256 bits = uint256(sig);
        // With a difficulty of 2 we require the last 2 bits to be 0 which gives a 25% hit rate
        uint256 mask = 0x03; // 0x03 is 00000011, aka a byte with the last 2 bits set to true
        require(bits & mask == 0, "INVALID_CODE/ip has been logged");

        securityState.securityApparatusActive = false;
    }

    function securityApparatusDeactivated() public view returns (bool) {
        return !securityState.securityApparatusActive;
    }

    function vulnerable() public view returns (bool) {
        return
            securityState.camerasActive == 0 &&
            !securityState.securityApparatusActive &&
            !securityState.gasDeployed &&
            !securityState.securityForcesDeployed;
    }
}
