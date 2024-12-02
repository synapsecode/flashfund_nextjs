import { createPublicClient, createWalletClient, formatEther, http, parseEther, publicActions, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts"
import { ganache } from "./ganache";
import { ViemClient, ViemContract } from "./viemc";
// import StorageJSON from "./contracts/Storage.json";
import { FlashFundInterface } from './flashfund_interface';

const API_URL = "https://7289-163-47-210-29.ngrok-free.app";

export async function flashfund_e2e({ initialValuation, infusedCapital, loanShare, loanShareName }) {

    // --------------------- Account Setup ---------------------------
    const members = {
        manas: '0x89249d7a5bab4f9ad15d67e83d2e0cdfecf08e5d00046fa6c5efbc39def48972',
        koushik: '0xee5ddae69b02bb1b76e079e81ccc553441e383e7a770e79d1c637a5577027b53',
        somnath: '0x722e12c5ab76c85051d35bdbd1a18f724ebed4b2a6f3ffe34e0d56db076a0eff',
        platform: '0x5d31428d5148b74b22152750f7295b8f5ac5edb7c15f617d3b1a29114b023dde', //BLANKPOINT's PVK
    }
    const _createViemClient = (privateKey) => new ViemClient({
        walletClient: createWalletClient({
            account: privateKeyToAccount(privateKey),
            chain: ganache,
            transport: http(API_URL)
        })
    },);
    const memberClients = {
        manas: _createViemClient(members.manas),
        koushik: _createViemClient(members.koushik),
        somnath: _createViemClient(members.somnath),
        platform: _createViemClient(members.platform),
    }
    // --------------------- Account Setup ---------------------------  

    //--------------------Deploy the Contract-------------------------

    const flashfund = await FlashFundInterface.createFlashFund({ client: memberClients.platform, initialValuation, infusedCapital, loanShare, loanShareName });

    // const factory = ViemContract.fromCompiledContract({ compiledContract: ChitFundJSON });
    // factory.connect({ client: memberClients.platform });
    // const { hash: deploymentHash, contract } = await factory.deploy({
    //     params: [3n, parseEther(chitAmount)],
    // });
    // contract.connect({ client: memberClients.platform });

    // console.log('DEPLOYED_CONTRACT_HASH', deploymentHash);
    console.log('DEPLOYED_CONTRACT_ADDRESS', flashfund.contractAddress)

    const cfbal = await flashfund.read({ method: 'getBalance' });
    console.log('INITIAL_CONTRACT_BALANCE', formatEther(cfbal))
    console.log('Contract Deployment Successful!');
    //--------------------Deploy the Contract-------------------------


    console.log('Fetch Initial Balances');
    const balanceM = await memberClients.manas.getBalance({ mode: 'ether' });
    const balanceK = await memberClients.koushik.getBalance({ mode: 'ether' });
    const balanceS = await memberClients.somnath.getBalance({ mode: 'ether' });
    console.log('ORIGINAL_BALANCE(MSK):', [balanceM, balanceK, balanceS]);

    // ----------- Buy Shares --------
    console.log('Buy Shares')
    await FlashFundInterface.buyShare({ flashfund, client: memberClients.manas, amount: 0.125 });
    await FlashFundInterface.buyShare({ flashfund, client: memberClients.somnath, amount: 0.05 });
    await FlashFundInterface.buyShare({ flashfund, client: memberClients.koushik, amount: 0.025 });

    //--------------------Fetch their Balances again-------------------------
    const balanceM2 = await memberClients.manas.getBalance({ mode: 'ether' });
    const balanceK2 = await memberClients.koushik.getBalance({ mode: 'ether' });
    const balanceS2 = await memberClients.somnath.getBalance({ mode: 'ether' });
    console.log('POST_SHAREBUY_BALANCES(MSK):', [balanceM2, balanceK2, balanceS2]);
    //--------------------Fetch their Balances again-------------------------

    let contractbal = await flashfund.read({ method: 'getBalance' });
    console.log('POST_DEPOSIT_CONTRACT_BALANCE:', formatEther(contractbal));

    //------------Loan Repayment-------
    await FlashFundInterface.repayLoan({ flashfund, client: memberClients.platform });

    //--------------------Fetch their Balances again-------------------------
    const balanceM3 = await memberClients.manas.getBalance({ mode: 'ether' });
    const balanceK3 = await memberClients.koushik.getBalance({ mode: 'ether' });
    const balanceS3 = await memberClients.somnath.getBalance({ mode: 'ether' });
    console.log('POST_REPAYMENT_BALANCES(MSK):', [balanceM3, balanceK3, balanceS3]);
    //--------------------Fetch their Balances again-------------------------
}