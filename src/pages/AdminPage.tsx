import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Check, X } from 'lucide-react';

type Tab = 'moderation' | 'users';

interface PendingDeal {
    id: string;
    title: string;
    store: string;
    category: string;
    price: number;
    created_at: string;
    author?: { username?: string };
}

interface ProfileRow {
    id: string;
    username: string;
    role: string;
    created_at: string;
}

export const AdminPage = () => {
    const navigate = useNavigate();
    const { loading: roleLoading, canModerate, isAdmin } = useUserRole();
    const { isAuthenticated } = useAuth();
    const [tab, setTab] = useState<Tab>('moderation');

    // Route guard
    useEffect(() => {
        if (!roleLoading && (!isAuthenticated || !canModerate)) {
            navigate('/', { replace: true });
        }
    }, [roleLoading, isAuthenticated, canModerate, navigate]);

    if (roleLoading || !canModerate) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Shield className="text-blue-600" />
                Admin Panel
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setTab('moderation')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                        tab === 'moderation'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Moderacja
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setTab('users')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                            tab === 'users'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Użytkownicy
                    </button>
                )}
            </div>

            {tab === 'moderation' && <ModerationTab />}
            {tab === 'users' && isAdmin && <UsersTab />}
        </div>
    );
};

// ==================== Moderation Tab ====================

const ModerationTab = () => {
    const [deals, setDeals] = useState<PendingDeal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!isSupabaseConfigured || !supabase) return;
            setLoading(true);
            const { data } = await supabase
                .from('deals')
                .select('id, title, store, category, price, created_at, author:profiles(username)')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });
            if (!cancelled) {
                setDeals((data as PendingDeal[]) || []);
                setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        if (!supabase) return;
        await supabase.from('deals').update({ status }).eq('id', id);
        setDeals(prev => prev.filter(d => d.id !== id));
    };

    if (loading) return <p className="text-gray-500">Loading...</p>;

    return (
        <div className="space-y-4">
            {deals.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No pending deals.</p>
            ) : (
                deals.map(deal => (
                    <div key={deal.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{deal.title}</p>
                            <p className="text-sm text-gray-500">
                                {deal.store} · {deal.category} · {deal.price} zł · by {(deal.author as { username?: string })?.username || 'Unknown'}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => updateStatus(deal.id, 'approved')}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Approve"
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={() => updateStatus(deal.id, 'rejected')}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Reject"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

// ==================== Users Tab ====================

const UsersTab = () => {
    const [users, setUsers] = useState<ProfileRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!isSupabaseConfigured || !supabase) return;
            setLoading(true);
            const { data } = await supabase
                .from('profiles')
                .select('id, username, role, created_at')
                .order('created_at', { ascending: false });
            if (!cancelled) {
                setUsers((data as ProfileRow[]) || []);
                setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const updateRole = async (id: string, newRole: string) => {
        if (!supabase) return;
        const { error } = await supabase.rpc('update_user_role', {
            target_user_id: id,
            new_role: newRole,
        });
        if (error) {
            console.error('Error updating role:', error.message);
            return;
        }
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    if (loading) return <p className="text-gray-500">Loading...</p>;

    return (
        <div className="space-y-4">
            {users.map(user => (
                <div key={user.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-sm text-gray-500">Role: {user.role}</p>
                    </div>
                    <select
                        value={user.role}
                        onChange={e => updateRole(user.id, e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="super_admin">admin</option>
                    </select>
                </div>
            ))}
        </div>
    );
};
