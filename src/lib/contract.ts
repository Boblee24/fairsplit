import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from './wagmi'
import { FAIRSPLIT_ABI } from './abi'
import { parseUnits } from 'viem'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`

export const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  }
] as const

// USDC has 6 decimals
export const toUSDC = (amount: number) => parseUnits(amount.toString(), 6)
export const fromUSDC = (amount: bigint) => Number(amount) / 1_000_000


export async function switchToBaseSepolia() {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x14A34' }], // 84532 in hex = Base Sepolia
  })
}
export async function createGroup(name: string, members: string[]) {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'createGroup',
    args: [name, members as `0x${string}`[]],
  })
  return waitForTransactionReceipt(config, { hash })
}

export async function addExpense(
  groupId: bigint,
  amount: number,
  description: string,
  receiptHash: string,
  debtors: string[],
  shares: number[]
) {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'addExpense',
    args: [
      groupId,
      toUSDC(amount),
      description,
      receiptHash,
      debtors as `0x${string}`[],
      shares.map(s => toUSDC(s))
    ],
  })
  return waitForTransactionReceipt(config, { hash })
}

export async function approveUSDC(amount: number) {
  const hash = await writeContract(config, {
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'approve',
    args: [CONTRACT_ADDRESS, toUSDC(amount)],
  })
  return waitForTransactionReceipt(config, { hash })
}

export async function settleDebt(groupId: bigint, creditor: string, amount: number) {
  // First approve, then settle
  await approveUSDC(amount)
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'settle',
    args: [groupId, creditor as `0x${string}`, toUSDC(amount)],
  })
  return waitForTransactionReceipt(config, { hash })
}

export async function getGroup(groupId: bigint) {
  return readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'getGroup',
    args: [groupId],
  })
}

export async function getGroupExpenses(groupId: bigint) {
  return readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'getGroupExpenses',
    args: [groupId],
  })
}

export async function getUserGroups(address: string) {
  return readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'getUserGroups',
    args: [address as `0x${string}`],
  })
}

export async function getBalance(groupId: bigint, address: string) {
  return readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'getBalance',
    args: [groupId, address as `0x${string}`],
  })
}
