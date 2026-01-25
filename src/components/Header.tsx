import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Search, Menu } from 'lucide-react';

export function Header() {
    const { t } = useLanguage();

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Left: Logo & Nav */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button - Visual Only for now */}
                        <button className="md:hidden p-1 -ml-1 text-gray-500">
                            <Menu size={24} />
                        </button>
                        <a href="/" className="text-2xl font-extrabold text-gray-900 tracking-tighter">
                            DealFeed<span className="text-blue-600">.ai</span>
                        </a>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors border-b-2 border-gray-900 py-5">{t.top}</a>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-5 border-b-2 border-transparent hover:border-gray-200">{t.new}</a>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-5 border-b-2 border-transparent hover:border-gray-200">{t.percent}</a>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-5 border-b-2 border-transparent hover:border-gray-200">{t.communities}</a>
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block group">
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            className="w-64 pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-full text-sm transition-all outline-none group-hover:bg-gray-50"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}
