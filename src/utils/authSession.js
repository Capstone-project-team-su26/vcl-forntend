const SESSION_KEY = "swiftship_session";
const ACCESS_TOKEN_KEY = "accessToken";
const PENDING_EMAIL_KEY = "swiftship_pending_email";
const ROLE_COOKIE = "vcl_role";
const AUTH_COOKIE = "vcl_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setCookie(name, value, maxAge = COOKIE_MAX_AGE) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/** Đồng bộ cookie cho middleware (localStorage không đọc được trên server). */
export function syncAuthCookies(session) {
  if (typeof document === "undefined") return;

  if (session?.token && session?.role) {
    setCookie(ROLE_COOKIE, session.role);
    setCookie(AUTH_COOKIE, "1");
    return;
  }

  deleteCookie(ROLE_COOKIE);
  deleteCookie(AUTH_COOKIE);
}

export function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) || getSession()?.token || null;
}

export function setSession(session) {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  if (session?.token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.token);
  }

  syncAuthCookies(session);
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  syncAuthCookies(null);
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}

export function setPendingRegisterEmail(email) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function getPendingRegisterEmail() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_EMAIL_KEY);
}

export function clearPendingRegisterEmail() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_EMAIL_KEY);
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
