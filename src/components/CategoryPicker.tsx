"use client"

import { useState } from "react"
import { CATEGORIES } from "@/lib/categories"

type Props = {
  value: string
  onChange: (categoryId: string) => void
}

export default function CategoryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const selected = CATEGORIES.find((c) => c.id === value) ?? CATEGORIES[CATEGORIES.length - 1]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-sm text-slate-100 hover:border-slate-600 transition-colors"
      >
        <span className="text-base">{selected.emoji}</span>
        <span>{selected.label}</span>
        <span className="ml-auto text-slate-500 text-xs">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl p-2 grid grid-cols-3 gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { onChange(cat.id); setOpen(false) }}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs transition-all hover:bg-slate-800 ${
                value === cat.id
                  ? "ring-1 ring-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "text-slate-400"
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}