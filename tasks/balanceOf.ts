import { task } from "hardhat/config";

task("balanceOf")
  .addParam("account", "Account's address")
  .addParam("token", "Token's name")
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { read } = deployments;

    const balance = await read(taskArgs.token, "balanceOf", taskArgs.account);
    const decimals = await read(taskArgs.token, "decimals");

    console.log(`${
      balance.div(ethers.BigNumber.from(10).pow(decimals)).toString()
    }.${
      balance.mod(ethers.BigNumber.from(10).pow(decimals)).toString()
    }`);
  });

module.exports = {};
