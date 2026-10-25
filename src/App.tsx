/**
 * Fabify CAD - Digital 3D Printable Model Platform & Parametric Engine
 * Features:
 * - Multi-Configurator 3D Studio:
 *   1. Parametric Tag & Keychain Forge
 *   2. Parametric Desk Organizer & Box Forge
 * - Digital-Only Delivery: Instant watertight binary STL exports & license certificates
 * - Free Community Templates & Paid Commercial CAD Licenses
 * - Digital Cart & Encrypted Checkout (Free 1-click download vs Paid Card/Apple/Google Pay)
 * - "My Downloads" Library with persistent re-downloads & 3D re-customization
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as opentype from 'opentype.js';
import { TagConfig, TagDimensions, AppTheme, TagPreset } from './types/tag';
import { BoxConfig, BoxDimensions, BoxPreset } from './types/box';
import { CartItem, OrderRecord, LicenseType } from './types/cart';
import { DEFAULT_TAG_CONFIG, TAG_PRESETS } from './utils/presets';
import { DEFAULT_BOX_CONFIG, BOX_PRESETS } from './utils/boxPresets';
import { loadHelveticaFont } from './utils/fontLoader';
import { generateTagModel, GeneratedTagModel } from './utils/tagGeometry';
import { generateBoxModel } from './utils/boxGeometry';
import { exportSTL, exportMultiPartSTL, getSafeFilename, fireExportConfetti } from './utils/stlExporter';
import { getSavedCart, saveCartToStorage } from './utils/orders';
import { VALID_PROMO_CODES, calculateDigitalItemPrice, COMMERCIAL_LICENSE_SURCHARGE } from './utils/pricing';

import { TopHeader, NavPage, StudioConfigurator } from './components/TopHeader';
import { Viewport3D } from './components/Viewport3D';
import { ControlDock, ActiveSheetTab } from './components/ControlDock';
import { BoxControlDock, BoxActiveTab } from './components/BoxControlDock';
import { DimensionsPanel } from './components/DimensionsPanel';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { CatalogView } from './components/CatalogView';
import { MyDownloadsView } from './components/MyDownloadsView';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>('light');
  const [currentPage, setCurrentPage] = useState<NavPage>('studio');
  const [activeConfigurator, setActiveConfigurator] = useState<StudioConfigurator>('tag');

  // Tag Configurator State
  const [tagConfig, setTagConfig] = useState<TagConfig>(DEFAULT_TAG_CONFIG);
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

  // Persist digital cart
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

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

  const handleExportTagSTL = (binary: boolean) => {
    const active = currentTagModelRef.current;
    if (!active) return;

    const line1 = tagConfig.text ? tagConfig.text.trim() : '';
    const line2 = tagConfig.hasSecondLine && tagConfig.textLine2 ? `_${tagConfig.textLine2.trim()}` : '';
    const filename = getSafeFilename(`${line1}${line2}`, binary ? '' : '_ascii');
    exportSTL(active.exportGeometry, { filename, binary });
    fireExportConfetti();
  };

  const handleExportTagMultiPart = () => {
    const active = currentTagModelRef.current;
    if (!active) return;

    const line1 = tagConfig.text ? tagConfig.text.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'Tag';
    const line2 = tagConfig.hasSecondLine && tagConfig.textLine2 ? `_${tagConfig.textLine2.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
    exportMultiPartSTL(active.baseGeometry, active.textGeometry, `Tag_${line1}${line2}`);
    fireExportConfetti();
  };

  // Box Configuration Handlers
  const handleUpdateBoxConfig = (partial: Partial<BoxConfig>) => {
    setBoxConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleExportBoxSTL = (binary: boolean) => {
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

  // Catalog Actions
  const handleSelectTagPreset = (preset: TagPreset) => {
    handleUpdateTagConfig(preset.config);
    setActiveConfigurator('tag');
    setCurrentPage('studio');
  };

  const handleSelectBoxPreset = (preset: BoxPreset) => {
    handleUpdateBoxConfig(preset.config);
    setActiveConfigurator('box');
    setCurrentPage('studio');
  };

  const handleInstantDownloadFreeTag = async (preset: TagPreset) => {
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
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productType: type,
      title: preset.name,
      isFree: isBox ? boxP.isFree : (tagP.isFree ?? false),
      unitPrice: basePrice,
      totalPrice: basePrice,
      licenseType: 'personal',
      customText: isBox ? (boxP.config.labelText || 'ORGANIZER') : (tagP.config.text || 'TAG'),
      boxConfig: isBox ? { ...DEFAULT_BOX_CONFIG, ...boxP.config } : undefined,
      tagConfig: !isBox ? { ...DEFAULT_TAG_CONFIG, ...tagP.config } : undefined,
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
      {/* Navigation Header */}
      <TopHeader
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        activeConfigurator={activeConfigurator}
        onChangeConfigurator={setActiveConfigurator}
        tagConfig={tagConfig}
        boxConfig={boxConfig}
        tagDimensions={tagModel?.dimensions || null}
        boxDimensions={(boxModel as any)?.boxDimensions || null}
        theme={theme}
        cartItemCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        onUpdateTagConfig={handleUpdateTagConfig}
        onUpdateBoxConfig={handleUpdateBoxConfig}
        onExportTagSTL={handleExportTagSTL}
        onExportBoxSTL={handleExportBoxSTL}
        onOpenSpecsModal={() => setShowSpecsModal(true)}
      />

      {/* Main App Body */}
      <main className="relative flex-1 w-full h-[calc(100dvh-56px)] overflow-hidden flex flex-col">
        {currentPage === 'studio' && (
          <div className="relative w-full h-full overflow-hidden">
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

            {/* Configurator-specific control docks */}
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
              />
            )}
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

        {currentPage === 'downloads' && (
          <MyDownloadsView
            theme={theme}
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

        {/* Order Success & Direct File Download Modal */}
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
      </main>
    </div>
  );
}
