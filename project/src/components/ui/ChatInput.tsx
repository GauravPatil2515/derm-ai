import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isConnected: boolean;
}

export function ChatInput({ onSend, isLoading, isConnected }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && isConnected) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isConnected ? "Type your question about skin conditions..." : "Reconnecting to service..."}
        className={`w-full rounded-lg border ${
          isConnected ? 'border-pink-200' : 'border-yellow-300'
        } bg-white px-4 py-3 pr-12 text-sm text-pink-900 placeholder-pink-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
        disabled={isLoading || !isConnected}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-pink-500 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:opacity-50"
        disabled={isLoading || !message.trim() || !isConnected}
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}