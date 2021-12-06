import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import { constants, utils } from "ethers";
import { read } from "fs";

// MAINNET
const FLX = "0x3ea8ea4237344c9931214796d9417af1a1180770"; // mainnet FLX token
const LP = "0xd6Ef070951d008f1e6426ad9ca1C4FcF7220eE4D"; // uniswap v2 FLX-USDC

// GOERLI
// const FLX = "0x23FF74Af1a1e8Ef4433d761943Eb164F927bA2e2"; // faucet token
// const LP = "0x23FF74Af1a1e8Ef4433d761943Eb164F927bA2e2"; // faucet token

const ONE_YEAR = 60 * 60 * 24 * 365;

const deployFunction: DeployFunction = async function ({ ethers, deployments, getNamedAccounts, getChainId }: HardhatRuntimeEnvironment) {
  console.log("running full deployment");

  const { deploy, execute, read, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = Number(await getChainId());

  // deployer can add/remove pools and distribute rewards 
  const multisig = deployer;

  // deploy liquidity mining manager
  const liquidityMiningManager = await deploy("LiquidityMiningManager", {
    contract: "LiquidityMiningManager",
    from: deployer,
    args: [
      FLX, // reward token
      multisig // reward source
    ],
    deterministicDeployment: false,
  });
  console.log(`LiquidityMiningManager deployed at ${liquidityMiningManager.address}`);

  // deploy FLX/USDC UniswapV2 pool
  const flxUsdcPool = await deploy("FLXUSDCPool", {
    contract: "TimeLockNonTransferablePool",
    from: deployer,
    args: [
      "Staked FLX-USDC UniswapV2 LP", // name
      "SFLXUSDC", // symbol
      LP, // deposit token
      FLX, // rewards token
      constants.AddressZero, // escrow pool
      0, // escrow portion
      0, // escrow duration
      1, // max bonus
      ONE_YEAR // max lock duration
    ],
    deterministicDeployment: false,
  });
  console.log(`FLXUSDCPool deployed at ${flxUsdcPool.address}`);

  // deploy view
  const view = await deploy("View", {
    contract: "View",
    from: deployer,
    args: [
      liquidityMiningManager.address, // liquidity mining manager
    ],
    deterministicDeployment: false,
  });
  console.log(`View deployed at ${view.address}`);


  // const liquidityMiningManager = (await get("LiquidityMiningManager"));
  // const flxUsdcPool = (await get("FLXUSDCPool"));
  // const view = (await get("View"));

  // assign roles
  const GOV_ROLE = await read("LiquidityMiningManager", {}, "GOV_ROLE");
  const REWARD_DISTRIBUTOR_ROLE = await read("LiquidityMiningManager", {}, "REWARD_DISTRIBUTOR_ROLE");
  console.log("Assigning GOV_ROLE");
  await execute("LiquidityMiningManager", {from: deployer}, "grantRole", GOV_ROLE, multisig);
  console.log("Assigning REWARD_DISTRIBUTOR_ROLE");
  await execute("LiquidityMiningManager", {from: deployer}, "grantRole", REWARD_DISTRIBUTOR_ROLE, multisig);
  
  // add pools
  console.log("Adding FLX LP Pool");
  const addPool = await execute("LiquidityMiningManager",
    { from: deployer, gasLimit: 250000 },
    "addPool",
    flxUsdcPool.address,
    constants.WeiPerEther
  );
  console.log(`Tx: ${addPool.transactionHash}`);

  console.log('done');
};

export default deployFunction;

deployFunction.tags = ["Full"];
