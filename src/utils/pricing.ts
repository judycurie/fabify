import { CartItem, LicenseType } from '../types/cart';

export const COMMERCIAL_LICENSE_SURCHARGE = 4.00;

export function calculateDigitalItemPrice(
  basePrice: number,
  licenseType: LicenseType
): number {
  if (basePrice === 0) {
    return licenseType === 'commercial' ? 3.00 : 0.00;
  }
  const licenseDelta = licenseType === 'commercial' ? COMMERCIAL_LICENSE_SURCHARGE : 0;
  return Math.round((basePrice + licenseDelta) * 100) / 100;
}

export const VALID_PROMO_CODES: Record<string, { discountPercent?: number; fixedDiscount?: number; description: string }> = {
  MAKER100: { discountPercent: 100, description: '100% Maker Scholarship Free Pass' },
  PRO3D: { discountPercent: 20, description: '20% Pro CAD Maker Discount' },
  FABIFY10: { discountPercent: 10, description: '10% Welcome Discount' },
  STUDENT: { discountPercent: 50, description: '50% Educational Discount' },
};
