import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, AlertTriangle, Shield, Stethoscope, Pill, ShieldCheck, AlertOctagon } from 'lucide-react';
import { useService } from '../../lib/ServiceContext';
import { API_BASE_URL } from '../../lib/config';

interface ScanDetails {
  timestamp: string;
  primary_condition: string;
  confidence: number;
  detailed_analysis: {
    overview: string[];
    symptoms: string[];
    treatment: string[];
    prevention: string[];
    warning: string[];
  };
  image_preview?: string;
}

export function ScanDetails() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<ScanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isHealthy } = useService();
  const userId = localStorage.getItem('chatUserId') || 'anonymous';

  useEffect(() => {
    fetchScanDetails();
  }, [id]);

  const fetchScanDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/analysis/${id}?user_id=${userId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch scan details');
      }

      setDetails(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scan details');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHealthy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-yellow-800">Service is currently unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center px-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-red-800">{error || 'Failed to load scan details'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-pink-900">Scan Details</h1>
        <p className="mt-1 text-pink-600">
          Analysis from {new Date(details.timestamp).toLocaleString()}
        </p>
      </div>

      {details.image_preview && (
        <div className="mb-8 overflow-hidden rounded-lg border border-pink-100">
          <img
            src={`data:image/jpeg;base64,${details.image_preview}`}
            alt="Scan preview"
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-pink-100">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-pink-900">{details.primary_condition}</h2>
            <p className="mt-1 text-pink-600">Confidence: {details.confidence.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Overview */}
          <div className="rounded-lg bg-pink-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-medium text-pink-800">
              <FileText className="mr-2 h-5 w-5" />
              Overview
            </h3>
            <ul className="space-y-2">
              {details.detailed_analysis.overview.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400" />
                  <span className="text-pink-900">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Symptoms */}
          <div className="rounded-lg bg-pink-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-medium text-pink-800">
              <Stethoscope className="mr-2 h-5 w-5" />
              Symptoms
            </h3>
            <ul className="space-y-2">
              {details.detailed_analysis.symptoms.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400" />
                  <span className="text-pink-900">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatment */}
          <div className="rounded-lg bg-pink-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-medium text-pink-800">
              <Pill className="mr-2 h-5 w-5" />
              Treatment
            </h3>
            <ul className="space-y-2">
              {details.detailed_analysis.treatment.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400" />
                  <span className="text-pink-900">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prevention */}
          <div className="rounded-lg bg-pink-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-medium text-pink-800">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Prevention
            </h3>
            <ul className="space-y-2">
              {details.detailed_analysis.prevention.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400" />
                  <span className="text-pink-900">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Warning Signs */}
        <div className="mt-6 rounded-lg bg-red-50 p-4">
          <h3 className="mb-3 flex items-center text-lg font-medium text-red-800">
            <AlertOctagon className="mr-2 h-5 w-5" />
            Warning Signs
          </h3>
          <ul className="space-y-2">
            {details.detailed_analysis.warning.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                <span className="text-red-900">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Medical Disclaimer</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start">
                <Shield className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-blue-700">
                  This analysis is provided by an AI system and should NOT replace professional medical evaluation
                </span>
              </li>
              <li className="flex items-start">
                <Shield className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-blue-700">
                  Always consult with a qualified healthcare provider for proper diagnosis and treatment
                </span>
              </li>
              <li className="flex items-start">
                <Shield className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-blue-700">
                  Seek immediate medical attention if you experience severe symptoms or rapid condition changes
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}