'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react';

export default function IndividualLoanPage() {
    const params = useParams();
    //Fetched Variables
    const [initialValuation, setInitialValuation] = useState(0);
    const [infusionCapital, setInfusionCapital] = useState(0);
    const [loanshareName, setLoanshareName] = useState('$NONE');
    const [outstandingShares, setOutstandingShares] = useState(0);


    //New Variables
    const [currentValuation, setCurrentValuation] = useState(1);
    const [file, setFile] = useState(null);
    const [interestPercentage, setInterestPercentage] = useState(10); // Example interest rate
    const [payableAmount, setPayableAmount] = useState(0);
    const [interest, setInterest] = useState(0);

    const getLoanDetails = async () => {
        console.log('Fetching Loan Details');
        setInfusionCapital(100_000);
        setLoanshareName('ACME');
        setInitialValuation(1_000_000);
        setCurrentValuation(1_000_000);
        setOutstandingShares(5400);
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
        getLoanDetails();
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

        const payload = {
            'amountPayable': amountPayable,
        };

        console.log()

        const formData = new FormData();
        formData.append("currentValuation", currentValuation);
        formData.append("file", file);

        // try {
        //   const response = await fetch("/api/distribute", {
        //     method: "POST",
        //     body: formData,
        //   });

        //   if (response.ok) {
        //     alert("Distribution successful!");
        //   } else {
        //     alert("Failed to distribute. Please try again.");
        //   }
        // } catch (error) {
        //   console.error("Error:", error);
        //   alert("Something went wrong. Please try again.");
        // }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                    Repay Loan (${loanshareName})
                </h1>
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
                                ${interest.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Payable</span>
                            <span className="text-sm text-gray-800 font-medium">
                                ${payableAmount.toFixed(2)}
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
