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
} from "@/utils/conversationService";
import styles from "./MessagesPage.module.scss";

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
      className={`${styles.conversationButton} ${
        isActive ? styles.conversationButtonActive : styles.conversationButtonIdle
      }`}
    >
      <div className={styles.conversationRow}>
        <div className={styles.conversationText}>
          <p className={styles.customerName}>{item.customerName || "Khách hàng"}</p>
          <p className={styles.conversationMeta}>
            {CONVERSATION_RELATED_TYPE_LABELS[item.relatedType] || item.relatedType}
            {item.relatedId ? ` · ${item.relatedId}` : ""}
          </p>
        </div>
        <div className={styles.conversationTimeBlock}>
          <p className={styles.conversationTime}>{formatMessageTime(item.lastMessageAt)}</p>
          {item.unreadCount > 0 ? (
            <span className={styles.unreadBadge}>
              {item.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
      <p className={styles.conversationPreview}>{item.lastMessagePreview || "Chưa có tin nhắn"}</p>
    </button>
  );
}

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`${styles.messageBubbleRow} ${isOwn ? styles.messageBubbleRowOwn : styles.messageBubbleRowOther}`}>
      <div
        className={`${styles.messageBubble} ${
          isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther
        }`}
      >
        {!isOwn ? (
          <p className={styles.messageSender}>{message.senderName || message.senderRole}</p>
        ) : null}
        <p className={styles.messageContent}>{message.content}</p>
        {message.attachmentUrl ? (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className={`${styles.attachmentLink} ${
              isOwn ? styles.attachmentLinkOwn : styles.attachmentLinkOther
            }`}
          >
            <Icon icon="lucide:paperclip" className={styles.attachmentIcon} />
            Tệp đính kèm
          </a>
        ) : null}
        <p className={`${styles.messageTime} ${isOwn ? styles.messageTimeOwn : styles.messageTimeOther}`}>
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
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>
          Trao đổi khách hàng
        </h1>
        <p className={styles.subtitle}>
          Phản hồi khách hàng về ký gửi, mua hộ, báo giá và trạng thái xử lý theo thời gian thực.
        </p>
      </div>

      {!isConnected ? (
        <div className={styles.connectionBanner}>
          <Icon icon="lucide:refresh-cw" className={styles.bannerIcon} />
          {hubAvailable === false
            ? "Server chưa bật SignalR (/hubs/chat 404) — đang dùng chế độ cập nhật nhanh mỗi 2.5 giây."
            : "Đang kết nối real-time... tạm dùng chế độ cập nhật nhanh."}
        </div>
      ) : (
        <div className={styles.realtimeBanner}>
          <span className={styles.statusDot} />
          Real-time đang hoạt động.
        </div>
      )}

      {error ? (
        <div className={styles.errorAlert}>
          {error}
        </div>
      ) : null}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Cuộc trao đổi</h2>
            <button
              type="button"
              onClick={loadConversations}
              className={styles.refreshButton}
              title="Làm mới"
            >
              <Icon icon="lucide:refresh-cw" className={styles.actionIcon} />
            </button>
          </div>

          <div className={`${styles.conversationList} custom-scrollbar`}>
            {isLoadingList ? (
              <div className={styles.loadingState}>
                <Icon icon="lucide:loader-2" className={`${styles.actionIcon} ${styles.spin}`} />
                Đang tải...
              </div>
            ) : conversations.length === 0 ? (
              <div className={styles.emptyState}>Chưa có cuộc trao đổi nào.</div>
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

        <section className={styles.chatPanel}>
          {selectedSummary ? (
            <>
              <div className={styles.chatHeader}>
                <p className={styles.chatCustomerName}>{selectedSummary.customerName}</p>
                <p className={styles.chatMeta}>
                  {CONVERSATION_RELATED_TYPE_LABELS[selectedSummary.relatedType] || selectedSummary.relatedType}
                  {selectedSummary.relatedId ? ` · ${selectedSummary.relatedId}` : ""}
                </p>
              </div>

              <div className={`${styles.messageList} custom-scrollbar`}>
                {isLoadingDetail ? (
                  <div className={styles.detailLoadingState}>
                    <Icon icon="lucide:loader-2" className={`${styles.actionIcon} ${styles.spin}`} />
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

              <div className={styles.composer}>
                <div className={styles.composerRow}>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={2}
                    placeholder="Nhập tin nhắn phản hồi khách hàng..."
                    className={`${styles.messageInput} input-focus-ring`}
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
                    className={styles.sendButton}
                  >
                    {isSending ? (
                      <Icon icon="lucide:loader-2" className={`${styles.actionIcon} ${styles.spin}`} />
                    ) : (
                      <Icon icon="lucide:send" className={styles.actionIcon} />
                    )}
                    Gửi
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              Chọn một cuộc trao đổi để bắt đầu.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
