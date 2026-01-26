import type { Language, Translations } from '../types';

export const translations: Record<Language, Translations> = {
    en: {
        top: 'Top',
        new: 'New',
        percent: '-%',
        communities: 'Communities',
        searchPlaceholder: 'Search deals...',
        goToStore: 'Go to store',
        genericError: 'Something went wrong',
    },
    pl: {
        top: 'Top',
        new: 'Nowe',
        percent: '-%',
        communities: 'Społeczności',
        searchPlaceholder: 'Szukaj okazji...',
        goToStore: 'Przejdź do sklepu',
        genericError: 'Coś poszło nie tak',
    },
};
