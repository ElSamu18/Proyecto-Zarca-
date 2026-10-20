/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Smartphone, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { validateVenezuelanPhone } from '../utils/zarcaLogic.ts';
import { UserAccount } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('4125558921');
  const [userName, setUserName] = useState('Carlos Mendoza');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validation = validateVenezuelanPhone(phoneNumber);
    if (!validation.valid) {
      setError(validation.error || 'Número de teléfono inválido');
      return;
    }
    if (!userName.trim()) {
      setError('Por favor indica tu nombre completo');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setOtpCode('9274'); // Pre-fill sample OTP for instant seamless testing
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otpCode.trim().length !== 4) {
      setError('Ingresa el código de 4 dígitos enviado por SMS');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const phoneValidation = validateVenezuelanPhone(phoneNumber);
      const newUser: UserAccount = {
        id: `user-${Date.now().toString().slice(-4)}`,
        name: userName.trim(),
        phone: phoneValidation.formatted,
        isKycVerified: false,
        activeRole: 'buyer',
        favorites: [],
      };
      onSuccess(newUser);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              Z
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ingreso a Zarca</h3>
              <p className="text-xs text-slate-500">Comercio seguro en Venezuela (+58)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal de autenticación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej: Alejandro Silva"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Número de Teléfono Móvil
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white focus-within:border-transparent transition-all">
                  <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 text-xs font-bold border-r border-slate-200">
                    🇻🇪 +58
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="412 123 4567"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-transparent focus:outline-none font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Digitel (412), Movistar (414, 424), Movilnet (416, 426)
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Enviando código SMS...</span>
                  ) : (
                    <>
                      <span>Continuar con SMS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Protección antifraude Zarca con verificación telefónica
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Código de Confirmación</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulamos el envío del SMS a <span className="font-mono font-semibold text-slate-700">+58 {phoneNumber}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                  Ingresa el código de 4 dígitos
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="9274"
                  className="w-36 mx-auto block text-center px-4 py-2.5 text-xl tracking-[0.5em] font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <span className="text-xs text-emerald-800">
                  Código de prueba autocompletado: <strong>9274</strong>
                </span>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Validando cuenta...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verificar e Ingresar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Cambiar número telefónico
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
