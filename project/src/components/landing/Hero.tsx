import React from 'react';
import { Bot } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ChatInput } from '@/components/ui/ChatInput';

export function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative pt-16 pb-32">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-pink-200 bg-pink-50 text-pink-700">
              AI-Powered Skin Analysis
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-pink-900 sm:text-6xl">
              Expert Dermatology at Your Fingertips
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-pink-600">
              Get instant, accurate skin condition analysis powered by advanced AI technology. 
              Upload a photo or use your camera for quick assessment and personalized care recommendations.
            </p>

            <div className="flex justify-center gap-4">
              <button className="rounded-lg bg-pink-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                Start Analysis
              </button>
              <button className="rounded-lg bg-pink-50 px-6 py-3 text-base font-medium text-pink-700 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                Learn More
              </button>
            </div>
          </div>

          <div className="mt-10 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg border border-pink-100">
            <div className="mb-6 flex items-center gap-3">
              <Bot className="h-8 w-8 rounded-full bg-pink-100 p-1.5 text-pink-500" />
              <p className="rounded-lg bg-pink-50 px-4 py-2 text-pink-900">
                Hello! I'm here to help you with all your skin-related concerns.
              </p>
            </div>
            <ChatInput />
          </div>
        </div>
      </div>
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-pink-50 opacity-20"></div>
    </div>
  );
}