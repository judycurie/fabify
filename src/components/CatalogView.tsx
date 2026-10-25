import React, { useState } from 'react';
import { TagPreset, TagConfig, AppTheme } from '../types/tag';
import { BoxPreset, BoxConfig } from '../types/box';
import { TAG_PRESETS } from '../utils/presets';
import { BOX_PRESETS } from '../utils/boxPresets';
import { 
  Box as BoxIcon, 
  Tag as TagIcon, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Sliders, 
  ShoppingBag,
  Check
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
  const [filter, setFilter] = useState<'all' | 'free' | 'paid' | 'box' | 'tag'>('all');
  const isLight = theme === 'light';

  // Merge presets with metadata
  const allItems: Array<{
    id: string;
    type: 'tag' | 'box';
    title: string;
    description: string;
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
      isFree: b.isFree,
      price: b.digitalPrice,
      category: b.category,
      boxPreset: b,
    })),
  ];

  const filteredItems = allItems.filter((item) => {
    if (filter === 'free') return item.isFree;
    if (filter === 'paid') return !item.isFree;
    if (filter === 'box') return item.type === 'box';
    if (filter === 'tag') return item.type === 'tag';
    return true;
  });

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
            <span>Free Community STLs & Pro Parametric Files</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Digital 3D Printable Catalog
          </h1>
          <p className={`text-sm sm:text-base max-w-xl mx-auto ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Download free community models or purchase commercial-license parametric templates. Customize dimensions, text, and compartments live in our 3D configurators.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              100% Watertight 2-Manifold
            </span>
            <span aria-hidden="true">·</span>
            <span>Instant Binary STL Download</span>
            <span aria-hidden="true">·</span>
            <span>Bambu / Prusa / Cura Ready</span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'all' as const, label: 'All 3D Models' },
            { id: 'free' as const, label: 'Free Downloads' },
            { id: 'paid' as const, label: 'Premium CAD Licenses' },
            { id: 'box' as const, label: 'Desk Organizers & Boxes' },
            { id: 'tag' as const, label: 'Tags & Keychains' },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? isLight ? 'bg-zinc-900 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm'
                    : isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((prod) => {
            const isBox = prod.type === 'box';

            return (
              <div
                key={prod.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all hover:shadow-xl group ${
                  isLight 
                    ? 'bg-white border-zinc-200 hover:border-zinc-400' 
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Card Header & Price Pill */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
                      }`}>
                        {isBox ? <BoxIcon className="w-4 h-4" /> : <TagIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-base tracking-tight leading-snug">
                          {prod.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                          <span className="capitalize">{isBox ? 'Desk Organizer' : 'Tag & Label'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{prod.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {prod.isFree ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          FREE
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-sm">
                          ${prod.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2D Mini Schematic Box Preview */}
                  <div className={`h-24 rounded-2xl border flex items-center justify-center p-4 relative overflow-hidden mb-3 ${
                    isLight ? 'bg-zinc-100/70 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    {isBox ? (
                      <div className="w-28 h-14 rounded-lg border-2 border-zinc-400/50 flex flex-col justify-between p-1.5 bg-zinc-800/20">
                        <div className="flex items-center justify-between gap-1 h-full">
                          <div className="flex-1 h-full rounded border border-dashed border-zinc-400/40 bg-zinc-400/10" />
                          <div className="flex-1 h-full rounded border border-dashed border-zinc-400/40 bg-zinc-400/10" />
                        </div>
                        <div className="text-[8px] font-mono text-center opacity-60">ORGANIZER</div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm border border-zinc-400/30 bg-zinc-900 text-white">
                        <div className="w-2.5 h-2.5 rounded-full border border-current opacity-70" />
                        <span className="font-bold font-mono text-xs tracking-wider">CUSTOM TAG</span>
                      </div>
                    )}
                  </div>

                  <p className={`text-xs mb-4 line-clamp-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {prod.description}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
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
                      className={`py-2 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                        isLight
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                          : 'bg-white hover:bg-zinc-100 text-zinc-900'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Get CAD (${prod.price.toFixed(2)})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
