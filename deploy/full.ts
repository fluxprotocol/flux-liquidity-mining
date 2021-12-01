import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import { constants, utils } from "ethers";
import { read } from "fs";

const FLX = "0x23FF74Af1a1e8Ef4433d761943Eb164F927bA2e2"; // ropsten FLX token with faucet
const LP = "0x615d0222f91d76A680eb99D3C8d3B88E03e5d607"; // same as above
const multisig = "0xCAa58677fa6a5437B0eDD37659f94DdBEa575945";
const ONE_YEAR = 60 * 60 * 24 * 365;

const deployFunction: DeployFunction = async function ({ ethers, deployments, getNamedAccounts, getChainId }: HardhatRuntimeEnvironment) {
  console.log("running full deployment");

  const { deploy, execute, read, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = Number(await getChainId());

  // deploy liquidity mining manager
  const liquidityMiningManager = await deploy("LiquidityMiningManager", {
    contract: "LiquidityMiningManager",
    from: deployer,
    args: [
      FLX,
      multisig
    ],
    deterministicDeployment: false,
  });
  console.log(`LiquidityMiningManager deployed at ${liquidityMiningManager.address}`);

  // deploy escrow pool
  const escrowPool = await deploy("EscrowPool", {
    contract: "TimeLockNonTransferablePool",
    from: deployer,
    args: [
      "Escrowed Flux Token",
      "EFLX",
      FLX,
      FLX,
      constants.AddressZero,
      0,
      0,
      0,
      ONE_YEAR * 10
    ],
    deterministicDeployment: false,
  });
  console.log(`EscrowPool deployed at ${escrowPool.address}`);

  // deploy FLX/USDC UniswapV2 pool
  const flxUsdcPool = await deploy("FLXUSDCPool", {
    contract: "TimeLockNonTransferablePool",
    from: deployer,
    args: [
      "Staked Flux Token Uniswap LP",
      "SFLXUNILP",
      LP,
      FLX,
      escrowPool.address,
      1,
      ONE_YEAR,
      1,
      ONE_YEAR
    ],
    deterministicDeployment: false,
  });
  console.log(`FLXUSDCPool deployed at ${flxUsdcPool.address}`);

  // deploy view
  const view = await deploy("View", {
    contract: "View",
    from: deployer,
    args: [
      liquidityMiningManager.address,
      escrowPool.address
    ],
    deterministicDeployment: false,
  });
  console.log(`View deployed at ${view.address}`);


  // const liquidityMiningManager = (await get("LiquidityMiningManager"));
  // const escrowPool = (await get("EscrowPool"));
  // const flxUsdcPool = (await get("FLXUSDCPool"));
  // const view = (await get("View"));
  
  // assign gov role to deployer
  const GOV_ROLE = await read("LiquidityMiningManager", {}, "GOV_ROLE");
  const REWARD_DISTRIBUTOR_ROLE = await read("LiquidityMiningManager", {}, "REWARD_DISTRIBUTOR_ROLE");
  const DEFAULT_ADMIN_ROLE = await read("LiquidityMiningManager", {}, "DEFAULT_ADMIN_ROLE");
    
  console.log("Assigning GOV_ROLE");
  await execute("LiquidityMiningManager", {from: deployer}, "grantRole", GOV_ROLE, deployer);
  console.log("Assigning REWARD_DISTRIBUTOR_ROLE");
  await execute("LiquidityMiningManager", {from: deployer}, "grantRole", REWARD_DISTRIBUTOR_ROLE, deployer);

  // add pools
  console.log("Adding FLX LP Pool");
  const addPool = await execute("LiquidityMiningManager",
    { from: deployer, gasLimit: 250000 },
    "addPool",
    flxUsdcPool.address,
    constants.WeiPerEther
  );
  console.log(`Tx: ${addPool.transactionHash}`);

    
  // Assign GOV, DISTRIBUTOR and DEFAULT_ADMIN roles to multisig
  console.log("setting lmm roles");
  // renounce gov role from deployer
  await execute("LiquidityMiningManager", {from: deployer}, "renounceRole", GOV_ROLE, deployer);
  console.log("renouncing distributor role");
  await execute("LiquidityMiningManager", {from: deployer}, "renounceRole", REWARD_DISTRIBUTOR_ROLE, deployer);
  console.log("Assigning GOV_ROLE");
  await execute("LiquidityMiningManager", {from: deployer}, "grantRole", GOV_ROLE, multisig);
  console.log("Assigning REWARD_DISTRIBUTOR_ROLE");
  await execute("LiquidityMiningManager", {from: deployer}, "grantRole", REWARD_DISTRIBUTOR_ROLE, multisig);
  console.log("Assigning DEFAULT_ADMIN_ROLE");
  await execute("LiquidityMiningManager", {from: deployer}, "grantRole", DEFAULT_ADMIN_ROLE, multisig);
  
  console.log("Assigning DEFAULT_ADMIN roles on pools");
  await execute("EscrowPool", {from: deployer}, "grantRole", DEFAULT_ADMIN_ROLE, multisig);
  await execute("FLXUSDCPool", {from: deployer}, "grantRole", DEFAULT_ADMIN_ROLE, multisig);

  console.log('done');
};

export default deployFunction;

deployFunction.tags = ["Full"];
