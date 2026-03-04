import { createConfig, http } from 'wagmi'
import { baseSepolia, base } from 'wagmi/chains'
import { coinbaseWallet, injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    coinbaseWallet({
      appName: 'FairSplit',
      appLogoUrl: 'https://fairsplit.vercel.app/logo.png',
      preference: 'all', // 'all' allows both Smart Wallet AND Coinbase Extension
    }),
    metaMask(),
    injected(), // catches any other browser wallet
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}