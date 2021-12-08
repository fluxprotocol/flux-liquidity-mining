import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { StakingRewards, StakingRewards__factory } from "../typechain";
import TimeTraveler from "../utils/TimeTraveler";

const INITIAL_MINT = parseEther("100");

describe("StakingRewards", function () {

    let stakingRewards: StakingRewards;
    let deployer: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let signers: SignerWithAddress[];
    let timeTraveler = new TimeTraveler(hre.network.provider);

    before(async() => {
        [
            deployer,
            account1,
            account2,
            ...signers
        ] = await hre.ethers.getSigners();

        stakingRewards = await (new StakingRewards__factory(deployer)).deploy(deployer.address, ethers.constants.AddressZero, ethers.constants.AddressZero);

        await timeTraveler.snapshot();

    });

    beforeEach(async() => {
        await timeTraveler.revertSnapshot();
    })

    describe("stakingRewards", async() => {
        it("Should deploy", async() => {
        });
    });

})