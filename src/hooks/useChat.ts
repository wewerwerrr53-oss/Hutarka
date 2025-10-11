import { useState, useEffect, useRef, useCallback } from "react";

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

interface UseChatProps {
  messages: Message[];
  onMessagesUpdate?: (messages: Message[]) => void;
}

export const useChat = ({ messages: initialMessages, onMessagesUpdate }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // 🔑 Инициализация аутентификации
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");
      try {
        const res = await fetch("http://localhost:5000/auth/init", {
          method: "POST",
          headers: savedToken ? { "Authorization": `Bearer ${savedToken}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAuthToken(data.token);
          localStorage.setItem("auth_token", data.token);
        }
      } catch (err) {
        console.error("Auth init failed", err);
      }
    };
    initAuth();
  }, []);

  // Сброс сообщений при смене чата
  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text: string, attachments?: FileAttachment[]) => {
    if ((!text.trim() && !attachments?.length) || isLoading || !authToken) return;

    let messageContent = text.trim();
    if (attachments?.length) {
      messageContent += "\n\nПрикрепленные файлы:\n";
      attachments.forEach(file => {
        messageContent += `- ${file.name} (${file.type})\n`;
        if (file.type.startsWith("text/") || file.type === "application/json") {
          messageContent += `Содержимое: ${file.content}\n`;
        }
      });
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      attachments,
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    onMessagesUpdate?.(updated);

    setIsLoading(true);
    try {
      // ✅ Отправляем БЕЗ user_id, только с токеном в заголовке
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, // 🔐
        },
        body: JSON.stringify({ message: messageContent }), // ❌ убран user_id
      });

      const data = await res.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Ошибка при получении ответа от сервера",
        timestamp: new Date(),
      };

      const withBot = [...updated, botMessage];
      setMessages(withBot);
      onMessagesUpdate?.(withBot);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Ошибка: " + err.message,
        timestamp: new Date(),
      };
      const withError = [...messages, errorMessage];
      setMessages(withError);
      onMessagesUpdate?.(withError);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage, messagesEndRef };
};