import { useState, useEffect } from 'react';
import { Video, Calendar, MessageSquare, Search, ExternalLink, Image as ImageIcon, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { useService } from '../../lib/ServiceContext';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/config';

interface SkinAnalysis {
  id: string;
  timestamp: string;
  primary_condition: string;
  confidence: number;
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

      if (!data.success) throw new Error(data.error);

      setAnalyses(data.history);
      setStats({
        total_scans: data.history.length,
        pending_review: data.history.filter((a: SkinAnalysis) => a.confidence < 70).length,
        urgent_cases: data.history.filter((a: SkinAnalysis) => a.confidence > 95).length,
        reviewed: data.history.filter((a: SkinAnalysis) => a.confidence >= 70 && a.confidence <= 95).length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusFromConfidence = (confidence: number): 'urgent' | 'pending' | 'reviewed' => {
    if (confidence > 95) return 'urgent';
    if (confidence < 70) return 'pending';
    return 'reviewed';
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = !searchTerm ||
      analysis.primary_condition.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatusFromConfidence(analysis.confidence);
    const matchesFilter = selectedFilter === 'all' || status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (confidence: number) => {
    const status = getStatusFromConfidence(confidence);
    const badges = {
      urgent: { class: 'badge-danger', label: 'Urgent' },
      pending: { class: 'badge-warning', label: 'Pending' },
      reviewed: { class: 'badge-success', label: 'Reviewed' }
    };
    return badges[status];
  };

  return (
    <div className="min-h-screen bg-pink-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Service Warning */}
        {!isHealthy && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              {!serviceStatus.modelLoaded && 'AI model loading... '}
              {!serviceStatus.databaseConnected && 'Database connecting...'}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-pink-900">Dashboard</h1>
          <p className="text-pink-600 mt-1">Overview of your skin analyses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="icon-box icon-box-pink">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="stat-label">Total</p>
                <p className="stat-value">{stats.total_scans}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="icon-box bg-yellow-50 text-yellow-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="stat-label">Pending</p>
                <p className="stat-value">{stats.pending_review}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="icon-box bg-red-50 text-red-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="stat-label">Urgent</p>
                <p className="stat-value">{stats.urgent_cases}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="icon-box bg-green-50 text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="stat-label">Reviewed</p>
                <p className="stat-value">{stats.reviewed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="section-title">Recent Analyses</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-9 py-2 text-sm w-40"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="input py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="urgent">Urgent</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-lg" />)}
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="empty-state">
              <ImageIcon className="empty-state-icon" />
              <p className="empty-state-title">No analyses found</p>
              <p className="empty-state-text">Complete your first scan to see results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-pink-500 uppercase border-b border-pink-100">
                    <th className="pb-3 font-medium">Image</th>
                    <th className="pb-3 font-medium">Condition</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Confidence</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredAnalyses.map((analysis) => {
                    const badge = getStatusBadge(analysis.confidence);
                    return (
                      <tr key={analysis.id} className="hover:bg-pink-50/50">
                        <td className="py-3">
                          {analysis.image_preview ? (
                            <div className="w-10 h-10 rounded overflow-hidden bg-pink-50">
                              <img src={`data:image/jpeg;base64,${analysis.image_preview}`} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-pink-50 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-pink-300" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 font-medium text-pink-900">{analysis.primary_condition}</td>
                        <td className="py-3 text-pink-600">{new Date(analysis.timestamp).toLocaleDateString()}</td>
                        <td className="py-3 text-pink-900">{analysis.confidence.toFixed(1)}%</td>
                        <td className="py-3">
                          <span className={`badge ${badge.class}`}>{badge.label}</span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => window.location.href = `/scan/${analysis.id}`}
                            className="p-1.5 rounded text-pink-400 hover:text-pink-600 hover:bg-pink-50"
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

        {/* Services */}
        <h2 className="section-title mb-4">Services</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard title="Video Consultation" description="Schedule a video call" icon={Video} price="$30" time="30 min" />
          <DashboardCard title="Clinic Visit" description="Book an appointment" icon={Calendar} price="$50" time="45 min" />
          <DashboardCard title="Quick Chat" description="Text consultation" icon={MessageSquare} price="$15" time="15 min" />
        </div>
      </div>
    </div>
  );
}