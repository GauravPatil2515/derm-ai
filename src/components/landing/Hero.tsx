import { useState, useEffect } from 'react';
import { Bot, User, Microscope, Shield, Zap, Heart, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/config';

export function Hero() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AI dermatology assistant. How can I help you today?" }
  ]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/health`);
      const data = await response.json();
      setIsConnected(data.success);
    } catch {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!isConnected || !message.trim()) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);

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
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { value: '10K+', label: 'Scans Completed' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '7', label: 'Conditions Detected' },
    { value: '24/7', label: 'Available' },
  ];

  const features = [
    { icon: Zap, title: 'Instant Analysis', desc: 'Get results in seconds with our AI' },
    { icon: Shield, title: 'Privacy First', desc: 'Your data is secure and encrypted' },
    { icon: Heart, title: 'Health Focused', desc: 'Expert-backed recommendations' },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 page-enter">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary-200 shadow-lg mb-6">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">AI-Powered Dermatology</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gray-900">Your Skin Health,</span>
              <br />
              <span className="text-gradient">Analyzed by AI</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload a photo and get instant, accurate skin condition analysis powered by
              advanced deep learning. Professional insights at your fingertips.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/scan" className="btn-premium group flex items-center gap-2">
                <Microscope className="w-5 h-5" />
                Start Free Analysis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/chat" className="btn-secondary flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Talk to AI Doctor
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 page-enter" style={{ animationDelay: '0.2s' }}>
            {stats.map((stat, i) => (
              <div key={i} className="card-glass p-6 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Chat Preview */}
          <div className="max-w-3xl mx-auto page-enter" style={{ animationDelay: '0.3s' }}>
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">DermAI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500">{isConnected ? 'Online' : 'Connecting...'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[250px] overflow-y-auto mb-4 scrollbar-thin">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-primary-100 to-accent-100'
                        : 'bg-gradient-to-br from-primary-500 to-accent-500'
                      }`}>
                      {msg.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-primary-600" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="chat-bubble-assistant flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement; handleSendMessage(input.value); input.value = ''; }} className="flex gap-3">
                <input
                  name="message"
                  type="text"
                  placeholder={isConnected ? "Ask about skin conditions..." : "Connecting..."}
                  disabled={!isConnected || isLoading}
                  className="input-premium flex-1"
                />
                <button type="submit" disabled={!isConnected || isLoading} className="btn-premium px-6">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose DermAI?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology meets medical expertise for accurate, instant skin analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="feature-card group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className="py-20 bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Conditions We Detect</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI is trained to identify various skin conditions with high accuracy.
            </p>
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
              <div key={i} className="card-premium p-4 text-center group cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{condition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="card-glass p-12 text-center border-gradient">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Upload your first image and get instant AI-powered skin analysis. It's free, fast, and secure.
            </p>
            <Link to="/scan" className="btn-premium inline-flex items-center gap-2">
              <Microscope className="w-5 h-5" />
              Start Free Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}