/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  PackageOpen,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ZarcaProduct } from '../types.ts';
import { ProductCard } from './ProductCard.tsx';
import { filterProducts } from '../utils/zarcaLogic.ts';
import { CATEGORIES, VENEZUELAN_CITIES } from '../data/mockData.ts';

interface BuyerFeedProps {
  products: ZarcaProduct[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: ZarcaProduct) => void;
  onQuickContact: (product: ZarcaProduct, e: React.MouseEvent) => void;
  showFavoritesOnly?: boolean;
  onResetFavoritesFilter?: () => void;
}

export const BuyerFeed: React.FC<BuyerFeedProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onQuickContact,
  showFavoritesOnly = false,
  onResetFavoritesFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todos');
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Compute filtered list
  const filteredProducts = useMemo(() => {
    let list = filterProducts(products, {
      query: searchQuery,
      category: selectedCategory === 'Todos' ? undefined : selectedCategory,
      city: selectedCity === 'Todos' ? undefined : selectedCity,
      onlyVerified,
    });

    if (showFavoritesOnly) {
      list = list.filter((p) => favorites.includes(p.id));
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedCity, onlyVerified, showFavoritesOnly, favorites]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todos');
    setSelectedCity('Todos');
    setOnlyVerified(false);
    if (onResetFavoritesFilter) onResetFavoritesFilter();
  };

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos, marcas o modelos en Venezuela..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl w-full sm:w-44">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 w-full focus:outline-none cursor-pointer"
                aria-label="Filtrar por ciudad venezolana"
              >
                {VENEZUELAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city === 'Todos' ? 'Toda Venezuela' : city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Badges and Verified Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Verified Seller Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Solo Vendedores Verificados
            </span>
          </label>
        </div>
      </div>

      {/* Active Filter Title */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Mostrando <strong className="text-slate-900 font-mono">{filteredProducts.length}</strong> publicaciones activas
          {selectedCity !== 'Todos' && ` en ${selectedCity}`}
          {selectedCategory !== 'Todos' && ` · ${selectedCategory}`}
          {showFavoritesOnly && ' · (Tus favoritos guardados)'}
        </span>

        {(searchQuery || selectedCategory !== 'Todos' || selectedCity !== 'Todos' || onlyVerified || showFavoritesOnly) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer filtros</span>
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectProduct}
              onQuickContact={onQuickContact}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No encontramos publicaciones coincidentes
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Prueba ajustando el término de búsqueda, seleccionando otra ciudad o quitando el filtro de categoría.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
};
