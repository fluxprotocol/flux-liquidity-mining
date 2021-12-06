import { task } from "hardhat/config";

task("setRewardPerSecond")
  .addParam("amount", "Amount of rewards per second in 1e18")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "LiquidityMiningManager",
        {from: deployer, log: true},
        "setRewardPerSecond",
        taskArgs.amount
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};
