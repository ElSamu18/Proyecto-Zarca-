/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ZarcaProduct {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  category: string;
  image: string;
  city: string;
  zone: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerReputation: number;
  isSellerVerified: boolean;
  isActive: boolean;
  viewsCount: number;
  inquiriesCount: number;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  cedula?: string;
  isKycVerified: boolean;
  kycVerificationDate?: string;
  kycVerificationHash?: string;
  activeRole: 'buyer' | 'seller';
  favorites: string[];
}

export interface KycFormData {
  cedulaType: 'V' | 'E';
  cedulaNumber: string;
  fullName: string;
  state: string;
  city: string;
  birthDate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
}
