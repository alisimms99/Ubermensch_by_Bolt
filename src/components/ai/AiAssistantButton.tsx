import React from 'react';
import { Bot } from 'lucide-react';

interface AiAssistantButtonProps {
  onClick: () => void;
}

export const AiAssistantButton: React.FC<AiAssistantButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      aria-label="Open AI Assistant"
    >
      <Bot className="h-6 w-6" />
    </button>
  );
};