/* eslint-disable no-unused-expressions */
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

  async function useAccount(account: string): Promise<Citadel> {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [account],
    });
    const signer = await ethers.getSigner(account);
    return citadel.connect(signer);
  }

  beforeEach(async function () {
    const Citadel = await ethers.getContractFactory("Citadel");
    citadel = await Citadel.deploy();
    await citadel.deployed();
  });

  it("can find a successful code within 100 tries", async function () {
    const runnerId = 1693;
    const owner = "0xfdb51891d9826a27cec6a9fd1f06f09860da81e3";
    // This is the token id of the runner used to perform the action
    // For now its unused
    const connectedCitadel = await useAccount(owner);
    const codeThatFails = "1835503163";
    const codeThatWorks = "1835503667";
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

  it("can be attacked by a horde", async function () {});
});
