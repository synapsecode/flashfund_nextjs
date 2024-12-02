const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('FlashFund', function () {
    let FlashFund;
    let flashFund;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    const initialValuation = ethers.parseUnits('1', 'ether') // 1 ether
    const infusedCapital = ethers.parseUnits('0.2', 'ether') // 0.2 ether
    const loanShare = ethers.parseUnits('0.001', 'ether') // 0.001 ether

    const getBAL = async (addr) => {
        const bwei = await ethers.provider.getBalance(addr);
        return ethers.formatUnits(bwei, 'ether');
    }

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        // Deploy the contract
        const FlashFundFactory = await ethers.getContractFactory('FlashFund');
        flashFund = await FlashFundFactory.deploy(initialValuation, infusedCapital, loanShare, "ACME");
    });

    describe('Deployment', function () {
        it('Outstanding Shares Calculation is Correct', async function () {
            expect(await flashFund.outstandingShares()).to.equal(infusedCapital.div(loanShare));
        });
    });

    describe('Buy Shares', function () {

        it('After Everyone buys shares, balance must be equal to loan amount', async function () {
            await flashFund.connect(addr1).buy({ value: ethers.parseUnits('0.125', 'ether') });
            await flashFund.connect(addr2).buy({ value: ethers.parseUnits('0.05', 'ether') });
            await flashFund.connect(addr3).buy({ value: ethers.parseUnits('0.025', 'ether') });
            const bal = await chethFund.getBalance();
            console.log(`Balance: ${bal}`)
            expect(bal).to.equal(ethers.parseUnits('0.2', 'ether'));
        });

        it('Test Distribution', async function () {
            const bal1 = await getBAL(addr1);
            const bal2 = await getBAL(addr2);
            const bal3 = await getBAL(addr3);
            console.log(bal1, bal2, bal3);

            await flashFund.connect(owner).repay();
            console.log('After Repayment');

            const bal1n = await getBAL(addr1);
            const bal2n = await getBAL(addr2);
            const bal3n = await getBAL(addr3);
            console.log(bal1n, bal2n, bal3n);

            expect(await chethFund.getBalance()).to.equal(0);
        });
    });
});
