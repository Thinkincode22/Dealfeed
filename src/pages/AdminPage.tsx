import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Check, X, LayoutDashboard, Users, ClipboardList, TrendingUp, Package, Trash2, Pencil } from 'lucide-react';

type Tab = 'dashboard' | 'moderation' | 'all-deals' | 'users';

interface PendingDeal {
    id: string;
    title: string;
    description: string;
    store: string;
    store_url: string;
    category: string;
    price: number;
    original_price: number;
    discount?: number;
    image_url: string | null;
    status?: 'pending' | 'approved' | 'rejected';
    is_active?: boolean;
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
    const [tab, setTab] = useState<Tab>('dashboard');

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
                <Shield className="text-violet-600" />
                Admin Panel
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setTab('dashboard')}
                    className={`shrink-0 whitespace-nowrap pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        tab === 'dashboard'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <LayoutDashboard size={16} />
                    Dashboard
                </button>
                <button
                    onClick={() => setTab('moderation')}
                    className={`shrink-0 whitespace-nowrap pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        tab === 'moderation'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <ClipboardList size={16} />
                    Moderacja
                </button>
                <button
                    onClick={() => setTab('all-deals')}
                    className={`shrink-0 whitespace-nowrap pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        tab === 'all-deals'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Package size={16} />
                    Wszystkie deale
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setTab('users')}
                        className={`shrink-0 whitespace-nowrap pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        tab === 'users'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    >
                        <Users size={16} />
                        Użytkownicy
                    </button>
                )}
            </div>

            {tab === 'dashboard' && <DashboardTab />}
            {tab === 'moderation' && <ModerationTab />}
            {tab === 'all-deals' && <AllDealsTab />}
            {tab === 'users' && isAdmin && <UsersTab />}
        </div>
    );
};

// ==================== Dashboard Tab ====================

