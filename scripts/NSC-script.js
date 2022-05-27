const hre = require("hardhat");

async function main() {
  const NSC = await hre.ethers.getContractFactory("NameServiceContract");
  const nsc = await NSC.deploy();

  await nsc.deployed();

  console.log("NameServiceContract deployed to:", nsc.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
