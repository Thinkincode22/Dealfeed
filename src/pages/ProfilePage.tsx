import { useState, useEffect } from 'react';
import { Calendar, MapPin, Award, Package, Heart, Settings } from 'lucide-react';
import type { Deal } from '../types/deal';
import { transformDBDealToDeal } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { DealCard } from '../components/DealCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ProfilePageProps {
    deals: Deal[];
}

type Tab = 'my-deals' | 'saved' | 'settings';

export const ProfilePage = ({ deals }: ProfilePageProps) => {
    const { user, isAuthenticated, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('my-deals');
    const [savedDeals, setSavedDeals] = useState<Deal[]>([]);
    const [savedLoading, setSavedLoading] = useState(false);

    // Edit profile form state
    const [editUsername, setEditUsername] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editMessage, setEditMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated || !user || !isSupabaseConfigured || !supabase) return;

        const fetchSaved = async () => {
            setSavedLoading(true);
            try {
                const { data, error } = await supabase!
                    .from('saved_deals')
                    .select('deal_id, deals(*)')
                    .eq('user_id', user.id);

                if (error) throw error;

                const transformed: Deal[] = (data || [])
                    .map((row: any) => row.deals ? transformDBDealToDeal(row.deals) : null)
                    .filter(Boolean) as Deal[];

                setSavedDeals(transformed);
            } catch (err) {
                console.error('Error fetching saved deals:', err);
            } finally {
                setSavedLoading(false);
            }
        };

        fetchSaved();
    }, [isAuthenticated, user]);

    const profile = user?.profile;

    // Initialize edit form from profile
    useEffect(() => {
        if (profile) {
            setEditUsername(profile.username || '');
            setEditBio(profile.bio || '');
            setEditLocation(profile.location || '');
            setEditAvatarUrl(profile.avatar || '');
        }
    }, [profile?.username, profile?.bio, profile?.location, profile?.avatar]);

    if (!isAuthenticated || !user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sign In Required</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Please sign in to view your profile.</p>
                <a href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
                    &larr; Back to Deals
                </a>
            </div>
        );
    }
    const myDeals = deals.filter(d => d.author.username === profile?.username);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex items-end -mt-12 mb-6">
                        <img
                            src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                            alt={profile?.username || 'User'}
                            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800"
                        />
                        <div className="ml-6 mb-2 flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {profile?.username || 'User'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {profile?.bio || 'No bio yet'}
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-colors"
                        >
                            <Settings size={18} />
                            <span>Edit Profile</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Award className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{profile?.reputation || 0}</div>
                                <div className="text-sm">Reputation</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <Package className="text-green-600 dark:text-green-400" size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{myDeals.length}</div>
                                <div className="text-sm">Deals Posted</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {profile?.joinDate?.toLocaleDateString() || 'N/A'}
                                </div>
                                <div className="text-sm">Joined</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <MapPin className="text-orange-600 dark:text-orange-400" size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {profile?.location || 'Not set'}
                                </div>
                                <div className="text-sm">Location</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('my-deals')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'my-deals'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Package size={18} />
                        My Deals ({myDeals.length})
                    </div>
                    {activeTab === 'my-deals' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'saved'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Heart size={18} />
                        Zapisane ({savedDeals.length})
                    </div>
                    {activeTab === 'saved' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'settings'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Settings size={18} />
                        Ustawienia <span className="text-xs text-gray-400">(Wkrótce)</span>
                    </div>
                    {activeTab === 'settings' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'my-deals' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {myDeals.length > 0 ? (
                            myDeals.map(deal => (
                                <DealCard key={deal.id} deal={deal} />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                                <Package size={48} className="mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deals yet</h3>
                                <p className="text-gray-500 dark:text-gray-400">Start posting deals to see them here!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {savedLoading ? (
                            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mx-auto mb-4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        ) : savedDeals.length > 0 ? (
                            savedDeals.map(deal => (
                                <DealCard key={deal.id} deal={deal} />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                                <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Brak zapisanych okazji</h3>
                                <p className="text-gray-500 dark:text-gray-400">Zapisz okazje, aby zobaczyć je tutaj!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Settings size={20} />
                                Edit Profile
                            </h3>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setEditSaving(true);
                                setEditMessage('');
                                const { error } = await updateProfile({
                                    username: editUsername,
                                    bio: editBio,
                                    location: editLocation,
                                    avatar_url: editAvatarUrl,
                                });
                                setEditSaving(false);
                                setEditMessage(error ? 'Failed to save changes.' : 'Profile updated!');
                            }} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                    <textarea
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={editLocation}
                                        onChange={(e) => setEditLocation(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                                    <input
                                        type="url"
                                        value={editAvatarUrl}
                                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {editAvatarUrl && (
                                    <div className="flex items-center gap-4">
                                        <img src={editAvatarUrl} alt="Avatar preview" className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 object-cover" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Preview</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        type="submit"
                                        disabled={editSaving}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                                    >
                                        {editSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    {editMessage && (
                                        <span className={`text-sm ${editMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                                            {editMessage}
                                        </span>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
