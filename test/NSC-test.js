const { messagePrefix } = require("@ethersproject/hash");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NameServiceContract", () => {
  let owner;
  let alice;
  let billy;
  let nsc
  let amount = ethers.utils.parseEther("2");

  beforeEach(async() => {
    const NSC = await ethers.getContractFactory('NameServiceContract');
    nsc = await NSC.deploy();
    await nsc.deployed();

    [owner, alice, billy] = await ethers.getSigners();

    //deposit eth
      const depTx = await nsc.connect(alice).deposit({value: amount});
      await depTx.wait();
      expect( await nsc.connect(alice).balances(alice.address)).to.eq(amount);
  });

  describe('registerName()', () => {
    it('should register name', async() => {
      console.log("registering the name");
      const regTx =  await nsc.connect(alice).registerName("alice");
      await regTx.wait();
      expect( await nsc.connect(alice).viewName()).to.eq("alice");

      const fee = await nsc.connect(alice).lockedFund();
      const lfeee = await nsc.calculateFee("alice");
      console.log(fee);
      expect(fee).to.eq(lfeee);

      console.log("time fast forward to lockup period");
      let blockNumBefore = await ethers.provider.getBlockNumber();
      let blockBefore = await ethers.provider.getBlock(blockNumBefore);
      let timestampBefore = blockBefore.timestamp;
      await network.provider.send("evm_mine", [timestampBefore + 130]); 

      console.log("Checking viewName()");
      await expect(nsc.connect(alice).viewName()).to.be.revertedWith("name expired");
    });
  });

  describe("withdraw()", () => {
    it("should withdraw funds", async () => {
      const witTx = await nsc.connect(alice).withdraw(amount);
      await witTx.wait();
      expect(await nsc.connect(alice).balances(alice.address)).to.eq(0);
    })
  })

  describe("renewName()", () => {
    it("should update the registration", async() => {
      console.log("registering the name");
      const regTx =  await nsc.connect(alice).registerName("alice");
      await regTx.wait();
      expect( await nsc.connect(alice).viewName()).to.eq("alice");


      console.log("time fast forward to lockup period");
      let blockNumBefore = await ethers.provider.getBlockNumber();
      let blockBefore = await ethers.provider.getBlock(blockNumBefore);
      let timestampBefore = blockBefore.timestamp;
      await network.provider.send("evm_mine", [timestampBefore + 130]); 

      await expect(nsc.connect(alice).viewName()).to.be.revertedWith("name expired");

      console.log("renewing the regstration");
      const renTx = await nsc.connect(alice).renewName();
      await renTx.wait();
      expect( await nsc.connect(alice).viewName()).to.eq("alice");
    })
  })
});
