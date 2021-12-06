import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("approveERC20")
.addParam("amount", "Amount as decimal (i.e. 1.0 = 1e18)")
.addParam("spender")
.setAction(async (taskArgs, hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { get, read, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const token = "TESTFLX"
  const amount = parseEther(taskArgs.amount);
  let tx;
  
  let spender = (await get(taskArgs.spender)).address;
  let allowance = await read(token, "allowance", deployer, spender);

  if (allowance.gte(amount)) {
    console.log(`Already approved ${allowance.toString()} ${token}. Exiting.`);
  } else {
    tx = await execute(token, { from: deployer, log: true }, "approve", spender, amount);
    console.log(`Executed approve(${spender},${amount}) on ${token} contract.`);
    console.log(`  Tx: ${tx.transactionHash}`);
  }

});

module.exports = {};
