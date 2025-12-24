import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/config';
import { BarChart3, TrendingUp, Calendar, Activity, Download } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

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
            if (data.success) {
                setAnalyses(data.history);
            }
        } catch (error) {
            console.error('Error fetching analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter by time range
    const filteredAnalyses = analyses.filter((a) => {
        if (timeRange === 'all') return true;
        const date = new Date(a.timestamp);
        const now = new Date();
        if (timeRange === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
        }
        if (timeRange === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return date >= monthAgo;
        }
        return true;
    });

    // Calculate condition statistics
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

    // Calculate average confidence
    const avgConfidence = filteredAnalyses.length > 0
        ? filteredAnalyses.reduce((sum, a) => sum + a.confidence, 0) / filteredAnalyses.length
        : 0;

    // Export functions
    const exportAsCSV = () => {
        const headers = ['ID', 'Date', 'Condition', 'Confidence'];
        const rows = filteredAnalyses.map((a) => [
            a.id,
            new Date(a.timestamp).toISOString(),
            a.primary_condition,
            a.confidence.toFixed(2),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        downloadFile(csv, 'analysis_history.csv', 'text/csv');
    };

    const exportAsJSON = () => {
        const json = JSON.stringify(filteredAnalyses, null, 2);
        downloadFile(json, 'analysis_history.json', 'application/json');
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getBarColor = (index: number) => {
        const colors = ['bg-pink-500', 'bg-rose-400', 'bg-pink-400', 'bg-rose-300', 'bg-pink-300'];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50/30 py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50/30 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
                            <BarChart3 className="w-7 h-7" />
                            Analytics Dashboard
                        </h1>
                        <p className="text-pink-600 mt-1">Track your skin analysis history and trends</p>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="px-4 py-2 border border-pink-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="week">Last 7 days</option>
                            <option value="month">Last 30 days</option>
                            <option value="all">All time</option>
                        </select>
                        <div className="relative group">
                            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                                <button
                                    onClick={exportAsCSV}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50"
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={exportAsJSON}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50"
                                >
                                    Export JSON
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-pink-100 rounded-lg">
                                <Activity className="w-6 h-6 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Analyses</p>
                                <p className="text-3xl font-bold text-pink-900">{filteredAnalyses.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg Confidence</p>
                                <p className="text-3xl font-bold text-green-700">{avgConfidence.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Conditions Found</p>
                                <p className="text-3xl font-bold text-blue-700">{conditionStats.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Condition Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100 mb-8">
                    <h2 className="text-lg font-semibold text-pink-900 mb-6">Condition Distribution</h2>

                    {conditionStats.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No analysis data available</p>
                            <p className="text-sm">Complete some skin analyses to see trends</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {conditionStats.map((stat, index) => (
                                <div key={stat.condition} className="flex items-center gap-4">
                                    <span className="w-40 text-sm text-gray-700 truncate" title={stat.condition}>
                                        {stat.condition}
                                    </span>
                                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getBarColor(index)} rounded-full transition-all duration-500`}
                                            style={{ width: `${stat.percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-16 text-sm font-medium text-gray-700 text-right">
                                        {stat.count} ({stat.percentage.toFixed(0)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity Timeline */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h2 className="text-lg font-semibold text-pink-900 mb-6">Recent Activity</h2>

                    {filteredAnalyses.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No recent activity</p>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {filteredAnalyses.slice(0, 10).map((analysis, index) => (
                                <div
                                    key={analysis.id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-pink-50 transition-colors"
                                >
                                    <div className="w-2 h-2 rounded-full bg-pink-400" />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{analysis.primary_condition}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(analysis.timestamp).toLocaleDateString()} at{' '}
                                            {new Date(analysis.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${analysis.confidence >= 80
                                                ? 'bg-green-100 text-green-700'
                                                : analysis.confidence >= 50
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                    >
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
