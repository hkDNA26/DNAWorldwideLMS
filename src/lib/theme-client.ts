/**
 * Whether dark mode is active right now, in the browser. An explicit choice
 * (data-theme on <html>) wins; otherwise it follows the OS setting. Shared by
 * the theme toggle and the Mapbox maps (which pick a light/dark map style).
 */
export function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark") return true;
  if (attr === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
