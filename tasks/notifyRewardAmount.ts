import { task } from "hardhat/config";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

task("notifyRewardAmount")
  .addParam("amount", "1.0 = 1e18")
  .setAction(async (taskArgs, hre) => {
    const { deployments, getNamedAccounts } = hre;
    const { get, read, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const txn = await execute(
        "StakingRewards",
        { from: deployer, log: true },
        "notifyRewardAmount",
        parseEther(taskArgs.amount)
    );
    console.log(`  Tx: ${txn.transactionHash}`);
  });

module.exports = {};
