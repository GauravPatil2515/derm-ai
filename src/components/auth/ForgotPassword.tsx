import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../lib/ToastContext';
import { ArrowLeft, Mail } from 'lucide-react';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { resetPassword } = useAuth();
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPassword(email);
            setSent(true);
            addToast('Password reset email sent! Check your inbox.', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to send reset email', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <Link
                    to="/login"
                    className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-pink-800">Forgot Password?</h2>
                    <p className="text-pink-600 mt-2">Enter your email to receive reset instructions</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all font-medium shadow-lg shadow-pink-200"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
