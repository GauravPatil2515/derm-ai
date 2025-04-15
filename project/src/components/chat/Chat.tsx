import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User, Loader } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../../lib/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId] = useState(() => localStorage.getItem('chatUserId') || uuidv4());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    localStorage.setItem('chatUserId', userId);
    loadChatHistory();
    checkConnection();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/health`);
      const data = await response.json();
      setIsConnected(data.success);
      if (!data.success && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(checkConnection, 5000);
      }
    } catch (err) {
      setIsConnected(false);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(checkConnection, 5000);
      }
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/chat/history?user_id=${userId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.history);
      }
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error loading chat history:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message immediately
    const newUserMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response not OK:', response.status, text);
        throw new Error(text || 'Failed to get response');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const newAssistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`${API_BASE_URL}/chat/chat/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      setMessages([]);
    } catch (err) {
      setError('Failed to clear chat history');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-pink-800">DermAI Chat Assistant</h1>
            {!isConnected && (
              <p className="mt-1 text-sm text-red-500">
                Connection lost. Attempting to reconnect...
              </p>
            )}
          </div>
          <button
            onClick={clearChat}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 hover:bg-pink-100"
            title="Clear chat history"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-pink-600">Ask me anything about skin health and conditions</p>
      </div>

      <div className="mb-6 h-[60vh] overflow-y-auto rounded-lg border border-pink-100 bg-white p-4 shadow-inner">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
            <Bot className="mb-4 h-12 w-12 text-pink-300" />
            <p className="max-w-sm text-pink-600">
              Hi! I'm your DermAI assistant. Feel free to ask me any questions about skin health, conditions, or skincare advice.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div
                  className={`rounded-full p-2 ${
                    message.role === 'assistant' ? 'bg-pink-100' : 'bg-pink-500'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5 text-pink-600" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'assistant'
                      ? 'bg-pink-50 text-gray-800'
                      : 'bg-pink-500 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Bot className="h-5 w-5 text-pink-600" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-pink-50 px-4 py-2">
                  <Loader className="h-5 w-5 animate-spin text-pink-600" />
                  <span className="text-pink-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full rounded-lg border border-pink-200 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-pink-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-pink-500 transition-colors hover:bg-pink-50 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}