import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("transferERC20")
  .addParam("token", "Name of token")
  .addParam("amount", "1.0 = 1e18")
  .addParam("recipient", "Address of recipient")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        taskArgs.token,
        {from: deployer, log: true},
        "transfer",
        taskArgs.recipient,
        parseEther(taskArgs.amount)
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};
