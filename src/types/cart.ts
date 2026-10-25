import { TagConfig, TagDimensions } from './tag';
import { BoxConfig, BoxDimensions } from './box';

export type ProductType = 'tag' | 'box';
export type LicenseType = 'personal' | 'commercial';

export interface CartItem {
  id: string;
  productType: ProductType;
  title: string;
  isFree: boolean;
  unitPrice: number;
  totalPrice: number;
  licenseType: LicenseType;
  tagConfig?: TagConfig;
  boxConfig?: BoxConfig;
  dimensions?: TagDimensions | null;
  customText: string;
  createdAt: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
}

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'free_checkout';

export interface OrderRecord {
  orderId: string;
  createdAt: number;
  items: CartItem[];
  customer: CustomerDetails;
  subtotal: number;
  discount: number;
  total: number;
  promoCodeApplied?: string;
  paymentMethod: PaymentMethod;
  last4Card?: string;
  downloadAccessKey: string;
}
