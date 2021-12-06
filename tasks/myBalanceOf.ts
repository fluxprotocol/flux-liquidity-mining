import { task } from "hardhat/config";

task("myBalanceOf")
  .addParam("token", "Token's name")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { read } = deployments;
    const { deployer } = await getNamedAccounts();

    const balance = await read(taskArgs.token, "balanceOf", deployer);
    const decimals = await read(taskArgs.token, "decimals");

    console.log("BigNumber:");
    console.log(balance.toString());
    console.log("Float:");
    console.log(`${
      balance.div(ethers.BigNumber.from(10).pow(decimals)).toString()
    }.${
      balance.mod(ethers.BigNumber.from(10).pow(decimals)).toString()
    }`);
  });

module.exports = {};
