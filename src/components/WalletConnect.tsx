// WalletConnect.tsx
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="h-11 px-8 rounded-full min-w-40 text-sm font-bold text-slate-950 bg-linear-to-r from-sky-400 via-emerald-400 to-indigo-500 shadow-[0_15px_45px_-10px_rgba(56,189,248,0.6)] transition-all duration-300 ease-out hover:from-sky-300 hover:via-emerald-300 hover:to-indigo-400 hover:shadow-[0_10px_25px_-8px_rgba(56,189,248,0.8)] hover:-translate-y-0.5 active:scale-95"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={openAccountModal}
                className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs shadow-[0_0_30px_rgba(56,189,248,0.2)]"
              >
                <span className="inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <span className="font-mono text-[11px] text-slate-200">
                  {account.displayName}
                </span>
              </button>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}