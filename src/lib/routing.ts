const GITHUB_PROJECT_BASE = "/100spasibo";

function usesGithubProjectBase() {
  return window.location.hostname.endsWith("github.io");
}

export function getRoutePath(pathname = window.location.pathname) {
  if (!usesGithubProjectBase()) return pathname;
  if (pathname === GITHUB_PROJECT_BASE) return "/";
  if (pathname.startsWith(`${GITHUB_PROJECT_BASE}/`)) {
    return pathname.slice(GITHUB_PROJECT_BASE.length) || "/";
  }
  return pathname;
}

export function getBrowserPath(routePath: string) {
  if (!usesGithubProjectBase()) return routePath;
  return `${GITHUB_PROJECT_BASE}${routePath === "/" ? "/" : routePath}`;
}
