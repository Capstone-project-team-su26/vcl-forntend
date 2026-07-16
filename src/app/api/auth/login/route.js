import http from "node:http";
import https from "node:https";
import { NextResponse } from "next/server";
import { mockLogin } from "@/utils/mocks/authMocks";
import {
  AUTH_SESSION_COOKIE,
  LEGACY_AUTH_COOKIE,
  LEGACY_ROLE_COOKIE,
  authCookieOptions,
  clearAuthCookieOptions,
  expiresAtToUnix,
  signAuthPayload,
} from "@/utils/signedAuthCookie";

const insecureHttpsAgent =
  process.env.NODE_ENV === "development"
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

function getApiBase() {
  const raw =
    process.env.API_URL ||
    process.env.API_PROXY_TARGET ||
    "https://localhost:7237";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

function nodeRequest(url, { method, headers, body }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const options = {
      method,
      headers,
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
    };
    if (parsed.protocol === "https:" && insecureHttpsAgent) {
      options.agent = insecureHttpsAgent;
    }

    const req = lib.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 502,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function allowMockLogin(request) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return false;
  }
  if (process.env.NEXT_PUBLIC_DATA_SOURCE?.toLowerCase() === "mock") return true;
  return request.headers.get("x-vcl-data-source")?.toLowerCase() === "mock";
}

function applySessionCookies(response, signed, maxAge) {
  response.cookies.set(AUTH_SESSION_COOKIE, signed, authCookieOptions(maxAge));
  response.cookies.set(LEGACY_AUTH_COOKIE, "", clearAuthCookieOptions());
  response.cookies.set(LEGACY_ROLE_COOKIE, "", clearAuthCookieOptions());
}

async function loginAgainstBackend(email, password) {
  const targetUrl = `${getApiBase()}/api/Auth/login`;
  const upstream = await nodeRequest(targetUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data = null;
  try {
    data = upstream.body ? JSON.parse(upstream.body) : null;
  } catch {
    data = { message: upstream.body || "Đăng nhập thất bại." };
  }

  return { status: upstream.status, data };
}

/** Server login — chỉ route này được set cookie HttpOnly đã ký. */
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Payload không hợp lệ." }, { status: 400 });
  }

  const email = payload?.email?.trim();
  const password = payload?.password;
  if (!email || !password) {
    return NextResponse.json({ message: "Email và mật khẩu là bắt buộc." }, { status: 400 });
  }

  let auth;
  let status = 200;

  try {
    if (allowMockLogin(request)) {
      auth = await mockLogin({ email, password });
    } else {
      const upstream = await loginAgainstBackend(email, password);
      status = upstream.status;
      auth = upstream.data;
      if (status < 200 || status >= 300) {
        return NextResponse.json(auth || { message: "Đăng nhập thất bại." }, { status });
      }
    }
  } catch (error) {
    console.error("auth login failed", error);
    return NextResponse.json(
      {
        message:
          "Không thể kết nối máy chủ. Kiểm tra API_URL trong .env.local và backend đang chạy.",
      },
      { status: 502 }
    );
  }

  if (!auth?.token || !auth?.role) {
    return NextResponse.json({ message: "Phản hồi đăng nhập không hợp lệ." }, { status: 502 });
  }

  const exp = expiresAtToUnix(auth.expiresAt);
  const signed = await signAuthPayload({ role: auth.role, exp });
  if (!signed) {
    return NextResponse.json(
      { message: "Thiếu AUTH_COOKIE_SECRET — không thể tạo phiên đăng nhập." },
      { status: 500 }
    );
  }

  const maxAge = Math.max(60, exp - Math.floor(Date.now() / 1000));
  const response = NextResponse.json(auth, { status: 200 });
  applySessionCookies(response, signed, maxAge);
  return response;
}
