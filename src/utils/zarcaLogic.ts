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
  sellerReputation: number; // 1-5 rating
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
  activeRole: 'buyer' | 'seller';
  favorites: string[];
}

export const OFFICIAL_BCV_RATE = 54.20; // Simulated official BCV exchange rate (Bs./USD)

/**
 * Validates and normalizes Venezuelan mobile numbers
 * Supported carriers: Digitel (412), Movistar (414, 424), Movilnet (416, 426)
 */
export function validateVenezuelanPhone(rawInput: string): {
  valid: boolean;
  formatted: string;
  carrier?: string;
  error?: string;
} {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, formatted: '', error: 'El número telefónico es obligatorio' };
  }

  // Strip non-digits
  const digits = rawInput.replace(/\D/g, '');

  let nationalNumber = digits;
  if (nationalNumber.startsWith('58')) {
    nationalNumber = nationalNumber.slice(2);
  }
  if (nationalNumber.startsWith('0')) {
    nationalNumber = nationalNumber.slice(1);
  }

  if (nationalNumber.length !== 10) {
    return {
      valid: false,
      formatted: rawInput,
      error: 'El número debe contener 10 dígitos (ej: 412 123 4567)',
    };
  }

  const prefix = nationalNumber.slice(0, 3);
  let carrier = 'Desconocido';
  if (prefix === '412') carrier = 'Digitel';
  else if (prefix === '414' || prefix === '424') carrier = 'Movistar';
  else if (prefix === '416' || prefix === '426') carrier = 'Movilnet';
  else {
    return {
      valid: false,
      formatted: rawInput,
      error: 'Prefijo no reconocido. Debe ser 0412, 0414, 0424, 0416 o 0426',
    };
  }

  const part1 = nationalNumber.slice(0, 3);
  const part2 = nationalNumber.slice(3, 6);
  const part3 = nationalNumber.slice(6);
  const formatted = `+58 ${part1}-${part2}-${part3}`;

  return { valid: true, formatted, carrier };
}

/**
 * Validates Venezuelan National ID (Cédula de Identidad)
 * Format: V-12345678 or E-87654321
 */
export function validateCedula(rawInput: string): {
  valid: boolean;
  formatted: string;
  type?: 'V' | 'E';
  error?: string;
} {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, formatted: '', error: 'La cédula es requerida' };
  }

  const clean = rawInput.trim().toUpperCase();
  const match = clean.match(/^([VE])-?(\d{5,9})$/);

  if (!match) {
    return {
      valid: false,
      formatted: rawInput,
      error: 'Formato inválido. Use V-12345678 o E-12345678 (5 a 9 dígitos)',
    };
  }

  const type = match[1] as 'V' | 'E';
  const num = parseInt(match[2], 10);
  const formatted = `${type}-${num.toLocaleString('es-VE')}`;

  return { valid: true, formatted, type };
}

/**
 * Dual Currency Converter (USD / Bs. BCV)
 */
