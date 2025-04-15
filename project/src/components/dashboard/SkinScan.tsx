import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Heart, WifiOff } from 'lucide-react';
import { SkinScanUpload } from './SkinScanUpload';
import { useService } from '../../lib/ServiceContext';
import { useToast } from '../../lib/ToastContext';
import { API_BASE_URL } from '../../lib/config';

const UPLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;

export function SkinScan() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const navigate = useNavigate();
  const { isHealthy } = useService();
  const { addToast } = useToast();
  const userId = localStorage.getItem('chatUserId') || 'anonymous';

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        setIsBackendConnected(data.status === 'healthy');
      } catch (err) {
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
      formData.append('image', file);
      formData.append('user_id', userId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (!response.ok || !data.result) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      addToast('Analysis completed successfully', 'success');
      
      // Navigate to the details page if we have an analysis ID
      if (data.result.id) {
        navigate(`/scan/${data.result.id}`);
      } else {
        // If no ID, navigate to dashboard
        navigate('/dashboard');
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-pink-800">Skin Analysis</h1>
        <p className="mt-2 text-pink-600">Upload an image for AI-powered skin condition analysis</p>
      </div>

      {!isBackendConnected && (
        <div className="mb-6 rounded-lg bg-yellow-50 p-4">
          <div className="flex items-center">
            <WifiOff className="mr-3 h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Connection Lost</h3>
              <p className="text-sm text-yellow-700">
                Unable to connect to the analysis service. Please check your connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-lg bg-white p-6 shadow-lg border border-pink-100">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
            <p className="mt-4 text-pink-600">Analyzing your image...</p>
          </div>
        ) : (
          <SkinScanUpload onUpload={handleAnalysis} />
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="mr-3 h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-pink-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-pink-800">Important Notes</h2>
        <ul className="list-inside list-disc space-y-2 text-pink-700">
          <li>Upload clear, well-lit images of the affected area</li>
          <li>Images should be in JPG or PNG format, under 10MB</li>
          <li>Multiple angles may improve analysis accuracy</li>
          <li>This tool is for educational purposes only</li>
          <li>Always consult a healthcare professional for medical advice</li>
        </ul>
      </div>
    </div>
  );
}