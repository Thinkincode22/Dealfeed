import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language, Translations } from '../types';

const translations: Record<Language, Translations> = {
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

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
