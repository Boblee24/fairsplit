const STORAGE_KEY = 'fairsplit_nicknames'

function load(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function save(data: Record<string, string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function setNickname(address: string, name: string) {
  if (!address || !name.trim()) return
  const data = load()
  data[address.toLowerCase()] = name.trim()
  save(data)
}

export function getNickname(address: string): string | null {
  if (!address) return null
  const data = load()
  return data[address.toLowerCase()] || null
}

export function resolveAddress(address: string): string {
  if (!address) return ''
  const name = getNickname(address)
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`
  return name ? `${name} (${short})` : short
}

export function getGroupMembers(addresses: string[]): { address: string; label: string }[] {
  return addresses.map(addr => ({
    address: addr,
    label: resolveAddress(addr)
  }))
}