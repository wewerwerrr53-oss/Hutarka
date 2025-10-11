import { useState, useCallback, useEffect } from 'react';
import { Message } from './useChat';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Загружаем чаты при старте
  useEffect(() => {
    const saved = localStorage.getItem("chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Chat[];
        setChats(parsed.map(chat => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        })));
        setCurrentChatId(parsed[0]?.id || null);
      } catch (e) {
        console.error("Ошибка загрузки чатов", e);
      }
    } else {
      // Если нет сохранённых чатов – создаём новый
      const firstChat: Chat = {
        id: Date.now().toString(),
        title: 'Новый чат',
        messages: [
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Привет! Я Hutarka, ваш AI-помощник. Как дела? Чем могу помочь?',
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChats([firstChat]);
      setCurrentChatId(firstChat.id);
    }
  }, []);

  // Сохраняем чаты при изменениях
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats]);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Привет! Я Hutarka, ваш AI-помощник. Как дела? Чем могу помочь?',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      if (filtered.length === 0) {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: 'Новый чат',
          messages: [
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Привет! Я Hutarka, ваш AI-помощник. Как дела? Чем могу помочь?',
              timestamp: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setCurrentChatId(newChat.id);
        return [newChat];
      }

      if (chatId === currentChatId) {
        setCurrentChatId(filtered[0].id);
      }
      return filtered;
    });
  }, [currentChatId]);

  const updateChatMessages = useCallback((chatId: string, messages: Message[]) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        let title = chat.title;
        if (messages.length > 1 && chat.title === 'Новый чат') {
          const firstUserMessage = messages.find(msg => msg.role === 'user');
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 30) +
              (firstUserMessage.content.length > 30 ? '...' : '');
          }
        }

        return {
          ...chat,
          title,
          messages,
          updatedAt: new Date(),
        };
      }
      return chat;
    }));
  }, []);

  return {
    chats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    updateChatMessages,
  };
};
