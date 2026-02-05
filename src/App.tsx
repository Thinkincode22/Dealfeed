import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { DealPost } from './components/DealPost';
import { Modal } from './components/Modal';
import { HomePage } from './components/HomePage';
import { DealPage } from './components/DealPage';
import { ProfilePage } from './components/ProfilePage';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';
import { useDeals } from './hooks/useDeals';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { Deal } from './types/deal';

function App() {
  const { deals, addDeal } = useDeals();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Verify Supabase connection on mount
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.from('deals').select('id').limit(1).then(({ data, error }) => {
        if (error) {
          console.warn('Supabase connection error:', error.message);
        } else {
          console.log('✅ Supabase connected! Deals in DB:', data?.length || 0);
        }
      });
    } else {
      console.log('📦 Running in mock mode (Supabase not configured)');
    }
  }, []);

  const handlePostDeal = async (newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => {
    await addDeal(newDeal);
    setIsPostModalOpen(false);
  };

  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Header */}
            <Header onPostClick={() => setIsPostModalOpen(true)} />

            {/* Routes */}
            <Routes>
              <Route path="/" element={<HomePage deals={deals} />} />
              <Route path="/deal/:id" element={<DealPage deals={deals} />} />
              <Route path="/profile" element={<ProfilePage deals={deals} />} />
            </Routes>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* About */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">DealFeed</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your community for finding and sharing the best deals online.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Quick Links</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">About Us</a></li>
                      <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</a></li>
                      <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</a></li>
                    </ul>
                  </div>

                  {/* Support */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Support</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">FAQ</a></li>
                      <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Guidelines</a></li>
                      <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a></li>
                    </ul>
                  </div>

                  {/* Social */}
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
                  © 2024 DealFeed. All rights reserved.
                </div>
              </div>
            </footer>

            {/* Post Deal Modal */}
            <Modal
              isOpen={isPostModalOpen}
              onClose={() => setIsPostModalOpen(false)}
            >
              <DealPost
                onSubmit={handlePostDeal}
                onClose={() => setIsPostModalOpen(false)}
              />
            </Modal>
          </div>
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
