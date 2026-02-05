import { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import type { Deal } from '../types/deal';

interface DealPostProps {
    onSubmit?: (deal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => void;
    onClose?: () => void;
}

const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys & Games',
    'Food & Grocery',
    'Beauty & Health',
    'Automotive',
    'Other',
];

export const DealPost = ({ onSubmit, onClose }: DealPostProps) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        discount: '',
        store: '',
        storeUrl: '',
        category: 'Electronics',
        image: '',
        couponCode: '',
        expiresAt: '',
        shippingInfo: '',
    });

    const [imagePreview, setImagePreview] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }
        if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
            newErrors.originalPrice = 'Valid original price is required';
        }
        if (!formData.store.trim()) {
            newErrors.store = 'Store name is required';
        }
        if (!formData.storeUrl.trim()) {
            newErrors.storeUrl = 'Store URL is required';
        }
        if (!imagePreview) {
            newErrors.image = 'Product image is required';
        }

        const price = parseFloat(formData.price);
        const originalPrice = parseFloat(formData.originalPrice);
        if (price >= originalPrice) {
            newErrors.discount = 'Sale price must be less than original price';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const price = parseFloat(formData.price);
            const originalPrice = parseFloat(formData.originalPrice);
            const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

            const newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'> = {
                title: formData.title,
                description: formData.description,
                price,
                originalPrice,
                discount,
                store: formData.store,
                storeUrl: formData.storeUrl,
                category: formData.category,
                image: imagePreview,
                comments: [],
                createdAt: new Date(),
                author: {
                    username: 'Anonymous User',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
                },
                ...(formData.couponCode && { couponCode: formData.couponCode }),
                ...(formData.expiresAt && { expiresAt: new Date(formData.expiresAt) }),
                ...(formData.shippingInfo && { shippingInfo: formData.shippingInfo }),
            };

            if (onSubmit) {
                onSubmit(newDeal);
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                price: '',
                originalPrice: '',
                discount: '',
                store: '',
                storeUrl: '',
                category: 'Electronics',
                image: '',
                couponCode: '',
                expiresAt: '',
                shippingInfo: '',
            });
            setImagePreview('');

            alert('Deal posted successfully!');
        } catch (error) {
            console.error('Error posting deal:', error);
            alert('Failed to post deal. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900">Post a New Deal</h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Alert */}
                {Object.keys(errors).length > 0 && (
                    <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-900">Please fix the following errors:</p>
                            <ul className="mt-2 space-y-1">
                                {Object.entries(errors).map(([key, error]) => (
                                    <li key={key} className="text-sm text-red-800">
                                        • {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Deal Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="E.g., Samsung 55 inch OLED TV - 30% OFF"
                            maxLength={100}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                                }`}
                        />
                        <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the deal, why it's great, any important details..."
                            maxLength={500}
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                                }`}
                        />
                        <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500</p>
                    </div>

                    {/* Price Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Sale Price (zł) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="99.99 zł"
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Original Price (zł) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleInputChange}
                            placeholder="149.99 zł"
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.originalPrice
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                                }`}
                        />
                    </div>

                    {/* Store Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Store Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="store"
                            value={formData.store}
                            onChange={handleInputChange}
                            placeholder="E.g., Amazon, Best Buy"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.store
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Store URL <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="storeUrl"
                            value={formData.storeUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/product"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.storeUrl
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                                }`}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Coupon Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Coupon Code (Optional)
                        </label>
                        <input
                            type="text"
                            name="couponCode"
                            value={formData.couponCode}
                            onChange={handleInputChange}
                            placeholder="E.g., SAVE20"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Expiration Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Deal Expires (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            name="expiresAt"
                            value={formData.expiresAt}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Shipping Info */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Shipping Info (Optional)
                        </label>
                        <input
                            type="text"
                            name="shippingInfo"
                            value={formData.shippingInfo}
                            onChange={handleInputChange}
                            placeholder="E.g., Free shipping over $50, 2-day delivery"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Product Image <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer block">
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                </label>
                            </div>
                            {errors.image && (
                                <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>

                        {imagePreview && (
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview('');
                                        setFormData(prev => ({ ...prev, image: '' }));
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Deal'}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};
