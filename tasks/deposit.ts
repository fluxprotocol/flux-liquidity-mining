import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("deposit")
  .addParam("amount")
  .addParam("duration")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "FLXUSDCPool",
        {from: deployer, log: true, gasLimit: 8000000},
        "deposit",
        parseEther(taskArgs.amount),
        taskArgs.duration,
        deployer
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};
