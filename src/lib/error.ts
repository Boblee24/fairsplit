
export function parseContractError(err: unknown): string {
  if (!err) return "An unknown error occurred.";

  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
      ? err
      : JSON.stringify(err);

  // ── User deliberately cancelled ───────────────────────────────────────────
  if (
    message.includes("User rejected") ||
    message.includes("user rejected") ||
    message.includes("User denied") ||
    message.includes("user denied") ||
    message.includes("ACTION_REJECTED") ||
    message.includes("4001")
  ) {
    return "Transaction cancelled, you rejected the request in your wallet.";
  }

  // ── Custom contract errors (from your FairSplit contract) ─────────────────
  if (message.includes("NotGroupMember"))
    return "You're not a member of this group.";
  if (message.includes("GroupNotActive"))
    return "This group is no longer active.";
  if (message.includes("InvalidAmount"))
    return "Amount must be greater than zero.";
  if (message.includes("ArrayLengthMismatch"))
    return "Debtors and shares arrays must be the same length.";
  if (message.includes("NoDebtInGroup"))
    return "You don't have any outstanding debt in this group.";
  if (message.includes("ExceedsDebt"))
    return "Settlement amount exceeds your current debt.";
  if (message.includes("CreditorNotOwed"))
    return "That address isn't owed any money in this group.";
  if (message.includes("TransferFailed"))
    return "USDC transfer failed — check your balance and allowance.";
  if (message.includes("AlreadyMember"))
    return "That wallet is already a member of this group.";

  // ── Require / revert strings ──────────────────────────────────────────────
  if (message.includes("Name cannot be empty"))
    return "Group name can't be empty.";
  if (message.includes("Invalid member address"))
    return "One of the addresses is invalid.";
  if (message.includes("Debtor not in group"))
    return "One of the debtors isn't in this group.";
  if (message.includes("Shares exceed total amount"))
    return "The sum of shares exceeds the total expense amount.";
  if (message.includes("Must have at least one debtor"))
    return "Add at least one person to split with.";
  if (message.includes("Not authorized"))
    return "Only the group creator can do this.";

  // ── Network / RPC errors ──────────────────────────────────────────────────
  if (
    message.includes("insufficient funds") ||
    message.includes("InsufficientFundsError")
  )
    return "Insufficient funds to cover gas fees.";
  if (message.includes("nonce") && message.includes("too low"))
    return "Transaction nonce conflict — try resetting your wallet's nonce or waiting a moment.";
  if (
    message.includes("network changed") ||
    message.includes("chain mismatch") ||
    message.includes("wrong network") ||
    message.includes("chainId")
  )
    return "Wrong network — please switch to Base Sepolia in your wallet.";
  if (message.includes("timeout") || message.includes("Timeout"))
    return "Request timed out — the RPC may be congested. Try again in a moment.";
  if (
    message.includes("execution reverted") ||
    message.includes("reverted with")
  )
    return "Transaction reverted by the contract — check your inputs and try again.";

  // ── USDC allowance hint ───────────────────────────────────────────────────
  if (message.includes("allowance") || message.includes("ERC20: transfer amount exceeds allowance"))
    return "Insufficient USDC allowance — approve the contract to spend your USDC first.";

  // ── Fallback: show first sentence only (avoids the giant blob) ───────────
  const firstSentence = message.split(/[.\n]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length < 120)
    return firstSentence;

  return "Something went wrong. Check your wallet and try again.";
}