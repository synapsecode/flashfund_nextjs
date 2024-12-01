import { decodeEventLog, formatEther, getAddress, getContract, parseAbi, parseEther, publicActions, toHex } from "viem";

class ViemGlobals {
    static eventUnsubscriberList = [];
}

export class ViemClient {
    walletClient = null;

    constructor({ walletClient }) {
        this.walletClient = walletClient.extend(publicActions);
    }

    async getClientAddress() {
        try {
            this._handleGuardrails();
            const [addr] = await this.walletClient.getAddresses();
            return getAddress(addr);
        } catch (error) {
            throw new Error(`CLIENT_GETADDRESS_EXCEPTION: ${error}`);
        }

    }

    async sendTransaction({ from, to, valueInEth }) {
        this._handleGuardrails();
        try {
            if (from === undefined) {
                from = await this.getClientAddress();
                console.log(`sendTransaction: 'from' address automatically set to: ${from}`)
            }
            const hash = await this.walletClient.sendTransaction({
                account: from,
                to: to,
                value: parseEther(valueInEth)
            })
            const txdata = await this.walletClient.waitForTransactionReceipt({ hash: hash });
            return { hash, txdata };
        } catch (error) {
            throw new Error(`CLIENT_SENDTRANSACTION_EXCEPTION: ${error}`);
        }
    }

    async getBalance({ mode = 'wei' } = {}) {
        this._handleGuardrails();
        try {
            const bal = await this.walletClient.getBalance({
                address: await this.getClientAddress(),
            });
            if (mode == 'ether') return Number(formatEther(bal));
            else return bal;
        } catch (error) {
            throw new Error(`CLIENT_GETBALANCEINWEI_EXCEPTION: ${error}`);
        }
    }

    async signMessage({ message }) {
        this._handleGuardrails();
        try {
            const account = await this.getClientAddress();
            const signature = await this.walletClient.signMessage({
                account,
                message: message,
            });
            return signature;
        } catch (error) {
            throw new Error(`CLIENT_SIGNMESSAGE_EXCEPTION: ${error}`);
        }
    }

    _handleGuardrails() {
        if (this.walletClient == null) throw new Error('WALLET_CLIENT_NOT_CONNECTED');
    }
}

export class ViemContract {
    contractAddress = null;
    walletClient = null;
    abi = null;
    bytecode = null;
    contractName = null;

    static fromCompiledContract({ compiledContract, deployedAddress = null }) {
        return new ViemContract({
            abi: compiledContract['abi'],
            bin: compiledContract['bytecode'],
            deployedAddress: deployedAddress,
            contractName: compiledContract['contractName']
        });
    }

    constructor({ abi, bin, deployedAddress, contractName }) {
        this.abi = abi;
        this.bytecode = bin;
        this.contractAddress = deployedAddress;
        this.contractName = contractName;
    }

    connect({ client }) {
        this.walletClient = client.walletClient.extend(publicActions);
        // console.log('WalletClient connected Successfully!')
    }


    async deploy({ params = [], valueInEth = undefined }) {
        this._handleGuardrails();
        try {
            const hash = await this.walletClient.deployContract({
                abi: this.abi,
                bytecode: this.bytecode,
                args: [...params], // any number should be in BigInt. like 125n
                value: valueInEth ? parseEther(valueInEth) : undefined,
            })
            // console.log('TXHASH', hash);
            const { contractAddress } = await this.walletClient.waitForTransactionReceipt({ hash });
            // console.log('CONTRACT_ADDRESS', contractAddress);
            if (!contractAddress) throw new Error('CONTRACT_NOT_DEPLOYED');
            const contract = new ViemContract({
                abi: this.abi,
                bin: this.bytecode,
                deployedAddress: contractAddress,
                contractName: this.contractName,
            })
            return { hash, contract };
        } catch (error) {
            throw new Error(`DEPLOY_EXCEPTION: ${error}`);
        }
    }

    async read({ method }) {
        this._handleGuardrails();
        try {
            const data = await this.walletClient.readContract({
                address: this.contractAddress,
                abi: this.abi,
                functionName: method
            })
            return data;
        } catch (error) {
            throw new Error(`READ_EXCEPTION: ${error}`);
        }
    }

    async readStorageSlot({ slot }) {
        this._handleGuardrails();
        try {
            const x = await this.walletClient.getStorageAt({
                address: this.contractAddress,
                slot: toHex(slot),
            });
            return x;
        } catch (error) {
            throw new Error(`READSTORAGESLOT_EXCEPTION: ${error}`);
        }
    }

