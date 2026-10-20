/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Camera,
  AlertCircle,
  Scan,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { validateCedula } from '../utils/zarcaLogic.ts';
import { VENEZUELAN_CITIES } from '../data/mockData.ts';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (kycData: {
    cedula: string;
    hash: string;
    verifiedAt: string;
  }) => void;
  userPhone: string;
  userName: string;
}

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userPhone,
  userName,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [cedulaType, setCedulaType] = useState<'V' | 'E'>('V');
  const [cedulaNumber, setCedulaNumber] = useState('23456789');
  const [fullName, setFullName] = useState(userName || 'Carlos Mendoza');
  const [city, setCity] = useState('Caracas');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Biometric Scan State
  const [cameraActive, setCameraActive] = useState(false);
  const [biometricPhase, setBiometricPhase] = useState<
    'idle' | 'centering' | 'blinking' | 'angle' | 'processing' | 'done'
  >('idle');
  const [biometricProgress, setBiometricProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Final Certificate
  const [certHash, setCertHash] = useState('');

  // Clean camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const fullCedula = `${cedulaType}-${cedulaNumber.trim()}`;
    const validation = validateCedula(fullCedula);
    if (!validation.valid) {
      setFormError(validation.error || 'Número de cédula inválido');
      return;
    }

    if (!agreeTerms) {
      setFormError('Debes aceptar los términos de comercio seguro y entrega transparente de Zarca');
      return;
    }

    setStep(2);
    startBiometricFlow();
  };

  const startBiometricFlow = async () => {
    setBiometricPhase('centering');
    setBiometricProgress(15);

    // Try starting camera if possible
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch {
      // In sandbox/headless or without permission, simulated facial scanner works 100% reliably
      setCameraActive(false);
    }

    // Step-by-step biometric simulation sequence
    setTimeout(() => {
      setBiometricPhase('blinking');
      setBiometricProgress(45);
    }, 1800);

    setTimeout(() => {
      setBiometricPhase('angle');
      setBiometricProgress(75);
    }, 3600);

    setTimeout(() => {
      setBiometricPhase('processing');
      setBiometricProgress(95);
    }, 5200);

    setTimeout(() => {
      setBiometricPhase('done');
      setBiometricProgress(100);
      stopCamera();
      const generatedHash = `ZRC-KYC-${Math.random().toString(36).substring(2, 7).toUpperCase()}-VZ`;
      setCertHash(generatedHash);
      setStep(3);
    }, 6500);
  };

  const handleFinish = () => {
    const fullCedula = `${cedulaType}-${cedulaNumber.trim()}`;
    const verifiedAt = new Date().toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    onSuccess({
      cedula: fullCedula,
      hash: certHash || 'ZRC-KYC-84920-VZ',
      verifiedAt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
        {/* Step Indicator Header */}
        <div className="bg-slate-950 text-white px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Verificación KYC de Vendedor</h3>
                <p className="text-[11px] text-slate-400">Seguridad y confianza en Zarca Venezuela</p>
              </div>
            </div>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar modal de verificación"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`flex flex-col gap-1 ${step >= 1 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
              <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <span>1. Identidad</span>
            </div>
            <div className={`flex flex-col gap-1 ${step >= 2 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
              <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <span>2. Prueba Facial</span>
            </div>
            <div className={`flex flex-col gap-1 ${step >= 3 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
              <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <span>3. Aprobación</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <strong className="block font-semibold">¿Por qué verificamos a los vendedores?</strong>
                  Zarca protege el comercio local en Venezuela. Al verificar tu identidad con Cédula y prueba de vida facial, tus productos recibirán el sello de <strong>Vendedor Verificado</strong>, aumentando tus ventas y la confianza de los compradores.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre Completo (según documento de identidad)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cédula de Identidad de Venezuela
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all">
                  <select
                    value={cedulaType}
                    onChange={(e) => setCedulaType(e.target.value as 'V' | 'E')}
                    className="px-3 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold border-r border-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="V">V - Venezolano</option>
                    <option value="E">E - Extranjero</option>
                  </select>
                  <input
                    type="text"
                    value={cedulaNumber}
                    onChange={(e) => setCedulaNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="23456789"
                    maxLength={9}
                    className="flex-1 px-3.5 py-2.5 text-sm bg-transparent focus:outline-none font-mono font-medium"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ingrese solo dígitos (ej: 23456789 para V-23.456.789)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ciudad / Estado
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {VENEZUELAN_CITIES.filter((c) => c !== 'Todos').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Teléfono Registrado
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userPhone || '+58 412-555-8921'}
                    className="w-full px-3 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>
                    Certifico que los datos son verídicos y me comprometo a cumplir con las normas de entrega segura y honestidad comercial de Zarca.
                  </span>
                </label>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Continuar a Prueba de Vida Facial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="text-center space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Validación Biométrica de Rostro</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prueba de vida para confirmar que eres el titular de la cédula V-{cedulaNumber}
                </p>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative mx-auto w-64 h-64 rounded-3xl bg-slate-950 overflow-hidden border-2 border-emerald-500/50 flex items-center justify-center shadow-inner">
                {/* Real video if camera granted */}
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  /* Animated Hologram Biometric Simulation */
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative">
                    {/* Simulated head silhouette */}
                    <div className="w-32 h-40 border-2 border-dashed border-emerald-400/60 rounded-[50%] flex items-center justify-center relative">
                      <div className="w-20 h-24 rounded-[50%] bg-emerald-500/10 flex items-center justify-center">
                        <Scan className="w-10 h-10 text-emerald-400 animate-pulse" />
                      </div>
                      {/* Scanning laser beam */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce opacity-80" />
                    </div>
                  </div>
                )}

                {/* Oval overlay mask */}
                <div className="absolute inset-0 border-[6px] border-slate-950/80 pointer-events-none rounded-3xl">
                  <div className="w-44 h-56 mx-auto mt-4 border-2 border-emerald-400/80 rounded-[50%] shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                </div>

                {/* Status chip over scan */}
                <div className="absolute bottom-3 inset-x-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl py-1.5 px-3 text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>
                    {biometricPhase === 'centering' && 'Centrando rostro en el óvalo...'}
                    {biometricPhase === 'blinking' && 'Paso 1: Parpadee suavemente...'}
                    {biometricPhase === 'angle' && 'Paso 2: Gire levemente a la derecha...'}
                    {biometricPhase === 'processing' && 'Validando con el registro...'}
                    {biometricPhase === 'done' && '¡Rostro Validado con Éxito!'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-xs mx-auto">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Progreso de verificación</span>
                  <span className="font-mono font-bold text-emerald-600">{biometricProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${biometricProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Mantenga buena iluminación. Los datos biométricos se procesan de forma encriptada bajo estándares internacionales de identidad.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  IDENTIDAD VERIFICADA EXITOSAMENTE
                </span>
                <h4 className="text-xl font-extrabold text-slate-900">
                  ¡Felicidades, {fullName.split(' ')[0]}!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  Tu perfil de vendedor en Zarca está validado. Ya puedes publicar productos, recibir pagos con seguridad y coordinar entregas directas.
                </p>
              </div>

              {/* Digital Trust Certificate Card */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-left border border-slate-800 space-y-2.5 font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>CERTIFICADO DE CONFIANZA ZARCA</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">ESTADO: ACTIVO</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Titular:</span>
                    <strong className="text-white">{fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cédula:</span>
                    <strong className="text-white font-mono">{cedulaType}-{cedulaNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ciudad:</span>
                    <span className="text-slate-300">{city}, Venezuela</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Código Hash Seguro:</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{certHash}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    Firma Criptográfica KYC
                  </span>
                  <span>Vigencia: Permanente</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <span>Acceder a Mi Panel de Vendedor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
