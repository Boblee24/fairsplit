import Link from "next/link";
import "@/styles/fairsplit-theme.css";

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
    <div className="fs-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"2rem 1rem" }}>
      <div className="fs-mesh"    aria-hidden />
      <div className="fs-texture" aria-hidden />

      <div className="relative z-10 w-full max-w-2xl">

        {/* Main card */}
        <div
          className="fs-animate fs-d1"
          style={{
            background: "var(--fs-surface)",
            border: "1px solid var(--fs-border-mid)",
            borderRadius: "var(--fs-radius-xl)",
            padding: "clamp(2rem, 5vw, 3rem)",
            textAlign: "center",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px var(--fs-border-accent)",
          }}
        >
          {/* Error badge */}
          <span className="fs-badge fs-badge-accent">Error 404</span>

          {/* Headline */}
          <h1
            className="fs-animate fs-d2"
            style={{
              fontFamily: "var(--fs-display)",
              fontSize: "clamp(2rem, 7vw, 3.2rem)",
              color: "var(--fs-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginTop: "1.25rem",
            }}
          >
            This split slipped
            <span
              style={{
                display: "block",
                color: "var(--fs-accent)",
                fontStyle: "italic",
              }}
            >
              off the ledger.
            </span>
          </h1>

          {/* Sub */}
          <p
            className="fs-animate fs-d3"
            style={{
              fontFamily: "var(--fs-ui)",
              fontSize: "0.9rem",
              color: "var(--fs-text-2)",
              lineHeight: 1.7,
              maxWidth: 420,
              margin: "1rem auto 0",
            }}
          >
            The page you tried to open doesn&apos;t exist, may have moved, or is no longer available. Let's get you back to an active group.
          </p>

          {/* Buttons */}
          <div
            className="fs-animate fs-d4"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.75rem", flexWrap:"wrap", marginTop:"2rem" }}
          >
            <Link href="/" className="fs-btn fs-btn-primary fs-btn-md">
              Go Home
            </Link>
            <Link href="/dashboard" className="fs-btn fs-btn-ghost fs-btn-md">
              Open Dashboard
            </Link>
          </div>

          {/* Divider */}
          <div
            className="fs-animate fs-d5"
            style={{ borderTop:"1px solid var(--fs-border)", marginTop:"2rem", paddingTop:"1.75rem" }}
          >
            {/* Tips grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"0.75rem", textAlign:"left" }}>
              {TIPS.map((tip, i) => (
                <div
                  key={tip.label}
                  className={`fs-animate fs-d${i + 6}`}
                  style={{
                    background: "var(--fs-surface-2)",
                    border: "1px solid var(--fs-border)",
                    borderRadius: "var(--fs-radius)",
                    padding: "0.9rem 1rem",
                  }}
                >
                  <p style={{ fontFamily:"var(--fs-ui)", fontSize:"0.8rem", fontWeight:700, color:"var(--fs-text)", marginBottom:"0.3rem" }}>
                    {tip.label}
                  </p>
                  <p style={{ fontFamily:"var(--fs-ui)", fontSize:"0.72rem", color:"var(--fs-muted)", lineHeight:1.55 }}>
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer mono note */}
          <p
            className="fs-animate fs-d9"
            style={{
              fontFamily: "var(--fs-mono)",
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fs-muted)",
              marginTop: "1.75rem",
              opacity: 0.5,
            }}
          >
            FairSplit · Base Sepolia · On-chain expense splitting
          </p>
        </div>
      </div>
    </div>
  );
}