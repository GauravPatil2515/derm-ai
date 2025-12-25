import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/config';
import { BarChart3, TrendingUp, Calendar, Activity, Download } from 'lucide-react';

interface AnalysisData {
    id: string;
    timestamp: string;
    primary_condition: string;
    confidence: number;
}

interface ConditionStats {
    condition: string;
    count: number;
    percentage: number;
}

export function Analytics() {
    const { user } = useAuth();
    const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

    const userId = user?.uid || 'anonymous';

    useEffect(() => {
        fetchAnalyses();
    }, [userId]);

    const fetchAnalyses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/analysis/history?user_id=${userId}`);
            const data = await response.json();
            if (data.success) setAnalyses(data.history);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAnalyses = analyses.filter((a) => {
        if (timeRange === 'all') return true;
        const date = new Date(a.timestamp);
        const now = new Date();
        const days = timeRange === 'week' ? 7 : 30;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return date >= cutoff;
    });

    const conditionStats: ConditionStats[] = (() => {
        const counts: Record<string, number> = {};
        filteredAnalyses.forEach((a) => {
            counts[a.primary_condition] = (counts[a.primary_condition] || 0) + 1;
        });
        const total = filteredAnalyses.length;
        return Object.entries(counts)
            .map(([condition, count]) => ({
                condition,
                count,
                percentage: total > 0 ? (count / total) * 100 : 0,
            }))
            .sort((a, b) => b.count - a.count);
    })();

    const avgConfidence = filteredAnalyses.length > 0
        ? filteredAnalyses.reduce((sum, a) => sum + a.confidence, 0) / filteredAnalyses.length
        : 0;

    const exportCSV = () => {
        const rows = [['ID', 'Date', 'Condition', 'Confidence'], ...filteredAnalyses.map(a => [a.id, a.timestamp, a.primary_condition, a.confidence.toFixed(2)])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'analysis_history.csv';
        a.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] py-8 px-4">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="skeleton h-8 w-48" />
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-lg" />)}
                    </div>
                    <div className="skeleton h-64 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-gray-600 mt-1">Track your analysis history</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="input py-2 text-sm"
                        >
                            <option value="week">Last 7 days</option>
                            <option value="month">Last 30 days</option>
                            <option value="all">All time</option>
                        </select>
                        <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="icon-box icon-box-teal">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="stat-label">Total Analyses</p>
                                <p className="stat-value">{filteredAnalyses.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="icon-box bg-emerald-50 text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="stat-label">Avg Confidence</p>
                                <p className="stat-value">{avgConfidence.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="icon-box bg-blue-50 text-blue-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="stat-label">Conditions</p>
                                <p className="stat-value">{conditionStats.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribution */}
                <div className="card p-6 mb-8">
                    <h2 className="section-title mb-6">Condition Distribution</h2>
                    {conditionStats.length === 0 ? (
                        <div className="empty-state">
                            <BarChart3 className="empty-state-icon" />
                            <p className="empty-state-title">No data available</p>
                            <p className="empty-state-text">Complete some analyses to see trends</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {conditionStats.map((stat) => (
                                <div key={stat.condition} className="flex items-center gap-4">
                                    <span className="w-36 text-sm text-gray-700 truncate font-medium">
                                        {stat.condition}
                                    </span>
                                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                            style={{ width: `${stat.percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-20 text-sm text-gray-600 text-right">
                                        {stat.count} ({stat.percentage.toFixed(0)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent */}
                <div className="card p-6">
                    <h2 className="section-title mb-6">Recent Activity</h2>
                    {filteredAnalyses.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm">No activity yet</p>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {filteredAnalyses.slice(0, 10).map((analysis) => (
                                <div key={analysis.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 text-sm truncate">{analysis.primary_condition}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(analysis.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`badge ${analysis.confidence >= 80 ? 'badge-success' :
                                            analysis.confidence >= 50 ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {analysis.confidence.toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
