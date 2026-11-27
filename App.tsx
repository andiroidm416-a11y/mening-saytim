import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryChips } from './components/CategoryChips';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AIAssistantModal } from './components/AIAssistantModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FavoritesModal } from './components/FavoritesModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { VisionFridgeModal } from './components/VisionFridgeModal';
import { LiveDeliveryMapModal } from './components/LiveDeliveryMapModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { Sparkles, Search, RefreshCw } from 'lucide-react';

const MarketContent: React.FC = () => {
  const {
    filteredProducts,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    selectedProductDetail,
    setSelectedProductDetail,
    setIsAIAssistantOpen
  } = useMarket();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner with AI integration */}
        <HeroBanner />

        {/* Category Navigation & Sort Toolbar */}
        <CategoryChips />

        {/* Product Catalog Grid */}
        <div id="catalog-section" className="my-8 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Mahsulotlar katalogi</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {filteredProducts.length} ta mahsulot
                </span>
              </h2>
              {searchQuery && (
                <p className="text-xs text-slate-400 mt-1">
                  "{searchQuery}" so'rovi bo'yicha qidiruv natijalari
                </p>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                  Mahsulot topilmadi
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Qidiruv so'zini o'zgartirib ko'ring yoki AI Yordamchidan kerakli mahsulotni topib berishni so'rang.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Filtrlarni tozalash</span>
                </button>

                <button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Maslahatchidan so'rash</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Quick Action Buttons at Bottom */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsAIAssistantOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-2xl shadow-violet-600/50 hover:scale-105 active:scale-95 transition-all group border border-violet-400/30"
          title="AI Aqlli Maslahatchi"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span className="text-xs sm:text-sm font-bold pr-1">AI Maslahatchi</span>
        </button>
      </div>

      {/* Modals & Slide-overs */}
      <CartDrawer />
      <AIAssistantModal />
      <CheckoutModal />
      <OrderSuccessModal />
      <FavoritesModal />
      <OrdersHistoryModal />
      <AdminDashboard />
      <AuthModal />
      <UserProfileModal />
      <VoiceSearchModal />
      <VisionFridgeModal />
      <LiveDeliveryMapModal />
      <ReceiptModal />
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
      />

      {/* Realtime Toast Notifications */}
      <ToastContainer />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MarketContent />
    </MarketProvider>
  );
}
