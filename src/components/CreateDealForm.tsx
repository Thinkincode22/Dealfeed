import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CATEGORIES } from '../constants/categories';

type FormErrors = Partial<Record<keyof FormData, string>>;

interface FormData {
    title: string;
    description: string;
    price: string;
    originalPrice: string;
    store: string;
    category: string;
    url: string;
    image: string;
    expires_at: string;
}

const initialForm: FormData = {
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    store: '',
    category: CATEGORIES[0],
    url: '',
    image: '',
    expires_at: '',
};

export const CreateDealForm = () => {
    const { user, isAuthenticated } = useAuth();
    const [form, setForm] = useState<FormData>(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isAuthenticated || !user) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    Zaloguj się, aby dodać ofertę
                </p>
            </div>
        );
    }

    const set = (field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validate = (): boolean => {
        const e: FormErrors = {};
        const title = form.title.trim();
        if (title.length < 5 || title.length > 200) e.title = 'Title must be 5–200 characters';
        const price = parseFloat(form.price);
        if (isNaN(price) || price <= 0) e.price = 'Price must be greater than 0';
        const originalPrice = parseFloat(form.originalPrice);
        if (isNaN(originalPrice) || originalPrice < price) e.originalPrice = 'Original price must be ≥ sale price';
        if (!form.url.trim()) e.url = 'URL is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!isSupabaseConfigured || !supabase) {
            setErrorMsg('Supabase is not configured');
            setStatus('error');
            return;
        }

        setStatus('submitting');
        setErrorMsg('');

        const { error } = await supabase.from('deals').insert({
            title: form.title.trim(),
            description: form.description.trim(),
            price: parseFloat(form.price),
            original_price: parseFloat(form.originalPrice),
            discount: Math.round(
                ((parseFloat(form.originalPrice) - parseFloat(form.price)) / parseFloat(form.originalPrice)) * 100
            ),
            store: form.store.trim(),
            store_url: form.url.trim(),
            image_url: form.image.trim() || null,
            category: form.category,
            expires_at: form.expires_at || null,
            author_id: user.id,
            status: 'pending',
            is_active: true,
        });

        if (error) {
            setErrorMsg(error.message);
            setStatus('error');
        } else {
            setStatus('success');
            setForm(initialForm);
        }
    };

    const field = (label: string, name: keyof FormData, type = 'text', opts?: { required?: boolean; min?: number; max?: number }) => (
        <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                {label} {opts?.required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={form[name]}
                onChange={e => set(name, e.target.value)}
                min={opts?.min}
                max={opts?.max}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none
                    ${errors[name]
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}
                    text-gray-900 dark:text-white`}
            />
            {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4 max-w-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dodaj ofertę</h2>

            {status === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
                    Oferta dodana! Pojawi się po weryfikacji.
                </div>
            )}
            {status === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
                    {errorMsg}
                </div>
            )}

            {field('Title', 'title', 'text', { required: true })}
            {field('Description', 'description')}
            {field('Sale Price (zł)', 'price', 'number', { required: true, min: 0 })}
            {field('Original Price (zł)', 'originalPrice', 'number', { required: true, min: 0 })}
            {field('Store', 'store')}
            {field('Deal URL', 'url', 'url', { required: true })}
            {field('Image URL', 'image', 'url')}
            {field('Expires', 'expires_at', 'datetime-local')}

            <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Category</label>
                <select
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
                {status === 'submitting' ? 'Dodawanie...' : 'Dodaj ofertę'}
            </button>
        </form>
    );
};
