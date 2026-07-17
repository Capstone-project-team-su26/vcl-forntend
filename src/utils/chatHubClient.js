import { getAccessToken } from "@/utils/authSession";

export const CHAT_EVENTS = {
  receiveMessage: "ReceiveMessage",
  messagesRead: "MessagesRead",
};

const HUB_CACHE_KEY = "vcl:chatHubAvailable";
const HUB_CACHE_AT_KEY = "vcl:chatHubAvailableAt";
const HUB_CACHE_TTL_MS = 60_000;
let hubProbePromise = null;
let signalRModulePromise = null;

function loadSignalR() {
  if (!signalRModulePromise) {
    signalRModulePromise = import("@microsoft/signalr");
  }
  return signalRModulePromise;
}

export function clearChatHubCache() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HUB_CACHE_KEY);
  sessionStorage.removeItem(HUB_CACHE_AT_KEY);
}

/**
 * Hub SignalR phải trỏ thẳng backend (không qua proxy /api của Next.js).
 * Đặt NEXT_PUBLIC_API_URL trùng API_URL, hoặc NEXT_PUBLIC_API_HUB_URL đầy đủ.
 */
export function getChatHubUrl() {
  const explicitHub = process.env.NEXT_PUBLIC_API_HUB_URL?.replace(/\/$/, "");
  if (explicitHub) {
    return explicitHub.endsWith("/hubs/chat") ? explicitHub : `${explicitHub}/hubs/chat`;
  }

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    ""
  ).replace(/\/$/, "");

  if (apiBase) {
    return `${apiBase}/hubs/chat`;
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "https://localhost:7237/hubs/chat";
    }
  }

  return null;
}

export function isChatHubConfigured() {
  return Boolean(getChatHubUrl());
}

/** Tắt hẳn SignalR: NEXT_PUBLIC_ENABLE_CHAT_HUB=false */
export function isChatHubEnabled() {
  const flag = process.env.NEXT_PUBLIC_ENABLE_CHAT_HUB?.toLowerCase();
  if (flag === "false" || flag === "0") {
    return false;
  }
  return isChatHubConfigured();
}

export function isHubNotFoundError(error) {
  const message = String(error?.message || error || "");
  return message.includes("404") || message.includes("not a SignalR endpoint");
}

export function isHubConnectionConnected(connection) {
  return connection?.state === "Connected";
}

export function isHubConnectionDisconnected(connection) {
  return connection?.state === "Disconnected";
}

async function probeChatHubOnce() {
  const hubUrl = getChatHubUrl();
  if (!hubUrl) {
    return false;
  }

  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(HUB_CACHE_KEY);
    const cachedAt = Number(sessionStorage.getItem(HUB_CACHE_AT_KEY) || 0);
    // Chỉ cache khi hub OK; không cache 404 cũ (BE có thể deploy sau).
    if (cached === "1" && Date.now() - cachedAt < HUB_CACHE_TTL_MS) {
      return true;
    }
  }

  const token = getAccessToken();

  try {
    const response = await fetch(`${hubUrl}/negotiate?negotiateVersion=1`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const available = response.ok;

    if (typeof window !== "undefined") {
      if (available) {
        sessionStorage.setItem(HUB_CACHE_KEY, "1");
        sessionStorage.setItem(HUB_CACHE_AT_KEY, String(Date.now()));
      } else {
        clearChatHubCache();
      }
    }

    return available;
  } catch {
    clearChatHubCache();
    return false;
  }
}

/** Kiểm tra hub có tồn tại trên server (tránh 404 spam khi BE chưa deploy ChatHub). */
export function probeChatHubAvailability() {
  if (!isChatHubEnabled()) {
    return Promise.resolve(false);
  }

  if (!hubProbePromise) {
    hubProbePromise = probeChatHubOnce().finally(() => {
      hubProbePromise = null;
    });
  }

  return hubProbePromise;
}

export async function createChatHubConnection() {
  const hubUrl = getChatHubUrl();
  if (!hubUrl) {
    return null;
  }

  const signalR = await loadSignalR();

  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => getAccessToken() || "",
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (context) => {
        if (isHubNotFoundError(context.retryReason)) {
          return null;
        }
        return Math.min(1000 * (context.previousRetryCount + 1), 15000);
      },
    })
    .configureLogging(signalR.LogLevel.None)
    .build();
}

export async function joinConversation(connection, conversationId) {
  if (!connection || !isHubConnectionConnected(connection)) {
    return;
  }

  await connection.invoke("JoinConversation", String(conversationId));
}

export async function leaveConversation(connection, conversationId) {
  if (!connection || !isHubConnectionConnected(connection)) {
    return;
  }

  try {
    await connection.invoke("LeaveConversation", String(conversationId));
  } catch {
    // ignore disconnect race
  }
}
