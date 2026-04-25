import { useEffect, useState } from "react";
import { getGroupExpenses } from "@/lib/contract";
import type { Expense } from "@/types";

function sortExpenses(expenses: Expense[]) {
  return [...expenses].sort((a, b) => {
    if (a.settled !== b.settled) return Number(a.settled) - Number(b.settled);
    if (a.timestamp !== b.timestamp) return Number(b.timestamp - a.timestamp);
    return Number(b.id - a.id);
  });
}

export function useExpenses(groupId: bigint | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setExpenses([]);
    getGroupExpenses(groupId)
      .then((data) => {
        setExpenses(sortExpenses(data as Expense[]));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [groupId]);

  return { expenses, loading };
}
