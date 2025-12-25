import { useState, useEffect } from 'react';
import { Video, Calendar, MessageSquare, Search, ExternalLink, Image as ImageIcon, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { useService } from '../../lib/ServiceContext';
import { useAuth } from '../../lib/AuthContext';
import { DashboardSkeleton } from '../ui/Skeleton';
import { API_BASE_URL } from '../../lib/config';

interface SkinAnalysis {
  id: string;
  timestamp: string;
  primary_condition: string;
  confidence: number;
  detailed_analysis: any;
  image_preview?: string;
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
  const { user, loading: authLoading } = useAuth();

  const userId = user ? user.uid : 'anonymous';

  useEffect(() => {
    if (!authLoading) {
      fetchAnalysisHistory();
    }
  }, [authLoading, userId]);

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

      const stats = {
        total_scans: data.history.length,
        pending_review: data.history.filter((a: SkinAnalysis) => a.confidence < 0.7).length,
        urgent_cases: data.history.filter((a: SkinAnalysis) => a.confidence < 0.5).length,
        reviewed: data.history.filter((a: SkinAnalysis) => a.confidence >= 0.7).length
      };

      setStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis history');
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

  const getStatusBadge = (confidence: number) => {
    const status = getStatusFromConfidence(confidence);
    switch (status) {
      case 'urgent': return { color: 'bg-red-100 text-red-700', label: 'Urgent' };
      case 'pending': return { color: 'bg-amber-100 text-amber-700', label: 'Pending' };
      case 'reviewed': return { color: 'bg-emerald-100 text-emerald-700', label: 'Reviewed' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Service Warning */}
        {!isHealthy && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Service Initializing</p>
              <p className="text-xs text-amber-600">
                {!serviceStatus.modelLoaded && 'AI model is loading... '}
                {!serviceStatus.databaseConnected && 'Database connecting...'}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your skin analyses and history</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-premium p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_scans}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_review}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent_cases}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reviewed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reviewed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scan History */}
        <div className="card-premium p-6 mb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium pl-10 py-2 text-sm w-48"
                />
              </div>

              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="input-premium py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="urgent">Urgent</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-4 text-red-700 text-sm">{error}</div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No analyses found</p>
              <p className="text-sm text-gray-500 mt-1">Complete your first scan to see results here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Report ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Condition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Confidence</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAnalyses.map((analysis) => {
                    const statusBadge = getStatusBadge(analysis.confidence);
                    return (
                      <tr key={analysis.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          {analysis.image_preview ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                              <img
                                src={`data:image/jpeg;base64,${analysis.image_preview}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-gray-900">{analysis.id.slice(0, 20)}...</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-gray-900">{analysis.primary_condition}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-gray-900">{analysis.confidence.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => window.location.href = `/scan/${analysis.id}`}
                            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Services Section */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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