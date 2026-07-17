"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHAT_EVENTS,
  clearChatHubCache,
  createChatHubConnection,
  isHubConnectionConnected,
  isHubConnectionDisconnected,
  isHubNotFoundError,
  joinConversation,
  leaveConversation,
  probeChatHubAvailability,
} from "@/utils/chatHubClient";
import { isMockMode } from "@/utils/mocks/dataSource";

export function useConversationChat({ conversationId, onMessage, onMessagesRead }) {
  const connectionRef = useRef(null);
  const startedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hubAvailable, setHubAvailable] = useState(null);
  const onMessageRef = useRef(onMessage);
  const onMessagesReadRef = useRef(onMessagesRead);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onMessagesReadRef.current = onMessagesRead;
  }, [onMessagesRead]);

  useEffect(() => {
    if (isMockMode()) {
      setHubAvailable(false);
      setIsConnected(false);
      return undefined;
    }

    let cancelled = false;

    const connect = async () => {
      clearChatHubCache();
      const available = await probeChatHubAvailability();
      if (cancelled) return;

      setHubAvailable(available);
      if (!available) {
        setIsConnected(false);
        return;
      }

      if (startedRef.current) {
        return;
      }

      const connection = await createChatHubConnection();
      if (!connection) {
        setIsConnected(false);
        return;
      }

      startedRef.current = true;
      connectionRef.current = connection;

      connection.on(CHAT_EVENTS.receiveMessage, (message) => {
        onMessageRef.current?.(message);
      });

      connection.on(CHAT_EVENTS.messagesRead, (event) => {
        onMessagesReadRef.current?.(event);
      });

      try {
        await connection.start();
        if (!cancelled) {
          setIsConnected(true);
        }
      } catch (error) {
        if (isHubNotFoundError(error)) {
          setHubAvailable(false);
        }
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      cancelled = true;
      const connection = connectionRef.current;
      if (connection) {
        connection.stop().catch(() => {});
      }
      connectionRef.current = null;
      startedRef.current = false;
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || isMockMode() || !conversationId || !hubAvailable) {
      return undefined;
    }

    let active = true;

    const syncGroup = async () => {
      if (!isHubConnectionConnected(connection)) {
        return;
      }

      await joinConversation(connection, conversationId);

      if (!active) {
        await leaveConversation(connection, conversationId);
      }
    };

    syncGroup().catch(() => {});

    return () => {
      active = false;
      leaveConversation(connection, conversationId).catch(() => {});
    };
  }, [conversationId, isConnected, hubAvailable]);

  const reconnect = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || isMockMode() || !hubAvailable) return;

    if (isHubConnectionDisconnected(connection)) {
      try {
        await connection.start();
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    }

    if (conversationId) {
      await joinConversation(connection, conversationId);
    }
  }, [conversationId, hubAvailable]);

  return { isConnected, hubAvailable, reconnect };
}
