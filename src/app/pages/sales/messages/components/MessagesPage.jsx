"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversationChat } from "@/hooks/useConversationChat";
import { getAccessToken, getSession } from "@/utils/authSession";
import { getErrorMessage } from "@/utils/apiError";
import { isMockMode } from "@/utils/mocks/dataSource";
import {
  CONVERSATION_RELATED_TYPE_LABELS,
  formatMessageTime,
  getConversation,
  listConversations,
  markConversationAsRead,
  sendMessage,
  dedupeConversations,
  normalizeConversationMessage,
  resolveMediaUrl,
} from "@/modules/messages";

const AVATAR_TONES = [
  "bg-primary",
  "bg-secondary",
  "bg-[#5865F2]",
  "bg-[#57F287]",
  "bg-[#EB459E]",
  "bg-[#ED4245]",
  "bg-[#FAA61A]",
];

const GROUP_WINDOW_MS = 7 * 60 * 1000;

function haveMessagesChanged(prev = [], next = []) {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i += 1) {
    if (prev[i]?.id !== next[i]?.id) return true;
    if (prev[i]?.isRead !== next[i]?.isRead) return true;
  }
  return false;
}

function haveConversationsChanged(prev = [], next = []) {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (a?.id !== b?.id) return true;
    if (a?.lastMessageAt !== b?.lastMessageAt) return true;
    if (a?.unreadCount !== b?.unreadCount) return true;
    if (a?.lastMessagePreview !== b?.lastMessagePreview) return true;
  }
  return false;
}

function getInitials(name) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${second}`.toUpperCase() || "?";
}

function avatarTone(seed) {
  const raw = String(seed || "");
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function sameCalendarDay(a, b) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function shouldGroupWithPrevious(prev, current) {
  if (!prev || !current) return false;
  if (prev.senderId !== current.senderId) return false;
  const gap = new Date(current.createdAt).getTime() - new Date(prev.createdAt).getTime();
  return Number.isFinite(gap) && gap >= 0 && gap < GROUP_WINDOW_MS;
}

function formatDayDivider(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMsg = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startToday - startMsg) / 86400000);

  if (dayDiff === 0) return "Hôm nay";
  if (dayDiff === 1) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHeaderClock(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function relatedTypeLabel(type) {
  return CONVERSATION_RELATED_TYPE_LABELS[type] || type || "Trao đổi";
}

function shortRef(id) {
  if (!id) return "";
  const raw = String(id);
  if (raw.length <= 10) return raw;
  return `${raw.slice(0, 8)}…`;
}

function UserAvatar({ name, seed, size = "md", className = "" }) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-[11px]"
      : size === "lg"
        ? "h-14 w-14 text-lg"
        : "h-10 w-10 text-sm";
  return (
    <div
      className={`shrink-0 rounded-full ${sizeClass} ${avatarTone(seed || name)} flex items-center justify-center font-bold text-white ${className}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

function TypePill({ type }) {
  const label = relatedTypeLabel(type);
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-surface-elevated text-muted border border-border-muted">
      {label}
    </span>
  );
}

function ConversationListItem({ item, isActive, onSelect }) {
  const preview =
    item.lastMessagePreview?.trim() ||
    (item.relatedId ? `Mã ${shortRef(item.relatedId)}` : "Chưa có tin nhắn");

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`w-[calc(100%-1rem)] text-left mx-2 px-2.5 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-primary/20 text-ink"
          : "text-muted hover:bg-surface-muted/80 hover:text-ink"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative shrink-0">
          <UserAvatar name={item.customerName} seed={item.customerId || item.id} size="sm" />
          {item.unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-danger text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-surface">
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-[13px] truncate ${
                isActive || item.unreadCount > 0 ? "font-semibold text-ink" : "font-medium"
              }`}
            >
              {item.customerName || "Khách hàng"}
            </p>
            <span className="shrink-0 text-[10px] tabular-nums text-faint">
              {formatMessageTime(item.lastMessageAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
            <TypePill type={item.relatedType} />
            <p className="text-[12px] text-subtle truncate min-w-0">{preview}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function DayDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-3 px-4" role="separator">
      <div className="h-px flex-1 bg-border-muted" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-faint shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-border-muted" />
    </div>
  );
}

