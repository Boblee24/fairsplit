"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { addExpense, getGroup, switchToBaseSepolia } from "@/lib/contract";
import { uploadReceipt } from "@/lib/pinata";
import { fetchUsername, formatWithName } from "@/lib/nicknames";
import CategoryPicker from "@/components/CategoryPicker";
import { parseContractError } from "@/lib/error";
import Link from "next/link";

function AddExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId") || "1";
  const { address } = useAccount();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([]);
  const [groupMembers, setGroupMembers] = useState<
    { address: string; label: string }[]
  >([]);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const result = (await getGroup(BigInt(groupId))) as any;
        const members: string[] = Array.isArray(result)
          ? result[2]
          : result.members;
        const others = members.filter(
          (m) => m.toLowerCase() !== address?.toLowerCase(),
        );
        const withNames = await Promise.all(
          others.map(async (addr) => {
            const name = await fetchUsername(addr);
            return { address: addr, label: formatWithName(addr, name) };
          }),
        );
        setGroupMembers(withNames);
      } catch (e) {
        console.error("Failed to fetch group members", e);
      }
    }
    if (address) fetchMembers();
  }, [groupId, address]);

  function toggleDebtor(addr: string) {
    setSelectedDebtors((prev) =>
      prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr],
    );
  }

  const sharePerPerson =
    amount && selectedDebtors.length > 0
      ? (parseFloat(amount) / (selectedDebtors.length + 1)).toFixed(2)
      : "0.00";

  async function handleSubmit() {
    if (!description.trim()) return setError("Description is required");
    if (!amount || parseFloat(amount) <= 0)
      return setError("Enter a valid amount");
    if (selectedDebtors.length === 0)
      return setError("Select at least one person to split with");

    const totalAmount = parseFloat(amount);
    const share = totalAmount / (selectedDebtors.length + 1);
    const shares = selectedDebtors.map(() => share);

    setLoading(true);
    setError("");
    try {
      await switchToBaseSepolia();
      let receiptHash = "";
      if (receipt) {
        try {
          receiptHash = await uploadReceipt(receipt);
        } catch (_) {}
      }
      await addExpense(
        BigInt(groupId),
        totalAmount,
        description,
        receiptHash,
        category,
        selectedDebtors,
        shares,
      );
      router.push(`/groups/${groupId}`);
    } catch (e: unknown) {
      setError(parseContractError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fs-page">
      <div className="fs-mesh" aria-hidden />
      <div className="fs-texture" aria-hidden />

      {/* Header */}
      <header className="fs-header">
        <div className="fs-header-inner">
          <div className="flex items-center gap-2">
            <Link href={`/groups/${groupId}`} className="fs-back">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 2L4 7l5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </Link>
            <span className="fs-breadcrumb-sep">/</span>
            <span className="fs-breadcrumb-title">Add expense</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-8 sm:px-6">
        {/* Headline */}
        <div className="fs-animate fs-d1 mb-7">
          <h1
            style={{
              fontFamily: "var(--fs-display)",
              fontSize: "clamp(1.6rem,5vw,2.2rem)",
              color: "var(--fs-text)",
              letterSpacing: "-0.01em",
            }}
          >
            Add expense
          </h1>
          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--fs-text-2)",
              fontFamily: "var(--fs-ui)",
              lineHeight: 1.6,
            }}
          >
            You paid — we&apos;ll calculate who owes what.
          </p>
        </div>

        <div className="fs-animate fs-d2 fs-panel space-y-5">
          {/* Description */}
          <div>
            <label className="fs-label">What was it for?</label>
            <input
              className="fs-input"
              placeholder="Dinner at Nobu, Airbnb, taxi…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="fs-label">Total amount (USDC)</label>
            <div className="fs-input-prefix-wrap">
              <span className="fs-input-prefix">$</span>
              <input
                className="fs-input"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ paddingLeft: "1.8rem" }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="fs-label">Category</label>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>

          {/* Split with */}
          <div>
            <label className="fs-label">Split with</label>
            <p
              className="fs-hint"
              style={{ marginTop: 0, marginBottom: "0.6rem" }}
            >
              You paid. Select who owes you.
            </p>

            {groupMembers.length === 0 ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="fs-skeleton h-11 w-full"
                    style={{
                      borderRadius: "var(--fs-radius-sm)",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {groupMembers.map((member) => {
                  const selected = selectedDebtors.includes(member.address);
                  return (
                    <div
                      key={member.address}
                      className={`fs-check-row ${selected ? "selected" : ""}`}
                      onClick={() => toggleDebtor(member.address)}
                    >
                      <div className={`fs-check-box`}>
                        {selected && (
                          <svg
                            width="9"
                            height="7"
                            viewBox="0 0 9 7"
                            fill="none"
                          >
                            <path
                              d="M1 3.5L3.5 6 8 1"
                              stroke="#071312"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-sm"
                        style={{
                          color: "var(--fs-text)",
                          fontFamily: "var(--fs-ui)",
                        }}
                      >
                        {member.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Split preview */}
          {parseFloat(amount) > 0 && selectedDebtors.length > 0 && (
            <div className="fs-split-preview">
              <p
                className="text-xs"
                style={{
                  color: "var(--fs-accent)",
                  fontFamily: "var(--fs-ui)",
                }}
              >
                Split {selectedDebtors.length + 1} ways —{" "}
                <span style={{ fontWeight: 700 }}>
                  each person owes ${sharePerPerson} USDC
                </span>
              </p>
            </div>
          )}

          {/* Receipt */}
          <div>
            <label className="fs-label">
              Receipt photo{" "}
              <span
                style={{
                  color: "var(--fs-muted)",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontWeight: 500,
                }}
              >
                (optional)
              </span>
            </label>
            <input
              className="fs-input"
              type="file"
              accept="image/*"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* Error */}
          {error && <div className="fs-error">{error}</div>}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="fs-btn fs-btn-positive fs-btn-lg fs-btn-full"
          >
            {loading ? "Adding to blockchain…" : "Add Expense"}
          </button>

          <p
            className="text-center"
            style={{
              fontSize: "0.7rem",
              color: "var(--fs-muted)",
              fontFamily: "var(--fs-ui)",
            }}
          >
            ~$0.01 gas fee on Base · ~2s confirmation
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AddExpensePage() {
  return (
    <Suspense
      fallback={
        <div
          className="fs-page flex items-center justify-center"
          style={{ color: "var(--fs-muted)", fontFamily: "var(--fs-ui)" }}
        >
          Loading…
        </div>
      }
    >
      <AddExpenseForm />
    </Suspense>
  );
}
