import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';

import { HomePage } from './pages/HomePage';
import { DealPage } from './pages/DealPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreateDealForm } from './components/CreateDealForm';
import { AdminPage } from './pages/AdminPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useDeals } from './hooks/useDeals';
import { supabase, isSupabaseConfigured } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  const { deals, loading, error, hasMore, loadMore } = useDeals();

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
                <Route path="/profile" element={<ProtectedRoute><ProfilePage deals={deals} /></ProtectedRoute>} />
                <Route path="/create-deal" element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <CreateDealForm />
                    </div>
                  </ProtectedRoute>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">DealFeed</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Polska społeczność łowców okazji. Znajdź i udostępniaj najlepsze zniżki.
                      </p>
                    </div>
                    <div className="md:text-right">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Kontakt</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Masz pytania? <a href="mailto:kontakt@dealfeed.pl" className="text-blue-600 dark:text-blue-400 hover:underline">kontakt@dealfeed.pl</a>
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} DealFeed. Wszelkie prawa zastrzeżone.
                  </div>
                </div>
              </footer>


            </div>
          </Router>
        </SearchProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
