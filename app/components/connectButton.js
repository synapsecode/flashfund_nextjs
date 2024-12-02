import React from "react"
import { ethers } from 'ethers'
import { useWallet } from "../Context/wallet"

const ConnectButton = () => {

    const { wallet, setWallet } = useWallet();

    const connection = async () => {
        const { ethereum } = window
        if (!ethereum) return alert("Please install MetaMask!")
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
        // console.log(account);
        return account;
    }

    const connectWallet = async () => {
        connection().then(account => setWallet(ethers.getAddress(account)))
    }

    return (
        <div className="absolute w-fit h-fit top-20 left-[85%]">
            {wallet ? (
                <>
                    {/* <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        {wallet.slice(0, 7) + '...' + wallet.slice(38, 42)}
                    </span> */}
                    {/* <p className="" onClick={()=>connectWallet()}>{wallet.slice(0, 7) + '...' + wallet.slice(38, 42)}</p> */}
                    <button className="inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-600 group-hover:to-pink-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-600 dark:focus:ring-pink-800">
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            {wallet.slice(0, 7) + '...' + wallet.slice(38, 42)}
                        </span>
                    </button>
                </>
            ) : (
                <>
                    {/* <button className='bg-accent px-4 py-1 rounded-lg absolute top-20 right-20' onClick={()=>connectWallet()}>Connect Wallet</button> */}
                    <button className="inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600 group-hover:from-purple-600 group-hover:to-pink-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-600 dark:focus:ring-pink-800">
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            Connect wallet
                        </span>
                    </button>
                </>
            )}
        </div>
    )
}

export default ConnectButton