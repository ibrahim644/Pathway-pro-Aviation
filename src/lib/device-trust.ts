/**
 * Per-browser random token used for the admin MFA "remember this device"
 * option. Only the token lives here; the server stores a SHA-256 hash of it
 * with an expiry, so a copied token alone is useless without a valid session.
 */
const STORAGE_KEY = "ppat.mfa.device-token";

export function readDeviceToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function createDeviceToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private-mode browsers simply won't remember the device.
  }
  return token;
}

export function clearDeviceToken() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Short human label so staff can recognise the browser in the future. */
export function deviceLabel(): string {
  if (typeof navigator === "undefined") return "Browser";
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Safari\//.test(ua)
        ? "Safari"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : "device";
  return `${browser} on ${os}`;
}
