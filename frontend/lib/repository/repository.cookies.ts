/**
 * Custom event name dispatched when repository settings are updated via API.
 * The dashboard footer listens for this to re-fetch its links.
 */
export const REPOSITORY_SETTINGS_UPDATED = "repository-settings-updated";

/** Dispatch after a successful PATCH so listeners (e.g. footer) re-fetch. */
export function notifyRepositorySettingsUpdated(): void {
  window.dispatchEvent(new Event(REPOSITORY_SETTINGS_UPDATED));
}
