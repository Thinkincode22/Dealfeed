export type Language = 'en' | 'pl';

export interface Deal {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    currency: string;
    discountPercentage: number;
    imageUrl: string;
    storeName: string;
    storeUrl: string;
    votes: number;
    comments: number;
    timestamp: string;
    author: string;
}

export interface Translations {
    top: string;
    new: string;
    percent: string;
    communities: string;
    searchPlaceholder: string;
    goToStore: string;
    genericError: string;
}
