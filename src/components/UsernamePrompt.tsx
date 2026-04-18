"use client"

import { useState } from "react"
import { setUsername } from "@/lib/nicknames"
import { switchToBaseSepolia } from "@/lib/contract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  onComplete: (name: string) => void
  onSkip: () => void
}

export default function UsernamePrompt({ onComplete, onSkip }: Props) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (!name.trim()) return setError("Enter a username")
    setLoading(true)
    setError("")
    try {
      await switchToBaseSepolia()
      await setUsername(name.trim())
      onComplete(name.trim())
    } catch {
      setError("Failed to save — try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-50">Set your username</h2>
          <p className="text-xs text-slate-400">
            This is how other group members will see you across all groups. Saved on-chain — set it once, use it everywhere.
          </p>
        </div>

        <Input
          placeholder="e.g. Ayo, Tunde, Kemi..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 text-sm font-medium text-slate-950 hover:from-emerald-400 hover:to-sky-300"
          >
            {loading ? "Saving..." : "Save username"}
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            disabled={loading}
            className="h-10 rounded-full text-slate-500 hover:text-slate-300"
          >
            Skip
          </Button>
        </div>

        <p className="text-center text-[11px] text-slate-600">
          You can always set it later from any group page.
        </p>
      </div>
    </div>
  )
}