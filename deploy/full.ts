import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import { constants, utils } from "ethers";
import { read } from "fs";

const FLX = "0x3ea8ea4237344c9931214796d9417af1a1180770"; // ropsten FLX token with faucet
const LP = "0xd6Ef070951d008f1e6426ad9ca1C4FcF7220eE4D"; // uniswap v2 FLX-USDC
const multisig = "0xCAa58677fa6a5437B0eDD37659f94DdBEa575945"; // TODO: SET ME to deployer 
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

  // deploy FLX/USDC UniswapV2 pool
  const flxUsdcPool = await deploy("FLXUSDCPool", {
    contract: "TimeLockNonTransferablePool",
    from: deployer,
    args: [
      "Staked Flux Token Uniswap LP",
      "SFLXUNILP",
      LP,
      FLX,
      constants.AddressZero,
      0,
      0,
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
      flxUsdcPool.address
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
