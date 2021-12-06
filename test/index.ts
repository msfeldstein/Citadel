import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Citadel } from "../typechain";

function pickTenChars() {
  return new Array(10)
    .fill(null)
    .map(() => "0123456789"[Math.floor(Math.random() * 10)])
    .join("");
}

describe("Citadel", function () {
  let citadel: Citadel;

  async function useAccount(account: string): Promise<Citadel> {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [account],
    });
    const signer = await ethers.getSigner(
      "0xfdb51891d9826a27cec6a9fd1f06f09860da81e3"
    );
    return citadel.connect(signer);
  }
  beforeEach(async function () {
    const Citadel = await ethers.getContractFactory("Citadel");
    citadel = await Citadel.deploy();
    await citadel.deployed();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0xfdb51891d9826a27cec6a9fd1f06f09860da81e3"],
    });
  });

  it("can find a successful code within 100 tries", async function () {
    const tokenId = 1693;
    const owner = "0xfdb51891d9826a27cec6a9fd1f06f09860da81e3";
    // This is the token id of the runner used to perform the action
    // For now its unused
    const connectedCitadel = await useAccount(owner);
    let successes = 0;
    for (let i = 0; i < 100; i++) {
      const code = pickTenChars();
      const success = await connectedCitadel.deactivateSecurityApparatus(
        tokenId,
        code
      );
      console.log(`${code}: ${success ? "SUCCESS" : "fail"}`);
      if (success) successes++;
    }
    console.log(`Success Rate ${successes}%`);
    expect(successes).to.be.greaterThan(5);
    expect(successes).to.be.lessThan(40);
  });

  it("can be attacked by a horde", async function () {});
});