function MessageAttachment({ url }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    async function load() {
      const resolved = resolveMediaUrl(url);
      if (!resolved) {
        setFailed(true);
        return;
      }

      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const isApiHosted =
        Boolean(apiBase) && resolved.startsWith(apiBase) && !resolved.includes("cloudinary");

      // Ảnh public (Cloudinary…) — gắn trực tiếp
      if (!isApiHosted && (/^https?:\/\//i.test(resolved) || /^data:/i.test(resolved))) {
        if (!cancelled) {
          setSrc(resolved);
          setFailed(false);
        }
        return;
      }

      // File trên API (cần Bearer) — fetch blob rồi hiện
      try {
        const token = getAccessToken();
        const response = await fetch(resolved, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (cancelled) return;

        const type = blob.type || "";
        const looksImage =
          type.startsWith("image/") || type === "application/octet-stream" || type === "";
        if (!looksImage) {
          setFailed(true);
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setFailed(false);
      } catch {
        // Fallback: vẫn thử <img> trực tiếp (URL public nhưng host trùng API)
        if (!cancelled) {
          setSrc(resolved);
          setFailed(false);
        }
      }
    }

    setSrc(null);
    setFailed(false);
    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (failed) {
    const href = resolveMediaUrl(url);
    const canOpen = href && /^https?:\/\//i.test(href);
    return (
      <div className="mt-2 inline-flex flex-col gap-1 rounded-lg border border-border-muted bg-surface-muted/50 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Icon icon="lucide:image-off" className="w-3.5 h-3.5" />
          Không tải được ảnh đính kèm
        </span>
        {canOpen ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-primary hover:underline truncate max-w-xs"
          >
            Mở liên kết
          </a>
        ) : null}
      </div>
    );
  }

  if (!src) {
    return (
      <div className="mt-2 h-36 w-56 animate-pulse rounded-lg border border-border-muted bg-surface-muted/60" />
    );
  }

  return (
    <a
      href={src.startsWith("blob:") ? resolveMediaUrl(url) || src : src}
      target="_blank"
      rel="noreferrer"
      className="mt-2 block max-w-sm overflow-hidden rounded-lg border border-border-muted bg-surface-muted/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Ảnh đính kèm"
        className="max-h-72 w-full object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </a>
  );
}

function MessageRow({ message, isOwn, grouped, fallbackName }) {
  const displayName =
    message.senderName ||
    (isOwn ? "Bạn" : fallbackName || (message.senderRole === "SALES" ? "Sales" : "Khách hàng"));
  const text = message.content?.trim();

  return (
    <div
      className={`group relative flex gap-3.5 px-4 ${
        grouped ? "py-0.5" : "mt-3 py-1"
      } hover:bg-surface-muted/40 rounded-sm`}
    >
      {grouped ? (
        <div className="w-8 shrink-0 flex justify-end pt-1.5 pr-0.5">
          <span className="text-[10px] text-faint opacity-0 group-hover:opacity-100 leading-none tabular-nums">
            {formatHeaderClock(message.createdAt)}
          </span>
        </div>
      ) : (
        <UserAvatar
          name={displayName}
          seed={message.senderId || displayName}
          size="sm"
          className="mt-0.5"
        />
      )}

      <div className="min-w-0 flex-1">
        {!grouped ? (
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className={`text-sm font-semibold leading-none ${isOwn ? "text-primary" : "text-ink"}`}>
              {displayName}
            </span>
            <span className="text-[11px] text-faint leading-none">
              {formatMessageTime(message.createdAt)}
              {isOwn && message.isRead ? " · Đã xem" : ""}
            </span>
          </div>
        ) : null}

        {text ? (
          <p className="text-sm leading-relaxed text-ink/95 whitespace-pre-wrap wrap-break-word">
            {text}
          </p>
        ) : null}

        {message.attachmentUrl ? <MessageAttachment url={message.attachmentUrl} /> : null}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const session = getSession();
  const currentUserId = session?.userId;

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const composerRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setIsLoadingList(true);
    setError("");
    try {
      const items = await listConversations();
      setConversations(items);
      if (!selectedId && items.length > 0) {
        setSelectedId(items[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingList(false);
    }
  }, [selectedId]);

  const loadDetail = useCallback(async (conversationId) => {
    if (!conversationId) {
      setDetail(null);
      return;
    }

    setIsLoadingDetail(true);
    setError("");
    try {
      const data = await getConversation(conversationId);
      setDetail(data);
      const lastMessage = data.messages?.[data.messages.length - 1];
      setConversations((prev) =>
        dedupeConversations(
          prev.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  lastMessagePreview: lastMessage?.content ?? item.lastMessagePreview,
                  lastMessageAt: lastMessage?.createdAt ?? item.lastMessageAt,
                  unreadCount: 0,
                  updatedAt: data.updatedAt ?? item.updatedAt,
                }
              : item
          )
        )
      );
      await markConversationAsRead(conversationId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const handleIncomingMessage = useCallback(
    (raw) => {
      const message = normalizeConversationMessage(raw);
      if (!message) {
        loadConversations();
        return;
      }

      if (message.conversationId !== selectedId) {
        loadConversations();
        return;
      }

      setDetail((prev) => {
        if (!prev) return prev;
        const exists = prev.messages.some((item) => item.id === message.id);
        if (exists) return prev;
        return {
          ...prev,
          messages: [...prev.messages, message],
          updatedAt: message.createdAt,
        };
      });

      if (message.senderId !== currentUserId) {
        markConversationAsRead(selectedId).catch(() => {});
      }

      loadConversations();
    },
    [selectedId, currentUserId, loadConversations]
  );

  const handleMessagesRead = useCallback(
    (event) => {
      if (!event || event.conversationId !== selectedId) return;

      setDetail((prev) => {
        if (!prev) return prev;
        const ids = new Set(event.messageIds || []);
        return {
          ...prev,
          messages: prev.messages.map((message) =>
            ids.has(message.id) ? { ...message, isRead: true } : message
          ),
        };
      });
    },
    [selectedId]
  );

  const { hubAvailable, isConnected } = useConversationChat({
    conversationId: selectedId,
    onMessage: handleIncomingMessage,
    onMessagesRead: handleMessagesRead,
  });

  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (isMockMode() || isConnected) {
      return undefined;
    }

    let stopped = false;

    const tick = async () => {
      if (stopped || document.hidden) return;

      try {
        const items = await listConversations();
        if (stopped) return;
        setConversations((prev) => (haveConversationsChanged(prev, items) ? items : prev));

        const activeId = selectedIdRef.current;
        if (!activeId) return;

        const data = await getConversation(activeId);
        if (stopped || selectedIdRef.current !== activeId) return;

        let hadNewIncoming = false;
        setDetail((prev) => {
          if (!prev || prev.id !== data.id) return data;
          if (!haveMessagesChanged(prev.messages, data.messages)) return prev;
          hadNewIncoming = data.messages.some(
            (m) => m.senderId !== currentUserId && !m.isRead
          );
          return data;
        });

        if (hadNewIncoming) {
          markConversationAsRead(activeId).catch(() => {});
        }
      } catch {
        // im lặng — lần poll sau thử lại
      }
    };

    const timer = window.setInterval(tick, 2500);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [isConnected, currentUserId]);

  const selectedSummary = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId]
  );

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((item) => {
      const hay = [
        item.customerName,
        item.lastMessagePreview,
        item.relatedId,
        relatedTypeLabel(item.relatedType),
        item.relatedType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, search]);

  const messageNodes = useMemo(() => {
    const messages = detail?.messages || [];
    const nodes = [];

    for (let i = 0; i < messages.length; i += 1) {
      const message = messages[i];
      const prev = messages[i - 1];

      if (!prev || !sameCalendarDay(prev.createdAt, message.createdAt)) {
        nodes.push({
          type: "day",
          key: `day-${message.createdAt}-${i}`,
          label: formatDayDivider(message.createdAt),
        });
      }

      nodes.push({
        type: "message",
        key: message.id,
        message,
        grouped: shouldGroupWithPrevious(prev, message),
        isOwn: message.senderId === currentUserId,
      });
    }

    return nodes;
  }, [detail?.messages, currentUserId]);

  const hasMessages = (detail?.messages?.length || 0) > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages?.length, selectedId, isLoadingDetail]);

  function resizeComposer() {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 24), 120)}px`;
  }

  useEffect(() => {
    resizeComposer();
  }, [draft]);

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setMobileShowChat(true);
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !selectedId || isSending) return;

    setIsSending(true);
    setError("");
    try {
      const message = await sendMessage(selectedId, { content });
      setDraft("");
      setDetail((prev) => {
        if (!prev) return prev;
        const exists = prev.messages.some((item) => item.id === message.id);
        if (exists) return prev;
        return {
          ...prev,
          messages: [...prev.messages, message],
          updatedAt: message.createdAt,
        };
      });
      loadConversations();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {/* Chat */}
      <section
        className={`${
          mobileShowChat ? "flex" : "hidden md:flex"
        } flex-1 min-w-0 flex-col bg-background`}
      >
        {selectedSummary ? (
          <>
            <header className="min-h-12 px-3 md:px-4 py-2 flex items-center gap-3 border-b border-border-muted bg-surface-elevated/80 shrink-0">
              <button
                type="button"
                className="md:hidden p-1.5 rounded-md text-muted hover:bg-surface-muted"
                onClick={() => setMobileShowChat(false)}
                aria-label="Quay lại danh sách"
              >
                <Icon icon="lucide:arrow-left" className="w-5 h-5" />
              </button>

              <UserAvatar
                name={selectedSummary.customerName}
                seed={selectedSummary.customerId || selectedSummary.id}
                size="sm"
                className="hidden sm:flex"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-[15px] font-bold text-ink truncate">
                    {selectedSummary.customerName || "Khách hàng"}
                  </h1>
                  <TypePill type={selectedSummary.relatedType} />
                </div>
                {selectedSummary.relatedId ? (
                  <p
                    className="text-[11px] text-muted truncate font-mono"
                    title={selectedSummary.relatedId}
                  >
                    Mã liên quan: {shortRef(selectedSummary.relatedId)}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted truncate">Trao đổi với khách hàng</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => loadDetail(selectedId)}
                className="p-2 rounded-md text-muted hover:text-ink hover:bg-surface-muted"
                title="Tải lại tin nhắn"
              >
                <Icon icon="lucide:rotate-cw" className="w-4 h-4" />
              </button>
            </header>

            {error ? (
              <div className="mx-4 mt-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger shrink-0">
                {error}
              </div>
            ) : null}

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="min-h-full flex flex-col">
                <div className="flex-1" />

                <div className="px-1 pt-3 pb-3">
                  {!hasMessages && !isLoadingDetail ? (
                    <div className="px-4 pb-4">
                      <UserAvatar
                        name={selectedSummary.customerName}
                        seed={selectedSummary.customerId || selectedSummary.id}
                        size="lg"
                        className="mb-3"
                      />
                      <h2 className="text-xl font-bold text-ink">
                        {selectedSummary.customerName || "Khách hàng"}
                      </h2>
                      <p className="text-sm text-muted mt-1 max-w-lg">
                        Bắt đầu trò chuyện về{" "}
                        <span className="text-ink font-medium">
                          {relatedTypeLabel(selectedSummary.relatedType).toLowerCase()}
                        </span>
                        . Tin nhắn sẽ hiện tại đây.
                      </p>
                    </div>
                  ) : null}

                  {isLoadingDetail ? (
                    <div className="px-4 py-8 text-sm text-muted flex items-center gap-2">
                      <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                      Đang tải tin nhắn...
                    </div>
                  ) : (
                    messageNodes.map((node) =>
                      node.type === "day" ? (
                        <DayDivider key={node.key} label={node.label} />
                      ) : (
                        <MessageRow
                          key={node.key}
                          message={node.message}
                          isOwn={node.isOwn}
                          grouped={node.grouped}
                          fallbackName={selectedSummary.customerName}
                        />
                      )
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            <div className="px-3 md:px-4 py-3 border-t border-border-muted/70 bg-surface-elevated/40 shrink-0">
              <div className="flex items-end gap-2 rounded-lg bg-surface-muted border border-border-muted px-3 py-2 focus-within:border-primary/35 transition-colors">
                <textarea
                  ref={composerRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={1}
                  placeholder={`Nhắn ${selectedSummary.customerName || "khách hàng"}…`}
                  className="flex-1 min-h-6 max-h-[7.5rem] resize-none bg-transparent py-1.5 text-sm leading-5 text-ink placeholder:text-faint outline-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={isSending || !draft.trim()}
                  onClick={handleSend}
                  className="shrink-0 mb-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-on-solid hover:bg-primary-hover disabled:opacity-35 disabled:pointer-events-none"
                  title="Gửi (Enter)"
                  aria-label="Gửi tin nhắn"
                >
                  {isSending ? (
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon icon="lucide:send" className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-faint text-center">
                Enter gửi · Shift+Enter xuống dòng
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center mb-1">
              <Icon icon="lucide:messages-square" className="w-7 h-7 text-faint" />
            </div>
            <p className="text-base font-bold text-ink">Chọn một cuộc trò chuyện</p>
            <p className="text-sm text-muted max-w-xs">
              Chọn khách ở cột phải để xem và trả lời tin nhắn.
            </p>
            {error ? <p className="text-sm text-danger mt-2">{error}</p> : null}
          </div>
        )}
      </section>

      {/* Sidebar — danh sách cuộc trò chuyện bên phải */}
      <aside
        className={`${
          mobileShowChat ? "hidden md:flex" : "flex"
        } w-full md:w-[280px] lg:w-[300px] shrink-0 flex-col border-l border-border-muted bg-surface`}
      >
        <div className="h-12 px-3 flex items-center gap-2 border-b border-border-muted shrink-0">
          <div className="relative flex-1 min-w-0">
            <Icon
              icon="lucide:search"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-faint pointer-events-none"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm cuộc trò chuyện"
              className="w-full h-8 pl-8 pr-3 rounded-md bg-background/80 border border-border-muted text-xs text-ink placeholder:text-faint outline-none focus:border-primary/40"
            />
          </div>
          <button
            type="button"
            onClick={loadConversations}
            className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-surface-muted"
            title="Làm mới"
          >
            <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-faint">
            Tin nhắn trực tiếp — {filteredConversations.length}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-2 space-y-0.5">
          {isLoadingList ? (
            <div className="px-4 py-10 text-sm text-muted flex items-center gap-2">
              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
              Đang tải...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-4 py-10 text-sm text-muted">
              {search.trim() ? "Không tìm thấy cuộc trao đổi." : "Chưa có cuộc trao đổi nào."}
            </div>
          ) : (
            filteredConversations.map((item) => (
              <ConversationListItem
                key={item.id}
                item={item}
                isActive={item.id === selectedId}
                onSelect={handleSelectConversation}
              />
            ))
          )}
        </div>

        <div className="px-2 py-2 border-t border-border-muted bg-surface-muted/50 shrink-0">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
            <div className="relative shrink-0">
              <UserAvatar
                name={session?.fullName || session?.displayName || "Sales"}
                seed={currentUserId || "sales"}
                size="sm"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                  isConnected
                    ? "bg-success"
                    : hubAvailable === false
                      ? "bg-warning-text"
                      : "bg-faint animate-pulse"
                }`}
                title={
                  isConnected
                    ? "Trực tuyến"
                    : hubAvailable === false
                      ? "Ngoại tuyến · đồng bộ mỗi vài giây"
                      : "Đang kết nối…"
                }
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink truncate leading-tight">
                {session?.fullName || session?.displayName || "Sales"}
              </p>
              <p className="text-[11px] text-muted truncate leading-tight mt-0.5">
                {isConnected
                  ? "Trực tuyến"
                  : hubAvailable === false
                    ? "Ngoại tuyến"
                    : "Đang kết nối…"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
