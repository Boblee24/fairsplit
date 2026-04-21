import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getBalance } from "@/lib/contract";
import { fromUSDC } from "@/lib/contract";

export function useBalance(groupId: bigint | undefined) {
  const { address } = useAccount();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !address) {
      setBalance(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setBalance(0);
    getBalance(groupId, address)
      .then((raw) =>
        setBalance(fromUSDC(raw < 0n ? -raw : raw) * (raw < 0n ? -1 : 1)),
      )
      .finally(() => setLoading(false));
  }, [groupId, address]);

  return { balance, loading };
}
