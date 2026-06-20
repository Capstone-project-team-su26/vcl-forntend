import http from "node:http";
import https from "node:https";

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
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });

    req.on("error", reject);

    if (body) req.write(body);
    req.end();
  });
}

async function proxyRequest(request, context) {
  const { path } = await context.params;
  const pathSegment = Array.isArray(path) ? path.join("/") : path;
  const apiBase = getApiBase();
  const targetUrl = `${apiBase}/api/${pathSegment}${request.nextUrl.search}`;

  const headers = {};
  const contentType = request.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  const authorization = request.headers.get("authorization");
  if (authorization) headers.authorization = authorization;

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

  let response;

  try {
    response = await nodeRequest(targetUrl, {
      method: request.method,
      headers,
      body,
    });
  } catch (error) {
    console.error(`API proxy failed: ${targetUrl}`, error);
    return Response.json(
      {
        message:
          "Không thể kết nối máy chủ. Kiểm tra API_URL trong .env.local và backend đang chạy.",
      },
      { status: 502 }
    );
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers["content-type"] || "application/json",
    },
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
