import { useState, useEffect } from 'react';
import { Video, Calendar, Clock, MessageSquare, Search, Download, ExternalLink } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { Link } from 'react-router-dom';
import { useService } from '../../lib/ServiceContext';
import { API_BASE_URL } from '../../lib/config';

interface SkinAnalysis {
  id: string;
  timestamp: string;
  primary_condition: string;
  confidence: number;
  detailed_analysis: any;
}

interface DashboardStats {
  total_scans: number;
  pending_review: number;
  urgent_cases: number;
  reviewed: number;
}

export function Dashboard() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_scans: 0,
    pending_review: 0,
    urgent_cases: 0,
    reviewed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status: serviceStatus, isHealthy } = useService();
  const userId = localStorage.getItem('chatUserId') || 'anonymous';

  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/analysis/history?user_id=${userId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analysis history');
      }

      setAnalyses(data.history);
      
      // Calculate stats
      const stats = {
        total_scans: data.history.length,
        pending_review: data.history.filter((a: SkinAnalysis) => a.confidence < 0.7).length,
        urgent_cases: data.history.filter((a: SkinAnalysis) => a.confidence < 0.5).length,
        reviewed: data.history.filter((a: SkinAnalysis) => a.confidence >= 0.7).length
      };
      
      setStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis history');
      console.error('Error fetching analysis history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusFromConfidence = (confidence: number): 'urgent' | 'pending' | 'reviewed' => {
    if (confidence > 95) return 'urgent';
    if (confidence < 85) return 'pending';
    return 'reviewed';
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = searchTerm === '' || 
      analysis.primary_condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getStatusFromConfidence(analysis.confidence);
    const matchesFilter = selectedFilter === 'all' || status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (confidence: number) => {
    const status = getStatusFromConfidence(confidence);
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-pink-100 text-pink-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!isHealthy && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Service Status</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-inside list-disc space-y-1">
                    {!serviceStatus.modelLoaded && (
                      <li>AI model is initializing...</li>
                    )}
                    {!serviceStatus.databaseConnected && (
                      <li>Database connection is being established...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-pink-900">Medical Dashboard</h1>
          <p className="mt-1 text-pink-600">Overview of patient skin analyses and consultations</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-pink-100">
            <p className="text-sm font-medium text-pink-600">Total Scans</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-3xl font-semibold text-pink-900">{stats.total_scans}</p>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-pink-100">
            <p className="text-sm font-medium text-pink-600">Pending Review</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-3xl font-semibold text-pink-900">{stats.pending_review}</p>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-pink-100">
            <p className="text-sm font-medium text-pink-600">Urgent Cases</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-3xl font-semibold text-pink-900">{stats.urgent_cases}</p>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-pink-100">
            <p className="text-sm font-medium text-pink-600">Reviewed</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-3xl font-semibold text-pink-900">{stats.reviewed}</p>
            </div>
          </div>
        </div>

        {/* Scan History Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-pink-100">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-pink-900">Recent Skin Analyses</h2>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-md border-pink-200 pl-9 text-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              {/* Filter */}
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="rounded-md border-pink-200 text-sm focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="all">All Status</option>
                <option value="urgent">Urgent</option>
                <option value="pending">Pending Review</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-pink-100">
              <table className="min-w-full divide-y divide-pink-200">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-pink-500">Report ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-pink-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-pink-500">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-pink-500">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-pink-500">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase text-pink-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 bg-white">
                  {filteredAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-pink-50/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-pink-900">{analysis.id}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-pink-600">
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-pink-900">{analysis.primary_condition}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-pink-900">{analysis.confidence.toFixed(1)}%</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(analysis.confidence)}`}>
                          {getStatusFromConfidence(analysis.confidence).charAt(0).toUpperCase() + 
                           getStatusFromConfidence(analysis.confidence).slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => window.location.href = `/scan/${analysis.id}`}
                            className="text-pink-400 hover:text-pink-500"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Services Section */}
        <h2 className="mb-4 text-lg font-semibold text-pink-900">Available Services</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Video Consultation"
            description="Schedule a video call with a dermatologist"
            icon={Video}
            price="$30"
            time="30 Minutes"
          />
          <DashboardCard
            title="Clinic Visit"
            description="Book an in-person appointment"
            icon={Calendar}
            price="$50"
            time="45 Minutes"
          />
          <DashboardCard
            title="Quick Chat"
            description="Text consultation with a specialist"
            icon={MessageSquare}
            price="$15"
            time="15 Minutes"
          />
        </div>
      </div>
    </div>
  );
}