import { task } from "hardhat/config";

task("distributeRewards")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "LiquidityMiningManager",
        {from: deployer, log: true, gasLimit: 8000000},
        "distributeRewards",
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};
