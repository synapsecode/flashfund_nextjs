'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import { flashfund_e2e } from '../blockchain/viemtest';
import { useWallet } from '@/app/Context/wallet';
import { FlashFundInterface } from '@/app/blockchain/flashfund_interface';
import ConnectButton from "../components/connectButton";

export default function CompanyHomePage() {
    const params = useParams();
    const [shares, setShares] = useState(0);
    const [costPerShare, setCostPerShare] = useState(0);
    const [outstandingShares, setOutstandingShares] = useState(0);
    const [currentContract, setCurrentContract] = useState('');
    const { wallet } = useWallet();
    const [contractInstance, setContractInstance] = useState();
    const [loanShareName, setLoanShareName] = useState('');
    const [wc, setWC] = useState('');


    const handleInputChange = (e) => {
        setShares(e.target.value);
    };

    const initialize = async () => {
        const addr = localStorage.getItem('CURRENT_LOAN');
        setCurrentContract(addr);

        const client = await FlashFundInterface.createMetaMaskClient({ wallet })
        setWC(client);

        const fund = await FlashFundInterface.fromContractAddress({ contractAddress: addr });
        setContractInstance(fund);

        const outstanding = await FlashFundInterface.getOutstandingShares({ flashFund: fund });
        setOutstandingShares(outstanding);

        const sharePrice = await FlashFundInterface.getLoanShare({ flashFund: fund });
        setCostPerShare(sharePrice);

        const lsName = await FlashFundInterface.getLoanShareName({ flashFund: fund });
        setLoanShareName(lsName);

    }

    useEffect(() => {
        initialize();
    }, []);

    const buyShares = async () => {
        const payload = {
            'amount': costPerShare * shares,
        }

        const client = await FlashFundInterface.createMetaMaskClient({ wallet })
        await FlashFundInterface.buyShare({ flashfund: contractInstance, client: client, amount: String(payload['amount']) })
        await initialize();
        alert('Transaction Complete!');
    }

    return (
        <div className='p-5'>
            <h1 className="center text-5xl">User Dashboard</h1>
            <ConnectButton />
            <br />
            <h2 className='text-2xl'>Buy Shares ({currentContract})</h2>

            <div>
                <label htmlFor="shares">Outstanding Number of Shares: {outstandingShares} | Amount left to fund: {outstandingShares * costPerShare}ETH</label>
                <br />
                <input
                    className='mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                    type="number"
                    id="shares"
                    value={shares}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                />
            </div>

            <h1>Cost Per Share: {costPerShare}</h1>
            <h1>Final Cost: {costPerShare * shares} </h1>

            <button
                type="submit"
                className="mt-2 w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={buyShares}
            >
                Buy Shares
            </button>

            <br />
            {/* <button
                type="submit"
                className="mt-2 w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => flashfund_e2e({ initialValuation: '1', infusedCapital: '0.2', loanShare: '0.001', loanShareName: 'ACME' })}
            >
                Run End2End Test
            </button> */}
        </div>
    );
}
