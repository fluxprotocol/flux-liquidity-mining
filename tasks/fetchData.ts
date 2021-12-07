import { task } from "hardhat/config";

task("fetchData")
  .addParam("account", "Account's address")
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { read } = deployments;

    const data = await read("View", "fetchData", taskArgs.account);

    console.log(`${JSON.stringify(data)}`);
  });

module.exports = {};
