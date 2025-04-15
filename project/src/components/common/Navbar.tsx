import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Camera, LayoutDashboard, AlertOctagon } from 'lucide-react';
import { useService } from '../../lib/ServiceContext';

export function Navbar() {
  const location = useLocation();
  const { status, isHealthy } = useService();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-pink-600">DermAI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isHealthy && (
              <div className="flex items-center text-yellow-600">
                <AlertOctagon className="mr-1 h-4 w-4" />
                <span className="text-sm">Service Issues</span>
              </div>
            )}

            <Link
              to="/dashboard"
              className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive('/dashboard')
                  ? 'bg-pink-100 text-pink-900'
                  : 'text-pink-600 hover:bg-pink-50'
              }`}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>

            <Link
              to="/scan"
              className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive('/scan')
                  ? 'bg-pink-100 text-pink-900'
                  : 'text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Camera className="mr-2 h-4 w-4" />
              Scan
              {!status.modelLoaded && (
                <span className="ml-2 h-2 w-2 rounded-full bg-yellow-400"></span>
              )}
            </Link>

            <Link
              to="/chat"
              className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive('/chat')
                  ? 'bg-pink-100 text-pink-900'
                  : 'text-pink-600 hover:bg-pink-50'
              }`}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
              {!status.databaseConnected && (
                <span className="ml-2 h-2 w-2 rounded-full bg-yellow-400"></span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}