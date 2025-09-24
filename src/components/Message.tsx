import React from 'react';
import { motion } from 'framer-motion';
import { Message as MessageType } from '../hooks/useChat';
import { Bot, User, File, Image, FileText } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  index: number;
}

export const Message: React.FC<MessageProps> = ({ message, index }) => {
  const isUser = message.role === 'user';

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-3 h-3" />;
    if (type.startsWith('text/') || type === 'application/json') return <FileText className="w-3 h-3" />;
    return <File className="w-3 h-3" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} mb-6`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 + index * 0.05 }}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((file) => (
              <div
                key={file.id}
                className={`flex items-center space-x-2 p-2 rounded-lg border ${
                  isUser
                    ? 'bg-white/20 border-white/30'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className={`${
                  isUser 
                    ? 'text-white/80' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    isUser 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {file.name}
                  </p>
                  <p className={`text-xs ${
                    isUser 
                      ? 'text-white/70' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-2">
          <span className={`text-xs ${
            isUser 
              ? 'text-blue-100' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};