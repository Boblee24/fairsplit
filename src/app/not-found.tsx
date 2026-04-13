import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 px-4 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.28),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.28),transparent_55%)] opacity-80" />

      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center">
        <section className="w-full rounded-3xl border border-slate-800/70 bg-slate-900/60 px-8 py-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
          <div className="mx-auto inline-flex rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300">
            Error 404
          </div>

          <div className="mt-6 space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              This split slipped
              <span className="block bg-linear-to-r from-sky-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                off the ledger
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-sm text-slate-400 sm:text-base">
              The page you tried to open does not exist, may have moved, or is no longer available.
              Let&apos;s get you back to an active group.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-10 rounded-full bg-linear-to-r from-sky-500 via-emerald-400 to-indigo-500 px-6 text-sm font-medium text-slate-950 shadow-[0_18px_45px_rgba(56,189,248,0.65)] hover:from-sky-400 hover:via-emerald-300 hover:to-indigo-400"
            >
              <Link href="/">Go Home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-slate-700/80 bg-slate-900/60 px-6 text-sm text-slate-100 hover:border-sky-400/80 hover:bg-slate-900"
            >
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {[
              {
                label: 'Check the URL',
                desc: 'A missing or mistyped group id can land you on a dead route.',
              },
              {
                label: 'Refresh state',
                desc: 'If you just created or deleted a group, the app may still be catching up.',
              },
              {
                label: 'Return safely',
                desc: 'Jump back to the dashboard to pick an active group from your list.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_0_40px_rgba(15,23,42,0.9)]"
              >
                <div className="text-sm font-medium text-slate-100">{item.label}</div>
                <div className="mt-1 text-xs text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
