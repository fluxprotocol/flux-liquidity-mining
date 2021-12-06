import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("dripFaucetTokens")
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "TESTFLX",
        {from: deployer, log: true, gasLimit: 8000000},
        "drip",
    );

    console.log(` Transaction hash: ${txn.transactionHash}`);
  });

module.exports = {};