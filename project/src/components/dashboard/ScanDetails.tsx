import React from 'react';
import { useParams } from 'react-router-dom';
import { FileText, ThermometerSun, Pill, Shield, AlertTriangle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../lib/config';
import { useToast } from '../../lib/ToastContext';
import { DISEASE_INFO } from '../../lib/utils';
import { GridBackground } from '../ui/GridBackground';

// Add condition code mapping
const conditionToCode = {
  'Bacterial Cellulitis': 'BA-cellulitis',
  'Bacterial Impetigo': 'BA-impetigo',
  'Athletes Foot': 'FU-athlete-foot',
  'Nail Fungus': 'FU-nail-fungus',
  'Ringworm': 'FU-ringworm',
  'Creeping Eruption': 'PA-cutaneous-larva-migrans',
  'Chickenpox': 'VI-chickenpox',
  'Shingles': 'VI-shingles'
};

interface AnalysisSection {
  title: string;
  icon: React.ReactNode;
  content: string[];
  description?: string;
}

export function ScanDetails() {
  const { id } = useParams();
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { addToast } = useToast();
  const userId = localStorage.getItem('chatUserId') || 'anonymous';

  React.useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/analysis/${id}?user_id=${userId}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch analysis details');
        }

        setAnalysis(data.result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch analysis details';
        setError(message);
        addToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysis();
    }
  }, [id, userId, addToast]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-white p-8 shadow-lg">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600"></div>
          <p className="text-lg text-pink-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-red-800 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Error Loading Analysis</h2>
          <p>{error || 'Analysis not found'}</p>
        </div>
      </div>
    );
  }

  // Convert the condition name to its code for DISEASE_INFO lookup
  const conditionCode = conditionToCode[analysis.primary_analysis.condition as keyof typeof conditionToCode] || analysis.primary_analysis.condition;
  const diseaseInfo = DISEASE_INFO[conditionCode as keyof typeof DISEASE_INFO];

  const sections: AnalysisSection[] = [
    {
      title: 'Overview',
      icon: <FileText className="h-6 w-6 text-pink-600" />,
      content: analysis.detailed_analysis.overview || [],
      description: diseaseInfo?.description
    },
    {
      title: 'Key Symptoms',
      icon: <ThermometerSun className="h-6 w-6 text-pink-600" />,
      content: analysis.detailed_analysis.symptoms || [],
      description: diseaseInfo?.symptoms?.join('\n')
    },
    {
      title: 'Treatment Approaches',
      icon: <Pill className="h-6 w-6 text-pink-600" />,
      content: analysis.detailed_analysis.treatment || [],
      description: diseaseInfo?.remedies?.join('\n')
    },
    {
      title: 'Prevention Guidelines',
      icon: <Shield className="h-6 w-6 text-pink-600" />,
      content: analysis.detailed_analysis.prevention || [],
      description: diseaseInfo?.precautions?.join('\n')
    },
    {
      title: 'Warning Signs',
      icon: <AlertTriangle className="h-6 w-6 text-pink-600" />,
      content: analysis.detailed_analysis.warning || [],
      description: diseaseInfo?.emergency_signs?.join('\n')
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <GridBackground className="bg-white">
      <div className="min-h-screen bg-pink-50/30 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Report Header */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-pink-100 pb-4">
              <div>
                <p className="text-sm font-medium text-pink-600">
                  Analysis Report #{id}
                </p>
                <p className="text-xs text-gray-500">
                  Generated on {new Date(analysis.report_metadata.timestamp).toLocaleString()}
                </p>
              </div>
              <div className={`rounded-lg px-4 py-2 ${getConfidenceColor(analysis.primary_analysis.confidence)}`}>
                <p className="text-sm font-medium">
                  Confidence: {analysis.primary_analysis.confidence.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Add Image Display Section */}
            {analysis.image_preview && (
              <div className="mt-6 rounded-lg border border-pink-100 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-pink-600" />
                  <h3 className="text-lg font-medium text-pink-800">Analyzed Image</h3>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-pink-50">
                  <img
                    src={`data:image/jpeg;base64,${analysis.image_preview}`}
                    alt="Analyzed skin condition"
                    className="mx-auto h-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-pink-800">
                {analysis.primary_analysis.condition}
              </h1>
              {diseaseInfo?.description && (
                <p className="mt-2 text-gray-600">{diseaseInfo.description}</p>
              )}
            </div>
          </div>

          {/* Analysis Sections */}
          <div className="grid gap-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="overflow-hidden rounded-lg border border-pink-100 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="border-b border-pink-100 bg-pink-50/50 p-4">
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <h2 className="text-lg font-semibold text-pink-800">{section.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  {section.content.length > 0 ? (
                    <ul className="space-y-3">
                      {section.content.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-500"></span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : section.description ? (
                    <ul className="space-y-3">
                      {section.description.split('\n').map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-300"></span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No information available for this section</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 rounded-lg bg-blue-50 p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-blue-800">Medical Disclaimer</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• This analysis is provided by an AI system and should NOT replace professional medical evaluation.</p>
                  <p>• The results should be reviewed by a qualified healthcare provider.</p>
                  <p>• Seek immediate medical attention for severe symptoms or rapid condition progression.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center rounded-lg bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-200"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </GridBackground>
  );
}