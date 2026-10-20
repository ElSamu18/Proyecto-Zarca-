/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  Store,
  Sparkles,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { ZarcaProduct, UserAccount } from './types.ts';
import { INITIAL_PRODUCTS, INITIAL_USER } from './data/mockData.ts';
import { Header } from './components/Header.tsx';
import { BuyerFeed } from './components/BuyerFeed.tsx';
import { SellerDashboard } from './components/SellerDashboard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { KycVerificationModal } from './components/KycVerificationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { InternalChatModal } from './components/InternalChatModal.tsx';
import { OFFICIAL_BCV_RATE } from './utils/zarcaLogic.ts';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(INITIAL_USER);
  const [products, setProducts] = useState<ZarcaProduct[]>(INITIAL_PRODUCTS);
  const [activeRole, setActiveRole] = useState<'buyer' | 'seller'>('buyer');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<ZarcaProduct | null>(null);
  const [chatProduct, setChatProduct] = useState<ZarcaProduct | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Subaccount switcher logic
  const handleRoleChange = (newRole: 'buyer' | 'seller') => {
    if (newRole === 'seller') {
      if (!user) {
        setIsAuthModalOpen(true);
        showToast('Debes ingresar con tu número +58 para acceder al Modo Vendedor');
        return;
      }
      if (!user.isKycVerified) {
        // Trigger required KYC flow
        setIsKycModalOpen(true);
        return;
      }
      setActiveRole('seller');
      showToast('Cambiado a Modo Vendedor. Gestiona tus productos.');
    } else {
      setActiveRole('buyer');
      showToast('Cambiado a Modo Comprador. Explora publicaciones.');
    }
  };

  // KYC Completion
  const handleKycSuccess = (kycData: {
    cedula: string;
    hash: string;
    verifiedAt: string;
  }) => {
    if (user) {
      const updatedUser: UserAccount = {
        ...user,
        cedula: kycData.cedula,
        isKycVerified: true,
        kycVerificationDate: kycData.verifiedAt,
        kycVerificationHash: kycData.hash,
        activeRole: 'seller',
      };
      setUser(updatedUser);

      // Upgrade existing products by this user to verified
      setProducts((prev) =>
        prev.map((p) =>
          p.sellerId === user.id || p.sellerName === user.name
            ? { ...p, isSellerVerified: true }
            : p
        )
      );
    }
    setActiveRole('seller');
    showToast('¡Identidad KYC verificada con éxito! Bienvenido al Panel de Vendedor.');
  };

  // Favorite toggle
  const handleToggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isFav = user.favorites.includes(productId);
    const newFavorites = isFav
      ? user.favorites.filter((id) => id !== productId)
      : [...user.favorites, productId];

    setUser({ ...user, favorites: newFavorites });
    showToast(isFav ? 'Eliminado de tus favoritos' : '¡Guardado en tus favoritos!');
  };

  // Add new product from Seller
  const handleAddProduct = (newProduct: ZarcaProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast('¡Publicación creada con éxito! Ya es visible para todos los compradores.');
  };

  // Toggle active status for listing
  const handleToggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isActive;
          showToast(nextState ? 'Publicación reactivada' : 'Publicación pausada');
          return { ...p, isActive: nextState };
        }
        return p;
      })
    );
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Publicación eliminada correctamente.');
  };

  // Update product price
  const handleUpdateProductPrice = (id: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, priceUsd: newPrice } : p))
    );
    showToast('Precio actualizado correctamente.');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveRole('buyer');
    showToast('Sesión cerrada.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container / Mobile Frame Wrapper */}
      <div
        className={
          isMobileSimulator
            ? 'max-w-[420px] mx-auto min-h-screen my-4 bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden flex flex-col'
            : 'flex-1 flex flex-col'
        }
      >
        {/* Header with Subaccount Switcher */}
        <Header
          user={user}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          favoritesCount={user?.favorites.length || 0}
          onViewFavorites={() => setShowFavoritesOnly((prev) => !prev)}
          isMobileSimulator={isMobileSimulator}
          onToggleMobileSimulator={() => setIsMobileSimulator((prev) => !prev)}
        />

        {/* Hero / Role Context Bar */}
        <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-600">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                {activeRole === 'buyer' ? (
                  <>
                    <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Subcuenta Comprador</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Subcuenta Vendedor Verificado</span>
                  </>
                )}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="text-slate-500 hidden sm:inline">
                {activeRole === 'buyer'
                  ? 'Explorando catálogo seguro en Venezuela'
                  : 'Gestión y publicación de inventario'}
              </span>
            </div>

            {/* Quick Demo Switcher Aid */}
            <div className="flex items-center gap-2">
              {!user?.isKycVerified && (
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Verificarme como Vendedor</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          {activeRole === 'buyer' ? (
            <BuyerFeed
              products={products}
              favorites={user?.favorites || []}
              onToggleFavorite={handleToggleFavorite}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onQuickContact={(p) => setChatProduct(p)}
              showFavoritesOnly={showFavoritesOnly}
              onResetFavoritesFilter={() => setShowFavoritesOnly(false)}
            />
          ) : user?.isKycVerified ? (
            <SellerDashboard
              user={user}
              products={products}
              onAddProduct={handleAddProduct}
              onToggleProductActive={handleToggleProductActive}
              onDeleteProduct={handleDeleteProduct}
              onUpdateProductPrice={handleUpdateProductPrice}
              onSwitchToBuyer={() => setActiveRole('buyer')}
              onOpenKycModal={() => setIsKycModalOpen(true)}
            />
          ) : (
            /* If accessed seller mode without KYC */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Verificación de Identidad Requerida
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Para vender de forma legal y segura en Zarca Venezuela, debes completar una rápida verificación KYC con tu número de cédula y prueba de vida facial.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Iniciar Verificación KYC</span>
                </button>
                <button
                  onClick={() => setActiveRole('buyer')}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Volver al Modo Comprador
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Zarca Venezuela</span>
              <span aria-hidden="true">·</span>
              <span>Comercio local seguro y verificado</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Tasa referencial BCV: Bs. {OFFICIAL_BCV_RATE.toFixed(2)}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Validación biométrica KYC
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isFavorite={Boolean(selectedProduct && user?.favorites.includes(selectedProduct.id))}
        onToggleFavorite={handleToggleFavorite}
        onOpenChat={(p) => setChatProduct(p)}
      />

      {/* Internal Chat Modal */}
      <InternalChatModal
        isOpen={Boolean(chatProduct)}
        onClose={() => setChatProduct(null)}
        product={chatProduct}
        buyerName={user?.name || 'Comprador'}
      />

      {/* KYC Verification Modal */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onSuccess={handleKycSuccess}
        userPhone={user?.phone || '+58 412-555-8921'}
        userName={user?.name || 'Carlos Mendoza'}
      />

      {/* Phone Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
          showToast(`¡Bienvenido a Zarca, ${newUser.name}!`);
        }}
      />
    </div>
  );
}
