/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  Heart,
  MessageCircle,
  Phone,
  CheckCircle2,
  Calendar,
  Share2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ZarcaProduct } from '../types.ts';
import { convertUsdToBs, generateWhatsAppContactLink } from '../utils/zarcaLogic.ts';

interface ProductDetailModalProps {
  product: ZarcaProduct | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenChat: (product: ZarcaProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenChat,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const { formattedUsd, formattedBs, rate } = convertUsdToBs(product.priceUsd);
  const whatsappUrl = generateWhatsAppContactLink(
    product.sellerPhone,
    product.title,
    product.priceUsd,
    product.sellerName
  );

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-6">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Publicación #{product.id.slice(0, 8)}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Copiar enlace"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? '¡Copiado!' : 'Compartir'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar detalle de producto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Container */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-slate-100 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
            {!imgError ? (
              <img
                src={product.image}
                alt={product.title}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Sparkles className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">{product.title}</p>
              </div>
            )}

            {/* Favorite button over image */}
            <button
              onClick={() => onToggleFavorite(product.id)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-600'
              }`}
              title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Location and Category */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-700">{product.city}</span>
                <span>—</span>
                <span>{product.zone}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {product.title}
              </h2>

              {/* Price Block */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {formattedUsd}
                </div>
                <div className="text-xs text-slate-600 font-mono mt-1 flex items-center justify-between">
                  <span>Equivalente: <strong className="text-emerald-700 font-bold">{formattedBs}</strong></span>
                  <span className="text-[10px] text-slate-400">Tasa: Bs. {rate.toFixed(2)}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Descripción del Producto
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Seller Trust Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      {product.sellerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{product.sellerName}</h4>
                      <p className="text-[11px] text-slate-500">Miembro vendedor verificado</p>
                    </div>
                  </div>
                  {product.isSellerVerified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      KYC Verificado
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-emerald-200/60">
                  <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Reputación: {product.sellerReputation} / 5.0
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {product.sellerPhone}
                  </span>
                </div>
              </div>

              {/* Safety Recommendation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Zarca Seguro:</strong> Acuerde entregas en lugares públicos o centros comerciales. Verifique el artículo antes de realizar su Pago Móvil o entrega en divisas.
                </span>
              </div>
            </div>

            {/* Contact Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(product);
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contactar por Chat Zarca</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors no-underline cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contactar por WhatsApp (+58)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
