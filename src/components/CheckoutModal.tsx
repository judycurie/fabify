import React, { useState } from 'react';
import { CartItem, CustomerDetails, PaymentMethod, OrderRecord } from '../types/cart';
import { AppTheme } from '../types/tag';
import { VALID_PROMO_CODES } from '../utils/pricing';
import { createNewDigitalOrder } from '../utils/orders';
import { getCurrentUser } from '../utils/auth';
import { 
  X, 
  CreditCard, 
  Lock, 
  Check, 
  Download, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  FileCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  theme: AppTheme;
  appliedPromo: string;
  onOrderCompleted: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  theme,
  appliedPromo,
  onOrderCompleted,
}) => {
  const currentUser = getCurrentUser();
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: currentUser?.name || 'Judy Curie',
    email: currentUser?.email || 'judymariecurie@gmail.com',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const [card, setCard] = useState({
    number: '',
    name: 'Alex Vance',
    expiry: '',
    cvc: '',
  });

  if (!isOpen) return null;

  const isLight = theme === 'light';

  // Calculate Subtotal
  const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);

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
  const isFreeCheckout = grandTotal === 0;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const parts = val.match(/.{1,4}/g);
    setCard((prev) => ({ ...prev, number: parts ? parts.join(' ') : '' }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCard((prev) => ({ ...prev, expiry: val }));
  };

  const handleFillDemoCard = () => {
    setCard({
      number: '4242 4242 4242 4242',
      name: customer.fullName || 'Alex Vance',
      expiry: '12/28',
      cvc: '842',
    });
    setFormError('');
  };

  const handleCompleteDigitalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customer.fullName.trim() || !customer.email.trim() || !customer.email.includes('@')) {
      setFormError('Please provide your name and a valid email address to receive download links.');
      return;
    }

    if (!isFreeCheckout && paymentMethod === 'card') {
      const cleanNum = card.number.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setFormError('Please enter a valid card number (or click "Use Test Card").');
        return;
      }
      if (!card.expiry || !card.expiry.includes('/')) {
        setFormError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (card.cvc.length < 3) {
        setFormError('Please enter a valid 3-4 digit CVC security code.');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate instant digital transaction authorization
    await new Promise((r) => setTimeout(r, 600));

    const cleanNum = card.number.replace(/\s+/g, '');
    const last4 = isFreeCheckout ? undefined : (cleanNum ? cleanNum.slice(-4) : '4242');

    const order = createNewDigitalOrder({
      items,
      customer,
      subtotal,
      discount: promoDiscount,
      total: grandTotal,
      promoCodeApplied: appliedPromo || undefined,
      paymentMethod: isFreeCheckout ? 'free_checkout' : paymentMethod,
      last4Card: last4,
    });

    setIsProcessing(false);
    onOrderCompleted(order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-xl max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">
                {isFreeCheckout ? 'Free Digital Download' : 'Digital CAD Checkout'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Instant STL Delivery</span>
                <span aria-hidden="true">·</span>
                <span>Commercial / Personal License</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            disabled={isProcessing}
            className={`p-2 rounded-xl transition-colors ${isLight ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="checkout-form" onSubmit={handleCompleteDigitalCheckout} className="flex-1 overflow-y-auto p-6 space-y-5">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Email Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">1. Delivery Email & Licensee</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Full Name / Studio *</label>
                <input
                  type="text"
                  required
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                    isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-900 border-zinc-700 focus:border-white'
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Email (Download Link Destination) *</label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="jane@example.com"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                    isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-900 border-zinc-700 focus:border-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Payment Section (Only if total > 0) */}
          {!isFreeCheckout ? (
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">2. Payment Method</h3>

              {/* Express 1-Click Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('apple_pay');
                    setTimeout(() => {
                      const fakeEvent = { preventDefault: () => {} } as any;
                      handleCompleteDigitalCheckout(fakeEvent);
                    }, 50);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-black text-white hover:bg-zinc-900 font-medium text-xs flex items-center justify-center gap-1.5 border border-zinc-800"
                >
                  <span>Pay 1-Click</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('google_pay');
                    setTimeout(() => {
                      const fakeEvent = { preventDefault: () => {} } as any;
                      handleCompleteDigitalCheckout(fakeEvent);
                    }, 50);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-medium text-xs flex items-center justify-center gap-1.5 border border-zinc-300"
                >
                  <span className="font-bold">G</span>
                  <span>Pay 1-Click</span>
                </button>
              </div>

              {/* Credit Card Box */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-zinc-500" />
                    <span className="font-bold text-xs">Credit or Debit Card</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoCard}
                    className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:underline"
                  >
                    Use Test Card
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={card.number}
                    onChange={handleCardNumberChange}
                    placeholder="4242 •••• •••• 4242"
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono tracking-wider focus:outline-none focus:ring-1 ${
                      isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-950 border-zinc-700 focus:border-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none focus:ring-1 ${
                      isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-950 border-zinc-700 focus:border-white'
                    }`}
                  />
                  <input
                    type="password"
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value.slice(0, 4) })}
                    placeholder="CVC"
                    maxLength={4}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none focus:ring-1 ${
                      isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-950 border-zinc-700 focus:border-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/40 border-emerald-900 text-emerald-300'
            }`}>
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold block">100% Free Community Download</span>
                <span className="text-[11px] opacity-80 block">
                  No payment details or credit card required. Instant STL download will start immediately.
                </span>
              </div>
            </div>
          )}

          {/* Order Items Summary */}
          <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isLight ? 'bg-zinc-100/60 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-500 block mb-1">
              Digital Files ({items.length})
            </span>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between items-start text-zinc-500 py-1">
                <div className="max-w-[70%]">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {i.templateName || i.title}
                  </div>
                  {i.paramCode && (
                    <div className="font-mono text-[9px] text-amber-700 dark:text-amber-400 truncate">
                      {i.paramCode}
                    </div>
                  )}
                  <span className="text-[10px] text-zinc-400 capitalize">
                    {i.licenseType} license
                  </span>
                </div>
                <span className="font-mono font-bold shrink-0">
                  {i.totalPrice === 0 ? 'FREE' : `$${i.totalPrice.toFixed(2)}`}
                </span>
              </div>
            ))}

            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1">
                <span>Voucher Discount</span>
                <span className="font-mono">-${promoDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span>Total</span>
              <span className="font-mono text-base">
                {grandTotal === 0 ? 'FREE' : `$${grandTotal.toFixed(2)}`}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`p-5 border-t shrink-0 flex items-center justify-between ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold ${
              isLight ? 'hover:bg-zinc-200 text-zinc-600' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className={`py-3 px-7 rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-[0.98] ${
              isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-950'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Digital Delivery...</span>
              </>
            ) : isFreeCheckout ? (
              <>
                <Download className="w-4 h-4" />
                <span>Download Free Files Now</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize & Download (${grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
