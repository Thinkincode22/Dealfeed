import { useState } from 'react';
import { Header } from './components/Header';
import { DealList } from './components/DealList';
import { Sidebar } from './components/Sidebar';
import { DealPost } from './components/DealPost';
import { Modal } from './components/Modal';
import { mockDeals } from './data/mockDeals';
import { SearchProvider } from './contexts/SearchContext';
import type { Deal } from './types/deal';

function App() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handlePostDeal = (newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => {
    const dealWithId: Deal = {
      ...newDeal,
      id: `deal-${Date.now()}`,
      temperature: 0,
      upvotes: 0,
      downvotes: 0,
    };
    setDeals(prev => [dealWithId, ...prev]);
    setIsPostModalOpen(false);
  };

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header onPostClick={() => setIsPostModalOpen(true)} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Deals List */}
            <div className="lg:col-span-2">
              <DealList deals={deals} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* About */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">DealFeed</h3>
                <p className="text-sm text-gray-600">
                  Your community for finding and sharing the best deals online.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-blue-600">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                  <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Support</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-blue-600">FAQ</a></li>
                  <li><a href="#" className="hover:text-blue-600">Guidelines</a></li>
                  <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                </ul>
              </div>

              {/* Social */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Follow Us</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-blue-600">Twitter</a></li>
                  <li><a href="#" className="hover:text-blue-600">Facebook</a></li>
                  <li><a href="#" className="hover:text-blue-600">Instagram</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
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
    </SearchProvider>
  );
}

export default App;
