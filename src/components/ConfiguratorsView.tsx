import React, { useState, useEffect } from 'react';
import { ConfiguratorItem, ConfiguratorKind } from '../types/configurator';
import { 
  DEFAULT_CONFIGURATORS, 
  getStoredConfigurators, 
  addCustomConfigurator, 
  deleteCustomConfigurator, 
  generateIframeEmbedCode, 
  generateReactEmbedCode 
} from '../utils/configuratorsData';
import { AppTheme } from '../types/tag';
import { 
  Box, 
  Tag as TagIcon, 
  Sparkles, 
  Plus, 
  ExternalLink, 
  Code, 
  Copy, 
  Check, 
  Trash2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  X, 
  Search, 
  ArrowLeft, 
  Globe, 
  Layers, 
  Sliders, 
  Info,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Building2
} from 'lucide-react';
import { FoundationFootnote } from './FoundationFootnote';

interface ConfiguratorsViewProps {
  theme: AppTheme;
  onOpenNativeStudio: (type: 'tag' | 'box') => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const ConfiguratorsView: React.FC<ConfiguratorsViewProps> = ({
  theme,
  onOpenNativeStudio,
}) => {
  const isLight = theme === 'light';

  // Master list of configurators (default + user-saved)
  const [configurators, setConfigurators] = useState<ConfiguratorItem[]>(getStoredConfigurators);
  
  // Filter & Search
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Embedded Configurator (Full Interactive Player)
  const [activeEmbedItem, setActiveEmbedItem] = useState<ConfiguratorItem | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [embedCodeModalItem, setEmbedCodeModalItem] = useState<ConfiguratorItem | null>(null);
  const [copiedType, setCopiedType] = useState<'html' | 'react' | null>(null);

  // Add Modal Form State
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState<ConfiguratorItem['category']>('Custom AI Studio');
  const [formDescription, setFormDescription] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formTags, setFormTags] = useState('AI Studio, 3D Print, Parametric');
  const [formStripeLink, setFormStripeLink] = useState('');
  const [formPrice, setFormPrice] = useState('3.50');
  const [formError, setFormError] = useState('');

  // Synchronize on load
  useEffect(() => {
    setConfigurators(getStoredConfigurators());
  }, []);

