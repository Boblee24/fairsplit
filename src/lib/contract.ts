import { readContract, writeContract, waitForTransactionReceipt, switchChain } from '@wagmi/core'
import { config } from './wagmi'
import { FAIRSPLIT_ABI } from './abi'
import { parseUnits } from 'viem'
import { baseSepolia } from 'wagmi/chains'

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
  try {
    // Use wagmi's active connector so we switch in the same wallet the user connected.
    await switchChain(config, { chainId: baseSepolia.id })
    return
  } catch (_) {
    // Fallback to direct provider call for wallets/connectors without switchChain support.
  }

  const connector = config.state.current
    ? config.state.connections.get(config.state.current)?.connector
    : undefined
  const connectorProvider = connector
    ? await connector.getProvider()
    : undefined
  const ethereum = (
    connectorProvider ??
    (window as unknown as {
      ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
    }).ethereum
  ) as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } | undefined
  if (!ethereum) return

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x14a34' }],
    })
  } catch (error: unknown) {
    const code = (error as { code?: number })?.code
    if (code !== 4902) throw error

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x14a34',
        chainName: 'Base Sepolia',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia.basescan.org'],
      }],
    })
  }
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
export async function deactivateGroup(groupId: bigint) {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: 'deactivateGroup',
    args: [groupId],
  })
  return waitForTransactionReceipt(config, { hash })
}