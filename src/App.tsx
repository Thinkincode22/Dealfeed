import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { DealPost } from './components/DealPost';
import { Modal } from './components/Modal';
import { HomePage } from './components/HomePage';
import { DealPage } from './components/DealPage';
import { ProfilePage } from './components/ProfilePage';
import { CreateDealForm } from './components/CreateDealForm';
import { AdminPage } from './pages/AdminPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';
import { useDeals } from './hooks/useDeals';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { Deal } from './types/deal';

function App() {
  const { deals, loading, error, hasMore, loadMore, addDeal } = useDeals();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.from('deals').select('id').limit(1).then(({ data, error }) => {
        if (error) {
          console.warn('Supabase connection error:', error.message);
        } else {
          console.log('Supabase connected! Deals in DB:', data?.length || 0);
        }
      });
    } else {
      console.log('Running in mock mode (Supabase not configured)');
    }
  }, []);

  const handlePostDeal = async (newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => {
    await addDeal(newDeal);
    setIsPostModalOpen(false);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SearchProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
              <Header />

              {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
                    {error} — Showing cached data.
                  </div>
                </div>
              )}

              <Routes>
                <Route path="/" element={<HomePage deals={deals} hasMore={hasMore} onLoadMore={loadMore} loading={loading} />} />
                <Route path="/deal/:id" element={<DealPage deals={deals} />} />
                <Route path="/profile" element={<ProfilePage deals={deals} />} />
                <Route path="/create-deal" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <CreateDealForm />
                  </div>
                } />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">The page you are looking for does not exist.</p>
                    <a href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
                      &larr; Back to Deals
                    </a>
                  </div>
                } />
              </Routes>

              <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">DealFeed</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your community for finding and sharing the best deals online.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Quick Links</h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">About Us</a></li>
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</a></li>
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Support</h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">FAQ</a></li>
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Guidelines</a></li>
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Follow Us</h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Twitter</a></li>
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Facebook</a></li>
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Instagram</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} DealFeed. All rights reserved.
                  </div>
                </div>
              </footer>

              <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)}>
                <DealPost onSubmit={handlePostDeal} onClose={() => setIsPostModalOpen(false)} />
              </Modal>
            </div>
          </Router>
        </SearchProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
