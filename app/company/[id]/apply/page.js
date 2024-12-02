'use client'
import { useParams } from 'next/navigation'
import React, { useState } from 'react';
import ConnectButton from "../../../components/connectButton";
import { useWallet } from '@/app/Context/wallet';
import { FlashFundInterface } from '@/app/blockchain/flashfund_interface';

const loans = [
  {
    'loan_amount': 100_000,
    'deployedAddress': '0x00000000000000',
  }
]
// pages/company.js



const CompanyForm = () => {
  const [initialValuation, setInitialValuation] = useState('');
  const [infusionCapital, setInfusionCapital] = useState('');
  const [loanshareValue, setLoanshareValue] = useState('');
  const [loanshareName, setLoanshareName] = useState('');
  const [supportingDocs, setSupportingDocs] = useState(null);
  const { wallet } = useWallet();

  // Handle numeric input formatting
  const handleCurrencyChange = (e, setState) => {
    const value = e.target.value.replace(/[^0-9\.]/g, ''); // Remove non-numeric characters
    setState(value);
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSupportingDocs(file);
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initialValuation || !infusionCapital || !loanshareValue || !loanshareName || !supportingDocs) {
      alert('Please fill out all fields');
      return;
    }

    // Handle form submission (send data to API or process it)
    console.log('Form Data:', {
      initialValuation,
      infusionCapital,
      loanshareValue,
      loanshareName,
      supportingDocs,
    });

    const companyClient = await FlashFundInterface.createMetaMaskClient({ wallet })
    console.log(companyClient);

    //   static createFlashFund = async ({ client, initialValuation, infusedCapital, loanShare, loanShareName }) => {

    const flashFund = await FlashFundInterface.createFlashFund({
      client: companyClient,
      initialValuation: String(initialValuation),
      infusedCapital: String(infusionCapital),
      loanShare: String(loanshareValue),
      loanshareName: String(loanshareName),
    })
    console.log(flashFund);
    console.log(flashFund.contractAddress)
    localStorage.setItem('CURRENT_LOAN', flashFund.contractAddress);
    alert('Form submitted successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-md mt-8">
      <ConnectButton />
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Apply for FlashFund</h1>

      <form onSubmit={handleSubmit}>

        {/* Initial Valuation */}
        <div className="mb-6">
          <label htmlFor="initialValuation" className="block text-sm font-medium text-gray-700">Initial Valuation (ETH)</label>
          <input
            type="text"
            id="initialValuation"
            value={initialValuation}
            onChange={(e) => handleCurrencyChange(e, setInitialValuation)}
            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
            required
          />
        </div>

        {/* Infusion Capital */}
        <div className="mb-6">
          <label htmlFor="infusionCapital" className="block text-sm font-medium text-gray-700">Infusion Capital (ETH)</label>
          <input
            type="number"
            id="infusionCapital"
            value={infusionCapital}
            onChange={(e) => handleCurrencyChange(e, setInfusionCapital)}
            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
            required
          />
        </div>

        <h1 className='text-2xl'>Percentage of Valuation: {(infusionCapital / initialValuation) * 100}% </h1>
        <br />

        {/* Loanshare Value */}
        <div className="mb-6">
          <label htmlFor="loanshareValue" className="block text-sm font-medium text-gray-700">Loanshare Value (ETH)</label>
          <input
            type="text"
            id="loanshareValue"
            value={loanshareValue}
            onChange={(e) => handleCurrencyChange(e, setLoanshareValue)}
            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
            required
          />
        </div>

        {/* Loanshare Name */}
        <div className="mb-6">
          <label htmlFor="loanshareName" className="block text-sm font-medium text-gray-700">Loanshare Name</label>
          <input
            type="text"
            id="loanshareName"
            value={loanshareName}
            onChange={(e) => setLoanshareName(e.target.value)}
            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter name"
            required
          />
        </div>

        {/* Supporting Documentation (Dropzone File Input) */}
        <div className="mb-6">
          <label htmlFor="supportingDocs" className="block text-sm font-medium text-gray-700">Supporting Documentation</label>
          <input
            type="file"
            id="supportingDocs"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <h1 className='text-2xl'>Number of LoanShares: {infusionCapital / (!loanshareValue ? 1 : loanshareValue)} </h1>
        <br />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CompanyForm;
