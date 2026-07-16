const SESSION_KEY = "swiftship_session";
const ACCESS_TOKEN_KEY = "accessToken";

function isExpired(session) {
  if (!session?.expiresAt) return false;
  const ms = new Date(session.expiresAt).getTime();
  return Number.isFinite(ms) && ms <= Date.now();
}

/** Xóa cookie HttpOnly phía server (best-effort). */
export function clearServerSession() {
  if (typeof window === "undefined") return;
  void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
}

export function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (isExpired(session)) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      clearServerSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  const session = getSession();
  if (!session) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) || session.token || null;
}

export function setSession(session) {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  if (session?.token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.token);
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  clearServerSession();
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}

/** Map AuthResponse từ backend sang session FE. */
export function createSessionFromAuthResponse(auth, email) {
  return {
    token: auth.token,
    expiresAt: auth.expiresAt,
    userId: auth.userId,
    fullName: auth.fullName,
    role: auth.role,
    email: email || auth.email,
    displayName: auth.fullName,
  };
}
