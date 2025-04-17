import { useState, useEffect } from 'react';
import { Bot, User, Microscope, Flower2, Bug, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { ChatInput } from '@/components/ui/ChatInput';
import { API_BASE_URL } from '@/lib/config';

export function Hero() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm here to help you with all your skin-related concerns." }
  ]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/health`);
      const data = await response.json();
      setIsConnected(data.success);
    } catch (error) {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!isConnected) return;
    setIsLoading(true);
    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          user_id: 'homepage-user'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Hero Section */}
      <div className="relative flex-1 bg-white">
        {/* Grid Background Pattern */}
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #FFF0F5 1px, transparent 1px),
              linear-gradient(to bottom, #FFF0F5 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Hero Content */}
            <div className="mx-auto max-w-2xl text-center">
              <Badge 
                variant="outline" 
                className="mb-5 border-2 border-pink-200 bg-pink-50/80 px-4 py-1.5 text-pink-700 backdrop-blur-sm"
              >
                AI-Powered Skin Analysis
              </Badge>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-pink-900 sm:text-5xl">
                Welcome to DermAI
              </h1>
              
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-pink-600">
                Get instant, accurate skin condition analysis powered by advanced AI technology. 
                Upload a photo or use your camera for quick assessment and personalized care recommendations.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-8">
                <Link to="/scan" className="group relative w-full overflow-hidden rounded-lg bg-pink-600 px-8 py-3.5 text-base font-medium text-white shadow-lg transition-all hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 sm:w-auto">
                  <span className="relative z-10">Start Analysis</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-pink-500 to-pink-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"></div>
                </Link>
                
                <Link to="/chat" className="w-full rounded-lg bg-pink-50 px-8 py-3.5 text-base font-medium text-pink-700 shadow-md transition-all hover:bg-pink-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 sm:w-auto">
                  Chat
                </Link>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="relative mx-auto w-full max-w-2xl">
              <div className="rounded-2xl border border-pink-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl">
                <div className="mb-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {messages.map((message, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`rounded-full ${
                        message.role === 'assistant' 
                          ? 'bg-gradient-to-br from-pink-100 to-pink-200' 
                          : 'bg-pink-500'
                      } p-2 shadow-inner`}>
                        {message.role === 'assistant' ? (
                          <Bot className="h-6 w-6 text-pink-500" />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <p className={`rounded-2xl px-5 py-3 shadow-inner ${
                        message.role === 'assistant'
                          ? 'bg-pink-50/80 text-pink-900'
                          : 'bg-pink-500 text-white'
                      }`}>
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
                <ChatInput 
                  onSend={handleSendMessage}
                  className="backdrop-blur-sm" 
                  placeholder={isConnected ? "Type your message..." : "Reconnecting to service..."}
                  isLoading={isLoading}
                  isConnected={isConnected}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions Information Section */}
      <section className="relative mt-24 bg-gradient-to-b from-pink-50/50 to-white py-20">
        {/* Decorative Separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
        
        {/* Grid Background Pattern Continued */}
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #FFF0F5 1px, transparent 1px),
              linear-gradient(to bottom, #FFF0F5 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-pink-900 text-center mb-12">
            Skin Conditions We Cover
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Bacterial Conditions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Microscope className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-800">Bacterial Infections</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Bacterial Cellulitis</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">A common bacterial skin infection causing redness, swelling, and warmth in the affected area.</p>
                </div>
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Bacterial Impetigo</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">A highly contagious skin infection that causes red sores that break open and form a honey-colored crust.</p>
                </div>
              </div>
            </div>

            {/* Fungal Conditions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Flower2 className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-800">Fungal Infections</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Athlete's Foot</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">A common fungal infection causing itchy, scaly rash between the toes.</p>
                </div>
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Nail Fungus</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">An infection that causes discoloration and thickening of the nails.</p>
                </div>
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Ringworm</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">A circular rash caused by a fungal infection of the skin.</p>
                </div>
              </div>
            </div>

            {/* Parasitic Conditions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Bug className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-800">Parasitic Infections</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Creeping Eruption</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">A parasitic skin infection causing itchy, raised tracks in the skin.</p>
                </div>
              </div>
            </div>

            {/* Viral Conditions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Lightbulb className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-800">Viral Infections</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Chickenpox</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">A viral infection causing itchy blisters across the body.</p>
                </div>
                <div className="group rounded-lg border border-pink-100 bg-white p-6 shadow-sm transition-all hover:border-pink-200 hover:shadow-md">
                  <h4 className="font-medium text-pink-700 mb-2 text-lg">Shingles</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">A painful skin rash caused by reactivation of the chickenpox virus.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Background Decorations */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-pink-50 opacity-20"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}