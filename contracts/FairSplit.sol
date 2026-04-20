// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}

contract FairSplit is ReentrancyGuard, Ownable {
    IERC20 public immutable usdc;
    uint256 private groupCounter;
    uint256 private expenseCounter;

    struct Group {
        uint256 id;
        string name;
        address[] members;
        address creator;
        bool isActive;
        mapping(address => bool) isMember;
    }

    struct Expense {
        uint256 id;
        uint256 groupId;
        address payer;
        uint256 amount;
        string description;
        string category;
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
    mapping(address => uint256) public reputationScore;
    mapping(address => string) public usernames;

    // Events for all state changes
    event GroupCreated(
        uint256 indexed groupId,
        string name,
        address indexed creator
    );
    event MemberAdded(uint256 indexed groupId, address indexed member);
    event ExpenseAdded(
        uint256 indexed groupId,
        uint256 indexed expenseId,
        address indexed payer,
        uint256 amount
    );
    event Settled(
        uint256 indexed groupId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event GroupDeactivated(uint256 indexed groupId);

    // Custom errors (cheaper than strings)
    error NotGroupMember();
    error GroupNotActive();
    error InvalidAmount();
    error ArrayLengthMismatch();
    error NoDebtInGroup();
    error ExceedsDebt();
    error CreditorNotOwed();
    error TransferFailed();
    error AlreadyMember();

    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    // ─── MODIFIERS ────────────────────────────────────────────────────────────

    modifier onlyGroupMember(uint256 groupId) {
        if (!groups[groupId].isMember[msg.sender]) revert NotGroupMember();
        _;
    }

    modifier groupExists(uint256 groupId) {
        if (!groups[groupId].isActive) revert GroupNotActive();
        _;
    }

    // ─── CREATE GROUP ─────────────────────────────────────────────────────────

    function createGroup(
        string calldata name,
        address[] calldata members
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");

        groupCounter++;
        Group storage g = groups[groupCounter];
        g.id = groupCounter;
        g.name = name;
        g.creator = msg.sender;
        g.isActive = true;

        // Add creator
        g.members.push(msg.sender);
        g.isMember[msg.sender] = true;
        userGroups[msg.sender].push(groupCounter);
        emit MemberAdded(groupCounter, msg.sender);

        // Add other members
        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            require(member != address(0), "Invalid member address");
            if (g.isMember[member]) revert AlreadyMember();
            g.members.push(member);
            g.isMember[member] = true;
            userGroups[member].push(groupCounter);
            emit MemberAdded(groupCounter, member);
        }

        emit GroupCreated(groupCounter, name, msg.sender);
        return groupCounter;
    }

    // ─── ADD EXPENSE ──────────────────────────────────────────────────────────

    function addExpense(
        uint256 groupId,
        uint256 amount,
        string calldata description,
        string calldata receiptHash,
        string calldata category,
        address[] calldata debtors,
        uint256[] calldata shares
    ) external onlyGroupMember(groupId) groupExists(groupId) {
        if (amount == 0) revert InvalidAmount();
        if (debtors.length != shares.length) revert ArrayLengthMismatch();
        require(debtors.length > 0, "Must have at least one debtor");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < debtors.length; i++) {
            require(
                groups[groupId].isMember[debtors[i]],
                "Debtor not in group"
            );
            require(shares[i] > 0, "Share must be greater than zero");
            totalShares += shares[i];
        }
        require(totalShares <= amount, "Shares exceed total amount");

        expenseCounter++;
        groupExpenses[groupId].push(
            Expense({
                id: expenseCounter,
                groupId: groupId,
                payer: msg.sender,
                amount: amount,
                description: description,
                receiptHash: receiptHash,
                category: category,
                debtors: debtors,
                shares: shares,
                settled: false,
                timestamp: block.timestamp
            })
        );

        _updateBalances(groupId, msg.sender, debtors, shares);
        emit ExpenseAdded(groupId, expenseCounter, msg.sender, amount);
    }

    function _updateBalances(
        uint256 groupId,
        address payer,
        address[] calldata debtors,
        uint256[] calldata shares
    ) internal {
        for (uint256 i = 0; i < debtors.length; i++) {
            balances[groupId][payer] += int256(shares[i]);
            balances[groupId][debtors[i]] -= int256(shares[i]);
        }
    }

    // ─── SETTLE DEBT ──────────────────────────────────────────────────────────
    // nonReentrant + checks-effects-interactions pattern

    function settle(
        uint256 groupId,
        address creditor,
        uint256 amount
    ) external nonReentrant groupExists(groupId) onlyGroupMember(groupId) {
        if (amount == 0) revert InvalidAmount();
        if (balances[groupId][msg.sender] >= 0) revert NoDebtInGroup();
        if (balances[groupId][creditor] <= 0) revert CreditorNotOwed();
        if (uint256(-balances[groupId][msg.sender]) < amount)
            revert ExceedsDebt();

        // EFFECTS first (checks-effects-interactions)
        balances[groupId][msg.sender] += int256(amount);
        balances[groupId][creditor] -= int256(amount);
        reputationScore[msg.sender] += 1;

        // INTERACTIONS last (external call after state update)
        bool success = usdc.transferFrom(msg.sender, creditor, amount);
        if (!success) revert TransferFailed();

        emit Settled(groupId, msg.sender, creditor, amount);
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    function deactivateGroup(uint256 groupId) external groupExists(groupId) {
        require(
            groups[groupId].creator == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        groups[groupId].isActive = false;
        emit GroupDeactivated(groupId);
    }

    // ─── VIEWS ────────────────────────────────────────────────────────────────

    function getGroup(
        uint256 groupId
    )
        external
        view
        returns (
            uint256 id,
            string memory name,
            address[] memory members,
            address creator,
            bool isActive
        )
    {
        Group storage g = groups[groupId];
        return (g.id, g.name, g.members, g.creator, g.isActive);
    }

    function isMember(
        uint256 groupId,
        address user
    ) external view returns (bool) {
        return groups[groupId].isMember[user];
    }

    function getGroupExpenses(
        uint256 groupId
    ) external view returns (Expense[] memory) {
        return groupExpenses[groupId];
    }

    function getUserGroups(
        address user
    ) external view returns (uint256[] memory) {
        return userGroups[user];
    }

    function getBalance(
        uint256 groupId,
        address user
    ) external view returns (int256) {
        return balances[groupId][user];
    }

    function getReputation(address user) external view returns (uint256) {
        return reputationScore[user];
    }

    function getGroupCount() external view returns (uint256) {
        return groupCounter;
    }

    function getExpenseCount() external view returns (uint256) {
        return expenseCounter;
    }
    function setUsername(string calldata name) external {
        usernames[msg.sender] = name;
    }

    function getUsername(address user) external view returns (string memory) {
        return usernames[user];
    }
}
