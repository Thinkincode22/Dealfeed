import { Users, TrendingUp, Award, Info } from 'lucide-react';

export const Sidebar = () => {
    return (
        <aside className="space-y-6">
            {/* About DealFeed Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                    About DealFeed
                </h2>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    The community for finding and sharing the best deals. Join us to save money and share your finds.
                </p>
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Join Community
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Community Stats
                </h2>
                <div className="space-y-3">
                    <StatItem
                        icon={<Users size={18} />}
                        label="Active Members"
                        value="12,543"
                    />
                    <StatItem
                        icon={<TrendingUp size={18} />}
                        label="Deals Today"
                        value="234"
                    />
                    <StatItem
                        icon={<Award size={18} />}
                        label="Money Saved"
                        value="$2.4M"
                    />
                </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Links
                </h2>
                <div className="space-y-2">
                    <QuickLink href="/guidelines">Community Guidelines</QuickLink>
                    <QuickLink href="/faq">FAQ</QuickLink>
                    <QuickLink href="/contact">Contact Support</QuickLink>
                    <QuickLink href="/about">About Us</QuickLink>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">
                            How It Works
                        </h3>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Vote on deals you love! Higher votes = hotter deals. Share your finds and help others save.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

// Helper component for stats
interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const StatItem = ({ icon, label, value }: StatItemProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <span className="font-bold text-gray-900">{value}</span>
        </div>
    );
};

// Helper component for quick links
interface QuickLinkProps {
    href: string;
    children: React.ReactNode;
}

const QuickLink = ({ href, children }: QuickLinkProps) => {
    return (
        <a
            href={href}
            className="block text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors"
        >
            {children}
        </a>
    );
};