export function convertUsdToBs(usd: number, bcvRate: number = OFFICIAL_BCV_RATE) {
  const safeUsd = Math.max(0, Number(usd) || 0);
  const bsAmount = safeUsd * bcvRate;

  const formattedUsd = `$${safeUsd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedBs = `Bs. ${bsAmount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return {
    usd: safeUsd,
    bs: bsAmount,
    formattedUsd,
    formattedBs,
    rate: bcvRate,
  };
}

/**
 * Filter and search products
 */
export interface ProductFilters {
  query?: string;
  category?: string;
  city?: string;
  maxPrice?: number;
  onlyVerified?: boolean;
}

export function filterProducts(products: ZarcaProduct[], filters: ProductFilters): ZarcaProduct[] {
  return products.filter((p) => {
    // Only active listings in buyer view
    if (!p.isActive) return false;

    if (filters.category && filters.category !== 'all' && p.category !== filters.category) {
      return false;
    }

    if (filters.city && filters.city !== 'all' && p.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.maxPrice && p.priceUsd > filters.maxPrice) {
      return false;
    }

    if (filters.onlyVerified && !p.isSellerVerified) {
      return false;
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchZone = p.zone.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchZone && !matchCity) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Official 24 Venezuelan States and their respective Municipalities
 */
export const VENEZUELA_STATES_AND_MUNICIPALITIES: Record<string, string[]> = {
  'Amazonas': ['Alto Orinoco', 'Atabapo', 'Atures', 'Autana', 'Manapiare', 'Maroa', 'Río Negro'],
  'Anzoátegui': ['Anaco', 'Aragua', 'Diego Bautista Urbaneja (Lechería)', 'Fernando de Peñalver', 'Francisco de Miranda', 'Francisco del Carmen Carvajal', 'Guanta', 'Guanipa', 'Independencia', 'Libertad', 'Manuel Ezequiel Bruzual', 'Pedro María Freites', 'Píritu', 'San José de Guanipa', 'San Juan de Capistrano', 'Santa Ana', 'Simón Bolívar (Barcelona)', 'Simón Rodríguez (El Tigre)', 'Sir Arthur McGregor'],
  'Apure': ['Achaguas', 'Biruaca', 'Muñoz', 'Páez', 'Pedro Camejo', 'Rómulo Gallegos', 'San Fernando'],
  'Aragua': ['Bolívar', 'Camatagua', 'Francisco Linares Alcántara', 'Girardot (Maracay)', 'José Ángel Lamas', 'José Félix Ribas', 'José Rafael Revenga', 'Libertador', 'Mario Briceño Iragorry', 'Ocumare de la Costa de Oro', 'San Casimiro', 'San Sebastián', 'Santiago Mariño', 'Santos Michelena', 'Sucre', 'Tovar (Colonia Tovar)', 'Urdaneta', 'Zamora'],
  'Barinas': ['Alberto Arvelo Torrealba', 'Andrés Eloy Blanco', 'Antonio José de Sucre', 'Arismendi', 'Barinas', 'Bolívar', 'Cruz Paredes', 'Ezequiel Zamora', 'Obispos', 'Pedraza', 'Rojas', 'Sosa'],
  'Bolívar': ['Angostura', 'Angostura del Orinoco (Ciudad Bolívar)', 'Caroní (Puerto Ordaz)', 'Cedeño', 'El Callao', 'Gran Sabana', 'Piar', 'Roscio', 'Sifontes', 'Sucre', 'Padre Pedro Chien'],
  'Carabobo': ['Bejuma', 'Carlos Arvelo', 'Diego Ibarra', 'Guacara', 'Juan José Mora', 'Libertador', 'Los Guayos', 'Miranda', 'Montalbán', 'Naguanagua', 'Puerto Cabello', 'San Diego', 'San Joaquín', 'Valencia'],
  'Cojedes': ['Anzoátegui', 'Tinaquillo', 'Girardot', 'Lima Blanco', 'Pao de San Juan Bautista', 'Ricaurte', 'Rómulo Gallegos', 'San Carlos', 'Santander'],
  'Delta Amacuro': ['Antonio Díaz', 'Casacoima', 'Pedernales', 'Tucupita'],
  'Distrito Capital': ['Libertador (Caracas)'],
  'Falcón': ['Acosta', 'Bolívar', 'Buchivacoa', 'Cacique Manaure', 'Carirubana (Punto Fijo)', 'Colina', 'Dabajuro', 'Democracia', 'Falcón', 'Federación', 'Jacura', 'Los Taques', 'Mauroa', 'Miranda (Coro)', 'Monseñor Iturriza', 'Palmasola', 'Petit', 'Píritu', 'San Francisco', 'Silva (Tucacas)', 'Sucre', 'Tocópero', 'Unión', 'Urumaco', 'Zamora'],
  'Guárico': ['Camaguán', 'Chaguaramas', 'El Socorro', 'Francisco de Miranda (Calabozo)', 'José Félix Ribas', 'José Tadeo Monagas', 'Juan Germán Roscio (San Juan de los Morros)', 'Julián Mellado', 'Las Mercedes', 'Leonardo Infante (Valle de la Pascua)', 'Pedro Zaraza', 'Ortiz', 'San Gerónimo de Guayabal', 'San José de Guaribe', 'Santa María de Ipire'],
  'La Guaira': ['Vargas (La Guaira / Maiquetía / Catia La Mar)'],
  'Lara': ['Andrés Eloy Blanco', 'Crespo', 'Iribarren (Barquisimeto)', 'Jiménez (Quíbor)', 'Morán (El Tocuyo)', 'Palavecino (Cabudare)', 'Simón Planas', 'Torres (Carora)', 'Urdaneta'],
  'Mérida': ['Alberto Adriani (El Vigía)', 'Andrés Bello', 'Antonio Pinto Salinas', 'Aricagua', 'Arzobispo Chacón', 'Campo Elías', 'Caracciolo Parra Olmedo', 'Cardenal Quintero', 'Guaraque', 'Julio César Salas', 'Justo Briceño', 'Libertador (Mérida)', 'Miranda', 'Obispo Ramos de Lora', 'Padre Noguera', 'Pueblo Llano', 'Rangel', 'Rivas Dávila', 'Santos Marquina', 'Sucre', 'Tovar', 'Tulio Febres Cordero', 'Zea'],
  'Miranda': ['Acevedo', 'Andrés Bello', 'Baruta', 'Brión (Higuerote)', 'Buroz', 'Carrizal', 'Chacao', 'Cristóbal Rojas (Charallave)', 'El Hatillo', 'Guaicaipuro (Los Teques)', 'Independencia', 'Lander (Ocumare del Tuy)', 'Los Salias (San Antonio)', 'Páez (Río Chico)', 'Paz Castillo', 'Pedro Gual', 'Plaza (Guarenas)', 'Simón Bolívar', 'Sucre (Petare)', 'Urdaneta (Cúa)', 'Zamora (Guatire)'],
  'Monagas': ['Acosta', 'Aguasay', 'Bolívar', 'Caripe', 'Cedeño', 'Ezequiel Zamora', 'Libertador', 'Maturín', 'Piar', 'Punceres', 'Santa Bárbara', 'Sotillo', 'Uracoa'],
  'Nueva Esparta': ['Antolín del Campo', 'Arismendi (La Asunción)', 'Díaz', 'García', 'Gómez', 'Maneiro (Pampatar)', 'Marcano (Juan Griego)', 'Mariño (Porlamar)', 'Península de Macanao', 'Tubores', 'Villalba (Coche)'],
  'Portuguesa': ['Agua Blanca', 'Araure', 'Esteller', 'Guanare', 'Guanarito', 'Monseñor José Vicente de Unda', 'Ospino', 'Páez (Acarigua)', 'Papelón', 'San Genaro de Boconoíto', 'San Rafael de Onoto', 'Santa Rosalía', 'Sucre', 'Turén'],
  'Sucre': ['Andrés Eloy Blanco', 'Andrés Mata', 'Arismendi', 'Benítez', 'Bermúdez (Carúpano)', 'Bolívar', 'Cruz Salmerón Acosta', 'Libertador', 'Mariño', 'Mejía', 'Montes', 'Ribero', 'Sucre (Cumaná)', 'Valdez (Güiria)'],
  'Táchira': ['Andrés Bello', 'Antonio Rómulo Costa', 'Ayacucho', 'Bolívar (San Antonio)', 'Cárdenas', 'Córdoba', 'Fernández Feo', 'Francisco de Miranda', 'García de Hevia', 'Guásimos', 'Independencia', 'Jáuregui (La Grita)', 'José María Vargas', 'Junín (Rubio)', 'Libertad', 'Libertador', 'Lobatera', 'Michelena', 'Panamericano', 'Pedro María Ureña', 'San Cristóbal', 'Seboruco', 'Simón Rodríguez', 'Sucre', 'Torbes', 'Uribante', 'San Judas Tadeo'],
  'Trujillo': ['Andrés Bello', 'Boconó', 'Bolívar', 'Candelaria', 'Carache', 'Chejendé', 'Escuque', 'José Felipe Márquez Cañizalez', 'Juan Vicente Campo Elías', 'La Ceiba', 'Miranda', 'Monte Carmelo', 'Motatán', 'Pampán', 'Pampanito', 'Rafael Rangel', 'San Rafael de Carvajal', 'Sucre', 'Trujillo', 'Urdaneta', 'Valera'],
  'Yaracuy': ['Aristides Bastidas', 'Bolívar', 'Bruzual (Chivacoa)', 'Cocorote', 'Independencia', 'José Antonio Páez', 'La Trinidad', 'Manuel Monge', 'Nirgua', 'Peña (Yaritagua)', 'San Felipe', 'Sucre', 'Urachiche', 'Veroes'],
  'Zulia': ['Almirante Padilla', 'Baralt', 'Cabimas', 'Catatumbo', 'Colón', 'Francisco Javier Pulgar', 'Jesús Enrique Lossada', 'Jesús María Semprún', 'La Cañada de Urdaneta', 'Lagunillas (Ciudad Ojeda)', 'Machiques de Perijá', 'Mara', 'Maracaibo', 'Miranda', 'Guajira', 'Rosario de Perijá', 'San Francisco', 'Santa Rita', 'Simón Bolívar', 'Sucre', 'Valmore Rodríguez']
};

export const VENEZUELA_STATES = Object.keys(VENEZUELA_STATES_AND_MUNICIPALITIES);

/**
 * Official Venezuelan Cities for Zarca Marketplace (backward compatibility)
 */
export const VENEZUELAN_CITIES = [
  'San Fernando de Apure',
  'Caracas',
  'Valencia',
  'Maracaibo',
  'Barquisimeto',
  'Maracay',
  'Puerto Ordaz',
  'Mérida',
  'San Cristóbal',
  'Barcelona',
  'Margarita',
] as const;

export type VenezuelanCity = typeof VENEZUELAN_CITIES[number];

/**
 * Checks if current user is the owner of the product to prevent self-messaging
 */
export function isSelfMessagingBlocked(currentUserUid: string | null | undefined, sellerUid: string | null | undefined): boolean {
  if (!currentUserUid || !sellerUid) return false;
  return currentUserUid.trim() === sellerUid.trim();
}

/**
 * Generates deterministic conversation ID for buyer, seller and product
 */
export function generateConversationId(buyerUid: string, sellerUid: string, productId: string): string {
  const sortedUsers = [buyerUid, sellerUid].sort().join('__');
  return `${sortedUsers}__prod_${productId}`;
}

/**
 * Generate safe WhatsApp direct contact link with pre-filled message
 */
export function generateWhatsAppContactLink(
  sellerPhone: string,
  productTitle: string,
  priceUsd: number,
  sellerName: string
): string {
  const cleanDigits = sellerPhone.replace(/\D/g, '');
  const message = `Hola ${sellerName}, vi tu publicación de "${productTitle}" ($${priceUsd}) en Zarca Venezuela. Me interesa coordinar entrega segura. ¿Está disponible?`;
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
}

