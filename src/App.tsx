import React from 'react';
import { Chat } from './components/Chat';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';

function App() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 overflow-hidden">
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      <Chat isDark={isDark} />
    </div>
  );
}

export default App;