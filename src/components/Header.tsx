/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  Store,
  ShoppingBag,
  User,
  Heart,
  LogOut,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { UserAccount } from '../types.ts';
import { OFFICIAL_BCV_RATE } from '../utils/zarcaLogic.ts';

interface HeaderProps {
  user: UserAccount | null;
  activeRole: 'buyer' | 'seller';
  onRoleChange: (role: 'buyer' | 'seller') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  favoritesCount: number;
  onViewFavorites: () => void;
  isMobileSimulator: boolean;
  onToggleMobileSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeRole,
  onRoleChange,
  onOpenAuth,
  onLogout,
  favoritesCount,
  onViewFavorites,
  isMobileSimulator,
  onToggleMobileSimulator,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner: BCV Reference Rate & Safe Commerce indicator */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">ZARCA VENEZUELA</span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span>Tasa BCV Referencial: <strong className="text-emerald-400 font-mono tabular-nums">Bs. {OFFICIAL_BCV_RATE.toFixed(2)}</strong> / USD</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Comercio 100% Verificado con KYC
          </span>
          <button
            onClick={onToggleMobileSimulator}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
            title="Alternar vista simulador móvil / escritorio"
            aria-label="Alternar vista simulador"
          >
            {isMobileSimulator ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vista Escritorio</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vista Móvil</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Top Bar Contract: Brand - Center Navigation/Role - Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 text-slate-900 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              Z
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                Zarca
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-600 tracking-wider block">
                Mercado Seguro
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Subaccount Role Switcher (Buyer vs Seller) */}
        <div className="flex items-center justify-center flex-1 max-w-xs sm:max-w-sm">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full shadow-inner">
            <button
              onClick={() => onRoleChange('buyer')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 sm:px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeRole === 'buyer'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Activar Modo Comprador"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Modo Comprador</span>
              <span className="sm:hidden">Comprador</span>
            </button>
            <button
              onClick={() => onRoleChange('seller')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 sm:px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeRole === 'seller'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Activar Modo Vendedor"
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Modo Vendedor</span>
              <span className="sm:hidden">Vendedor</span>
              {user?.isKycVerified && (
                <span title="Verificado con Cédula y Biometría" className="inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Zone 3: User Profile & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeRole === 'buyer' && (
            <button
              onClick={onViewFavorites}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors relative cursor-pointer"
              title="Mis Favoritos"
              aria-label="Ver favoritos guardados"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  {user.phone}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <User className="w-4 h-4" />
              <span>Ingresar (+58)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
