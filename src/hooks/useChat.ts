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

  const storedId = localStorage.getItem("user_id");
  const generatedId = "user_" + Math.random().toString(36).substring(2, 9);
  const userId = useRef<string>(storedId || generatedId);

  useEffect(() => {
    if (!storedId) localStorage.setItem("user_id", userId.current);
  }, [storedId]);

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
    if ((!text.trim() && !attachments?.length) || isLoading) return;

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
    onMessagesUpdate?.(updated); // ✅ обновляем только тут

    setIsLoading(true);
    //https://testdeploysalesmanai3-production.up.railway.app/chat   http://localhost:5000/chat   https://testdeploysalesmanai3.onrender.com
    try { 
      const res = await fetch("https://testdeploysalesmanai3.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId.current, message: messageContent }),
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
      onMessagesUpdate?.(withBot); // ✅ и тут
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

  return { messages, setMessages, isLoading, sendMessage, messagesEndRef };
};
