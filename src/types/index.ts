export interface Group {
  id: bigint
  name: string
  members: string[]
  creator: string
  isActive: boolean
}

export interface Expense {
  id: bigint
  groupId: bigint
  payer: string
  amount: bigint
  description: string
  receiptHash: string
  debtors: string[]
  shares: bigint[]
  settled: boolean
  timestamp: bigint
}

export interface Balance {
  address: string
  amount: bigint // positive = owed, negative = owes
}
//type shii