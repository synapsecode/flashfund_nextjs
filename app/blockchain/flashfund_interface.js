import FlashFundJSON from "../../artifacts/contracts/LoanShare.sol/LoanShareContract.json";
import { ganache } from "./ganache";
import { ViemClient, ViemContract } from "./viemc";
import { createWalletClient, formatEther, http, parseEther, publicActions, getContract, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts"

//============GANACHE==============
const CHAIN = ganache;
// const RPC = process.env.NEXT_PUBLIC_API_URL;
const RPC = "https://7289-163-47-210-29.ngrok-free.app"
const platformClientPVK = "0x5d31428d5148b74b22152750f7295b8f5ac5edb7c15f617d3b1a29114b023dde"
//=================================

//============POLYGON==============
// const CHAIN = polygonAmoy;
// const RPC = "https://polygon-amoy.g.alchemy.com/v2/Q9_DTST1PIaTKcaPjvkURoBlR8gq8omM";
//============POLYGON==============

//ChETHFund's own private client
const platformClient = new ViemClient({
    walletClient: createWalletClient({
        account: privateKeyToAccount(platformClientPVK),
        chain: CHAIN,
        transport: http(RPC)
    })
},);

export class FlashFundInterface {

    static fromContractAddress = async ({ contractAddress }) => {
        const factory = ViemContract.fromCompiledContract({ compiledContract: FlashFundJSON, deployedAddress: contractAddress });
        factory.connect({ client: platformClient });
        return factory;
    }


    static createMetaMaskClient = async ({ wallet }) => {
        const { ethereum } = window
        if (!ethereum) return alert("Please install MetaMask!")
        // const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        // const account = accounts[0]
        return new ViemClient({
            walletClient: createWalletClient({
                account: wallet,
                chain: CHAIN,
                transport: custom(ethereum),
            }),
        })
    }

    static getFlashFundBalance = async ({ flashFund }) => {
        flashFund.connect({ client: platformClient });
        const cfbal = await flashFund.read({ method: 'getBalance' });
        return Number(formatEther(cfbal))
    }

    static getInitialValuation = async ({ flashFund }) => {
        flashFund.connect({ client: platformClient });
        const x = await flashFund.read({ method: 'initialValuation' });
        return Number(formatEther(x))
    }

    static getInfusedCapital = async ({ flashFund }) => {
        flashFund.connect({ client: platformClient });
        const x = await flashFund.read({ method: 'infusedCapital' });
        return Number(formatEther(x))
    }

    static getLoanShare = async ({ flashFund }) => {
        flashFund.connect({ client: platformClient });
        const x = await flashFund.read({ method: 'loanShare' });
        return Number(formatEther(x))
    }

    static getLoanShareName = async ({ flashFund }) => {
        flashFund.connect({ client: platformClient });
        const x = await flashFund.read({ method: 'loanShareName' });
        return x;
    }

    static getOutstandingShares = async ({ flashFund }) => {
        flashFund.connect({ client: platformClient });
        const x = await flashFund.read({ method: 'outstandingShares' });
        return Number(x);
    }

    static recieveLoanAmountFromFlashFund = async ({ flashFund }) => {
        flashFund.connect({ client: platformClient });
        const x = await flashFund.read({ method: 'outstandingShares' });
        return Number(x);
    }

    static recieveLoanAmount = async ({ flashfund, client }) => {
        flashfund.connect({ client }); //connect the current client to the provided contract
        await flashfund.write({
            method: 'recieveLoanAmount',
        });
        flashfund.connect({ client: platformClient });
    }

    static createFlashFund = async ({ client, initialValuation, infusedCapital, loanShare, loanShareName }) => {
        const factory = ViemContract.fromCompiledContract({ compiledContract: FlashFundJSON });
        factory.connect({ client: client });
        const { hash: deploymentHash, contract } = await factory.deploy({
            params: [parseEther(initialValuation), parseEther(infusedCapital), parseEther(loanShare), loanShareName],
        });
        contract.connect({ client: platformClient })
        console.log('DEPLOYED_CONTRACT_HASH', deploymentHash);
        return contract;
    }

    static buyShare = async ({ flashfund, client, amount }) => {
        flashfund.connect({ client }); //connect the current client to the provided contract
        await flashfund.write({
            method: 'buy',
            valueInEth: String(amount),
        });
        flashfund.connect({ client: platformClient });
    }

    static repayLoan = async ({ flashfund, client }) => {
        flashfund.connect({ client }); //connect the current client to the provided contract
        await flashfund.write({
            method: 'repay',
        });
        flashfund.connect({ client: platformClient });
    }
}