import React, { useState } from 'react';
import { TagPreset, AppTheme } from '../types/tag';
import { BoxPreset } from '../types/box';
import { TAG_PRESETS } from '../utils/presets';
import { BOX_PRESETS } from '../utils/boxPresets';
import { 
  Box as BoxIcon, 
  Tag as TagIcon, 
  ShieldCheck, 
  Download, 
  Sliders, 
  ShoppingBag,
  Lock,
  Check,
  Sparkles
} from 'lucide-react';

interface CatalogViewProps {
  theme: AppTheme;
  onSelectTagPreset: (preset: TagPreset) => void;
  onSelectBoxPreset: (preset: BoxPreset) => void;
  onInstantDownloadFreeTag: (preset: TagPreset) => void;
  onInstantDownloadFreeBox: (preset: BoxPreset) => void;
  onAddToCartPreset: (type: 'tag' | 'box', preset: TagPreset | BoxPreset) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  theme,
  onSelectTagPreset,
  onSelectBoxPreset,
  onInstantDownloadFreeTag,
  onInstantDownloadFreeBox,
  onAddToCartPreset,
}) => {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid' | 'tag' | 'plate' | 'box'>('all');
  const isLight = theme === 'light';

  // Merge presets with metadata and photo renders
  const allItems: Array<{
    id: string;
    type: 'tag' | 'box';
    title: string;
    description: string;
    image?: string;
    isFree: boolean;
    price: number;
    category: string;
    tagPreset?: TagPreset;
    boxPreset?: BoxPreset;
  }> = [
    ...TAG_PRESETS.map((t) => ({
      id: `tag-${t.id}`,
      type: 'tag' as const,
      title: t.name,
      description: t.description,
      image: t.image,
      isFree: t.isFree ?? true,
      price: t.digitalPrice ?? 0,
      category: t.category || 'tag',
      tagPreset: t,
    })),
    ...BOX_PRESETS.map((b) => ({
      id: `box-${b.id}`,
      type: 'box' as const,
      title: b.name,
      description: b.description,
      image: b.image,
      isFree: b.isFree,
      price: b.digitalPrice,
      category: b.category,
      boxPreset: b,
    })),
  ];

  const freeItems = allItems.filter((i) => i.isFree);
  const paidItems = allItems.filter((i) => !i.isFree);

  const filteredItems = allItems.filter((item) => {
    if (filter === 'free') return item.isFree;
    if (filter === 'paid') return !item.isFree;
    if (filter === 'box') return item.type === 'box';
    if (filter === 'tag') return item.type === 'tag' && item.category !== 'plate';
    if (filter === 'plate') return item.category === 'plate';
    return true;
  });

  const renderCard = (prod: typeof allItems[0]) => {
    const isBox = prod.type === 'box';
    const isPlate = prod.category === 'plate';
    const typeLabel = isBox ? 'Desk Organizer' : (isPlate ? 'Plates & Signs' : 'Tags & Keychains');

    return (
      <div
        key={prod.id}
        className={`rounded-3xl border p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-xl group ${
          prod.isFree
            ? isLight 
              ? 'bg-white border-zinc-200 hover:border-emerald-300' 
              : 'bg-zinc-900/60 border-zinc-800 hover:border-emerald-900/80'
            : isLight
              ? 'bg-white border-zinc-200 hover:border-amber-300'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-amber-900/80'
        }`}
      >
        <div>
          {/* Card Header & Clear Price / License Badge */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-1">
                <span>{typeLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{isBox ? 'Modular Organizer' : (isPlate ? 'Architectural Plate' : 'Free Community Tag')}</span>
              </div>
              <h3 className="font-bold text-lg tracking-tight leading-snug">
                {prod.title}
              </h3>
            </div>

            <div className="text-right shrink-0">
              {prod.isFree ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  FREE STL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full font-bold uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  ${prod.price.toFixed(2)} CAD
                </span>
              )}
            </div>
          </div>

          {/* Realistic Render Miniature */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
            {prod.image ? (
              <img
                src={prod.image}
                alt={`${prod.title} printed 3D model`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
                {isBox ? <BoxIcon className="w-8 h-8" /> : <TagIcon className="w-8 h-8" />}
                <span className="text-xs font-mono">3D Model</span>
              </div>
            )}
            
            {/* License Tag Overlay */}
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-200 flex items-center gap-1.5 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${prod.isFree ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{prod.isFree ? 'Free Community STL' : 'Commercial CAD License'}</span>
            </div>
          </div>

          <p className={`text-xs mb-4 line-clamp-2 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {prod.description}
          </p>
        </div>

        {/* Card Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              if (isBox && prod.boxPreset) {
                onSelectBoxPreset(prod.boxPreset);
              } else if (!isBox && prod.tagPreset) {
                onSelectTagPreset(prod.tagPreset);
              }
            }}
            className={`py-2 px-3 rounded-xl font-semibold text-xs border flex items-center justify-center gap-1.5 transition-all ${
              isLight
                ? 'border-zinc-300 hover:border-zinc-900 bg-white text-zinc-900'
                : 'border-zinc-700 hover:border-white bg-zinc-900 text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize 3D</span>
          </button>

          {prod.isFree ? (
            <button
              type="button"
              onClick={() => {
                if (isBox && prod.boxPreset) {
                  onInstantDownloadFreeBox(prod.boxPreset);
                } else if (!isBox && prod.tagPreset) {
                  onInstantDownloadFreeTag(prod.tagPreset);
                }
              }}
              className={`py-2 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Free STL</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onAddToCartPreset(prod.type, (prod.boxPreset || prod.tagPreset)!);
              }}
              className="py-2 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Basket (${prod.price.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full overflow-y-auto">
      {/* Hero Banner */}
      <section className={`py-12 px-4 sm:px-6 border-b text-center ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>Watertight Slicer-Ready CAD Models</span>
            <span aria-hidden="true">·</span>
            <span>Free Community STLs & Commercial Licenses</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            3D Printable Catalog
          </h1>
          <p className={`text-sm sm:text-base max-w-xl mx-auto ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Download free community STLs for personal 3D printing, or purchase commercial CAD licenses with unlimited physical print selling rights.
          </p>

          {/* Quick License Comparison Pill Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-medium bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Free Community Tier: 1-Click Instant STL Download</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-medium bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Commercial CAD Tier: Unlimited Physical Sales Allowed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs with Clear Counts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'all' as const, label: `All Models (${allItems.length})` },
            { id: 'free' as const, label: `Free STLs (${freeItems.length})`, isFreeTag: true },
            { id: 'paid' as const, label: `Commercial CAD (${paidItems.length})`, isPaidTag: true },
            { id: 'tag' as const, label: `Tags & Keychains (${allItems.filter(i => i.type === 'tag' && i.category !== 'plate').length})` },
            { id: 'plate' as const, label: `Plates & Signs (${allItems.filter(i => i.category === 'plate').length})` },
            { id: 'box' as const, label: `Desk Organizers (${allItems.filter(i => i.type === 'box').length})` },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? tab.isFreeTag
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : tab.isPaidTag
                      ? 'bg-amber-600 text-white shadow-sm'
                      : isLight ? 'bg-zinc-900 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm'
                    : isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                {tab.isFreeTag && <Check className="w-3.5 h-3.5" />}
                {tab.isPaidTag && <Lock className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SECTIONED VIEW WHEN 'ALL' IS SELECTED */}
        {filter === 'all' ? (
          <div className="space-y-12">
            {/* 1. FREE COMMUNITY MODELS SECTION */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h2 className="text-xl font-extrabold tracking-tight">Free Community Models</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      FREE DOWNLOAD
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Free personal 3D printing models. Slicer-ready watertight STL files delivered instantly.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">{freeItems.length} Free STLs Available</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeItems.map(renderCard)}
              </div>
            </div>

            {/* 2. COMMERCIAL CAD LICENSES SECTION */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h2 className="text-xl font-extrabold tracking-tight">Commercial CAD Licenses</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      PAID LICENSE REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Premium parametric designs with commercial print-to-sell rights and lifetime digital library access.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">{paidItems.length} Premium Templates</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paidItems.map(renderCard)}
              </div>
            </div>
          </div>
        ) : (
          /* FILTERED GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(renderCard)}
          </div>
        )}
      </section>
    </div>
  );
};
