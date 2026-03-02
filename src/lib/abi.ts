export const FAIRSPLIT_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_usdc", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "name": "createGroup",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "members", "type": "address[]" }
    ],
    "outputs": [{ "type": "uint256" }]
  },
  {
    "name": "addExpense",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "groupId", "type": "uint256" },
      { "name": "amount", "type": "uint256" },
      { "name": "description", "type": "string" },
      { "name": "receiptHash", "type": "string" },
      { "name": "debtors", "type": "address[]" },
      { "name": "shares", "type": "uint256[]" }
    ],
    "outputs": []
  },
  {
    "name": "settle",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "groupId", "type": "uint256" },
      { "name": "creditor", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "getGroup",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "groupId", "type": "uint256" }],
    "outputs": [{
      "components": [
        { "name": "id", "type": "uint256" },
        { "name": "name", "type": "string" },
        { "name": "members", "type": "address[]" },
        { "name": "creator", "type": "address" },
        { "name": "isActive", "type": "bool" }
      ],
      "type": "tuple"
    }]
  },
  {
    "name": "getGroupExpenses",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "groupId", "type": "uint256" }],
    "outputs": [{
      "components": [
        { "name": "id", "type": "uint256" },
        { "name": "groupId", "type": "uint256" },
        { "name": "payer", "type": "address" },
        { "name": "amount", "type": "uint256" },
        { "name": "description", "type": "string" },
        { "name": "receiptHash", "type": "string" },
        { "name": "debtors", "type": "address[]" },
        { "name": "shares", "type": "uint256[]" },
        { "name": "settled", "type": "bool" },
        { "name": "timestamp", "type": "uint256" }
      ],
      "type": "tuple[]"
    }]
  },
  {
    "name": "getUserGroups",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "type": "uint256[]" }]
  },
  {
    "name": "getBalance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "groupId", "type": "uint256" },
      { "name": "user", "type": "address" }
    ],
    "outputs": [{ "type": "int256" }]
  },
  {
    "name": "GroupCreated",
    "type": "event",
    "inputs": [
      { "name": "groupId", "indexed": true, "type": "uint256" },
      { "name": "name", "indexed": false, "type": "string" },
      { "name": "creator", "indexed": false, "type": "address" }
    ]
  },
  {
    "name": "ExpenseAdded",
    "type": "event",
    "inputs": [
      { "name": "groupId", "indexed": true, "type": "uint256" },
      { "name": "expenseId", "indexed": false, "type": "uint256" },
      { "name": "payer", "indexed": false, "type": "address" },
      { "name": "amount", "indexed": false, "type": "uint256" }
    ]
  },
  {
    "name": "Settled",
    "type": "event",
    "inputs": [
      { "name": "groupId", "indexed": true, "type": "uint256" },
      { "name": "from", "indexed": false, "type": "address" },
      { "name": "to", "indexed": false, "type": "address" },
      { "name": "amount", "indexed": false, "type": "uint256" }
    ]
  }
] as const
