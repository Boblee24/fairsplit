// app/not-found.tsx
// Pure server component — NO "use client", NO CSS imports, NO external deps.
// All styles are inline so this page never triggers a compile chain.
import Link from "next/link";

const TIPS = [
  {
    label: "Check the URL",
    desc:  "A missing or mistyped group ID can land you on a dead route.",
  },
  {
    label: "Refresh state",
    desc:  "If you just created or deleted a group, the app may still be catching up.",
  },
  {
    label: "Return safely",
    desc:  "Jump back to the dashboard to pick an active group from your list.",
  },
];

export default function NotFound() {
  return (
    <>
      {/* Scoped styles — no external file needed */}
      <style>{`
        .nf-page {
          min-height: 100vh;
          background: #091918;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: system-ui, sans-serif;
          color: #e8f5f4;
          position: relative;
          overflow: hidden;
        }
        .nf-mesh {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 55% at 15% -5%,  rgba(0,210,180,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 55% 45% at 90% 110%, rgba(0,180,160,0.08) 0%, transparent 60%);
        }
        .nf-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 680px;
          background: #0d2322;
          border: 1px solid rgba(0,210,180,0.20);
          border-radius: 20px;
          padding: clamp(2rem, 5vw, 3rem);
          text-align: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,210,180,0.15);
        }
        .nf-badge {
          display: inline-flex;
          align-items: center;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #00d2b4;
          background: rgba(0,210,180,0.09);
          border: 1px solid rgba(0,210,180,0.42);
          padding: 3px 10px;
          border-radius: 999px;
          font-family: 'Courier New', monospace;
        }
        .nf-h1 {
          margin: 1.2rem 0 0;
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #e8f5f4;
        }
        .nf-h1 em {
          display: block;
          font-style: italic;
          color: #00d2b4;
          font-weight: 400;
        }
        .nf-sub {
          margin: 1rem auto 0;
          max-width: 420px;
          font-size: 0.9rem;
          color: rgba(232,245,244,0.62);
          line-height: 1.7;
        }
        .nf-btns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 2rem;
        }
        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #00d2b4;
          color: #071312;
          font-weight: 700;
          font-size: 0.85rem;
          border-radius: 999px;
          padding: 0.65rem 1.5rem;
          text-decoration: none;
          transition: opacity .15s, transform .15s;
        }
        .nf-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .nf-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: #00d2b4;
          font-weight: 700;
          font-size: 0.85rem;
          border-radius: 999px;
          border: 1px solid rgba(0,210,180,0.42);
          padding: 0.65rem 1.5rem;
          text-decoration: none;
          transition: background .15s;
        }
        .nf-btn-ghost:hover { background: rgba(0,210,180,0.09); }
        .nf-divider {
          border: none;
          border-top: 1px solid rgba(0,210,180,0.09);
          margin: 2rem 0 1.75rem;
        }
        .nf-tips {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          text-align: left;
        }
        .nf-tip {
          background: #112b2a;
          border: 1px solid rgba(0,210,180,0.09);
          border-radius: 12px;
          padding: 0.9rem 1rem;
        }
        .nf-tip-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #e8f5f4;
          margin-bottom: 0.3rem;
        }
        .nf-tip-desc {
          font-size: 0.72rem;
          color: rgba(232,245,244,0.38);
          line-height: 1.55;
        }
        .nf-footer {
          margin-top: 1.75rem;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(232,245,244,0.20);
          font-family: 'Courier New', monospace;
        }
      `}</style>

      <div className="nf-page">
        <div className="nf-mesh" aria-hidden />

        <div className="nf-card">
          <span className="nf-badge">Error 404</span>

          <h1 className="nf-h1">
            This split slipped
            <em>off the ledger.</em>
          </h1>

          <p className="nf-sub">
            The page you tried to open doesn&apos;t exist, may have moved, or is no longer available.
            Let&apos;s get you back to an active group.
          </p>

          <div className="nf-btns">
            <Link href="/"          className="nf-btn-primary">Go Home</Link>
            <Link href="/dashboard" className="nf-btn-ghost">Open Dashboard</Link>
          </div>

          <hr className="nf-divider" />

          <div className="nf-tips">
            {TIPS.map((tip) => (
              <div key={tip.label} className="nf-tip">
                <p className="nf-tip-title">{tip.label}</p>
                <p className="nf-tip-desc">{tip.desc}</p>
              </div>
            ))}
          </div>

          <p className="nf-footer">
            FairSplit · Base Sepolia · On-chain expense splitting
          </p>
        </div>
      </div>
    </>
  );
}