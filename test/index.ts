import { expect } from "chai";
import { ethers } from "hardhat";
import { Citadel } from "../typechain";

function pickTenChars() {
  return new Array(10)
    .fill(null)
    .map(() => "0123456789"[Math.floor(Math.random() * 10)])
    .join("");
}

describe("Citadel", function () {
  let citadel: Citadel;
  beforeEach(async function () {
    const Citadel = await ethers.getContractFactory("Citadel");
    citadel = await Citadel.deploy();
    await citadel.deployed();
  });

  it("can find a successful code within 100 tries", async function () {
    // This is the token id of the runner used to perform the action
    // For now its unused
    const tokenId = 0;
    let successes = 0;
    for (let i = 0; i < 100; i++) {
      const code = pickTenChars();
      const success = await citadel.deactivateSecurityApparatus(tokenId, code);
      console.log(`${code}: ${success ? "SUCCESS" : "fail"}`);
      if (success) successes++;
    }
    console.log(`Success Rate ${successes}%`);
    expect(successes).to.be.greaterThan(5);
    expect(successes).to.be.lessThan(40);
  });
});
