"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversationChat } from "@/hooks/useConversationChat";
import { getSession } from "@/utils/authSession";
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
} from "@/modules/messages";

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

function ConversationListItem({ item, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`w-full text-left p-4 border-b border-border-muted transition-colors ${
        isActive ? "bg-primary/20 border-l-4 border-l-secondary" : "hover:bg-surface-muted"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink truncate">{item.customerName || "Khách hàng"}</p>
          <p className="text-xs text-muted mt-0.5">
            {CONVERSATION_RELATED_TYPE_LABELS[item.relatedType] || item.relatedType}
            {item.relatedId ? ` · ${item.relatedId}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-muted">{formatMessageTime(item.lastMessageAt)}</p>
          {item.unreadCount > 0 ? (
            <span className="inline-flex mt-1 min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-bg">
              {item.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
      <p className="text-sm text-subtle mt-2 line-clamp-2">{item.lastMessagePreview || "Chưa có tin nhắn"}</p>
    </button>
  );
}

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isOwn
            ? "bg-secondary text-accent-subtle rounded-br-md"
            : "bg-surface-elevated border border-border-muted text-ink rounded-bl-md"
        }`}
      >
        {!isOwn ? (
          <p className="text-[11px] font-bold text-muted mb-1">{message.senderName || message.senderRole}</p>
        ) : null}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {message.attachmentUrl ? (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold underline ${
              isOwn ? "text-accent-subtle/90" : "text-secondary"
            }`}
          >
            <Icon icon="lucide:paperclip" className="w-3.5 h-3.5" />
            Tệp đính kèm
          </a>
        ) : null}
        <p className={`text-[10px] mt-1 ${isOwn ? "text-accent-subtle/80" : "text-muted"}`}>
          {formatMessageTime(message.createdAt)}
          {isOwn && message.isRead ? " · Đã xem" : ""}
        </p>
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
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

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
    (message) => {
      if (!message || message.conversationId !== selectedId) {
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

  // Fallback near-real-time: poll nhanh khi SignalR chưa kết nối được.
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          Trao đổi khách hàng
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Phản hồi khách hàng về ký gửi, mua hộ, báo giá và trạng thái xử lý theo thời gian thực.
        </p>
      </div>

      {!isConnected ? (
        <div className="rounded-lg border border-border bg-surface-muted px-4 py-2.5 text-xs text-muted flex items-center gap-2">
          <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
          {hubAvailable === false
            ? "Server chưa bật SignalR (/hubs/chat 404) — đang dùng chế độ cập nhật nhanh mỗi 2.5 giây."
            : "Đang kết nối real-time... tạm dùng chế độ cập nhật nhanh."}
        </div>
      ) : (
        <div className="rounded-lg border border-primary/40 bg-info-bg px-4 py-2.5 text-xs text-info-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          Real-time đang hoạt động.
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="bg-surface-elevated rounded-xl border border-border overflow-hidden min-h-[640px] flex">
        <aside className="w-full max-w-sm border-r border-border-muted flex flex-col">
          <div className="px-4 py-3 border-b border-border-muted flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Cuộc trao đổi</h2>
            <button
              type="button"
              onClick={loadConversations}
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-muted"
              title="Làm mới"
            >
              <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoadingList ? (
              <div className="p-6 text-sm text-muted flex items-center gap-2">
                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                Đang tải...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-sm text-muted">Chưa có cuộc trao đổi nào.</div>
            ) : (
              conversations.map((item) => (
                <ConversationListItem
                  key={item.id}
                  item={item}
                  isActive={item.id === selectedId}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          {selectedSummary ? (
            <>
              <div className="px-5 py-4 border-b border-border-muted">
                <p className="text-lg font-bold text-ink">{selectedSummary.customerName}</p>
                <p className="text-sm text-muted mt-1">
                  {CONVERSATION_RELATED_TYPE_LABELS[selectedSummary.relatedType] || selectedSummary.relatedType}
                  {selectedSummary.relatedId ? ` · ${selectedSummary.relatedId}` : ""}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4 bg-background">
                {isLoadingDetail ? (
                  <div className="text-sm text-muted flex items-center gap-2">
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    Đang tải tin nhắn...
                  </div>
                ) : (
                  (detail?.messages || []).map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === currentUserId}
                    />
                  ))
                )}
              </div>

              <div className="border-t border-border-muted p-4 bg-surface-elevated">
                <div className="flex items-end gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={2}
                    placeholder="Nhập tin nhắn phản hồi khách hàng..."
                    className="flex-1 resize-none rounded-lg border border-border-muted px-4 py-3 text-sm input-focus-ring"
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
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-secondary text-accent-subtle text-sm font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {isSending ? (
                      <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon icon="lucide:send" className="w-4 h-4" />
                    )}
                    Gửi
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted p-8">
              Chọn một cuộc trao đổi để bắt đầu.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
