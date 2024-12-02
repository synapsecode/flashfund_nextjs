'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import { FlashFundInterface } from '@/app/blockchain/flashfund_interface';
import ConnectButton from "@/app/components/connectButton";
import { useWallet } from '@/app/Context/wallet';
import { setBalance } from 'viem/actions';

export default function IndividualLoanPage() {
    const params = useParams();
    //Fetched Variables
    const [initialValuation, setInitialValuation] = useState(0);
    const [infusionCapital, setInfusionCapital] = useState(0);
    const [loanshareName, setLoanshareName] = useState('$NONE');
    const [outstandingShares, setOutstandingShares] = useState(0);
    const [currentContract, setCurrentContract] = useState('');
    const { wallet } = useWallet();
    const [contractInstance, setContractInstance] = useState();



    //New Variables
    const [currentValuation, setCurrentValuation] = useState(1);
    const [file, setFile] = useState(null);
    const [interestPercentage, setInterestPercentage] = useState(10); // Example interest rate
    const [payableAmount, setPayableAmount] = useState(0);
    const [interest, setInterest] = useState(0);
    const [loanShareName, setLoanShareName] = useState('');
    const [contractBalance, setContractBalance] = useState(0);

    const initialize = async () => {
        const addr = localStorage.getItem('CURRENT_LOAN');
        setCurrentContract(addr);

        const fund = await FlashFundInterface.fromContractAddress({ contractAddress: addr });
        setContractInstance(fund);

        const loanShareName = await FlashFundInterface.getLoanShareName({ flashFund: fund });
        setLoanShareName(loanShareName);

        const outstanding = await FlashFundInterface.getOutstandingShares({ flashFund: fund });
        setOutstandingShares(outstanding);

        const iv = await FlashFundInterface.getInitialValuation({ flashFund: fund });
        setInitialValuation(iv);
        setCurrentValuation(iv)

        const ic = await FlashFundInterface.getInfusedCapital({ flashFund: fund });
        setInfusionCapital(ic);

        const bal = await FlashFundInterface.getFlashFundBalance({ flashFund: fund });
        setContractBalance(bal);
    }

    useEffect(() => {
        console.log(infusionCapital, currentValuation, initialValuation)
        const interestPC = (100 * infusionCapital * (currentValuation - initialValuation)) / (currentValuation * initialValuation);
        setInterestPercentage(interestPC);
        const computedInterest = infusionCapital * interestPC / 100;
        setInterest(computedInterest);
        const payable = infusionCapital + computedInterest;
        setPayableAmount(payable);
    }, [currentValuation]);

    //initState
    useEffect(() => {
        initialize();
    }, []);

    const handleValuationChange = (e) => {
        const valuation = parseFloat(e.target.value) || 0;
        setCurrentValuation(valuation);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDistribute = async () => {
        if (!currentValuation || !file) {
            alert("Please fill out all fields!");
            return;
        }
        console.log(`Pauyable: ${payableAmount}`)
        const client = await FlashFundInterface.createMetaMaskClient({ wallet })

        const addr = localStorage.getItem('CURRENT_LOAN');
        const fund = await FlashFundInterface.fromContractAddress({ contractAddress: addr });

        await FlashFundInterface.repayLoan({ flashfund: fund, client: client, amount: payableAmount });
        await initialize();
    };

    const recieveLoan = async () => {
        const client = await FlashFundInterface.createMetaMaskClient({ wallet });
        await FlashFundInterface.recieveLoanAmount({ flashfund: contractInstance, client: client });
        await initialize();
        alert('Transaction Complete!');
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
                <ConnectButton />
                <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                    Recieve Loan Value ({contractBalance} ETH)
                </h1>
                <button
                    type="button"
                    onClick={recieveLoan}
                    className="w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Recieve Loan Value
                </button>
                <br />  <br />

                <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                    Repay Loan (${loanShareName == '' ? 'ACME' : loanshareName})
                </h1>
                <p>Original Loan Amount: {infusionCapital} ETH</p><br />
                <p>ContractAddress: {currentContract}</p><br />
                <h1 className='text-md text-gray-600 mt-0'>Outstanding Shares: {outstandingShares}</h1>
                <br />
                <form className="space-y-6">
                    <div>
                        <label
                            htmlFor="currentValuation"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Current Valuation
                        </label>
                        <input
                            type="number"
                            min={initialValuation}
                            id="currentValuation"
                            value={currentValuation}
                            onChange={handleValuationChange}
                            placeholder="Enter current valuation"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="supportingDocs"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Supporting Documentation
                        </label>
                        <input
                            type="file"
                            id="supportingDocs"
                            onChange={handleFileChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md shadow-inner space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Interest (%)</span>
                            <span className="text-sm text-gray-800 font-medium">
                                {interestPercentage}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Interest Amount</span>
                            <span className="text-sm text-gray-800 font-medium">
                                {interest.toFixed(2)} ETH
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Payable</span>
                            <span className="text-sm text-gray-800 font-medium">
                                {payableAmount.toFixed(2)} ETH
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleDistribute}
                        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Repay and Distribute
                    </button>
                </form>
            </div>
        </div>
    );
}