  // Filtered Items
  const filteredItems = configurators.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'native' && item.kind === 'native') ||
      (activeCategory === 'embed' && item.kind === 'embed') ||
      (activeCategory === 'custom' && item.isCustom) ||
      item.category === activeCategory;

    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleOpenConfigurator = (item: ConfiguratorItem) => {
    if (item.kind === 'native' && item.nativeStudioType) {
      onOpenNativeStudio(item.nativeStudioType);
    } else {
      setActiveEmbedItem(item);
      setIsIframeLoading(true);
    }
  };

  const handleRefreshIframe = () => {
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a configurator title');
      return;
    }
    if (!formUrl.trim()) {
      setFormError('Please provide an app.ai.studio or Cloud Run URL address');
      return;
    }

    let cleanUrl = formUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const hasStripe = Boolean(formStripeLink.trim());
    const newItem = addCustomConfigurator({
      name: formName.trim(),
      embedUrl: cleanUrl,
      category: formCategory,
      description: formDescription.trim() || 'Custom parametric 3D configurator created with Google AI Studio.',
      author: formAuthor.trim() || 'Independent Designer',
      kind: 'embed',
      badge: hasStripe ? 'Designer Stripe' : 'Community App',
      badgeColor: hasStripe ? 'blue' : 'purple',
      monetizationType: hasStripe ? 'creator_stripe' : 'free_community',
      stripePaymentLink: formStripeLink.trim() || undefined,
      digitalPrice: hasStripe ? parseFloat(formPrice) || 3.50 : 0,
      tags: tagsArray.length > 0 ? tagsArray : ['Custom', '3D CAD', 'AI Studio'],
      dimensions: 'Dynamic parametric',
      exportFormats: ['STL'],
      imageUrl: '/images/render_keychain_tag_1793271969252.jpg',
    });

    setConfigurators(getStoredConfigurators());
    setShowAddModal(false);
    setFormName('');
    setFormUrl('');
    setFormDescription('');
    setFormAuthor('');
    setFormStripeLink('');
    setFormPrice('3.50');
    setFormError('');

    // Immediately preview the newly added configurator
    setActiveEmbedItem(newItem);
    setIsIframeLoading(true);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this custom embedded configurator?')) {
      const updated = deleteCustomConfigurator(id);
      setConfigurators(updated);
      if (activeEmbedItem?.id === id) {
        setActiveEmbedItem(null);
      }
    }
  };

  const handleCopyCode = (code: string, type: 'html' | 'react') => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2200);
  };

  const quickFillSample = (sampleUrl: string, sampleTitle: string, sampleDesc: string) => {
    setFormUrl(sampleUrl);
    setFormName(sampleTitle);
    setFormDescription(sampleDesc);
    setFormCategory('Desk & Storage');
  };

  // If viewing an active embedded configurator
  if (activeEmbedItem) {
    const isMobileMode = deviceMode === 'mobile';
    const isTabletMode = deviceMode === 'tablet';

    return (
      <div className={`relative w-full h-[calc(100vh-3.5rem)] flex flex-col ${isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
        {/* Top Embedded Control Bar */}
        <div className={`h-14 px-4 flex items-center justify-between border-b shrink-0 z-20 ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActiveEmbedItem(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                isLight ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Configurators</span>
            </button>

            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-sm truncate">{activeEmbedItem.name}</span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Globe className="w-2.5 h-2.5" />
                AI Studio
              </span>
            </div>
          </div>

          {/* Center: Device Viewport Switcher */}
          <div className="hidden md:flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setDeviceMode('desktop')}
              title="Desktop View (100% Full Width)"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                deviceMode === 'desktop'
                  ? isLight ? 'bg-white text-zinc-950 shadow-sm' : 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px]">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              title="Tablet View (768px frame)"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                deviceMode === 'tablet'
                  ? isLight ? 'bg-white text-zinc-950 shadow-sm' : 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="text-[11px]">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              title="Mobile View (390px phone frame)"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                deviceMode === 'mobile'
                  ? isLight ? 'bg-white text-zinc-950 shadow-sm' : 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px]">Mobile</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefreshIframe}
              title="Reload Configurator"
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isLight ? 'hover:bg-zinc-100 border-zinc-200 text-zinc-700' : 'hover:bg-zinc-800 border-zinc-800 text-zinc-300'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setEmbedCodeModalItem(activeEmbedItem)}
              title="Get HTML/React Embed Code"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                isLight 
                  ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800' 
                  : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Embed Code</span>
            </button>

            {activeEmbedItem.stripePaymentLink && (
              <a
                href={activeEmbedItem.stripePaymentLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Buy CAD License via Designer's Stripe"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Buy CAD License {activeEmbedItem.digitalPrice ? `($${activeEmbedItem.digitalPrice.toFixed(2)})` : ''}</span>
              </a>
            )}

            {activeEmbedItem.embedUrl && (
              <a
                href={activeEmbedItem.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Standalone Window"
                className={`p-2 rounded-xl border text-xs transition-colors ${
                  isLight ? 'hover:bg-zinc-100 border-zinc-200 text-zinc-700' : 'hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Embedded IFrame Area */}
        <div className="flex-1 w-full overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-zinc-200/50 dark:bg-zinc-900/40 relative">
          {/* Loading Overlay */}
          {isIframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/20 backdrop-blur-xs">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-xs font-bold tracking-wide uppercase text-zinc-600 dark:text-zinc-300">
                Loading Embedded 3D Configurator...
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 max-w-xs text-center">
                Connecting to {activeEmbedItem.embedUrl}
              </div>
            </div>
          )}

          {/* Device Mockup Shell */}
          <div
            className={`h-full transition-all duration-300 relative flex flex-col shadow-2xl rounded-2xl overflow-hidden border ${
              isLight ? 'bg-white border-zinc-300 shadow-zinc-400/20' : 'bg-black border-zinc-800 shadow-black'
            } ${
              isMobileMode
                ? 'w-[390px] max-w-full my-auto rounded-[36px] border-4 border-zinc-800'
                : isTabletMode
                ? 'w-[768px] max-w-full my-auto rounded-3xl border-2'
                : 'w-full'
            }`}
          >
            {/* Phone Notch/Speaker bar when in mobile mockup */}
            {isMobileMode && (
              <div className="h-5 bg-zinc-900 flex items-center justify-center shrink-0">
                <div className="w-16 h-3 bg-zinc-800 rounded-full" />
              </div>
            )}

            <iframe
              key={iframeKey}
              src={activeEmbedItem.embedUrl}
              title={activeEmbedItem.name}
              className="w-full flex-1 border-0"
              onLoad={() => setIsIframeLoading(false)}
              allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
            />
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className={`h-8 px-4 flex items-center justify-between text-[11px] border-t select-none shrink-0 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4B00F2] inline-block animate-pulse" />
            <span>Embedded via Google AI Studio</span>
          </div>
          <div className="truncate max-w-xs font-mono text-[10px]">
            {activeEmbedItem.embedUrl}
          </div>
        </div>
      </div>
    );
  }

  // Main Directory Grid View
  return (
    <div className={`w-full min-h-[calc(100vh-3.5rem)] pb-24 ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      {/* Hero Section */}
      <section className={`border-b ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-4 bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] border border-[#4B00F2]/25">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parametric CAD Ecosystem</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                3D Configurator Directory & Embed Hub
              </h1>
              <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Launch standalone parametric 3D CAD engines or embed any application created in Google AI Studio
                directly into this workspace or your own website by providing its URL address.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-[#4B00F2] hover:bg-[#3D00C6] text-white shadow-lg shadow-[#4B00F2]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Embed AI Studio App</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Engines' },
                { id: 'native', label: 'Built-in 3D Studios' },
                { id: 'embed', label: 'AI Studio Embeds' },
                { id: 'Tags & Plates', label: 'Tags & Plates' },
                { id: 'Desk & Storage', label: 'Desk & Storage' },
                { id: 'custom', label: 'My Custom Applets' },
              ].map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? isLight
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-white text-zinc-950 shadow-sm'
                        : isLight
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search configurators..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border transition-all outline-none ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-300 focus:border-zinc-900 text-zinc-900'
                    : 'bg-zinc-900 border-zinc-800 focus:border-zinc-500 text-zinc-100'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {filteredItems.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <Layers className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
            <h3 className="font-bold text-base">No configurators found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              No generators match your current filter or search criteria. Try selecting another category or embed a new AI Studio applet.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isNative = item.kind === 'native';
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenConfigurator(item)}
                  className={`group rounded-3xl border transition-all duration-200 flex flex-col overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                    isLight
                      ? 'bg-white border-zinc-200 hover:border-zinc-400'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Thumbnail / Visual Zone */}
                  <div className="relative aspect-16/10 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-white p-6">
                        <Globe className="w-12 h-12 text-purple-400 mb-2 opacity-80" />
                        <span className="text-xs font-bold text-zinc-300">AI Studio Embed</span>
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm border ${
                        (isNative || item.monetizationType === 'fab_foundation')
                          ? 'bg-[#4B00F2] text-white border-[#4B00F2]'
                          : 'bg-zinc-900/90 text-zinc-100 border-zinc-700/80'
                      }`}>
                        {(isNative || item.monetizationType === 'fab_foundation') ? 'FFP Engine' : (item.badge || 'AI Studio')}
                      </span>

                      {item.isCustom && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900/80 text-zinc-200 backdrop-blur-sm border border-zinc-700">
                          User Added
                        </span>
                      )}
                    </div>

                    {/* Delete button for user custom items */}
                    {item.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        title="Delete custom embed"
                        className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white backdrop-blur-sm transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                        <span className="font-semibold">{item.category}</span>
                        <div className="flex items-center gap-1 font-medium">
                          {item.monetizationType === 'fab_foundation' ? (
                            <span className="text-[#4B00F2] dark:text-[#855BFF] flex items-center gap-1 font-semibold text-[10px]">
                              <Building2 className="w-3 h-3" />
                              FFP Engine
                            </span>
                          ) : item.monetizationType === 'creator_stripe' ? (
                            <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1 font-semibold text-[10px]">
                              <CreditCard className="w-3 h-3" />
                              Designer Stripe
                            </span>
                          ) : (
                            <span className="text-[10px]">{item.author}</span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-base tracking-tight leading-snug group-hover:text-[#4B00F2] dark:group-hover:text-[#855BFF] transition-colors">
                        {item.name}
                      </h3>

                      <p className={`mt-2 text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {item.description}
                      </p>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-mono text-zinc-500 truncate">
                        {isNative ? 'Watertight Engine' : 'Live Iframe Embed'}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Embed Code Modal Button */}
                        <button
                          type="button"
                          onClick={() => setEmbedCodeModalItem(item)}
                          title="Get Iframe/React Embed Code"
                          className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                            isLight
                              ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                          }`}
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>

                        {/* Open Button with #4B00F2 color accent */}
                        <button
                          type="button"
                          onClick={() => handleOpenConfigurator(item)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-[#4B00F2] hover:bg-[#3D00C6] text-white shadow-sm"
                        >
                          <span>{isNative ? 'Launch Studio' : 'Open Embed'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Global Foundation Footnote with Logotype and Required Note */}
      <FoundationFootnote theme={theme} />

      {/* Embed Code Dialog Modal */}
      {embedCodeModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setEmbedCodeModalItem(null)}
        >
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 overflow-hidden ${
              isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-base">Embed this 3D Configurator</h3>
                  <p className="text-xs text-zinc-500">{embedCodeModalItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEmbedCodeModalItem(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* HTML Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Standard HTML IFrame (Shopify, WordPress, Webflow, Webpages)
                  </span>
                  <button
                    onClick={() => handleCopyCode(generateIframeEmbedCode(embedCodeModalItem), 'html')}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {copiedType === 'html' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy HTML</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className={`p-3 rounded-2xl text-[11px] font-mono overflow-x-auto border ${
                  isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                }`}>
                  <code>{generateIframeEmbedCode(embedCodeModalItem)}</code>
                </pre>
              </div>

              {/* React JSX Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    React Component (Next.js / Vite SPA)
                  </span>
                  <button
                    onClick={() => handleCopyCode(generateReactEmbedCode(embedCodeModalItem), 'react')}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {copiedType === 'react' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy React</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className={`p-3 rounded-2xl text-[11px] font-mono overflow-x-auto border ${
                  isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                }`}>
                  <code>{generateReactEmbedCode(embedCodeModalItem)}</code>
                </pre>
              </div>

              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                isLight ? 'bg-emerald-50 text-emerald-800' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  This embed automatically adapts to mobile screens, handles mouse/touch orbit controls, and retains full 3D interactive generation.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom AI Studio Configurator Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 overflow-hidden ${
              isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-base">Embed AI Studio Configurator</h3>
                  <p className="text-xs text-zinc-500">Provide any app.ai.studio or Cloud Run address to embed</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* URL Address Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-700 dark:text-zinc-300">
                  AI Studio Web Address / URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://ais-dev-...run.app or app.ai.studio address"
                  value={formUrl}
                  onChange={(e) => {
                    setFormUrl(e.target.value);
                    setFormError('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-mono transition-all outline-none ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-emerald-600 text-zinc-900'
                      : 'bg-zinc-950 border-zinc-800 focus:border-emerald-500 text-zinc-100'
                  }`}
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Supports Google AI Studio live applet URLs (`https://ais-*.run.app`) and external 3D WebGL configurators.
                </span>
              </div>

              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-700 dark:text-zinc-300">
                    Configurator Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lithophane Lamp Forge"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 focus:border-zinc-900 text-zinc-900'
                        : 'bg-zinc-950 border-zinc-800 focus:border-zinc-500 text-zinc-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-700 dark:text-zinc-300">
                    Creator / Author
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Studio Maker"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 focus:border-zinc-900 text-zinc-900'
                        : 'bg-zinc-950 border-zinc-800 focus:border-zinc-500 text-zinc-100'
                    }`}
                  />
                </div>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                    }`}
                  >
                    <option value="Desk & Storage">Desk & Storage</option>
                    <option value="Tags & Plates">Tags & Plates</option>
                    <option value="Mechanical & Tools">Mechanical & Tools</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Custom AI Studio">Custom AI Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-700 dark:text-zinc-300">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="3D CAD, STL, Parametric"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all outline-none ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What does this 3D configurator generate?"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border transition-all outline-none resize-none ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                  }`}
                />
              </div>

              {/* Creator Stripe Monetization Section */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Creator Stripe Monetization (Optional)</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Independent designers can link their own Stripe Payment Link to sell commercial CAD licenses directly to makers. Leave blank for free community models.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">
                      Your Stripe Payment Link (buy.stripe.com)
                    </label>
                    <input
                      type="url"
                      placeholder="https://buy.stripe.com/..."
                      value={formStripeLink}
                      onChange={(e) => setFormStripeLink(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs border font-mono transition-all outline-none ${
                        isLight
                          ? 'bg-white border-zinc-300 focus:border-blue-600 text-zinc-900'
                          : 'bg-zinc-900 border-zinc-700 focus:border-blue-500 text-zinc-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">
                      Price ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs border font-mono transition-all outline-none ${
                        isLight
                          ? 'bg-white border-zinc-300 focus:border-blue-600 text-zinc-900'
                          : 'bg-zinc-900 border-zinc-700 focus:border-blue-500 text-zinc-100'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Fill Preset Pills */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-zinc-500 block mb-1.5">
                  Or test with sample AI Studio addresses:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      quickFillSample(
                        'https://ais-dev-ftwzx3eth7ocfrviel7tut-493219649253.us-west2.run.app',
                        'Modular Phone Stand & Cable Dock',
                        'Parametric angled desktop smartphone dock with integrated wireless charging cutout and wire channels.'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    + Sample Phone Stand
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quickFillSample(
                        'https://ais-dev-ftwzx3eth7ocfrviel7tut-493219649253.us-west2.run.app',
                        'Hex Pegboard Tool Hanger Forge',
                        'Generative tool clip creator with customizable diameter, snap-fit tolerance, and wall mount anchors.'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    + Sample Pegboard Tool Hanger
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Save & Launch Embed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
