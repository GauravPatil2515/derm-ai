import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Hero } from '@/components/landing/Hero';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SkinScan } from '@/components/dashboard/SkinScan';
import { ScanDetails } from '@/components/dashboard/ScanDetails';
import { Chat } from '@/components/chat/Chat';
import { Navbar } from '@/components/common/Navbar';
import { ServiceProvider } from './lib/ServiceContext';
import { ToastProvider } from './lib/ToastContext';

function App() {
  return (
    <ServiceProvider>
      <ToastProvider>
        <Router basename="/derm-ai">
          <div className="min-h-screen bg-pink-50/30">
            <Navbar />
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scan" element={<SkinScan />} />
              <Route path="/scan/:id" element={<ScanDetails />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </ServiceProvider>
  );
}

export default App;