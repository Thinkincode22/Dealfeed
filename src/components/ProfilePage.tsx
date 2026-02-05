import { useState } from 'react';
import { Calendar, MapPin, Award, Package, Heart, Settings } from 'lucide-react';
import type { Deal } from '../types/deal';
import { currentUser } from '../data/mockUser';
import { DealCard } from './DealCard';

interface ProfilePageProps {
    deals: Deal[];
}

type Tab = 'my-deals' | 'saved' | 'settings';

export const ProfilePage = ({ deals }: ProfilePageProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('my-deals');

    // Filter deals for "My Deals" tab (simulated by random check or just using all for now for demo)
    // For demo purposes, let's say "My Deals" are the first 2 deals
    const myDeals = deals.slice(0, 2);

    // "Saved" deals could be the next 2
    const savedDeals = deals.slice(2, 4);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex items-end -mt-12 mb-6">
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.username}
                            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800"
                        />
                        <div className="ml-6 mb-2 flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {currentUser.username}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {currentUser.bio}
                            </p>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-colors">
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
                                <div className="font-bold text-gray-900 dark:text-white">{currentUser.reputation}</div>
                                <div className="text-sm">Reputation</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <Package className="text-green-600 dark:text-green-400" size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{currentUser.dealsPosted}</div>
                                <div className="text-sm">Deals Posted</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {currentUser.joinDate.toLocaleDateString()}
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
                                    {currentUser.location}
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
                        My Deals
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
                        Saved
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
                        Settings
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
                        {myDeals.map(deal => (
                            <DealCard key={deal.id} deal={deal} />
                        ))}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {savedDeals.map(deal => (
                            <DealCard key={deal.id} deal={deal} />
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
                        <Settings size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Settings Panel</h3>
                        <p>User settings implementation would go here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
