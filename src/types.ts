// Re-export all types from dedicated type files for easier imports
export type { Deal, SortOption } from './types/deal';
export type Language = 'en' | 'pl';

export interface Translations {
    top: string;
    new: string;
    percent: string;
    communities: string;
    searchPlaceholder: string;
    goToStore: string;
    genericError: string;
}
