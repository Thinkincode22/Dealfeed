import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'pl' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 font-medium text-sm border border-transparent hover:border-gray-200"
            aria-label="Toggle Language"
        >
            <Globe size={16} />
            <span>{language === 'en' ? 'EN' : 'PL'}</span>
        </button>
    );
}
