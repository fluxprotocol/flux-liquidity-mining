import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("withdraw")
  .addParam("id")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "FLXUSDCPool",
        {from: deployer, log: true, gasLimit: 8000000},
        "withdraw",
        taskArgs.id,
        deployer
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};