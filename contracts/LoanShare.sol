// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoanShareContract {
    address public contractCreator;
    uint256 public initialValuation;
    uint256 public infusedCapital;
    uint256 public loanShare;
    string public loanShareName;

    uint256 public outstandingShares;
    mapping(address => uint256) public shareRegistry;
    address[] public users;
    uint8 sharePurchaseCount = 0;

    constructor(
        uint256 _initialValuation,
        uint256 _infusedCapital,
        uint256 _loanShare,
        string memory _loanShareName
    ) {
        require(_loanShare > 0, "Loan share value must be greater than 0");
        require(_infusedCapital > 0, "Infused capital must be greater than 0");

        contractCreator = msg.sender;
        initialValuation = _initialValuation;
        infusedCapital = _infusedCapital;
        loanShare = _loanShare;
        loanShareName = _loanShareName;

        // Calculate initial outstanding shares
        outstandingShares = infusedCapital / loanShare;
    }

    modifier onlyCreator() {
        require(
            msg.sender == contractCreator,
            "Only contract creator can call this"
        );
        _;
    }

    function buy() external payable {
        require(msg.value % loanShare == 0, "NOT_IN_DENOMINATION");
        uint256 shares = msg.value / loanShare;
        require(shares <= outstandingShares, "NOT_ENOUGH_SHARES");
        // uint256 requiredAmouant = shares * loanShare;
        // require(msg.value == requiredAmount, "Incorrect payable amount"); //Hidden for GAS
        shareRegistry[msg.sender] += shares;
        users.push(msg.sender);
        outstandingShares -= shares;
        sharePurchaseCount++;
    }

    function repay() external onlyCreator {
        uint256 totalFunds = address(this).balance;
        require(totalFunds > 0, "No funds to distribute");

        // Distribute funds proportionately to all shareholders
        for (uint256 i = 0; i < sharePurchaseCount; i++) {
            address shareholder = users[i];
            uint256 sharesOwned = shareRegistry[shareholder];
            uint256 payout = (totalFunds * sharesOwned) /
                (infusedCapital / loanShare);
            payable(shareholder).transfer(payout);
        }
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function recieveLoanAmount() public view returns (uint) {
        return address(contractCreator).balance;
    }
}
