/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateVenezuelanPhone,
  validateCedula,
  convertUsdToBs,
  filterProducts,
} from './zarcaLogic.ts';
import type { ZarcaProduct } from './zarcaLogic.ts';

test('Venezuelan phone validation accepts valid Digitel and Movistar numbers', () => {
  const digi = validateVenezuelanPhone('04121234567');
  assert.equal(digi.valid, true);
  assert.equal(digi.carrier, 'Digitel');
  assert.equal(digi.formatted, '+58 412-123-4567');

  const movi = validateVenezuelanPhone('+58 424 987 6543');
  assert.equal(movi.valid, true);
  assert.equal(movi.carrier, 'Movistar');
  assert.equal(movi.formatted, '+58 424-987-6543');
});

test('Venezuelan phone validation rejects invalid length and unknown carriers', () => {
  const short = validateVenezuelanPhone('0412123');
  assert.equal(short.valid, false);

  const wrongPrefix = validateVenezuelanPhone('04331234567');
  assert.equal(wrongPrefix.valid, false);
});

test('Venezuelan Cédula validation supports V- and E- formats', () => {
  const vCedula = validateCedula('V-24890123');
  assert.equal(vCedula.valid, true);
  assert.equal(vCedula.type, 'V');

  const eCedula = validateCedula('E82103450');
  assert.equal(eCedula.valid, true);
  assert.equal(eCedula.type, 'E');

  const invalid = validateCedula('X-12345678');
  assert.equal(invalid.valid, false);
});

test('Dual Currency calculations with BCV rate', () => {
  const converted = convertUsdToBs(100, 50.0);
  assert.equal(converted.usd, 100);
  assert.equal(converted.bs, 5000);
  assert.match(converted.formattedUsd, /\$100/);
});

test('Product filtering properly matches search and category', () => {
  const mockProducts: ZarcaProduct[] = [
    {
      id: '1',
      title: 'Café de Especialidad Boconó',
      description: 'Café gourmet tostado',
      priceUsd: 12,
      category: 'Alimentos',
      image: '/coffee.jpg',
      city: 'Caracas',
      zone: 'Chacao',
      sellerId: 's1',
      sellerName: 'Café Los Andes',
      sellerPhone: '+58 412 111 2233',
      sellerReputation: 4.9,
      isSellerVerified: true,
      isActive: true,
      viewsCount: 120,
      inquiriesCount: 15,
      createdAt: '2026-10-18',
    },
    {
      id: '2',
      title: 'Zapatos Deportivos Blancos',
      description: 'Talla 42 en cuero',
      priceUsd: 45,
      category: 'Moda',
      image: '/shoes.jpg',
      city: 'Valencia',
      zone: 'El Viñedo',
      sellerId: 's2',
      sellerName: 'Calzados Centro',
      sellerPhone: '+58 414 222 3344',
      sellerReputation: 4.2,
      isSellerVerified: false,
      isActive: false, // inactive
      viewsCount: 40,
      inquiriesCount: 2,
      createdAt: '2026-10-19',
    },
  ];

  const searchResults = filterProducts(mockProducts, { query: 'boconó' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '1');

  // Inactive product should not show
  const searchInactive = filterProducts(mockProducts, { query: 'deportivos' });
  assert.equal(searchInactive.length, 0);
});
