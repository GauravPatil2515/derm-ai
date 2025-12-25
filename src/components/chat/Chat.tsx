import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User, Loader, Mic, MicOff, Sparkles, MessageCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../../lib/config';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const formatMessage = (content: string) => {
  const sections = content.split(/\*\*(.*?)\*\*/).filter(Boolean);

  return sections.map((section, index) => {
    if (index % 2 === 0) {
      return (
        <div key={index} className="mt-2 space-y-2">
          {section.split('\n').map((line, lineIndex) => {
            if (line.trim().startsWith('•')) {
              return (
                <div key={lineIndex} className="flex items-start gap-2">
                  <span className="mt-1.5 text-primary-500">•</span>
                  <span className="text-gray-700">{line.trim().substring(1).trim()}</span>
                </div>
              );
            }
            return line.trim() && (
              <p key={lineIndex} className="text-gray-700">{line.trim()}</p>
            );
          })}
        </div>
      );
    } else {
      return (
        <h3 key={index} className="mt-4 font-semibold text-lg text-primary-700 first:mt-0">
          {section.trim()}
        </h3>
      );
    }
  });
};

const suggestedQuestions = [
  "What are the signs of skin cancer?",
  "How to treat acne naturally?",
  "What causes eczema?",
  "Tips for healthy skin",
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId] = useState(() => localStorage.getItem('chatUserId') || uuidv4());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('chatUserId', userId);
    loadChatHistory();
    checkConnection();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } else {
      setError('Speech recognition is not supported.');
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/health`);
      const data = await response.json();
      setIsConnected(data.success);
      if (!data.success && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(checkConnection, 5000);
      }
    } catch {
      setIsConnected(false);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(checkConnection, 5000);
      }
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/history?user_id=${userId}`);
      const data = await response.json();
      if (data.success) setMessages(data.messages);
    } catch {
      setError('Failed to load chat history');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMessage = input.trim();
    setInput('');
    setError(null);

    const newUserMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, user_id: userId }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to get response');

      const newAssistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  const clearChat = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      setMessages([]);
    } catch {
      setError('Failed to clear chat history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="card-glass p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">DermAI Assistant</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-500">
                    {isConnected ? 'Online - Ready to help' : 'Reconnecting...'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="btn-icon text-gray-400 hover:text-red-500"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="card-glass p-6 mb-6">
          <div className="h-[55vh] overflow-y-auto scrollbar-thin mb-4 pr-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 text-primary-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Start a Conversation</h2>
                <p className="text-gray-500 max-w-md mb-8">
                  Ask me anything about skin health, conditions, treatments, or skincare advice.
                </p>

                {/* Suggested Questions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(q)}
                      className="px-4 py-2 rounded-full bg-white/80 border border-primary-200 text-sm text-primary-600 hover:bg-primary-50 hover:border-primary-300 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 animate-slide-up ${message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${message.role === 'assistant'
                        ? 'bg-gradient-to-br from-primary-100 to-accent-100'
                        : 'bg-gradient-to-br from-primary-500 to-accent-500'
                      }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-5 h-5 text-primary-600" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                      }`}>
                      {message.role === 'assistant'
                        ? formatMessage(message.content)
                        : <p>{message.content}</p>
                      }
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-3 animate-slide-up">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="chat-bubble-assistant flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-primary-500" />
                      <span className="text-gray-500">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type your message..."}
                className={`input-premium pr-12 ${isListening ? 'border-accent-400 ring-4 ring-accent-100' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isListening
                    ? 'bg-accent-500 text-white animate-pulse'
                    : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50'
                  }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-premium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card-glass p-4 border-l-4 border-red-500 bg-red-50/50 animate-slide-up">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="card-glass p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>Tip: You can use voice input by clicking the microphone icon</span>
          </div>
        </div>
      </div>
    </div>
  );
}