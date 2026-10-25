import React, { useState } from 'react';
import { CartItem, LicenseType } from '../types/cart';
import { AppTheme } from '../types/tag';
import { VALID_PROMO_CODES, calculateDigitalItemPrice, COMMERCIAL_LICENSE_SURCHARGE } from '../utils/pricing';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag as TagIcon, 
  ShieldCheck, 
  Download,
  Check,
  AlertCircle,
  FileCode,
  Box as BoxIcon
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  theme: AppTheme;
  onToggleLicense: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  appliedPromo: string;
  onApplyPromo: (code: string) => boolean;
  onRemovePromo: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  theme,
  onToggleLicense,
  onRemoveItem,
  onProceedToCheckout,
  appliedPromo,
  onApplyPromo,
  onRemovePromo,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const isLight = theme === 'light';

  // Subtotal calculation
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  // Promo calculation
  let promoDiscount = 0;
  if (appliedPromo && VALID_PROMO_CODES[appliedPromo]) {
    const promo = VALID_PROMO_CODES[appliedPromo];
    if (promo.discountPercent) {
      promoDiscount = Math.round((subtotal * (promo.discountPercent / 100)) * 100) / 100;
    } else if (promo.fixedDiscount) {
      promoDiscount = Math.min(subtotal, promo.fixedDiscount);
    }
  }

  const grandTotal = Math.max(0, Math.round((subtotal - promoDiscount) * 100) / 100);

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    const success = onApplyPromo(clean);
    if (success) {
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try PRO3D or FABIFY10');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div 
        className={`w-full max-w-md h-full flex flex-col border-l shadow-2xl transition-all ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            <h2 className="font-bold text-base tracking-tight">Digital Downloads ({items.length})</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isLight ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instant Digital Delivery Banner */}
        <div className={`px-4 py-2.5 border-b text-xs flex items-center gap-2 ${isLight ? 'bg-zinc-100/70 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-zinc-600 dark:text-zinc-400">
            Instant .STL download delivery right after confirmation.
          </span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isLight ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-zinc-600'}`}>
                <Download className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-base">Your digital queue is empty</h3>
              <p className="text-xs text-zinc-500 max-w-xs">
                Configure custom tags, desk organizers, or explore our free and premium templates in the catalog.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={`mt-2 py-2.5 px-5 rounded-xl font-bold text-xs ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                }`}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isCommercial = item.licenseType === 'commercial';

              return (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl mt-0.5 ${isLight ? 'bg-zinc-200/60' : 'bg-zinc-800'}`}>
                        {item.productType === 'box' ? <BoxIcon className="w-4 h-4" /> : <TagIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{item.title}</h4>
                        <div className="font-mono text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">
                          Text: {item.customText || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* License Selector & Price */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => onToggleLicense(item.id)}
                      className={`py-1 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                        isCommercial
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isLight ? 'border-zinc-300 text-zinc-700 bg-white' : 'border-zinc-700 text-zinc-300 bg-zinc-900'
                      }`}
                    >
                      {isCommercial ? '✓ Commercial License' : 'Personal License (+Commercial $4)'}
                    </button>

                    <span className="font-bold font-mono text-sm">
                      {item.totalPrice === 0 ? 'FREE' : `$${item.totalPrice.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Area */}
        {items.length > 0 && (
          <div className={`p-4 border-t shrink-0 space-y-3.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCode} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <TagIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (e.g. PRO3D)"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border font-mono uppercase focus:outline-none focus:ring-1 ${
                      isLight
                        ? 'bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900'
                        : 'bg-zinc-950 border-zinc-700 focus:border-white text-zinc-100'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    isLight
                      ? 'border-zinc-300 hover:border-zinc-900 bg-white text-zinc-900'
                      : 'border-zinc-700 hover:border-white bg-zinc-950 text-white'
                  }`}
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Code <strong>{appliedPromo}</strong> applied
                  </span>
                  <button
                    type="button"
                    onClick={onRemovePromo}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-[11px] underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <div className="flex items-center gap-1 text-xs text-red-500 pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{promoError}</span>
                </div>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({appliedPromo})</span>
                  <span className="font-mono font-medium">-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>Total Due</span>
                <span className="font-mono text-base">
                  {grandTotal === 0 ? 'FREE' : `$${grandTotal.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={onProceedToCheckout}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-white hover:bg-zinc-100 text-zinc-950'
              }`}
            >
              <span>{grandTotal === 0 ? 'Get Free Downloads' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
