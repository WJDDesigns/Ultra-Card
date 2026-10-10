/** Dashboard url_path from the current location (`default` for the main dashboard). */
export function getCurrentDashboardId(): string {
  const path = window.location.pathname;
  const match = path.match(/\/lovelace\/(.+)$/);
  return match ? match[1] : 'default';
}
