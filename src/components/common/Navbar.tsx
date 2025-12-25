import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Camera, LayoutDashboard, LogOut, LogIn, Menu, X, User, BarChart3 } from 'lucide-react';
import { useService } from '../../lib/ServiceContext';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../lib/ToastContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isHealthy } = useService();
  const { user, signOut } = useAuth();
  const { addToast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Signed out successfully', 'success');
      navigate('/');
      setMobileMenuOpen(false);
    } catch {
      addToast('Error signing out', 'error');
    }
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/scan', label: 'Scan', icon: Camera },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-pink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-pink-900">DermAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                    ? 'bg-pink-50 text-pink-700'
                    : 'text-pink-600 hover:text-pink-900 hover:bg-pink-50'
                  }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {!isHealthy && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-600">
                Initializing
              </span>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-pink-600" />
                    </div>
                  )}
                  <span className="text-sm text-pink-800 max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2">
                <LogIn className="w-4 h-4 mr-1.5 inline" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-pink-600 hover:bg-pink-50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-100">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(link.path)
                      ? 'bg-pink-50 text-pink-700'
                      : 'text-pink-600 hover:bg-pink-50'
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-pink-100">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-pink-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-pink-900">{user.displayName || 'Profile'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 mt-1"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="btn-primary w-full text-center"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}