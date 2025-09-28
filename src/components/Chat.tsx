import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat, Message } from "../hooks/useChat";
import { useChats } from "../hooks/useChats";
import { Message as MessageComponent } from "./Message";
import { MessageInput } from "./MessageInput";
import { LoadingDots } from "./LoadingDots";
import { Sidebar } from "./Sidebar";
import { Bot } from "lucide-react";

interface ChatProps {
  isDark: boolean;
}

export const Chat: React.FC<ChatProps> = ({ isDark }) => {
  const {
    chats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    updateChatMessages,
  } = useChats();

  // ✅ useChat теперь работает "чисто"
  const { messages, isLoading, sendMessage, messagesEndRef } = useChat({
    messages: currentChat?.messages || [],
    onMessagesUpdate: (msgs: Message[]) => {
      if (currentChatId) {
        updateChatMessages(currentChatId, msgs);
      }
    },
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId??''}
        onChatSelect={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isDark={isDark}
      />

      {/* Main Chat Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col bg-white dark:bg-gray-900"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center space-x-3 shadow-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-white">Hutarka</h1>
            <p className="text-blue-100 text-sm">малады беларускі ІІ, які яшчэ вучыцца</p>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageComponent key={message.id} message={message} index={index} />
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start space-x-3 mb-6"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <LoadingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </motion.div>
    </div>
  );
};
