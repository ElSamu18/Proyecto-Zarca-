/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, ShieldCheck, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { ZarcaProduct } from '../types.ts';
import { convertUsdToBs } from '../utils/zarcaLogic.ts';

interface ProductCardProps {
  product: ZarcaProduct;
  isFavorite: boolean;
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  onSelect: (product: ZarcaProduct) => void;
  onQuickContact?: (product: ZarcaProduct, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onQuickContact,
}) => {
  const [imgError, setImgError] = useState(false);
  const { formattedUsd, formattedBs } = convertUsdToBs(product.priceUsd);

  return (
    <article
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-400">
            <Sparkles className="w-8 h-8 mb-1 text-slate-300" />
            <span className="text-xs font-medium text-slate-500 text-center line-clamp-1">
              {product.category}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => onToggleFavorite(product.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-600'
          }`}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Verified Seller Seal on corner */}
        {product.isSellerVerified && (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vendedor Verificado</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Category and City */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-700">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 text-slate-500 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {product.city}, {product.zone}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-2 leading-snug transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Action */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-extrabold text-slate-900 font-mono tracking-tight">
              {formattedUsd}
            </div>
            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              {formattedBs} (ref. BCV)
            </div>
          </div>

          {onQuickContact && (
            <button
              onClick={(e) => onQuickContact(product, e)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Contactar vendedor"
              aria-label={`Contactar al vendedor de ${product.title}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contactar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
