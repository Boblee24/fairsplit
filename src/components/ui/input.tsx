import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] outline-none backdrop-blur-xl placeholder:text-slate-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:border-sky-400/80 focus-visible:ring-2 focus-visible:ring-sky-500/60",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
