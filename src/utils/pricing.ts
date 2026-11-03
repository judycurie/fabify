import { CartItem, LicenseType } from '../types/cart';

export const TIER1_STATIC_PRICE = 5.00;
export const TIER2_MONTH_PASS_PRICE = 25.00;
export const COMMERCIAL_LICENSE_SURCHARGE = 5.00;

export function calculateDigitalItemPrice(
  basePrice: number,
  licenseType: LicenseType
): number {
  if (licenseType === 'commercial') {
    return TIER1_STATIC_PRICE;
  }
  return 0.00;
}

export const VALID_PROMO_CODES: Record<string, { discountPercent?: number; fixedDiscount?: number; description: string }> = {
  MAKER100: { discountPercent: 100, description: '100% Maker Scholarship Free Pass' },
  PRO3D: { discountPercent: 20, description: '20% Pro CAD Maker Discount' },
  FABIFY10: { discountPercent: 10, description: '10% Welcome Discount' },
  STUDENT: { discountPercent: 50, description: '50% Educational Discount' },
};
