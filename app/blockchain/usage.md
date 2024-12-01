# ViemC Usage

```jsx

import chitfundContract from "../contracts/ChitFund.json"

const wc = createWalletClient(...)

const viemClient = new ViemClient({
    walletClient: wc,
});

//getting the address
const addr = await viemClient.getClientAddress();

//getting Balance (wei & eth)
let bal = await viemClient.getBalance();
bal = await viemClient.getBalance({mode: 'ether'});

//signing a message
const sig = viemClient.signMessage({message: 'HELLO'});

//send a transaction with Value
const {txHash, txData} = viemClient.sendTransaction({
	from: '0x....',
	to: '0x.....',
	valueInEth: '0.01'
});

//Creating a Complete Instance for a Deployed Contract
//const ChitFundVC = ViemConract.fromCompiledContract({
//	compiledContract: chitfundContract,
//	contractName: 'ChitFund',
//	deployedAddress: '0x....',
//})
//ChitFundVC.connect({client: viemClient});

//Deploy a Contract from the ClientSide
const ChitFundVCFactory = ViemConract.fromCompiledContract({
	compiledContract: chitfundContract,
})
ChitFundVCFactory.connect({client: viemClient});
const {deploymentHash, chitFundVC} = await ChitFundVCFactory.deploy({
	params: [...],
	valueInEth: '0.01' //incase of pre-paid deployments
});

//Reading Public Values
const chitFundAmount = await chitFundVC.read({method: 'chitAmount'});

//Reading DirectStorageSlots
const xyz = await chitFundVC.readStorageSlot({slot: 0});

//Performing Write Operations
const txHash = await chitFundVC.write({method: 'changeX', params: [10]});

//Sending Valued Transactions to payable method
const txHash = await chitFundVC.write({
	method: 'addFunds', 
	params: [10],
	valueInEth: '0.1',
});

//get all past events
const logs = await chitFundVC.getAllEvents({event: 'CHITADDED'});

//listen for live events
chitFundVC.startListeningToEvent({
	eventDefinition: 'event CHITADDED(uint8 chitId);',
	callback: (e) {
		console.log(e)
		//handle the events here!
	}
});

```