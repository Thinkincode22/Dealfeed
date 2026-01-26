import { useState } from 'react';
import { Search, Bell, User, Zap, Plus } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';

type NavItem = 'hot' | 'new' | 'discussed';

interface HeaderProps {
    onPostClick?: () => void;
}

export const Header = ({ onPostClick }: HeaderProps) => {
    const [activeNav, setActiveNav] = useState<NavItem>('hot');
    const { setQuery } = useSearch();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setQuery(value);
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Navigation */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 rounded-lg p-2 group-hover:bg-blue-700 transition-colors">
                                <Zap size={24} className="text-white" fill="white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">DealFeed</span>
                        </a>

                        {/* Navigation */}
                        <nav className="flex items-center gap-1">
                            <NavButton
                                active={activeNav === 'hot'}
                                onClick={() => setActiveNav('hot')}
                            >
                                Hot
                            </NavButton>
                            <NavButton
                                active={activeNav === 'new'}
                                onClick={() => setActiveNav('new')}
                            >
                                New
                            </NavButton>
                            <NavButton
                                active={activeNav === 'discussed'}
                                onClick={() => setActiveNav('discussed')}
                            >
                                Discussed
                            </NavButton>
                        </nav>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search deals, stores, products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Post Deal Button */}
                        <button
                            onClick={onPostClick}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            <span>Post Deal</span>
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Sign In Button */}
                        <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                            <User size={20} />
                            <span>Sign In</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Helper component for navigation buttons
interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const NavButton = ({ active, onClick, children }: NavButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${active
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
        >
            {children}
        </button>
    );
};