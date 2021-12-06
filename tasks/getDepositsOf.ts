import { task } from "hardhat/config";

task("getDepositsOf")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { read } = deployments;
    const { deployer } = await getNamedAccounts();

    const tx = await read("FLXUSDCPool", "getDepositsOf", deployer);
    
    console.log(tx);

  });

module.exports = {};
