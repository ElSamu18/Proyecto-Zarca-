/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ZarcaProduct, UserAccount } from '../types.ts';

export const INITIAL_PRODUCTS: ZarcaProduct[] = [
  {
    id: 'prod-001',
    title: 'Café Gourmet Merida Reserve (850g Tostado)',
    description: 'Café 100% arábica de altura cosechado en los Andes venezolanos. Tueste medio artesanal, notas a chocolate negro, caña de azúcar y avellana. Empaque hermético con válvula desgasificadora.',
    priceUsd: 14.50,
    category: 'Alimentos',
    image: '/src/assets/images/zarca_product_coffee_1792515012563.jpg',
    city: 'Caracas',
    zone: 'Chacao',
    sellerId: 'user-001',
    sellerName: 'Andes Café Gourmet C.A.',
    sellerPhone: '+58 412-445-9821',
    sellerReputation: 4.9,
    isSellerVerified: true,
    isActive: true,
    viewsCount: 384,
    inquiriesCount: 29,
    createdAt: '2026-10-14',
  },
  {
    id: 'prod-002',
    title: 'Smartphone Pro 5G 256GB + Audífonos Inalámbricos',
    description: 'Equipo libre para Movistar, Digitel y Movilnet en 4G/5G. Pantalla AMOLED 120Hz, cámara triple de 108MP, batería 5000mAh. Incluye estuche antichoque y cargador rápido original.',
    priceUsd: 385.00,
    category: 'Tecnología',
    image: '/src/assets/images/zarca_product_tech_1792515029218.jpg',
    city: 'Caracas',
    zone: 'Las Mercedes',
    sellerId: 'seller-tech-01',
    sellerName: 'Caracas Tech Store',
    sellerPhone: '+58 414-221-8733',
    sellerReputation: 4.8,
    isSellerVerified: true,
    isActive: true,
    viewsCount: 1120,
    inquiriesCount: 88,
    createdAt: '2026-10-16',
  },
  {
    id: 'prod-003',
    title: 'Zapatos Minimalistas Cuero Blanco Premium (Talla 40-44)',
    description: 'Calzado manufacturado con cuero vacuno genuino y suela de caucho vulcanizado antideslizante. Confort ergonómico para uso diario. Diseñado en Venezuela.',
    priceUsd: 55.00,
    category: 'Moda',
    image: '/src/assets/images/zarca_product_sneakers_1792515041899.jpg',
    city: 'Valencia',
    zone: 'El Viñedo',
    sellerId: 'seller-shoe-02',
    sellerName: 'Calzados D’Artisan',
    sellerPhone: '+58 424-409-1244',
    sellerReputation: 4.7,
    isSellerVerified: true,
    isActive: true,
    viewsCount: 540,
    inquiriesCount: 31,
    createdAt: '2026-10-17',
  },
  {
    id: 'prod-004',
    title: 'Estación de Energía Portátil 300W / Respaldo Inverter',
    description: 'Batería LiFePO4 de 256Wh para respaldo eléctrico en el hogar o comercio. Salidas 110V AC, USB-C 100W PD y 12V. Ideal para enrutadores WiFi, laptops, lámparas y equipos médicos.',
    priceUsd: 220.00,
    category: 'Energía',
    image: '/src/assets/images/zarca_product_powerstation_1792515054124.jpg',
    city: 'Caracas',
    zone: 'Altamira',
    sellerId: 'user-001',
    sellerName: 'Soluciones Energéticas Vzla',
    sellerPhone: '+58 412-445-9821',
    sellerReputation: 5.0,
    isSellerVerified: true,
    isActive: true,
    viewsCount: 1890,
    inquiriesCount: 142,
    createdAt: '2026-10-18',
  },
];

export const INITIAL_USER: UserAccount = {
  id: 'user-001',
  name: 'Carlos Mendoza',
  phone: '+58 412-555-8921',
  cedula: 'V-23.456.789',
  isKycVerified: false, // Initially false so user can experience KYC flow or test it immediately
  activeRole: 'buyer',
  favorites: ['prod-001', 'prod-004'],
};

export const VENEZUELAN_CITIES = [
  'Todos',
  'Caracas',
  'Valencia',
  'Maracaibo',
  'Barquisimeto',
  'Lechería',
  'Maracay',
  'Mérida',
];

export const CATEGORIES = [
  'Todos',
  'Tecnología',
  'Alimentos',
  'Moda',
  'Energía',
  'Hogar',
  'Vehículos',
];
