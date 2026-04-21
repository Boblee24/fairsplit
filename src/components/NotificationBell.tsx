"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";

export function NotificationBell() {
  const { notifications, loading, unreadCount, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) markAllRead();
  }

  const icon = {
    expense_added: "💸",
    settled: "✅",
    member_added: "👋",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-sm font-semibold text-slate-100">
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-xl bg-slate-800/60"
                  />
                ))}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-500">
                No notifications yet
              </div>
            )}

            {!loading &&
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0 ${
                    !n.read ? "bg-slate-800/30" : ""
                  }`}
                >
                  <span className="mt-0.5 text-base shrink-0">
                    {icon[n.type]}
                  </span>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <Link
                      href={`/groups/${n.groupId}`}
                      onClick={() => setOpen(false)}
                      className="text-xs text-slate-200 leading-snug hover:text-white transition-colors"
                    >
                      {n.message}
                    </Link>
                    <div>
                      <a
                        href={`https://sepolia.basescan.org/tx/${n.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-sky-500 hover:text-sky-400"
                      >
                        View tx ↗
                      </a>
                    </div>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
