import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Hero } from '@/components/landing/Hero';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SkinScan } from '@/components/dashboard/SkinScan';
import { ScanDetails } from '@/components/dashboard/ScanDetails';
import { Analytics } from '@/components/dashboard/Analytics';
import { Chat } from '@/components/chat/Chat';
import { Navbar } from '@/components/common/Navbar';
import { Login } from '@/components/auth/Login';
import { Signup } from '@/components/auth/Signup';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { Profile } from '@/components/profile/Profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ServiceProvider } from './lib/ServiceContext';
import { ToastProvider } from './lib/ToastContext';
import { AuthProvider } from './lib/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <ToastProvider>
          <Router basename="/derm-ai">
            <div className="min-h-screen bg-pink-50/30">
              <Navbar />
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/scan" element={<SkinScan />} />
                <Route path="/scan/:id" element={
                  <ProtectedRoute>
                    <ScanDetails />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={<Chat />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </ServiceProvider>
    </AuthProvider>
  );
}

export default App;