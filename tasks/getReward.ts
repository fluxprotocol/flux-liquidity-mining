import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("getReward")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "StakingRewards",
        {from: deployer, log: true, gasLimit: 8000000},
        "getReward"
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};
