import { useState } from 'react';
import { Pencil, X, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CATEGORIES } from '../constants/categories';
import type { Deal } from '../types/deal';

interface EditDealModalProps {
    deal: Deal;
    onClose: () => void;
    onSaved: () => void;
}

export const EditDealModal = ({ deal, onClose, onSaved }: EditDealModalProps) => {
    const [form, setForm] = useState({
        title: deal.title,
        description: deal.description,
        price: String(deal.price),
        originalPrice: String(deal.originalPrice),
        store: deal.store,
        storeUrl: deal.storeUrl,
        category: deal.category,
        image: deal.image,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSupabaseConfigured || !supabase) {
            setError('Supabase is not configured');
            return;
        }

        const price = parseFloat(form.price);
        const originalPrice = parseFloat(form.originalPrice);
        if (isNaN(price) || price <= 0) {
            setError('Price must be greater than 0');
            return;
        }
        if (isNaN(originalPrice) || originalPrice < price) {
            setError('Original price must be ≥ sale price');
            return;
        }

        setSaving(true);
        setError('');

        const { error: updateError } = await supabase
            .from('deals')
            .update({
                title: form.title.trim(),
                description: form.description.trim(),
                price,
                original_price: originalPrice,
                discount: Math.round(((originalPrice - price) / originalPrice) * 100),
                store: form.store.trim(),
                store_url: form.storeUrl.trim(),
                category: form.category,
                image_url: form.image.trim() || null,
            })
            .eq('id', deal.id);

        setSaving(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        onSaved();
        onClose();
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Pencil size={20} />
                        Edytuj ofertę
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Tytuł *</label>
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
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Opis</label>
                        <textarea
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            rows={3}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Cena (zł) *</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => set('price', e.target.value)}
                                required
                                min={0}
                                step={0.01}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Cena oryginalna (zł) *</label>
                            <input
                                type="number"
                                value={form.originalPrice}
                                onChange={e => set('originalPrice', e.target.value)}
                                required
                                min={0}
                                step={0.01}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Sklep</label>
                            <input
                                type="text"
                                value={form.store}
                                onChange={e => set('store', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Kategoria</label>
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
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Link do oferty *</label>
                        <input
                            type="url"
                            value={form.storeUrl}
                            onChange={e => set('storeUrl', e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Zdjęcie (URL)</label>
                        <input
                            type="url"
                            value={form.image}
                            onChange={e => set('image', e.target.value)}
                            placeholder="https://..."
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : 'Zapisz zmiany'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
