import { useEffect, useState } from "react";
import { fetchUsername, formatWithName } from "@/lib/nicknames";

export function useUsernames(addresses: string[]) {
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!addresses.length) return;
    Promise.all(
      addresses.map(async (addr) => {
        const name = await fetchUsername(addr);
        return [addr.toLowerCase(), formatWithName(addr, name)] as const;
      }),
    ).then((entries) => setNames(Object.fromEntries(entries)));
  }, [addresses.join(",")]);

  // Fallback: if not yet loaded, show truncated address
  const resolve = (address: string) =>
    names[address.toLowerCase()] ??
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return { resolve, names };
}
