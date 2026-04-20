"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletConnect } from "@/components/WalletConnect";

const TICKER = [
  {
    from: "ayo.base.eth",
    to: "tunde.base.eth",
    amount: "12.50",
    label: "Lagos dinner",
  },
  {
    from: "kemi.base.eth",
    to: "david.base.eth",
    amount: "34.00",
    label: "Airbnb split",
  },
  {
    from: "0x4f3c...9a1b",
    to: "sara.base.eth",
    amount: "8.75",
    label: "Taxi fare",
  },
  {
    from: "mike.base.eth",
    to: "0x8d2f...3c7e",
    amount: "55.20",
    label: "Weekend trip",
  },
  {
    from: "amaka.base.eth",
    to: "jide.base.eth",
    amount: "6.00",
    label: "Coffee run",
  },
];

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTickerIndex((i) => (i + 1) % TICKER.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tick = TICKER[tickerIndex];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fs-root {
          min-height: 100vh;
          background: #080a0f;
          font-family: 'DM Sans', sans-serif;
          color: #e8eaf0;
          overflow-x: hidden;
          position: relative;
        }

        /* Subtle grid */
        .fs-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* Glow orbs */
        .fs-orb-1 {
          position: fixed;
          top: -20%;
          left: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(20,184,166,0.12), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .fs-orb-2 {
          position: fixed;
          bottom: -20%;
          right: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .fs-wrap {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* NAV */
        .fs-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 0 0;
        }
        .fs-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .fs-logo span { color: #2dd4bf; }
        .fs-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(45,212,191,0.3);
          color: #2dd4bf;
          background: rgba(45,212,191,0.06);
          letter-spacing: 1px;
        }

        /* HERO */
        .fs-hero {
          padding: 80px 0 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .fs-hero { grid-template-columns: 1fr; gap: 40px; padding: 60px 0 40px; }
          .fs-card-side { display: none; }
        }

        .fs-headline {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(42px, 5vw, 62px);
          line-height: 1.05;
          letter-spacing: -1.5px;
          color: #fff;
        }
        .fs-headline em {
          font-style: italic;
          color: #2dd4bf;
        }

        .fs-sub {
          margin-top: 20px;
          font-size: 16px;
          line-height: 1.7;
          color: #8892a4;
          font-weight: 300;
          max-width: 420px;
        }

        .fs-cta {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          padding-top: 12px;
        }
        .fs-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4a5568;
          letter-spacing: 0.5px;
        }

        /* STATS ROW */
        .fs-stats {
          display: flex;
          gap: 32px;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .fs-stat-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
        }
        .fs-stat-label {
          font-size: 11px;
          color: #4a5568;
          margin-top: 3px;
          letter-spacing: 0.5px;
        }

        /* CARD SIDE */
        .fs-card-side {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .fs-receipt {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .fs-receipt::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #2dd4bf, transparent);
        }

        .fs-receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .fs-receipt-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4a5568;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .fs-receipt-amount {
          font-family: 'JetBrains Mono', monospace;
          font-size: 28px;
          font-weight: 700;
          color: #2dd4bf;
        }
        .fs-receipt-sub {
          font-size: 11px;
          color: #4a5568;
          margin-top: 2px;
        }

        .fs-members {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }
        .fs-member {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .fs-member-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #8892a4;
        }
        .fs-member-amt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }
        .fs-member-amt.owed { color: #f87171; }
        .fs-member-amt.paid { color: #4ade80; }

        /* LIVE TICKER */
        .fs-ticker {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }
        .fs-ticker-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #2dd4bf;
          box-shadow: 0 0 8px #2dd4bf;
          animation: blink 1.5s infinite;
          flex-shrink: 0;
        }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }

        .fs-ticker-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #8892a4;
          transition: opacity 0.3s ease;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .fs-ticker-text.hidden { opacity: 0; }
        .fs-ticker-text .name { color: #e8eaf0; }
        .fs-ticker-amt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          color: #2dd4bf;
          flex-shrink: 0;
        }

        /* FEATURES */
        .fs-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 80px;
        }
        @media (max-width: 640px) {
          .fs-features { grid-template-columns: 1fr; }
        }
        .fs-feature {
          background: #080a0f;
          padding: 28px 24px;
          transition: background 0.2s;
        }
        .fs-feature:hover { background: #0d1117; }
        .fs-feature-icon {
          font-size: 22px;
          margin-bottom: 12px;
        }
        .fs-feature-title {
          font-size: 14px;
          font-weight: 500;
          color: #e8eaf0;
          margin-bottom: 6px;
        }
        .fs-feature-desc {
          font-size: 12px;
          color: #4a5568;
          line-height: 1.6;
        }

        /* FOOTER LINE */
        .fs-foot {
          padding: 20px 0 40px;
          display: flex;
          justify-content: center;
          gap: 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #2a3240;
          letter-spacing: 1px;
        }

        /* Entrance animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.6s ease both; }
        .anim-2 { animation: fadeUp 0.6s 0.1s ease both; }
        .anim-3 { animation: fadeUp 0.6s 0.2s ease both; }
        .anim-4 { animation: fadeUp 0.6s 0.3s ease both; }
        .anim-5 { animation: fadeUp 0.6s 0.15s ease both; }
        .anim-6 { animation: fadeUp 0.6s 0.25s ease both; }
      `}</style>

      <div className="fs-root">
        <div className="fs-orb-1" />
        <div className="fs-orb-2" />

        <div className="fs-wrap">
          {/* NAV */}
          <nav className="fs-nav anim-1">
            <div className="fs-logo">
              Fair<span>Split</span>
            </div>
            <div className="fs-badge">BASE SEPOLIA · TESTNET</div>
          </nav>

          {/* HERO */}
          <section className="fs-hero">
            <div>
              <h1 className="fs-headline anim-2">
                Split bills.
                <br />
                Settle <em>instantly.</em>
                <br />
                On Base.
              </h1>
              <p className="fs-sub anim-3">
                Group expenses settled in USDC on Base — no banks, no IOUs, no
                chasing people for money. Just fair splits, confirmed on-chain.
              </p>

              <div className="fs-cta anim-4">
                <WalletConnect />
                <p className="fs-hint">NON-CUSTODIAL · YOU HOLD YOUR FUNDS</p>
              </div>

              <div className="fs-stats anim-4">
                <div>
                  <div className="fs-stat-val">$0.01</div>
                  <div className="fs-stat-label">avg gas fee</div>
                </div>
                <div>
                  <div className="fs-stat-val">~2s</div>
                  <div className="fs-stat-label">confirmation</div>
                </div>
                <div>
                  <div className="fs-stat-val">USDC</div>
                  <div className="fs-stat-label">stable settlement</div>
                </div>
              </div>
            </div>

            {/* CARD SIDE */}
            <div className="fs-card-side">
              <div className="fs-receipt anim-5">
                <div className="fs-receipt-header">
                  <div>
                    <div className="fs-receipt-title">Group · Weekend Trip</div>
                    <div className="fs-receipt-amount">$120.00</div>
                    <div className="fs-receipt-sub">Split 4 ways · USDC</div>
                  </div>
                </div>
                <div className="fs-members">
                  {[
                    {
                      name: "ayo.base.eth",
                      amt: "+$90.00",
                      type: "paid",
                      label: "paid",
                    },
                    {
                      name: "tunde.base.eth",
                      amt: "-$30.00",
                      type: "owed",
                      label: "owes",
                    },
                    {
                      name: "0x4f3c...9a1b",
                      amt: "-$30.00",
                      type: "owed",
                      label: "owes",
                    },
                    {
                      name: "kemi.base.eth",
                      amt: "-$30.00",
                      type: "owed",
                      label: "owes",
                    },
                  ].map((m) => (
                    <div className="fs-member" key={m.name}>
                      <span className="fs-member-name">{m.name}</span>
                      <span className={`fs-member-amt ${m.type}`}>{m.amt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE TICKER */}
              <div className="fs-ticker anim-6">
                <div className="fs-ticker-dot" />
                <div className={`fs-ticker-text ${visible ? "" : "hidden"}`}>
                  <span className="name">{tick.from}</span>
                  <span> settled with </span>
                  <span className="name">{tick.to}</span>
                  <span> · {tick.label}</span>
                </div>
                <div className="fs-ticker-amt">${tick.amount}</div>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <div className="fs-features anim-4">
            {[
              {
                icon: "🌍",
                title: "Truly borderless",
                desc: "Send USDC to anyone, anywhere. No bank transfers, no FX fees, no waiting.",
              },
              {
                icon: "🔐",
                title: "Non-custodial",
                desc: "Your wallet, your funds. FairSplit never touches your money — the contract does.",
              },
              {
                icon: "🧾",
                title: "On-chain receipts",
                desc: "Every expense and settlement is recorded on Base. Immutable, verifiable, forever.",
              },
            ].map((f) => (
              <div className="fs-feature" key={f.title}>
                <div className="fs-feature-icon">{f.icon}</div>
                <div className="fs-feature-title">{f.title}</div>
                <div className="fs-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="fs-foot">
            <span>BUILT ON BASE</span>
            <span>·</span>
            <span>POWERED BY USDC</span>
            <span>·</span>
            <span>BASE BATCHES 2025</span>
          </div>
        </div>
      </div>
    </>
  );
}