const DashboardTab = () => {
    const [stats, setStats] = useState({
        totalDeals: 0,
        approvedDeals: 0,
        pendingDeals: 0,
        totalUsers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            if (!isSupabaseConfigured || !supabase) return;
            setLoading(true);
            try {
                const [{ count: totalDeals }, { count: approvedDeals }, { count: pendingDeals }, { count: totalUsers }] = await Promise.all([
                    supabase.from('deals').select('*', { count: 'exact', head: true }),
                    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
                    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                ]);

                setStats({
                    totalDeals: totalDeals || 0,
                    approvedDeals: approvedDeals || 0,
                    pendingDeals: pendingDeals || 0,
                    totalUsers: totalUsers || 0,
                });
            } catch (err) {
                console.error('Error loading stats:', err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <p className="text-gray-500">Loading statistics...</p>;

    const statCards = [
        { label: 'Total Deals', value: stats.totalDeals, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        { label: 'Approved', value: stats.approvedDeals, icon: Check, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Pending', value: stats.pendingDeals, icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
                <div key={card.label} className={`p-6 rounded-2xl border border-gray-200 dark:border-gray-800 ${card.bg} flex items-center gap-4`}>
                    <div className={`p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm ${card.color}`}>
                        <card.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ==================== Moderation Tab ====================

const ModerationTab = () => {
    const [deals, setDeals] = useState<PendingDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDeal, setEditingDeal] = useState<PendingDeal | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!isSupabaseConfigured || !supabase) return;
            setLoading(true);
            const { data } = await supabase
                .from('deals')
                .select('id, title, description, store, store_url, category, price, original_price, image_url, created_at, author:profiles(username)')
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
        const { error } = await supabase.from('deals').update({ status }).eq('id', id);
        if (error) {
            alert('Error updating status: ' + error.message);
            return;
        }
        setDeals(prev => prev.filter(d => d.id !== id));
    };

    const deleteDeal = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this deal?')) return;
        if (!supabase) return;
        const { error } = await supabase.from('deals').delete().eq('id', id);
        if (error) {
            alert('Error deleting deal: ' + error.message);
            return;
        }
        setDeals(prev => prev.filter(d => d.id !== id));
    };

    const saveDeal = async (updated: PendingDeal) => {
        if (!supabase) return;
        const { error } = await supabase.from('deals').update({
            title: updated.title,
            description: updated.description,
            store: updated.store,
            store_url: updated.store_url,
            category: updated.category,
            price: updated.price,
            original_price: updated.original_price,
            image_url: updated.image_url || null,
            discount: Math.round(((updated.original_price - updated.price) / updated.original_price) * 100),
        }).eq('id', updated.id);
        if (error) {
            alert('Error saving deal: ' + error.message);
            return;
        }
        setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
        setEditingDeal(null);
    };

    if (loading) return <p className="text-gray-500">Loading...</p>;

    return (
        <>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3">Deal</th>
                            <th className="px-6 py-3">Store / Category</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Author</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {deals.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    No pending deals to moderate.
                                </td>
                            </tr>
                        ) : (
                            deals.map(deal => (
                                <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{deal.title}</p>
                                        <p className="text-xs text-gray-500">{new Date(deal.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900 dark:text-white">{deal.store}</p>
                                        <p className="text-xs text-gray-500">{deal.category}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {deal.price} zł
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {(deal.author as { username?: string })?.username || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingDeal(deal)}
                                                className="p-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(deal.id, 'approved')}
                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                title="Approve"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(deal.id, 'rejected')}
                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Reject"
                                            >
                                                <X size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteDeal(deal.id)}
                                                className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingDeal && (
                <EditDealModal
                    deal={editingDeal}
                    onSave={saveDeal}
                    onClose={() => setEditingDeal(null)}
                />
            )}
        </>
    );
};

// ==================== All Deals Tab ====================

interface AllDeal {
    id: string;
    title: string;
    description: string;
    store: string;
    store_url: string;
    category: string;
    price: number;
    original_price: number;
    discount?: number;
    image_url: string | null;
    status?: 'pending' | 'approved' | 'rejected';
    is_active?: boolean;
    created_at: string;
    author?: { username?: string };
}

const AllDealsTab = () => {
    const [deals, setDeals] = useState<AllDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [editingDeal, setEditingDeal] = useState<AllDeal | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!isSupabaseConfigured || !supabase) return;
            setLoading(true);
            const { data } = await supabase
                .from('deals')
                .select('id, title, description, store, store_url, category, price, original_price, image_url, status, is_active, created_at, author:profiles(username)')
                .order('created_at', { ascending: false });
            if (!cancelled) {
                setDeals((data as AllDeal[]) || []);
                setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        if (!supabase) return;
        const { error } = await supabase.from('deals').update({ status }).eq('id', id);
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        setDeals(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    };

    const deleteDeal = async (id: string) => {
        if (!window.confirm('Видалити цей deal?')) return;
        if (!supabase) return;
        const { error } = await supabase.from('deals').delete().eq('id', id);
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        setDeals(prev => prev.filter(d => d.id !== id));
    };

    const toggleActive = async (id: string, current: boolean) => {
        if (!supabase) return;
        const { error } = await supabase.from('deals').update({ is_active: !current }).eq('id', id);
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        setDeals(prev => prev.map(d => d.id === id ? { ...d, is_active: !current } : d));
    };

    const saveDeal = async (updated: AllDeal) => {
        if (!supabase) return;
        const { error } = await supabase.from('deals').update({
            title: updated.title,
            description: updated.description,
            store: updated.store,
            store_url: updated.store_url,
            category: updated.category,
            price: updated.price,
            original_price: updated.original_price,
            image_url: updated.image_url || null,
            discount: Math.round(((updated.original_price - updated.price) / updated.original_price) * 100),
        }).eq('id', updated.id);
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
        setEditingDeal(null);
    };

    const filtered = filter === 'all' ? deals : deals.filter(d => d.status === filter);

    const statusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    if (loading) return <p className="text-gray-500">Loading...</p>;

    return (
        <>
            {/* Filter buttons */}
            <div className="flex gap-2 mb-4">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            filter === f
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {f === 'all' ? `Wszystkie (${deals.length})` :
                         f === 'pending' ? `Oczekujące (${deals.filter(d => d.status === 'pending').length})` :
                         f === 'approved' ? `Zatwierdzone (${deals.filter(d => d.status === 'approved').length})` :
                         `Odrzucone (${deals.filter(d => d.status === 'rejected').length})`}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[820px]">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3">Deal</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Active</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    No deals found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map(deal => (
                                <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{deal.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {deal.store || 'No store'} · by {(deal.author as { username?: string })?.username || 'Unknown'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{deal.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{deal.price} zł</td>
                                    <td className="px-6 py-4">{statusBadge(deal.status || 'pending')}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(deal.id, deal.is_active ?? true)}
                                            className={`w-10 h-5 rounded-full transition-colors relative ${
                                                deal.is_active ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                                deal.is_active ? 'translate-x-5' : ''
                                            }`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingDeal(deal)}
                                                className="p-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {deal.status !== 'approved' && (
                                                <button
                                                    onClick={() => updateStatus(deal.id, 'approved')}
                                                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            {deal.status !== 'rejected' && (
                                                <button
                                                    onClick={() => updateStatus(deal.id, 'rejected')}
                                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteDeal(deal.id)}
                                                className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingDeal && (
                <EditDealModal
                    deal={editingDeal}
                    onSave={saveDeal}
                    onClose={() => setEditingDeal(null)}
                />
            )}
        </>
    );
};

// ==================== Edit Deal Modal ====================

interface EditDealModalProps {
    deal: PendingDeal;
    onSave: (deal: PendingDeal) => void;
    onClose: () => void;
}

const CATEGORIES = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Gaming',
    'Books', 'Toys & Games', 'Food', 'Health', 'Other',
];

const EditDealModal = ({ deal, onSave, onClose }: EditDealModalProps) => {
    const [form, setForm] = useState({
        title: deal.title,
        description: deal.description || '',
        store: deal.store || '',
        store_url: deal.store_url || '',
        category: deal.category,
        price: deal.price,
        original_price: deal.original_price,
        image_url: deal.image_url || '',
    });

    const set = (field: string, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...deal,
            ...form,
            discount: Math.round(((form.original_price - form.price) / form.original_price) * 100),
        });
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Pencil size={20} />
                        Edit Deal
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            required
                            minLength={5}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            rows={3}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Sale Price (zł) *</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => set('price', parseFloat(e.target.value) || 0)}
                                required
                                min={0}
                                step={0.01}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Original Price (zł) *</label>
                            <input
                                type="number"
                                value={form.original_price}
                                onChange={e => set('original_price', parseFloat(e.target.value) || 0)}
                                required
                                min={0}
                                step={0.01}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Store</label>
                            <input
                                type="text"
                                value={form.store}
                                onChange={e => set('store', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Category</label>
                            <select
                                value={form.category}
                                onChange={e => set('category', e.target.value)}
                                className={inputClass}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Deal URL *</label>
                        <input
                            type="url"
                            value={form.store_url}
                            onChange={e => set('store_url', e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Image URL</label>
                        <input
                            type="url"
                            value={form.image_url}
                            onChange={e => set('image_url', e.target.value)}
                            className={inputClass}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
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
            alert('Error updating role: ' + error.message);
            return;
        }
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    if (loading) return <p className="text-gray-500">Loading...</p>;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Joined</th>
                        <th className="px-6 py-3 text-right">Manage</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                                <p className="text-xs text-gray-500">{user.id}</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                    user.role === 'moderator' ? 'bg-violet-100 text-violet-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <select
                                    value={user.role}
                                    onChange={e => updateRole(user.id, e.target.value)}
                                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                >
                                    <option value="user">user</option>
                                    <option value="moderator">moderator</option>
                                    <option value="super_admin">super_admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