    async write({ method, params = [], valueInEth = undefined }) {
        this._handleGuardrails();
        try {
            const hash = await this.walletClient.writeContract({
                address: this.contractAddress,
                abi: this.abi,
                functionName: method,
                args: [...params],
                value: valueInEth ? parseEther(valueInEth) : undefined,
            })
            const txHash = await this.walletClient.waitForTransactionReceipt({ hash: hash });
            return txHash;
        } catch (error) {
            throw new Error(`READ_EXCEPTION: ${error}`);
        }
    }

    async getAllEvents({ event }) {
        this._handleGuardrails();
        try {
            const logs = await this.walletClient.getContractEvents({
                abi: this.abi,
                address: this.contractAddress,
                eventName: event,
            });
            return logs;
        } catch (error) {
            throw new Error(`GETALLEVENTS_EXCEPTION: ${error}`)
        }
    }

    startListeningToEvents = ({ eventSignatures, callback }) => {
        this._handleGuardrails();
        try {
            const unwatch = this.walletClient.watchEvent({
                events: parseAbi(eventSignatures),
                onLogs: logs => {
                    const parsedData = decodeEventLog({
                        abi: parseAbi(eventSignatures.filter((z) => z.includes(logs[0].eventName))),
                        data: logs[0].data,
                        topics: logs[0].topics,
                        strict: false
                    });
                    callback(logs[0].eventName, parsedData);
                }
            })
            ViemGlobals.eventUnsubscriberList.push({
                contract: this.contractAddress,
                dispose: unwatch,
            });
            console.log(`Started Listening Events!`);

        } catch (error) {
            throw new Error(`STARTLISTENINGTOEVENTS_EXCEPTION: ${error}`);
        }
    }

    // startListeningToEvent = (
    //     { eventDefinition, callback, indexedArguments = undefined }
    // ) => {
    //     this._handleGuardrails();
    //     try {
    //         const eventName = eventDefinition.substring(6, eventDefinition.indexOf('('));
    //         const unwatch = this.walletClient.watchContractEvent({
    //             address: this.contractAddress,
    //             abi: this.abi,
    //             eventName: eventName,
    //             args: indexedArguments !== undefined ? { ...indexedArguments } : undefined,
    //             onLogs: logs => {
    //                 const parsedData = decodeEventLog({
    //                     abi: parseAbi([eventDefinition]),
    //                     data: logs[0].data,
    //                     topics: logs[0].topics,
    //                     strict: false
    //                 });
    //                 callback(parsedData);
    //             }
    //         });
    //         ViemGlobals.eventUnsubscriberList.push({
    //             contract: this.contractAddress,
    //             dispose: unwatch,
    //         });
    //         console.log(`Started Listening to ${eventName} event`);
    //     } catch (error) {
    //         throw new Error(`STARTLISTENINGTOEVENT_EXCEPTION: ${error}`);
    //     }

    // }

    stopListeningToEvents = async () => {
        this._handleGuardrails();
        try {
            const remlist = ViemGlobals.eventUnsubscriberList.filter((x) => x.contract !== this.contractAddress);
            const evlist = ViemGlobals.eventUnsubscriberList.filter((x) => x.contract === this.contractAddress);
            for (let ev of evlist) {
                await ev.dispose();
            }
            ViemGlobals.eventUnsubscriberList = [...remlist];
            console.log(`Stopped Listenign to all Events of Contract(${this.contractName})`)
        } catch (error) {
            throw new Error(`STOPLISTENINGTOEVENTS_EXCEPTION: ${error}`);
        }
    }

    // async _fetchTransactionReceipt({ hash }) {

    //     const _get = async () => {
    //         const response = await fetch(API_URL, {
    //             method: 'POST',
    //             headers: {
    //                 'accept': 'application/json',
    //                 'content-type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 id: 1,
    //                 jsonrpc: '2.0',
    //                 method: 'eth_getTransactionReceipt',
    //                 params: [
    //                     hash
    //                 ],
    //             }),
    //         });

    //         if (!response.ok) {
    //             throw new Error(`fetchTransactionReceipt: HTTP error! status: ${response.status}`);
    //         }
    //         const data = await response.json();
    //         return data['result'];
    //     }

    //     while (true) {
    //         const z = await _get();
    //         if (z != null) return z;
    //         await new Promise(r => setTimeout(r, 1000));
    //         console.log('retrying to fetch TXReceipt');
    //     }
    // }

    _handleGuardrails() {
        if (this.abi === null || this.bytecode == null) throw new Error('CONTRACT_UNINITIALIZED');
        if (this.walletClient == null) throw new Error('WALLET_CLIENT_NOT_CONNECTED');
    }
}