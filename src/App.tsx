import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { DealPost } from './components/DealPost';
import { MOCK_DEALS } from './data/mockData';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 font-sans pb-12">
        <Header />

        <main className="max-w-[800px] mx-auto px-4 py-6 sm:py-8 space-y-4">
          {MOCK_DEALS.map((deal) => (
            <DealPost key={deal.id} deal={deal} />
          ))}

          {/* Infinite Scroll Load More (Visual) */}
          <div className="pt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
