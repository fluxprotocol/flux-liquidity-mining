import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// MAINNET
const FLX = "0x3ea8ea4237344c9931214796d9417af1a1180770"; // mainnet FLX token
const LP = "0xd6Ef070951d008f1e6426ad9ca1C4FcF7220eE4D"; // uniswap v2 FLX-USDC
const MULTISIG = "0xC6B60a7107a0c35E719EC099469Fe5eC2E617316" // flux multisig

// GOERLI
// const FLX = "0x23FF74Af1a1e8Ef4433d761943Eb164F927bA2e2"; // faucet token
// const LP = "0x9b4b3756b352da98e154a30a0033069a83a3be51"; // uniswap goerli testflx-testusdc

const deployFunction: DeployFunction = async function ({ ethers, deployments, getNamedAccounts, getChainId }: HardhatRuntimeEnvironment) {
  console.log("running StakingRewards deployment");

  const { deploy, execute, read, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const multisig = MULTISIG;
  // const multisig = deployer;

  // deploy staking rewards
  const stakingRewards = await deploy("StakingRewards", {
    from: deployer,
    args: [
      multisig, // owner
      FLX, // rewards token
      LP // staking token
    ],
    deterministicDeployment: false,
  });
  console.log(`StakingRewards deployed at ${stakingRewards.address}`);

};

export default deployFunction;

deployFunction.tags = ["StakingRewards"];
