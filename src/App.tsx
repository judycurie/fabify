/**
 * Fabify CAD - Digital 3D Printable Model Platform & Parametric Engine
 * Features:
 * - Multi-Configurator 3D Studio:
 *   1. Parametric Tag & Keychain Forge
 *   2. Parametric Desk Organizer & Box Forge
 * - Digital-Only Delivery: Instant watertight binary STL exports & license certificates
 * - Strict Separation of Free Community Models & Paid Commercial CAD Licenses
 * - Free download gating: Paid templates require commercial CAD license purchase before export
 * - Digital Cart & Encrypted Checkout (Free 1-click download vs Paid Card/Apple/Google Pay)
 * - "My Downloads" Library with persistent re-downloads & 3D re-customization
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as opentype from 'opentype.js';
import { TagConfig, TagDimensions, AppTheme, TagPreset } from './types/tag';
import { BoxConfig, BoxDimensions, BoxPreset } from './types/box';
import { CartItem, OrderRecord, LicenseType, ActiveTemplateInfo } from './types/cart';
import { DEFAULT_TAG_CONFIG, TAG_PRESETS } from './utils/presets';
import { DEFAULT_BOX_CONFIG, BOX_PRESETS } from './utils/boxPresets';
import { generateTagParamCode, generateBoxParamCode } from './utils/paramCode';
import { loadHelveticaFont } from './utils/fontLoader';
import { generateTagModel, GeneratedTagModel } from './utils/tagGeometry';
import { generateBoxModel } from './utils/boxGeometry';
import { exportSTL, exportMultiPartSTL, getSafeFilename, fireExportConfetti } from './utils/stlExporter';
import { getSavedCart, saveCartToStorage, isTemplatePurchased, createNewDigitalOrder } from './utils/orders';
import { VALID_PROMO_CODES, calculateDigitalItemPrice } from './utils/pricing';
import { UserProfile } from './types/auth';
import { getCurrentUser, logoutUser } from './utils/auth';
import { verifyStripeSession } from './utils/stripeService';

import { TopHeader, NavPage, StudioConfigurator } from './components/TopHeader';
import { Viewport3D } from './components/Viewport3D';
import { ControlDock, ActiveSheetTab } from './components/ControlDock';
import { BoxControlDock, BoxActiveTab } from './components/BoxControlDock';
import { DimensionsPanel } from './components/DimensionsPanel';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { CatalogView } from './components/CatalogView';
import { ConfiguratorsView } from './components/ConfiguratorsView';
import { MyDownloadsView } from './components/MyDownloadsView';
import { AuthModal } from './components/AuthModal';
import { FoundationFootnote } from './components/FoundationFootnote';
import { Sparkles, ArrowRight, Lock, Download, ShoppingBag } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>('light');
  const [currentPage, setCurrentPage] = useState<NavPage>('studio');
  const [activeConfigurator, setActiveConfigurator] = useState<StudioConfigurator>('tag');

  // User Authentication & Session State for Free Downloads
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const pendingDownloadActionRef = useRef<(() => void) | null>(null);

  // Active Template / Provenance Tracking (Defaults to Tag Keys)
  const [activeTemplate, setActiveTemplate] = useState<ActiveTemplateInfo>({
    id: 'keychain',
    name: 'Tag Keys',
    isFree: true,
    price: 0,
    productType: 'tag',
  });

  // Tag Configurator State (Initialized with Tag Keys text 'KEYS')
  const [tagConfig, setTagConfig] = useState<TagConfig>({
    ...DEFAULT_TAG_CONFIG,
    text: 'KEYS',
  });
  const [tagModel, setTagModel] = useState<GeneratedTagModel | null>(null);
  const [activeTagSheet, setActiveTagSheet] = useState<ActiveSheetTab>(null);

  // Box Configurator State
  const [boxConfig, setBoxConfig] = useState<BoxConfig>(DEFAULT_BOX_CONFIG);
  const [boxModel, setBoxModel] = useState<GeneratedTagModel | null>(null);
  const [activeBoxSheet, setActiveBoxSheet] = useState<BoxActiveTab>(null);

  // Shared Engine State
  const [font, setFont] = useState<opentype.Font | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFontLoading, setIsFontLoading] = useState<boolean>(true);
  const [showSpecsModal, setShowSpecsModal] = useState<boolean>(false);

  // E-Commerce & Digital Downloads State
  const [cartItems, setCartItems] = useState<CartItem[]>(getSavedCart);
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  const debounceTagRef = useRef<number | null>(null);
  const debounceBoxRef = useRef<number | null>(null);
  const currentTagModelRef = useRef<GeneratedTagModel | null>(null);
  const currentBoxModelRef = useRef<GeneratedTagModel | null>(null);

  // Check if current active template has been purchased
  const isCurrentTemplatePurchased = isTemplatePurchased(activeTemplate.id, activeTemplate.name);

  // Persist digital cart
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  // Handle return from Stripe Checkout Session (NO WEBHOOK REQUIRED!)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('order_success') === 'true') {
      const sessionId = params.get('session_id') || `cs_stripe_${Date.now()}`;
      // Clean up URL query parameters without page reload
      window.history.replaceState({}, document.title, window.location.pathname);

      verifyStripeSession(sessionId).then((verification) => {
        if (verification.paid) {
          if (cartItems.length > 0) {
            const order = createNewDigitalOrder({
              items: cartItems,
              customer: {
                fullName: verification.customerName || currentUser?.name || 'Fab Foundation Maker',
                email: verification.customerEmail || currentUser?.email || 'maker@fabfoundation.pl',
              },
              subtotal: verification.amountTotal || cartItems.reduce((acc, i) => acc + i.totalPrice, 0),
              discount: 0,
              total: verification.amountTotal || cartItems.reduce((acc, i) => acc + i.totalPrice, 0),
              paymentMethod: 'card',
              last4Card: 'Stripe',
            });
            setCompletedOrder(order);
            setIsOrderSuccessOpen(true);
            setCartItems([]);
          }
          fireExportConfetti();
        }
      });
    }
  }, []);

  // Load font
  useEffect(() => {
    let isMounted = true;
    setIsFontLoading(true);

    loadHelveticaFont('bold')
      .then((loadedFont) => {
        if (isMounted) {
          setFont(loadedFont);
          setIsFontLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load Helvetica font:', err);
        if (isMounted) {
          setIsFontLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Generate Tag Model
  const updateTagGeometry = useCallback(
    (cfg: TagConfig, activeFont: opentype.Font) => {
      setIsLoading(true);
      generateTagModel(cfg, activeFont)
        .then((generated) => {
          setTagModel(generated);
          currentTagModelRef.current = generated;
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate tag geometry:', err);
          setIsLoading(false);
        });
    },
    []
  );

  useEffect(() => {
    if (!font) return;
    if (debounceTagRef.current) window.clearTimeout(debounceTagRef.current);

    debounceTagRef.current = window.setTimeout(() => {
      updateTagGeometry(tagConfig, font);
    }, 35);

    return () => {
      if (debounceTagRef.current) window.clearTimeout(debounceTagRef.current);
    };
  }, [tagConfig, font, updateTagGeometry]);

  // Generate Box Model
  const updateBoxGeometry = useCallback(
    (cfg: BoxConfig, activeFont: opentype.Font | null) => {
      setIsLoading(true);
      generateBoxModel(cfg, activeFont)
        .then((generated) => {
          setBoxModel(generated);
          currentBoxModelRef.current = generated;
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate box geometry:', err);
          setIsLoading(false);
        });
    },
    []
  );

  useEffect(() => {
    if (debounceBoxRef.current) window.clearTimeout(debounceBoxRef.current);

    debounceBoxRef.current = window.setTimeout(() => {
      updateBoxGeometry(boxConfig, font);
    }, 45);

    return () => {
      if (debounceBoxRef.current) window.clearTimeout(debounceBoxRef.current);
    };
  }, [boxConfig, font, updateBoxGeometry]);

  // Tag Configuration Handlers
  const handleUpdateTagConfig = (partial: Partial<TagConfig>) => {
    setTagConfig((prev) => ({ ...prev, ...partial }));
  };

  // Box Configuration Handlers
  const handleUpdateBoxConfig = (partial: Partial<BoxConfig>) => {
    setBoxConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleChangeConfigurator = (mode: StudioConfigurator) => {
    setActiveConfigurator(mode);
    if (mode === 'box' && activeTemplate.productType !== 'box') {
      setActiveTemplate({
        id: 'free_desk_catchall',
        name: 'Catchall Tray',
        isFree: true,
        price: 0,
        productType: 'box',
      });
    } else if (mode === 'tag' && activeTemplate.productType !== 'tag') {
      setActiveTemplate({
        id: 'keychain',
        name: 'Tag Keys',
        isFree: true,
        price: 0,
        productType: 'tag',
      });
    }
  };

  // Trigger Purchase / Checkout flow for the current customized model
  const handlePurchaseCurrentTemplate = () => {
    const isBox = activeConfigurator === 'box';
    const basePrice = activeTemplate.price > 0 ? activeTemplate.price : (isBox ? 3.50 : 2.99);

    const customText = isBox
      ? (boxConfig.labelText || 'ORGANIZER')
      : (tagConfig.text ? `${tagConfig.text}${tagConfig.hasSecondLine && tagConfig.textLine2 ? ` · ${tagConfig.textLine2}` : ''}` : 'TAG');

    const paramCode = isBox ? generateBoxParamCode(boxConfig) : generateTagParamCode(tagConfig);
    const templateName = activeTemplate.name || (isBox ? 'Custom Desk Organizer' : 'Custom Plate / Tag');

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productType: isBox ? 'box' : 'tag',
      title: templateName,
      templateName,
      paramCode,
      isFree: false,
      unitPrice: basePrice,
      totalPrice: basePrice,
      licenseType: 'personal',
      customText,
      boxConfig: isBox ? { ...boxConfig } : undefined,
      tagConfig: !isBox ? { ...tagConfig } : undefined,
      createdAt: Date.now(),
    };

    setCartItems((prev) => {
      const exists = prev.some((it) => it.title === newItem.title && it.customText === newItem.customText && it.paramCode === newItem.paramCode);
      if (exists) return prev;
      return [newItem, ...prev];
    });
    setIsCartOpen(true);
  };

  // User Login & Session Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (pendingDownloadActionRef.current) {
      const action = pendingDownloadActionRef.current;
      pendingDownloadActionRef.current = null;
      setTimeout(() => {
        action();
      }, 100);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const requireAuthForFreeDownload = (callback: () => void): boolean => {
    if (!currentUser) {
      pendingDownloadActionRef.current = callback;
      setIsAuthOpen(true);
      return false;
    }
    return true;
  };

  // Export Tag STL - Gated against unpaid templates and requires login for free download
  const handleExportTagSTL = (binary: boolean) => {
    if (!activeTemplate.isFree && !isCurrentTemplatePurchased) {
      handlePurchaseCurrentTemplate();
      return;
    }

    if (!requireAuthForFreeDownload(() => handleExportTagSTL(binary))) {
      return;
    }

    const active = currentTagModelRef.current;
    if (!active) return;

    const line1 = tagConfig.text ? tagConfig.text.trim() : '';
    const line2 = tagConfig.hasSecondLine && tagConfig.textLine2 ? `_${tagConfig.textLine2.trim()}` : '';
    const filename = getSafeFilename(`${line1}${line2}`, binary ? '' : '_ascii');
    exportSTL(active.exportGeometry, { filename, binary });
    fireExportConfetti();
  };

  const handleExportTagMultiPart = () => {
    if (!activeTemplate.isFree && !isCurrentTemplatePurchased) {
      handlePurchaseCurrentTemplate();
      return;
    }

    if (!requireAuthForFreeDownload(() => handleExportTagMultiPart())) {
      return;
    }

    const active = currentTagModelRef.current;
    if (!active) return;

    const line1 = tagConfig.text ? tagConfig.text.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'Tag';
    const line2 = tagConfig.hasSecondLine && tagConfig.textLine2 ? `_${tagConfig.textLine2.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
    exportMultiPartSTL(active.baseGeometry, active.textGeometry, `Tag_${line1}${line2}`);
    fireExportConfetti();
  };

  // Export Box STL - Gated against unpaid templates and requires login for free download
  const handleExportBoxSTL = (binary: boolean) => {
    if (!activeTemplate.isFree && !isCurrentTemplatePurchased) {
      handlePurchaseCurrentTemplate();
      return;
    }

    if (!requireAuthForFreeDownload(() => handleExportBoxSTL(binary))) {
      return;
    }

    const active = currentBoxModelRef.current;
    if (!active) return;

    const slug = (boxConfig.labelText || 'Organizer').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    exportSTL(active.exportGeometry, {
      filename: `Fabify_Box_${slug}${binary ? '' : '_ascii'}.stl`,
      binary,
    });
    fireExportConfetti();
  };

  // Cart Management
  const handleToggleLicense = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLicense: LicenseType = item.licenseType === 'personal' ? 'commercial' : 'personal';
          const newPrice = calculateDigitalItemPrice(item.unitPrice, nextLicense);
          return {
            ...item,
            licenseType: nextLicense,
            totalPrice: newPrice,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleApplyPromo = (code: string): boolean => {
    if (VALID_PROMO_CODES[code]) {
      setAppliedPromo(code);
      return true;
    }
    return false;
  };

  const handleOrderCompleted = (order: OrderRecord) => {
    setCompletedOrder(order);
    setIsCheckoutOpen(false);
    setCartItems([]);
    setAppliedPromo('');
    setIsOrderSuccessOpen(true);
  };

  // Preset Selection Handlers (Catalog & Templates Menu)
  const handleSelectTagPreset = (preset: TagPreset) => {
    handleUpdateTagConfig(preset.config);
    setActiveTemplate({
      id: preset.id,
      name: preset.name,
      isFree: preset.isFree ?? true,
      price: preset.digitalPrice ?? 0,
      productType: 'tag',
    });
    setActiveConfigurator('tag');
    setCurrentPage('studio');
  };

  const handleSelectBoxPreset = (preset: BoxPreset) => {
    handleUpdateBoxConfig(preset.config);
    setActiveTemplate({
      id: preset.id,
      name: preset.name,
      isFree: preset.isFree,
      price: preset.digitalPrice,
      productType: 'box',
    });
    setActiveConfigurator('box');
    setCurrentPage('studio');
  };

  const handleInstantDownloadFreeTag = async (preset: TagPreset) => {
    if (!requireAuthForFreeDownload(() => handleInstantDownloadFreeTag(preset))) {
      return;
    }
    handleUpdateTagConfig(preset.config);
    try {
      const activeFont = font || await loadHelveticaFont('bold');
      const tempModel = await generateTagModel({ ...DEFAULT_TAG_CONFIG, ...preset.config }, activeFont);
      exportSTL(tempModel.exportGeometry, {
        filename: `Free_${preset.name.replace(/\s+/g, '_')}.stl`,
        binary: true,
      });
      fireExportConfetti();
    } catch (e) {
      console.error('Failed free instant download:', e);
    }
  };

  const handleInstantDownloadFreeBox = async (preset: BoxPreset) => {
    if (!requireAuthForFreeDownload(() => handleInstantDownloadFreeBox(preset))) {
      return;
    }
    handleUpdateBoxConfig(preset.config);
    try {
      const tempModel = await generateBoxModel({ ...DEFAULT_BOX_CONFIG, ...preset.config }, font);
      exportSTL(tempModel.exportGeometry, {
        filename: `Free_Box_${preset.name.replace(/\s+/g, '_')}.stl`,
        binary: true,
      });
      fireExportConfetti();
    } catch (e) {
      console.error('Failed free instant box download:', e);
    }
  };

  const handleAddToCartPreset = (type: 'tag' | 'box', preset: TagPreset | BoxPreset) => {
    const isBox = type === 'box';
    const boxP = preset as BoxPreset;
    const tagP = preset as TagPreset;

    const basePrice = isBox ? boxP.digitalPrice : (tagP.digitalPrice ?? 2.99);
    const resolvedBoxConfig = isBox ? { ...DEFAULT_BOX_CONFIG, ...boxP.config } : undefined;
    const resolvedTagConfig = !isBox ? { ...DEFAULT_TAG_CONFIG, ...tagP.config } : undefined;
    const paramCode = isBox 
      ? generateBoxParamCode(resolvedBoxConfig!) 
      : generateTagParamCode(resolvedTagConfig!);

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productType: type,
      title: preset.name,
      templateName: preset.name,
      paramCode,
      image: preset.image,
      isFree: isBox ? boxP.isFree : (tagP.isFree ?? false),
      unitPrice: basePrice,
      totalPrice: basePrice,
      licenseType: 'personal',
      customText: isBox ? (boxP.config.labelText || 'ORGANIZER') : (tagP.config.text || 'TAG'),
      boxConfig: resolvedBoxConfig,
      tagConfig: resolvedTagConfig,
      createdAt: Date.now(),
    };

    setCartItems((prev) => [newItem, ...prev]);
    setIsCartOpen(true);
  };

  // Adapted config for Viewport3D so background and dimensions render reliably
  const currentActiveModel = activeConfigurator === 'tag' ? tagModel : boxModel;
  const currentViewportConfig: TagConfig = activeConfigurator === 'tag'
    ? tagConfig
    : {
        ...DEFAULT_TAG_CONFIG,
        baseColor: boxConfig.primaryColor,
        textColor: boxConfig.accentColor,
        showDimensions3D: boxConfig.showDimensions3D,
        showBuildPlate: boxConfig.showBuildPlate,
      };

  return (
    <div
      className={`flex flex-col h-screen h-[100dvh] w-screen overflow-hidden transition-colors duration-200 ${
        theme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      {/* Navigation Header with Gated Free/Paid Download Action */}
      <TopHeader
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        activeConfigurator={activeConfigurator}
        onChangeConfigurator={handleChangeConfigurator}
        tagConfig={tagConfig}
        boxConfig={boxConfig}
        tagDimensions={tagModel?.dimensions || null}
        boxDimensions={(boxModel as any)?.boxDimensions || null}
        theme={theme}
        cartItemCount={cartItems.length}
        activeTemplate={activeTemplate}
        isTemplatePurchased={isCurrentTemplatePurchased}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        onUpdateTagConfig={handleUpdateTagConfig}
        onUpdateBoxConfig={handleUpdateBoxConfig}
        onSelectTagPreset={handleSelectTagPreset}
        onSelectBoxPreset={handleSelectBoxPreset}
        onExportTagSTL={handleExportTagSTL}
        onExportBoxSTL={handleExportBoxSTL}
        onOpenSpecsModal={() => setShowSpecsModal(true)}
        onPurchaseTemplate={handlePurchaseCurrentTemplate}
      />

      {/* Main App Body */}
      <main className="relative flex-1 w-full h-[calc(100dvh-56px)] overflow-hidden flex flex-col">
        {currentPage === 'studio' && (
          <div className="relative w-full h-full overflow-hidden flex flex-col justify-between">
            <div className="relative flex-1 w-full overflow-hidden">
              {/* Active Template Status Pill & Explore More Templates Button */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
                <div className={`px-3 py-1.5 rounded-2xl border shadow-lg backdrop-blur-xl flex items-center gap-2 text-xs transition-all ${
                  theme === 'light'
                    ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/40'
                    : 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black'
                }`}>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Template:</span>
                  <span className="font-bold">{activeTemplate.name}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-white shadow-sm inline-flex items-center gap-1 ${
                    activeTemplate.isFree
                      ? 'bg-[#4B00F2]'
                      : 'bg-[#F26C65]'
                  }`}>
                    {activeTemplate.isFree ? (
                      <>
                        <Download className="w-3 h-3 text-white" />
                        <span>FREE STL</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-white" />
                        <span>${activeTemplate.price.toFixed(2)} CAD</span>
                      </>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage('catalog')}
                  className="px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 bg-gradient-to-r from-[#4B00F2] via-[#A832E5] to-[#F26C65] hover:opacity-95 text-white cursor-pointer active:scale-95 shadow-[#4B00F2]/25"
                  title="Browse all 3D templates in configurators"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore More Templates</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>

              {/* 3D Viewport with live Three.js scene */}
              <Viewport3D
                model={currentActiveModel}
                config={currentViewportConfig}
                theme={theme}
                isLoading={isLoading || isFontLoading}
                isSheetOpen={activeConfigurator === 'tag' ? activeTagSheet !== null : activeBoxSheet !== null}
                onCanvasClick={() => {
                  setActiveTagSheet(null);
                  setActiveBoxSheet(null);
                }}
              />

              {/* Configurator-specific control docks with license gating */}
              {activeConfigurator === 'tag' ? (
                <ControlDock
                  config={tagConfig}
                  dimensions={tagModel?.dimensions || null}
                  theme={theme}
                  activeTab={activeTagSheet}
                  onSelectTab={setActiveTagSheet}
                  onChange={handleUpdateTagConfig}
                  onExportSTL={handleExportTagSTL}
                  onExportMultiPart={handleExportTagMultiPart}
                  onOpenSpecs={() => setShowSpecsModal(true)}
                  isFree={activeTemplate.isFree}
                  price={activeTemplate.price}
                  isPurchased={isCurrentTemplatePurchased}
                  templateName={activeTemplate.name}
                  onPurchase={handlePurchaseCurrentTemplate}
                />
              ) : (
                <BoxControlDock
                  config={boxConfig}
                  dimensions={(boxModel as any)?.boxDimensions || null}
                  theme={theme}
                  activeTab={activeBoxSheet}
                  onSelectTab={setActiveBoxSheet}
                  onChange={handleUpdateBoxConfig}
                  onExportSTL={handleExportBoxSTL}
                  isFree={activeTemplate.isFree}
                  price={activeTemplate.price}
                  isPurchased={isCurrentTemplatePurchased}
                  templateName={activeTemplate.name}
                  onPurchase={handlePurchaseCurrentTemplate}
                />
              )}
            </div>

            {/* Studio Bottom Footnote Bar with FFP Logotype and Mission Note */}
            <FoundationFootnote theme={theme} variant="studio" className="block shrink-0 z-20" />
          </div>
        )}

        {currentPage === 'catalog' && (
          <CatalogView
            theme={theme}
            onSelectTagPreset={handleSelectTagPreset}
            onSelectBoxPreset={handleSelectBoxPreset}
            onInstantDownloadFreeTag={handleInstantDownloadFreeTag}
            onInstantDownloadFreeBox={handleInstantDownloadFreeBox}
            onAddToCartPreset={handleAddToCartPreset}
          />
        )}

        {currentPage === 'configurators' && (
          <ConfiguratorsView
            theme={theme}
            onOpenNativeStudio={(type) => {
              setActiveConfigurator(type);
              setCurrentPage('studio');
            }}
          />
        )}

        {currentPage === 'downloads' && (
          <MyDownloadsView
            theme={theme}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenTagInStudio={(cfg) => {
              setTagConfig(cfg);
              setActiveConfigurator('tag');
              setCurrentPage('studio');
            }}
            onOpenBoxInStudio={(cfg) => {
              setBoxConfig(cfg);
              setActiveConfigurator('box');
              setCurrentPage('studio');
            }}
          />
        )}

        {/* 3D Calipers & Geometry Specs Modal */}
        <DimensionsPanel
          isOpen={showSpecsModal}
          onClose={() => setShowSpecsModal(false)}
          dimensions={currentActiveModel?.dimensions || null}
          config={tagConfig}
          theme={theme}
        />

        {/* Digital Downloads Queue Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          theme={theme}
          onToggleLicense={handleToggleLicense}
          onRemoveItem={handleRemoveCartItem}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          appliedPromo={appliedPromo}
          onApplyPromo={handleApplyPromo}
          onRemovePromo={() => setAppliedPromo('')}
        />

        {/* Digital Payment & Instant Download Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          theme={theme}
          appliedPromo={appliedPromo}
          onOrderCompleted={handleOrderCompleted}
        />

        {/* Post-Order Download & Slicer Ready Modal */}
        {completedOrder && (
          <OrderSuccessModal
            isOpen={isOrderSuccessOpen}
            onClose={() => setIsOrderSuccessOpen(false)}
            order={completedOrder}
            theme={theme}
            onGoToDownloads={() => {
              setIsOrderSuccessOpen(false);
              setCurrentPage('downloads');
            }}
            onGoToStudio={() => {
              setIsOrderSuccessOpen(false);
              setCurrentPage('studio');
            }}
          />
        )}

        {/* Free Downloads Authentication Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          theme={theme}
          onClose={() => {
            setIsAuthOpen(false);
            pendingDownloadActionRef.current = null;
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      </main>
    </div>
  );
}
