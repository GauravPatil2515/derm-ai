import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Camera, LayoutDashboard, AlertOctagon, LogOut, LogIn, Menu, X, User, BarChart3 } from 'lucide-react';
import { useService } from '../../lib/ServiceContext';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../lib/ToastContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { status, isHealthy } = useService();
  const { user, signOut } = useAuth();
  const { addToast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Signed out successfully', 'success');
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      addToast('Error signing out', 'error');
    }
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/scan', label: 'Scan', icon: Camera, badge: !status.modelLoaded },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/chat', label: 'Chat', icon: MessageSquare, badge: !status.databaseConnected },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            <span className="text-xl font-bold text-pink-600">DermAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {!isHealthy && (
              <div className="flex items-center text-yellow-600 mr-2">
                <AlertOctagon className="mr-1 h-4 w-4" />
                <span className="text-sm">Service Issues</span>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${isActive(link.path)
                    ? 'bg-pink-100 text-pink-900'
                    : 'text-pink-600 hover:bg-pink-50'
                  }`}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
                {link.badge && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-yellow-400"></span>
                )}
              </Link>
            ))}

            {/* User Menu */}
            <div className="ml-4 flex items-center border-l border-pink-200 pl-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-pink-700" />
                      </div>
                    )}
                    <span className="text-sm text-pink-800 max-w-[120px] truncate hidden lg:block">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center rounded-lg bg-pink-50 px-3 py-2 text-sm text-pink-700 hover:bg-pink-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-pink-600 hover:bg-pink-50"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-pink-100 mt-2 pt-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm transition-colors ${isActive(link.path)
                      ? 'bg-pink-100 text-pink-900'
                      : 'text-pink-600 hover:bg-pink-50'
                    }`}
                >
                  <link.icon className="mr-3 h-5 w-5" />
                  {link.label}
                  {link.badge && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-yellow-400"></span>
                  )}
                </Link>
              ))}

              <div className="border-t border-pink-100 pt-4 mt-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center rounded-lg px-4 py-3 text-sm text-pink-600 hover:bg-pink-50"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full mr-3" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-pink-700" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.displayName || 'My Profile'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center rounded-lg px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-lg bg-pink-600 px-4 py-3 text-sm font-medium text-white hover:bg-pink-700"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
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