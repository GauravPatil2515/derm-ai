import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  price: string;
  time: string;
}

export function DashboardCard({ title, description, icon: Icon, price, time }: DashboardCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-pink-100">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 transform opacity-10">
        <Icon className="h-full w-full" strokeWidth={1} />
      </div>
      
      <div className="relative">
        <div className="mb-4 inline-flex rounded-lg bg-pink-100 p-3">
          <Icon className="h-6 w-6 text-pink-600" />
        </div>
        
        <h3 className="mb-2 text-lg font-medium text-pink-900">{title}</h3>
        <p className="mb-4 text-sm text-pink-600">{description}</p>
        
        <div className="flex items-center justify-between border-t border-pink-100 pt-4">
          <div className="text-sm text-pink-600">
            <span className="font-medium text-pink-900">{price}</span> / session
          </div>
          <div className="text-sm text-pink-600">
            {time}
          </div>
        </div>
        
        <button
          className="mt-4 w-full rounded-lg bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-100"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}