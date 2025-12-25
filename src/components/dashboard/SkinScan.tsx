import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, WifiOff, Upload, Camera, Shield, Info } from 'lucide-react';
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
      } catch {
        setIsBackendConnected(false);
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

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
            addToast(`Retrying analysis...`, 'info');
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Skin Analysis</h1>
          <p className="text-gray-600 mt-1">Upload an image for AI-powered skin condition analysis</p>
        </div>

        {/* Login Prompt */}
        {!user && (
          <div className="mb-6 p-4 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-teal-600" />
              <p className="text-sm text-teal-800">Sign in to save your analysis history</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-teal-700 hover:text-teal-900"
            >
              Sign In →
            </button>
          </div>
        )}

        {/* Connection Warning */}
        {!isBackendConnected && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Connection Issue</p>
              <p className="text-xs text-amber-600">Unable to connect. Retrying...</p>
            </div>
          </div>
        )}

        {/* Main Upload Card */}
        <div className="card p-6 mb-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="spinner w-8 h-8 mb-4"></div>
              <p className="text-gray-600">Analyzing your image...</p>
              <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
            </div>
          ) : (
            <SkinScanUpload onUpload={handleAnalysis} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Analysis Failed</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="btn-secondary text-sm py-1.5">
              Dismiss
            </button>
          </div>
        )}

        {/* Guidelines */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="icon-box icon-box-teal">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-gray-900">Photo Guidelines</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Use good lighting, preferably natural</li>
              <li>• Keep camera steady and focused</li>
              <li>• Capture the affected area clearly</li>
              <li>• JPG or PNG format, under 10MB</li>
            </ul>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="icon-box bg-amber-50 text-amber-600">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-gray-900">Important Notice</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• For educational purposes only</li>
              <li>• Not a substitute for medical advice</li>
              <li>• Consult a dermatologist for diagnosis</li>
              <li>• Your data is processed securely</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}