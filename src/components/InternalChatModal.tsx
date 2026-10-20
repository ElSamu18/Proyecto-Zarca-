/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  ShieldCheck,
  CreditCard,
  MapPin,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { ZarcaProduct, ChatMessage } from '../types.ts';
import { convertUsdToBs } from '../utils/zarcaLogic.ts';

interface InternalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ZarcaProduct | null;
  buyerName: string;
}

export const InternalChatModal: React.FC<InternalChatModalProps> = ({
  isOpen,
  onClose,
  product,
  buyerName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product && isOpen) {
      // Initialize with welcome and context message
      const initialMsgs: ChatMessage[] = [
        {
          id: 'm-sys',
          sender: 'seller',
          text: `¡Hola ${buyerName || 'amigo'}! Soy ${product.sellerName}, vendedor verificado en Zarca. La publicación "${product.title}" está disponible para entrega personal en ${product.city} (${product.zone}) o envíos nacionales asegurados.`,
          timestamp: 'Justo ahora',
        },
      ];
      setMessages(initialMsgs);
    }
  }, [product, isOpen, buyerName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !product) return null;

  const { formattedUsd, formattedBs } = convertUsdToBs(product.priceUsd);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'buyer',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');

    // Simulate smart seller reply
    setIsTyping(true);
    setTimeout(() => {
      let replyText = 'Con gusto. Coordinemos la entrega en una zona segura o te comparto los datos de Pago Móvil.';
      const lower = text.toLowerCase();
      if (lower.includes('pago móvil') || lower.includes('transferencia') || lower.includes('banco') || lower.includes('bs')) {
        replyText = `Aceptamos Pago Móvil al cambio oficial BCV (${formattedBs}) a Banesco / Mercantil, o divisas en efectivo ($) al momento de la entrega en ${product.zone}.`;
      } else if (lower.includes('disponible') || lower.includes('talla') || lower.includes('color')) {
        replyText = `Sí, confirmado 100% disponible en stock inmediato aquí en ${product.city}. Puedes revisarlo detalladamente antes de concretar.`;
      } else if (lower.includes('entrega') || lower.includes('lugar') || lower.includes('encontrarnos')) {
        replyText = `Perfecto. Hacemos entregas personales seguras en punto céntrico de ${product.zone} (${product.city}) con estacionamiento vigilado. ¿A qué hora te conviene?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'seller',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full h-[620px] max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                {product.sellerName.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white truncate max-w-[180px]">
                  {product.sellerName}
                </h4>
                {product.isSellerVerified && (
                  <span title="Vendedor Verificado KYC" className="inline-flex">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-400 font-mono">
                {product.sellerPhone} · {product.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar chat con vendedor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Quick Banner */}
        <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <img
              src={product.image}
              alt=""
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div className="truncate">
              <span className="font-semibold text-slate-900 block truncate">{product.title}</span>
              <span className="text-slate-500 text-[11px]">{product.zone}, {product.city}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-slate-900 font-mono">{formattedUsd}</span>
            <span className="text-[10px] text-slate-500 block font-mono">{formattedBs}</span>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((m) => {
            const isMe = m.sender === 'buyer';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl px-3 py-2 w-28">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[10px] text-slate-400">escribiendo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <button
            onClick={() => handleQuickPrompt('¿Está disponible para entrega inmediata?')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg whitespace-nowrap cursor-pointer transition-colors border border-slate-200"
          >
            ¿Disponible de inmediato?
          </button>
          <button
            onClick={() => handleQuickPrompt('¿Aceptas Pago Móvil tasa BCV?')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg whitespace-nowrap cursor-pointer transition-colors border border-slate-200"
          >
            ¿Aceptas Pago Móvil?
          </button>
          <button
            onClick={() => handleQuickPrompt(`¿Podemos coordinar entrega en ${product.zone}?`)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg whitespace-nowrap cursor-pointer transition-colors border border-slate-200"
          >
            ¿Punto de entrega?
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage(inputValue);
              }
            }}
            placeholder="Escribe tu mensaje seguro al vendedor..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Enviar mensaje al vendedor"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
