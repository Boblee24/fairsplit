"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";
import "@/styles/fairsplit-theme.css";

const TYPE_ICON: Record<string, string> = {
  expense_added: "💸",
  settled:       "✅",
  member_added:  "👋",
};

export function NotificationBell() {
  const { notifications, loading, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) markAllRead();
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: `1px solid ${open ? "var(--fs-border-accent)" : "var(--fs-border-mid)"}`,
          background: open ? "var(--fs-accent-dim)" : "var(--fs-surface)",
          color: open ? "var(--fs-accent)" : "var(--fs-muted)",
          cursor: "pointer",
          transition: "border-color .15s, background .15s, color .15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--fs-border-accent)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--fs-accent)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--fs-border-mid)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--fs-muted)";
          }
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: -3, right: -3,
            minWidth: 16, height: 16,
            padding: "0 3px",
            borderRadius: 999,
            background: "var(--fs-accent)",
            color: "#071312",
            fontSize: 9,
            fontWeight: 800,
            fontFamily: "var(--fs-mono)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 8px)",
          width: 320,
          zIndex: 50,
          background: "var(--fs-surface)",
          border: "1px solid var(--fs-border-mid)",
          borderRadius: "var(--fs-radius-lg)",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px var(--fs-border-accent)",
        }}>

          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--fs-border)",
          }}>
            <span style={{ fontFamily: "var(--fs-ui)", fontWeight: 700, fontSize: "0.825rem", color: "var(--fs-text)" }}>
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontFamily: "var(--fs-mono)",
                  fontSize: "9.5px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--fs-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fs-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fs-muted)")}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>

            {/* Loading */}
            {loading && (
              <div style={{ padding: "0.75rem" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="fs-skeleton"
                    style={{ height: 48, borderRadius: "var(--fs-radius-sm)", marginBottom: 8, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && notifications.length === 0 && (
              <div style={{ padding: "2.5rem 1rem", textAlign: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1px solid var(--fs-border-accent)",
                  background: "var(--fs-accent-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 0.75rem",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fs-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p style={{ fontFamily: "var(--fs-ui)", fontSize: "0.75rem", color: "var(--fs-muted)" }}>
                  No notifications yet
                </p>
              </div>
            )}

            {/* Notification rows */}
            {!loading && notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--fs-border)",
                  background: !n.read ? "rgba(0,210,180,0.04)" : "transparent",
                  transition: "background .15s",
                }}
              >
                {/* Icon */}
                <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>
                  {TYPE_ICON[n.type] ?? "🔔"}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/groups/${n.groupId}`}
                    onClick={() => setOpen(false)}
                    style={{
                      fontFamily: "var(--fs-ui)",
                      fontSize: "0.75rem",
                      color: "var(--fs-text-2)",
                      lineHeight: 1.5,
                      textDecoration: "none",
                      display: "block",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fs-text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fs-text-2)")}
                  >
                    {n.message}
                  </Link>
                  <a
                    href={`https://sepolia.basescan.org/tx/${n.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--fs-mono)",
                      fontSize: "9.5px",
                      letterSpacing: "0.06em",
                      color: "var(--fs-accent)",
                      textDecoration: "none",
                      marginTop: 3,
                      display: "inline-block",
                      opacity: 0.75,
                      transition: "opacity .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.75")}
                  >
                    View tx ↗
                  </a>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <span style={{
                    width: 7, height: 7,
                    borderRadius: "50%",
                    background: "var(--fs-accent)",
                    flexShrink: 0,
                    marginTop: 5,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}