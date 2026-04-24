# FairSplit 🔗

> Split expenses globally. Settle instantly with USDC on Base.

FairSplit is a blockchain-based expense-splitting app — like Splitwise, but trustless and borderless. Groups track shared expenses on-chain, and members settle debts instantly using USDC on the Base network with near-zero fees.

**Live app:** [fairsplit-ten.vercel.app](https://fairsplit-ten.vercel.app)

---

## ⚡ Try it now (Quickstart)

### 1. Install a wallet

You'll need [MetaMask](https://metamask.io) or [Rabby](https://rabby.io) (browser extension). FairSplit runs on **Base Sepolia testnet** — no real money involved.

### 2. Add Base Sepolia to your wallet

In MetaMask: **Settings → Networks → Add a network manually**

| Field | Value |
|---|---|
| Network name | Base Sepolia |
| RPC URL | `https://sepolia.base.org` |
| Chain ID | `84532` |
| Currency symbol | `ETH` |
| Block explorer | `https://sepolia.basescan.org` |

Or click **"Add to MetaMask"** directly on [Chainlist](https://chainlist.org/chain/84532).

### 3. Get testnet ETH (for gas)

Go to the [Base Sepolia faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) or [Alchemy faucet](https://www.alchemy.com/faucets/base-sepolia) and paste your wallet address. You'll receive a small amount of test ETH to cover gas fees.

### 4. Get test USDC

FairSplit uses the official Base Sepolia USDC:
`0x036CbD53842c5426634e7929541eC2318f3dCF7e`

Get test USDC from the portal.cdp.coinbase.com and paste your address.

### 5. Approve USDC spending

Before settling a debt, you'll need to approve the FairSplit contract to spend your USDC. The app prompts you to do this automatically when you settle — just confirm both transactions in your wallet.

### 6. Connect and go

1. Click **Connect Wallet** in the top right
2. Create a group and add your friends' wallet addresses
3. Log expenses as they happen
4. Settle up with one click — USDC transfers instantly on-chain

---

## ✨ Features

- **On-chain expense tracking** — all data lives on the blockchain, no backend
- **Instant USDC settlement** — pay anyone, anywhere, in seconds
- **Expense categories** — tag expenses (food, transport, accommodation, etc.)
- **Settlement history** — full on-chain log of all payments
- **On-chain usernames** — set a display name visible to all your group members
- **In-app notifications** — get alerted when expenses are added or debts settled
- **Mobile responsive** — works on any device

---

## 🏗 How it works

```
User A pays for dinner → logs expense on-chain
Contract updates balances for all group members
User B owes User A → clicks Settle
USDC transfers from B → A via smart contract
Balances update instantly on-chain
```

No intermediary holds funds. No backend database. The contract *is* the app state.

---

## 🔧 Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Blockchain | Solidity 0.8.20, Base Sepolia |
| Wallet integration | wagmi v2, viem, RainbowKit |
| Token | USDC (ERC-20) |
| Deployment | Vercel (frontend), Remix IDE (contracts) |

---

## 📄 Contract

| | |
|---|---|
| Network | Base Sepolia (Chain ID: 84532) |
| FairSplit contract | `0xB05A33f7A179754De8F98d6d39119255c25dfc27` |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Explorer | [View on Basescan](https://sepolia.basescan.org/address/0xB05A33f7A179754De8F98d6d39119255c25dfc27) |

---

## 🧑‍💻 Run locally

```bash
git clone https://github.com/YOUR_USERNAME/fairsplit.git
cd fairsplit
npm install
cp .env.example .env.local   # add your WalletConnect project ID
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a WalletConnect project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com) (free).

---

## 🌍 Why Base + USDC?

Traditional expense apps (Splitwise, etc.) require bank transfers to actually settle up — slow, expensive across borders, and impossible without shared banking infrastructure. FairSplit uses USDC on Base to solve this:

- **USDC** — stable value, no crypto volatility risk when splitting a dinner bill
- **Base** — transactions cost fractions of a cent, confirming in ~2 seconds
- **No borders** — a group can include anyone with a wallet, anywhere in the world

Built for the **Base Batches Hackathon** student track.

---

## 🙏 Acknowledgements


- [RainbowKit](https://rainbowkit.com) for wallet connection UI
- [shadcn/ui](https://ui.shadcn.com) for components
- [Base](https://base.org) for the L2 infrastructure