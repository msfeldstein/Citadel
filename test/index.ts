/* eslint-disable no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import hre, { ethers, waffle } from "hardhat";
import { Citadel } from "../typechain";

const RUNNER_CONTRACT = "0x97597002980134beA46250Aa0510C9B90d87A587";
const RUNNER_ABI = [
  "function ownerOf(uint256 tokenId) external view returns (address owner)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
];

describe("Citadel", function () {
  let citadel: Citadel;
  beforeEach(async function () {
    const Citadel = await ethers.getContractFactory("Citadel");
    citadel = await Citadel.deploy();
    await citadel.deployed();
  });

  async function useAccount(account: string): Promise<Citadel> {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [account],
    });
    await hre.network.provider.send("hardhat_setBalance", [
      account,
      "0xB4B2D34110F6E75F90",
    ]);
    const signer = await ethers.getSigner(account);
    return citadel.connect(signer);
  }

  it("can find a successful code within 100 tries", async function () {
    // Has a visor
    const runnerId = 1175;
    const owner = "0x3a4126f0ff96f702b2ddf0862c40920be8e83b68";
    // This is the token id of the runner used to perform the action
    // For now its unused
    const connectedCitadel = await useAccount(owner);
    const codeThatFails = "1835503163";
    const codeThatWorks = "1835503611";
    await expect(
      connectedCitadel.deactivateSecurityApparatus(runnerId, codeThatFails)
    ).to.be.revertedWith("INVALID_CODE/ip has been logged");

    await connectedCitadel.deactivateSecurityApparatus(runnerId, codeThatWorks);
    const deactivated = await connectedCitadel.securityApparatusDeactivated();
    expect(deactivated).to.be.true;
  });

  it("can have cameras jammed", async function () {
    const runnersContract = new ethers.Contract(
      RUNNER_CONTRACT,
      RUNNER_ABI,
      waffle.provider
    );
    for (let i = 1; i <= 10; i++) {
      const camerasJammed = await citadel.camerasJammed();
      expect(camerasJammed).to.be.false;
      const owner = await runnersContract.ownerOf(i);
      const connectedCitadel = await useAccount(owner);
      await connectedCitadel.jamCamera(i);
    }
    const camerasJammed = await citadel.camerasJammed();
    expect(camerasJammed).to.be.true;
  });

  it("can't have 2 cameras jammed by the same runner", async function () {
    const runnersContract = new ethers.Contract(
      RUNNER_CONTRACT,
      RUNNER_ABI,
      waffle.provider
    );
    const owner = await runnersContract.ownerOf(1);
    const authed = await useAccount(owner);
    await authed.jamCamera(1);
    await expect(authed.jamCamera(1)).to.be.revertedWith(
      "Camera is already down"
    );
  });

  it("can be attacked by a horde", async function () {
    const owner = "0x91e371c3cd3aa81af27b1602d4d8cf9d81ec5a90";
    const authed = await useAccount(owner);
    await authed.summonHorde([
      1903, 1732, 1754, 1760, 1925, 1821, 1915, 1826, 1827, 1891,
    ]);
    expect(await authed.securityForcesDefeated()).to.be.true;
  });

  it("can't be attacked by a horde not owned by the person", async function () {
    const owner = "0x91e371c3cd3aa81af27b1602d4d8cf9d81ec5a90";
    const authed = await useAccount(owner);
    await expect(
      authed.summonHorde([
        1903, 2732, 1254, 1760, 1925, 1821, 1935, 1826, 1823, 1892,
      ])
    ).to.be.revertedWith("Runner Impersonation");
    expect(await authed.securityForcesDefeated()).to.be.false;
  });

  it("can't be attacked by a horde of the same runners", async function () {
    const owner = "0x91e371c3cd3aa81af27b1602d4d8cf9d81ec5a90";
    const authed = await useAccount(owner);
    await expect(
      authed.summonHorde([
        1903, 1903, 1903, 1903, 1903, 1903, 1903, 1903, 1903, 1903,
      ])
    ).to.be.revertedWith("Doublerunner");
    expect(await authed.securityForcesDefeated()).to.be.false;
  });
});
