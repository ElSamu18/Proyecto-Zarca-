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

test('Venezuelan cities list has required cities', async () => {
  const { VENEZUELAN_CITIES } = await import('./zarcaLogic.ts');
  assert.equal(VENEZUELAN_CITIES.length, 11);
  assert.ok(VENEZUELAN_CITIES.includes('San Fernando de Apure'));
  assert.ok(VENEZUELAN_CITIES.includes('Caracas'));
  assert.ok(VENEZUELAN_CITIES.includes('Margarita'));
});

test('Self messaging blocking detects own products', async () => {
  const { isSelfMessagingBlocked, generateConversationId } = await import('./zarcaLogic.ts');
  assert.equal(isSelfMessagingBlocked('user123', 'user123'), true);
  assert.equal(isSelfMessagingBlocked('user123', 'seller456'), false);
  assert.equal(isSelfMessagingBlocked(null, 'seller456'), false);

  const convId1 = generateConversationId('buyerA', 'sellerB', 'prod1');
  const convId2 = generateConversationId('sellerB', 'buyerA', 'prod1');
  assert.equal(convId1, convId2); // deterministic sorted order

  const { generate1to1ChatId } = await import('./zarcaLogic.ts');
  const chatId1 = generate1to1ChatId('user_alpha', 'user_beta');
  const chatId2 = generate1to1ChatId('user_beta', 'user_alpha');
  assert.equal(chatId1, 'user_alpha_user_beta');
  assert.equal(chatId1, chatId2);
});

test('Product-anchored chatId generates deterministic unique ID per product and user pair', async () => {
  const { generateProductChatId } = await import('./zarcaLogic.ts');
  const chat1 = generateProductChatId('buyer_123', 'seller_456', 'prod_999');
  const chat2 = generateProductChatId('seller_456', 'buyer_123', 'prod_999');
  assert.equal(chat1, 'buyer_123_seller_456_prod_999');
  assert.equal(chat1, chat2);

  // Different product creates isolated room
  const chatDifferentProduct = generateProductChatId('buyer_123', 'seller_456', 'prod_888');
  assert.notEqual(chat1, chatDifferentProduct);
});

test('1:1 center crop calculation keeps centered square coordinates', async () => {
  const { calculateCenterCropSquare } = await import('./zarcaLogic.ts');
  // Landscape image 800x600 -> 600x600 centered at sx=100, sy=0
  const cropLandscape = calculateCenterCropSquare(800, 600);
  assert.deepEqual(cropLandscape, { sx: 100, sy: 0, sWidth: 600, sHeight: 600 });

  // Portrait image 500x900 -> 500x500 centered at sx=0, sy=200
  const cropPortrait = calculateCenterCropSquare(500, 900);
  assert.deepEqual(cropPortrait, { sx: 0, sy: 200, sWidth: 500, sHeight: 500 });

  // Square image 400x400 -> sx=0, sy=0
  const cropSquare = calculateCenterCropSquare(400, 400);
  assert.deepEqual(cropSquare, { sx: 0, sy: 0, sWidth: 400, sHeight: 400 });
});


