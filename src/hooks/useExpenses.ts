import { useEffect, useState } from "react";
import { getGroupExpenses } from "@/lib/contract";
import type { Expense } from "@/types";

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
        setExpenses(data as Expense[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [groupId]);

  return { expenses, loading };
}
