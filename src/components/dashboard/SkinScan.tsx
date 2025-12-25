import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, WifiOff, Lock, Upload, Camera, Info, Shield } from 'lucide-react';
import { SkinScanUpload } from './SkinScanUpload';
import { useService } from '../../lib/ServiceContext';
import { useToast } from '../../lib/ToastContext';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/config';

const UPLOAD_TIMEOUT = 30000;
const MAX_RETRIES = 2;

export function SkinScan() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const navigate = useNavigate();
  const { isHealthy } = useService();
  const { addToast } = useToast();
  const { user } = useAuth();

  const userId = user ? user.uid : 'anonymous';

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        setIsBackendConnected(data.status === 'healthy');

        if (!data.model_loaded && !data.model_loading) {
          console.log("Model not loaded yet. Will lazy-load on first request.");
        } else if (data.model_loading) {
          addToast('AI Model is currently loading...', 'info');
        }
      } catch {
        setIsBackendConnected(false);
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [addToast]);

  const handleAnalysis = async (file: File) => {
    if (!isHealthy || !isBackendConnected) {
      addToast('Service is currently unavailable', 'error');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

      let retryCount = 0;
      let success = false;

      while (retryCount < MAX_RETRIES && !success) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to analyze image');
          }

          const data = await response.json();

          if (!data.success || !data.result) {
            throw new Error(data.error || 'Failed to analyze image');
          }

          addToast('Analysis completed successfully', 'success');

          if (data.result.id) {
            navigate(`/scan/${data.result.id}`);
            success = true;
          } else {
            throw new Error('No analysis ID returned');
          }
        } catch (err) {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            addToast(`Retrying analysis (attempt ${retryCount + 1})...`, 'info');
          } else {
            throw err;
          }
        }
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skin Analysis</h1>
          <p className="text-gray-600">Upload an image for AI-powered skin condition analysis</p>
        </div>

        {/* Login Prompt */}
        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-800">Save Your Analysis History</p>
                <p className="text-xs text-primary-600">Sign in to keep track of all your scans</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:underline"
            >
              Sign In →
            </button>
          </div>
        )}

        {/* Connection Warning */}
        {!isBackendConnected && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Connection Issue</p>
              <p className="text-xs text-amber-600">Unable to connect to analysis service. Retrying...</p>
            </div>
          </div>
        )}

        {/* Main Upload Card */}
        <div className="mb-8">
          <div className="card-premium p-8">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary-100" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                </div>
                <p className="mt-6 text-lg font-medium text-gray-700">Analyzing your image...</p>
                <p className="mt-2 text-sm text-gray-500">This may take a few seconds</p>
              </div>
            ) : (
              <SkinScanUpload onUpload={handleAnalysis} />
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Analysis Failed</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Guidelines */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Photo Guidelines</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                Use good lighting, preferably natural
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                Keep camera steady and focused
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                Capture the affected area clearly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                JPG or PNG format, under 10MB
              </li>
            </ul>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Important Notice</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                For educational purposes only
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Not a substitute for medical advice
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Consult a dermatologist for diagnosis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Your data is processed securely
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}