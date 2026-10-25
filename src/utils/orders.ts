import { OrderRecord, CartItem, CustomerDetails, PaymentMethod } from '../types/cart';

const STORAGE_KEY = 'fabify_digital_orders_v2';
const CART_STORAGE_KEY = 'fabify_digital_cart_v2';

export function getSavedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read saved cart from localStorage:', err);
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
}

export function getSavedOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with 1 initial sample order so the user sees their digital library right away
      const initialSeed: OrderRecord = {
        orderId: 'DIGITAL-89210',
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
        customer: {
          fullName: 'Alex Vance',
          email: 'alex@precisioncad.design',
        },
        items: [
          {
            id: 'demo-box-1',
            productType: 'box',
            title: '4-Compartment Modular EDC Valet',
            isFree: false,
            unitPrice: 3.50,
            totalPrice: 3.50,
            licenseType: 'personal',
            customText: 'DAILY EDC',
            createdAt: Date.now() - 1000 * 60 * 60 * 12,
            boxConfig: {
              width: 150.0,
              depth: 100.0,
              height: 34.0,
              wallThickness: 2.4,
              floorThickness: 2.6,
              filletRadius: 6.0,
              edgeBevel: 0.8,
              gridColumns: 2,
              gridRows: 2,
              dividerThickness: 2.0,
              dividerHeightPercent: 90,
              hasScoop: true,
              scoopRadius: 8.0,
              hasStackingLip: false,
              stackingLipHeight: 3.0,
              hasLabel: true,
              labelText: 'DAILY EDC',
              labelFontSize: 7.0,
              labelStyle: 'embossed',
              labelRelief: 1.0,
              primaryColor: '#18181b',
              accentColor: '#ffffff',
              showDimensions3D: true,
              showBuildPlate: true,
            },
          },
        ],
        subtotal: 3.50,
        discount: 0,
        total: 3.50,
        paymentMethod: 'card',
        last4Card: '4242',
        downloadAccessKey: 'DL-SECURE-89210-EDC',
      };
      saveOrdersToStorage([initialSeed]);
      return [initialSeed];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read orders from localStorage:', err);
    return [];
  }
}

export function saveOrdersToStorage(orders: OrderRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage:', err);
  }
}

export function createNewDigitalOrder(params: {
  items: CartItem[];
  customer: CustomerDetails;
  subtotal: number;
  discount: number;
  total: number;
  promoCodeApplied?: string;
  paymentMethod: PaymentMethod;
  last4Card?: string;
}): OrderRecord {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `DIGITAL-${randomSuffix}`;
  const downloadAccessKey = `DL-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${randomSuffix}`;

  const newOrder: OrderRecord = {
    orderId,
    createdAt: Date.now(),
    items: params.items,
    customer: params.customer,
    subtotal: params.subtotal,
    discount: params.discount,
    total: params.total,
    promoCodeApplied: params.promoCodeApplied,
    paymentMethod: params.paymentMethod,
    last4Card: params.last4Card,
    downloadAccessKey,
  };

  const existing = getSavedOrders();
  saveOrdersToStorage([newOrder, ...existing]);

  return newOrder;
}
