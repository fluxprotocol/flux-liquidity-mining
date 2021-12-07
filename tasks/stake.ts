import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("stake")
  .addParam("amount")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "StakingRewards",
        {from: deployer, log: true, gasLimit: 8000000},
        "stake",
        parseEther(taskArgs.amount),
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};