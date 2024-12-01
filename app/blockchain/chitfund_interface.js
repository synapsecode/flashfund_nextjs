import ChitFundJSON from "../../../artifacts/contracts/ChethFund.sol/ChethFund.json";
const API_URL = 'https://f596-14-195-8-78.ngrok-free.app';
import { polygonAmoy } from "viem/chains";
import { ganache } from "./ganache";
import { ViemClient, ViemContract } from "./viemc";
import { createWalletClient, formatEther, http, parseEther, publicActions, getContract, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts"
import chitfund from "../Context/chitfund";


//============GANACHE==============
const CHAIN = ganache;
// const RPC = process.env.NEXT_PUBLIC_API_URL;
const RPC = "https://6e62-14-195-8-78.ngrok-free.app"
const platformClientPVK = "0xff2b5b94122182537f302af22d17ab060f975ba8a48f0b18c72daaafc2c9440a"
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

export class ChitFundInterface {

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

    static getChitBalance = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const cfbal = await chitfund.read({ method: 'getBalance' });
        return Number(formatEther(cfbal))
    }

    static getMemberCount = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const mc = await chitfund.read({ method: 'memberSize' });
        return mc
    }

    static getRemainingMonths = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const cfbal = await chitfund.read({ method: 'remainingMonths' });
        return Number((cfbal))
    }

    static getChitValue = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const cv = await chitfund.read({ method: 'chitValue' });
        return Number(formatEther(cv))
    }

    static getChitAmount = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const cfa = await chitfund.read({ method: 'chitAmount' });
        return Number(formatEther(cfa))
    }


    static isContractActive = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const isActive = await chitfund.read({ method: 'contractActive' });
        return isActive
    }

    static getPaidMembersList = async ({ chitfund }) => {
        // try {
        chitfund.connect({ client: platformClient });
        const paidMembersList = await chitfund.read({ method: 'paidMembersList' });
        return paidMembersList;
        // } catch (error) {
        //     console.log(error);
        // }

    }

    static getInternalCalculations = ({ contractBalance, highestBidInEth }) => {
        const highestBid = Number(highestBidInEth);
        const commission = (parseEther(contractBalance) * BigInt(2)) / 100n //2% commission
        contractBalance = parseEther(contractBalance) - commission;
        const toBeneficiary = (Number(contractBalance) - highestBid);
        const amtSplit2All = parseEther(String(highestBid / 3));
        return {
            commission: Number(formatEther(commission)),
            amountSentToBidWinner: Number(formatEther(toBeneficiary)),
            commonSplit: Number(formatEther(amtSplit2All)),
        }
    }

    static createChitFund = async ({ chitAmountInEth, memberSize }) => {
        const factory = ViemContract.fromCompiledContract({ compiledContract: ChitFundJSON });
        factory.connect({ client: platformClient });
        const { hash: deploymentHash, contract } = await factory.deploy({
            params: [BigInt(memberSize), parseEther(chitAmountInEth)],
        });
        contract.connect({ client: platformClient })
        console.log('DEPLOYED_CONTRACT_HASH', deploymentHash);
        // console.log('DEPLOYED_CONTRACT_ADDRESS', contract.contractAddress)
        return contract;
    }


    static getChitFundFromContractAddress = async ({ contractAddress }) => {
        const factory = ViemContract.fromCompiledContract({ compiledContract: ChitFundJSON, deployedAddress: contractAddress });
        factory.connect({ client: platformClient });
        return factory;
    }

    static depositChitAmount = async ({ chitfund, client, chitAmount }) => {
        chitfund.connect({ client }); //connect the current client to the provided contract
        await chitfund.write({
            method: 'depositChit',
            valueInEth: String(chitAmount),
        });
        chitfund.connect({ client: platformClient });
    }

    static finalizeBidAndDistributeFunds = async ({ chitfund, client, bidAmount }) => {
        chitfund.connect({ client: platformClient }); //connect the current client to the provided contract
        const clientAddr = await client.getClientAddress();
        await chitfund.write({ method: 'bid', params: [parseEther(bidAmount), clientAddr] });
        chitfund.connect({ client: platformClient });
        await chitfund.write({ method: 'distributeFunds' });
    }

    // static getBlockchainData = async ({ roomData }) => {
    //     // const client = await ChitFundInterface.createMetaMaskClient()
    //     // setClient(client)

    //     const chitfund = await ChitFundInterface.getChitFundFromContractAddress({ contractAddress: roomData.contract_address })
    //     // setChitFund(ctfund)
    //     // console.log(ctfund)
    //     const remainingMonths = await ChitFundInterface.getRemainingMonths({ chitfund })
    //     // console.log(rm)
    //     // setRemainingMonths(rm)
    //     const balance = await ChitFundInterface.getChitBalance({ chitfund })
    //     // console.log(bal)
    //     // setBalance(bal)
    //     const chitValue = await ChitFundInterface.getChitValue({ chitfund })
    //     // setChitValue(chitval)
    //     const chitAmount = await ChitFundInterface.getChitAmount({ chitfund })
    //     // setChitAmount(chitAmt)
    //     return ({ chitfund, remainingMonths, balance, chitValue, chitAmount })
    //     // const pdm = await ChitFundInterface.getPaidMembersList({chitfund:ctfund})
    //     // setPaidMembersList(pdm)
    // }
}