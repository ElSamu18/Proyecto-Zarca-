/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Eye,
  MessageSquare,
  TrendingUp,
  Package,
  Trash2,
  Power,
  Edit3,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ZarcaProduct, UserAccount } from '../types.ts';
import { convertUsdToBs, OFFICIAL_BCV_RATE } from '../utils/zarcaLogic.ts';
import { CATEGORIES, VENEZUELAN_CITIES } from '../data/mockData.ts';

interface SellerDashboardProps {
  user: UserAccount;
  products: ZarcaProduct[];
  onAddProduct: (newProduct: ZarcaProduct) => void;
  onToggleProductActive: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProductPrice: (id: string, newPrice: number) => void;
  onSwitchToBuyer: () => void;
  onOpenKycModal: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  user,
  products,
  onAddProduct,
  onToggleProductActive,
  onDeleteProduct,
  onUpdateProductPrice,
  onSwitchToBuyer,
  onOpenKycModal,
}) => {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');

  // Form Fields for New Product
  const [title, setTitle] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [category, setCategory] = useState('Tecnología');
  const [city, setCity] = useState('Caracas');
  const [zone, setZone] = useState('Chacao');
  const [description, setDescription] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(
    '/src/assets/images/zarca_product_coffee_1792515012563.jpg'
  );
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter seller's own products
  const myProducts = products.filter(
    (p) => p.sellerId === user.id || p.sellerName === user.name
  );

  // Compute seller KPIs
  const activeCount = myProducts.filter((p) => p.isActive).length;
  const totalViews = myProducts.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalInquiries = myProducts.reduce((acc, p) => acc + (p.inquiriesCount || 0), 0);

  // Preset sample high quality images
  const PRESET_IMAGES = [
    {
      id: 'img-coffee',
      label: 'Café Gourmet Los Andes',
      url: '/src/assets/images/zarca_product_coffee_1792515012563.jpg',
    },
    {
      id: 'img-tech',
      label: 'Teléfono Smartphone 5G',
      url: '/src/assets/images/zarca_product_tech_1792515029218.jpg',
    },
    {
      id: 'img-sneakers',
      label: 'Calzado Deportivo Cuero',
      url: '/src/assets/images/zarca_product_sneakers_1792515041899.jpg',
    },
    {
      id: 'img-power',
      label: 'Generador / Batería LiFePO4',
      url: '/src/assets/images/zarca_product_powerstation_1792515054124.jpg',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPresetImage(reader.result);
          setImageMode('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numericPrice = parseFloat(priceUsd);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Por favor ingresa un precio válido en dólares (USD)');
      return;
    }
    if (!title.trim()) {
      setFormError('Ingresa un título descriptivo para la publicación');
      return;
    }
    if (!description.trim()) {
      setFormError('Agrega una breve descripción del estado y entrega del producto');
      return;
    }

    const finalImage =
      imageMode === 'url' && customImageUrl.trim()
        ? customImageUrl.trim()
        : selectedPresetImage;

    const newProduct: ZarcaProduct = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priceUsd: numericPrice,
      category,
      image: finalImage,
      city,
      zone: zone.trim() || 'Centro',
      sellerId: user.id,
      sellerName: user.name,
      sellerPhone: user.phone,
      sellerReputation: 5.0,
      isSellerVerified: user.isKycVerified,
      isActive: true,
      viewsCount: 1,
      inquiriesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddProduct(newProduct);
    setIsPublishModalOpen(false);

    // Reset Form
    setTitle('');
    setPriceUsd('');
    setDescription('');
    setCustomImageUrl('');
  };

  const handleSavePriceEdit = (productId: string) => {
    const num = parseFloat(editPriceValue);
    if (!isNaN(num) && num > 0) {
      onUpdateProductPrice(productId, num);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Seller Verification Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Panel de Vendedor Verificado
              </h2>
              {user.isKycVerified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  KYC Aprobado
                </span>
              ) : (
                <button
                  onClick={onOpenKycModal}
                  className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3 h-3" />
                  Completar Verificación
                </button>
              )}
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Titular: <strong className="text-white">{user.name}</strong> · Cédula:{' '}
              <strong className="text-emerald-400 font-mono">{user.cedula || 'En trámite'}</strong> ·
              Teléfono: <span className="font-mono">{user.phone}</span>
            </p>
            {user.kycVerificationHash && (
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Certificado Hash: {user.kycVerificationHash}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex-1 md:flex-initial py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Nuevo Producto</span>
          </button>
          <button
            onClick={onSwitchToBuyer}
            className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            title="Ver catálogo como comprador"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Feed</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Publicaciones Activas</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {activeCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Visibles en feed de Venezuela</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Visualizaciones</span>
            <Eye className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalViews.toLocaleString('es-VE')}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Compradores locales interesados</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Consultas / Leads</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalInquiries}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Chats y contactos por WhatsApp</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Reputación Vendedor</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            5.0 <span className="text-xs font-normal text-slate-500">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Nivel Platino Zarca</p>
        </div>
      </div>

      {/* Publications Management Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mis Publicaciones en Venta</h3>
            <p className="text-xs text-slate-500">
              Gestiona precios en USD / Bs, activa o pausa tus artículos de forma inmediata
            </p>
          </div>
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nueva publicación</span>
          </button>
        </div>

        {myProducts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {myProducts.map((p) => {
              const { formattedUsd, formattedBs } = convertUsdToBs(p.priceUsd);
              return (
                <div
                  key={p.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                        <span className="font-semibold text-slate-700">{p.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {p.city}, {p.zone}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[11px] text-slate-400">Creado {p.createdAt}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{p.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {p.viewsCount} visitas
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          {p.inquiriesCount} consultas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Price */}
                  <div className="shrink-0 text-left sm:text-right">
                    {editingPriceId === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={editPriceValue}
                          onChange={(e) => setEditPriceValue(e.target.value)}
                          className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                          step="0.5"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePriceEdit(p.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="group flex items-center sm:justify-end gap-1.5">
                        <div>
                          <div className="text-sm font-extrabold text-slate-900 font-mono">
                            {formattedUsd}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {formattedBs}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingPriceId(p.id);
                            setEditPriceValue(p.priceUsd.toString());
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Modificar precio"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleProductActive(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        p.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={p.isActive ? 'Pausar publicación' : 'Activar publicación'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{p.isActive ? 'Activo' : 'Pausado'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar publicación"
                      aria-label={`Eliminar ${p.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Aún no tienes publicaciones</h4>
            <p className="text-xs text-slate-500 mb-3">
              Publica tu primer artículo para que miles de compradores en Venezuela lo vean de inmediato.
            </p>
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Publicar ahora
            </button>
          </div>
        )}
      </div>

      {/* Publish New Product Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  +
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Crear Nueva Publicación</h3>
                  <p className="text-xs text-slate-500">
                    Aparecerá inmediatamente en el catálogo de compradores
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                aria-label="Cerrar modal de nueva publicación"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Producto o Artículo
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Lote Café Boconó 1kg / Batería Inverter / Smartphone..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Price in USD and automatic BCV calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio en Divisas (USD $)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={priceUsd}
                      onChange={(e) => setPriceUsd(e.target.value)}
                      placeholder="25.00"
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equivalente en Bolívares (Tasa BCV {OFFICIAL_BCV_RATE.toFixed(2)})
                  </label>
                  <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-mono font-bold text-sm">
                    {priceUsd && !isNaN(parseFloat(priceUsd))
                      ? `Bs. ${(parseFloat(priceUsd) * OFFICIAL_BCV_RATE).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'Bs. 0,00'}
                  </div>
                </div>
              </div>

              {/* Category and Venezuelan Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {VENEZUELAN_CITIES.filter((c) => c !== 'Todos').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zona / Sector
                  </label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="Ej: Chacao / El Viñedo"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción y condiciones de entrega
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla estado del producto, garantía, método de entrega personal o envío..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Photo Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Fotografía del Producto
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetImage(preset.url);
                        setImageMode('preset');
                      }}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        imageMode === 'preset' && selectedPresetImage === preset.url
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      {imageMode === 'preset' && selectedPresetImage === preset.url && (
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir imagen propia</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-slate-400">o</span>
                  <input
                    type="url"
                    placeholder="Pegar URL de foto..."
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      setImageMode('url');
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar en Zarca Venezuela</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
