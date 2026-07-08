import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "@/utils/authSession";

export const CHAT_EVENTS = {
  receiveMessage: "ReceiveMessage",
  messagesRead: "MessagesRead",
};

const HUB_CACHE_KEY = "vcl:chatHubAvailable";
let hubProbePromise = null;

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

async function probeChatHubOnce() {
  const hubUrl = getChatHubUrl();
  if (!hubUrl) {
    return false;
  }

  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(HUB_CACHE_KEY);
    if (cached === "0") return false;
    if (cached === "1") return true;
  }

  const token = getAccessToken();

  try {
    const response = await fetch(`${hubUrl}/negotiate?negotiateVersion=1`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const available = response.ok;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(HUB_CACHE_KEY, available ? "1" : "0");
    }

    return available;
  } catch {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(HUB_CACHE_KEY, "0");
    }
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

export function createChatHubConnection() {
  const hubUrl = getChatHubUrl();
  if (!hubUrl) {
    return null;
  }

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
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
    return;
  }

  await connection.invoke("JoinConversation", String(conversationId));
}

export async function leaveConversation(connection, conversationId) {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
    return;
  }

  try {
    await connection.invoke("LeaveConversation", String(conversationId));
  } catch {
    // ignore disconnect race
  }
}

export { signalR };
