export const NAVIGATION_START_EVENT = "shortcut-hub:navigation-start";

export function beginNavigation() {
  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}
