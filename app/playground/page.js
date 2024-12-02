'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import { flashfund_e2e } from '../blockchain/viemtest';

export default function CompanyHomePage() {
    const params = useParams();
    const [shares, setShares] = useState(0);
    const [costPerShare, setCostPerShare] = useState(0);
    const [outstandingShares, setOutstandingShares] = useState(0);

    const handleInputChange = (e) => {
        setShares(e.target.value);
    };

    const initialize = async () => {
        setCostPerShare(1);
        setOutstandingShares(100000);
    }

    useEffect(() => {
        initialize();
    }, []);

    const buyShares = () => {
        const payload = {
            'amount': costPerShare * shares,
        }
        setOutstandingShares(outstandingShares - shares)
        setShares(0);
        console.log(payload);
    }

    return (
        <div className='p-5'>
            <h1 className="center text-5xl">User Playground</h1>
            <br />
            <h2 className='text-2xl'>Buy Shares</h2>
            <div>
                <label htmlFor="shares">Outstanding Number of Shares: {outstandingShares} | Amount left to fund: {outstandingShares * costPerShare}</label>
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
            <button
                type="submit"
                className="mt-2 w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => flashfund_e2e({ initialValuation: '1', infusedCapital: '0.2', loanShare: '0.001', loanShareName: 'ACME' })}
            >
                Run End2End Test
            </button>
        </div>
    );
}
