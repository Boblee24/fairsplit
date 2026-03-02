// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract FairSplit {
    IERC20 public usdc;
    uint256 private groupCounter;
    uint256 private expenseCounter;

    struct Group {
        uint256 id;
        string name;
        address[] members;
        address creator;
        bool isActive;
    }

    struct Expense {
        uint256 id;
        uint256 groupId;
        address payer;
        uint256 amount;
        string description;
        string receiptHash;
        address[] debtors;
        uint256[] shares;
        bool settled;
        uint256 timestamp;
    }

    mapping(uint256 => Group) public groups;
    mapping(uint256 => Expense[]) public groupExpenses;
    mapping(uint256 => mapping(address => int256)) public balances;
    mapping(address => uint256[]) public userGroups;

    event GroupCreated(uint256 indexed groupId, string name, address creator);
    event ExpenseAdded(uint256 indexed groupId, uint256 expenseId, address payer, uint256 amount);
    event Settled(uint256 indexed groupId, address from, address to, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function createGroup(string memory name, address[] memory members) external returns (uint256) {
        groupCounter++;
        Group storage g = groups[groupCounter];
        g.id = groupCounter;
        g.name = name;
        g.creator = msg.sender;
        g.isActive = true;
        g.members.push(msg.sender);
        userGroups[msg.sender].push(groupCounter);
        for (uint i = 0; i < members.length; i++) {
            g.members.push(members[i]);
            userGroups[members[i]].push(groupCounter);
        }
        emit GroupCreated(groupCounter, name, msg.sender);
        return groupCounter;
    }

    function addExpense(
        uint256 groupId, uint256 amount, string memory description,
        string memory receiptHash, address[] memory debtors, uint256[] memory shares
    ) external {
        require(groups[groupId].isActive, "Group not active");
        require(debtors.length == shares.length, "Mismatch");
        expenseCounter++;
        Expense memory exp = Expense({
            id: expenseCounter, groupId: groupId, payer: msg.sender,
            amount: amount, description: description, receiptHash: receiptHash,
            debtors: debtors, shares: shares, settled: false, timestamp: block.timestamp
        });
        groupExpenses[groupId].push(exp);
        for (uint i = 0; i < debtors.length; i++) {
            balances[groupId][msg.sender] += int256(shares[i]);
            balances[groupId][debtors[i]] -= int256(shares[i]);
        }
        emit ExpenseAdded(groupId, expenseCounter, msg.sender, amount);
    }

    function settle(uint256 groupId, address creditor, uint256 amount) external {
        require(usdc.transferFrom(msg.sender, creditor, amount), "Transfer failed");
        balances[groupId][msg.sender] += int256(amount);
        balances[groupId][creditor] -= int256(amount);
        emit Settled(groupId, msg.sender, creditor, amount);
    }

    function getGroup(uint256 groupId) external view returns (Group memory) { return groups[groupId]; }
    function getGroupExpenses(uint256 groupId) external view returns (Expense[] memory) { return groupExpenses[groupId]; }
    function getUserGroups(address user) external view returns (uint256[] memory) { return userGroups[user]; }
    function getBalance(uint256 groupId, address user) external view returns (int256) { return balances[groupId][user]; }
}
