import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../lib/ToastContext';
import { User, Mail, Lock, LogOut, Shield, Camera } from 'lucide-react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function Profile() {
    const { user, signOut } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            addToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            if (!user?.email) throw new Error('No user email');

            // Re-authenticate user first
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser!, credential);

            // Update password
            await updatePassword(auth.currentUser!, newPassword);

            addToast('Password updated successfully!', 'success');
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.code === 'auth/wrong-password') {
                addToast('Current password is incorrect', 'error');
            } else {
                addToast(error.message || 'Failed to update password', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            addToast('Signed out successfully', 'success');
            navigate('/');
        } catch (error) {
            addToast('Error signing out', 'error');
        }
    };

    const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full border-4 border-pink-200"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            )}
                            <button className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {user?.displayName || 'DermAI User'}
                            </h1>
                            <p className="text-gray-500 flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4" />
                                {user?.email}
                            </p>
                            {isGoogleUser && (
                                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google Account
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-pink-600" />
                        Account Settings
                    </h2>

                    {!isGoogleUser && (
                        <div className="border-b border-gray-100 pb-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-800">Password</h3>
                                    <p className="text-sm text-gray-500">Change your account password</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    className="px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                >
                                    {showPasswordForm ? 'Cancel' : 'Change'}
                                </button>
                            </div>

                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all font-medium"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">User ID</span>
                            <span className="font-mono text-gray-700">{user?.uid?.slice(0, 12)}...</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Email Verified</span>
                            <span className={user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                                {user?.emailVerified ? '✓ Verified' : '⚠ Not Verified'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500">Account Created</span>
                            <span className="text-gray-700">
                                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
