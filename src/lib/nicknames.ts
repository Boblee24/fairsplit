import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { config } from "./wagmi";
import { FAIRSPLIT_ABI } from "./abi";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// In-memory cache so we don't re-fetch on every render
const usernameCache: Record<string, string> = {};

export async function setUsername(name: string) {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: FAIRSPLIT_ABI,
    functionName: "setUsername",
    args: [name],
  });
  return waitForTransactionReceipt(config, { hash });
}

export async function fetchUsername(address: string): Promise<string> {
  const key = address.toLowerCase();
  if (usernameCache[key] !== undefined) return usernameCache[key];
  try {
    const name = (await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: FAIRSPLIT_ABI,
      functionName: "getUsername",
      args: [address as `0x${string}`],
    })) as string;
    usernameCache[key] = name || "";
    return name || "";
  } catch {
    usernameCache[key] = "";
    return "";
  }
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatWithName(address: string, name: string): string {
  const short = formatAddress(address);
  return name ? `${name} (${short})` : short;
}
