import { useState, useEffect } from 'react';
import { Bot, User, ArrowRight, Camera, Shield, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/config';

export function Hero() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AI dermatology assistant. Ask me anything about skin health." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/health`);
        const data = await response.json();
        setIsConnected(data.success);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, user_id: 'homepage-user' }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              AI-Powered Skin Analysis
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Professional skin analysis,
              <br />
              powered by AI
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Upload a photo of your skin concern and receive instant AI analysis.
              Get detailed information about potential conditions and recommended next steps.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/scan" className="btn-primary inline-flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Start Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Clock, title: 'Instant Results', desc: 'Get analysis in seconds, not days' },
              { icon: Shield, title: 'Private & Secure', desc: 'Your data is encrypted and protected' },
              { icon: CheckCircle, title: '7 Conditions', desc: 'Trained on dermatology datasets' },
            ].map((feature, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="icon-box icon-box-teal mx-auto mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Chat Preview */}
          <div className="max-w-2xl mx-auto">
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="avatar">
                  <Bot className="avatar-icon" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">DermAI Assistant</h3>
                  <p className="text-xs text-gray-500">
                    {isConnected ? 'Online' : 'Connecting...'}
                  </p>
                </div>
              </div>

              <div className="h-64 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-teal-100' : 'bg-gray-200'
                      }`}>
                      {msg.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-teal-600" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${msg.role === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about skin conditions..."
                  className="input flex-1"
                  disabled={!isConnected}
                />
                <button
                  onClick={handleSend}
                  disabled={!isConnected || isLoading}
                  className="btn-primary"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Conditions We Detect</h2>
            <p className="text-gray-600">Our AI is trained to identify common skin conditions</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              'Actinic Keratoses',
              'Basal Cell Carcinoma',
              'Benign Keratosis',
              'Dermatofibroma',
              'Melanocytic Nevi',
              'Melanoma',
              'Vascular Lesions'
            ].map((condition, i) => (
              <div key={i} className="card p-4 text-center">
                <p className="text-sm font-medium text-gray-700">{condition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-amber-50 border-t border-amber-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-amber-800 text-sm">
            <strong>Medical Disclaimer:</strong> This tool is for educational purposes only and does not replace professional medical advice.
            Always consult a dermatologist for diagnosis and treatment.
          </p>
        </div>
      </section>
    </div>
  );
}