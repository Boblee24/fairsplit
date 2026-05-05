const GROUPS_CHANGED_STORAGE_KEY = "fairsplit:groups-changed-at";
const RECENT_CHANGE_WINDOW_MS = 30_000;

export const GROUPS_CHANGED_EVENT = "fairsplit:groups-changed";

export function markGroupsChanged() {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    GROUPS_CHANGED_STORAGE_KEY,
    Date.now().toString(),
  );
  window.dispatchEvent(new Event(GROUPS_CHANGED_EVENT));
}

export function hasRecentGroupChange() {
  if (typeof window === "undefined") return false;

  const changedAt = Number(
    window.sessionStorage.getItem(GROUPS_CHANGED_STORAGE_KEY) ?? 0,
  );

  return Number.isFinite(changedAt)
    && Date.now() - changedAt < RECENT_CHANGE_WINDOW_MS;
}
