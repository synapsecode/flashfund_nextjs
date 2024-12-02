"use client";
import { ethers } from "ethers";
import { useContext, createContext, useState, useEffect } from "react";


const WalletContext = createContext({
    wallet: null,
    setWallet: () => ''
})

export const WalletProvider = ({ children }) => {
    const [wallet, setWallet] = useState()
    if (typeof window === 'object') {
        const { ethereum } = window.window
        const accounts = ethereum.request({ method: 'eth_requestAccounts' }).then((result) => {
            setWallet(ethers.getAddress(result[0]))
        })
        ethereum.on('accountsChanged', async () => {
            const newAcc = await window.ethereum.request({ method: 'eth_requestAccounts' })
            setWallet(ethers.getAddress(newAcc[0]))
        })
    }

    return (
        <WalletContext.Provider value={{ wallet, setWallet }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext);