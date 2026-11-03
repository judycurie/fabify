import React, { useState } from 'react';
import { TagPreset, AppTheme } from '../types/tag';
import { BoxPreset } from '../types/box';
import { TAG_PRESETS } from '../utils/presets';
import { BOX_PRESETS } from '../utils/boxPresets';
import { 
  Box as BoxIcon, 
  Tag as TagIcon, 
  Sliders, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FoundationFootnote } from './FoundationFootnote';

interface CatalogViewProps {
  theme: AppTheme;
  onSelectTagPreset: (preset: TagPreset) => void;
  onSelectBoxPreset: (preset: BoxPreset) => void;
  onInstantDownloadFreeTag?: (preset: TagPreset) => void;
  onInstantDownloadFreeBox?: (preset: BoxPreset) => void;
  onAddToCartPreset?: (type: 'tag' | 'box', preset: TagPreset | BoxPreset, tierId?: 'tier1_static' | 'tier2_subscription') => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  theme,
  onSelectTagPreset,
  onSelectBoxPreset,
}) => {
  const [filter, setFilter] = useState<'all' | 'tag' | 'plate' | 'box'>('all');
  const isLight = theme === 'light';

  // Merge presets with metadata and photo renders (Parts Sorter is removed from boxPresets)
  const allItems: Array<{
    id: string;
    type: 'tag' | 'box';
    title: string;
    description: string;
    image?: string;
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
      category: t.category || 'tag',
      tagPreset: t,
    })),
    ...BOX_PRESETS.map((b) => ({
      id: `box-${b.id}`,
      type: 'box' as const,
      title: b.name,
      description: b.description,
      image: b.image,
      category: b.category,
      boxPreset: b,
    })),
  ];

  const filteredItems = allItems.filter((item) => {
    if (filter === 'box') return item.type === 'box';
    if (filter === 'tag') return item.type === 'tag' && item.category !== 'plate';
    if (filter === 'plate') return item.category === 'plate';
    return true;
  });

  const renderCard = (prod: typeof allItems[0]) => {
    const isBox = prod.type === 'box';
    const isPlate = prod.category === 'plate';
    const typeLabel = isBox ? 'Desk Organizer' : (isPlate ? 'Plates & Signs' : 'Tags & Keychains');

    const handleCustomize = () => {
      if (isBox && prod.boxPreset) {
        onSelectBoxPreset(prod.boxPreset);
      } else if (!isBox && prod.tagPreset) {
        onSelectTagPreset(prod.tagPreset);
      }
    };

    return (
      <div
        key={prod.id}
        onClick={handleCustomize}
        className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-2xl group cursor-pointer ${
          isLight 
            ? 'bg-white border-zinc-200 hover:border-zinc-900 shadow-sm' 
            : 'bg-zinc-900/90 border-zinc-700/80 hover:border-zinc-300 shadow-black/60'
        }`}
      >
        <div>
          {/* Card Category Header without any badges */}
          <div className="mb-2.5">
            <div className="text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
              {typeLabel}
            </div>
            <h3 className="font-bold text-base sm:text-lg tracking-tight leading-snug text-zinc-950 dark:text-white" title={prod.title}>
              {prod.title}
            </h3>
          </div>

          {/* Clean Render Miniature without any overlay tags */}
          <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden mb-3.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            {prod.image ? (
              <img
                src={prod.image}
                alt={`${prod.title} 3D model`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-200">
                {isBox ? <BoxIcon className="w-8 h-8" /> : <TagIcon className="w-8 h-8" />}
                <span className="text-xs font-mono font-medium">3D Model</span>
              </div>
            )}
          </div>

          {/* High contrast, readable description in dark mode */}
          <p className="text-xs mb-4 line-clamp-2 leading-relaxed text-zinc-700 dark:text-zinc-200 font-medium">
            {prod.description}
          </p>
        </div>

        {/* Single Primary Action: Customize in 3D Studio (No download buttons on card) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCustomize();
            }}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              isLight
                ? 'bg-zinc-950 text-white hover:bg-black group-hover:scale-[1.01]'
                : 'bg-white text-zinc-950 hover:bg-zinc-100 group-hover:scale-[1.01]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>Customize in 3D Studio</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full overflow-y-auto flex flex-col justify-between">
      {/* Simplified Hero Banner with bright readable typography */}
      <section className={`py-10 px-4 sm:px-6 border-b text-center ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <div className="max-w-2xl mx-auto space-y-2.5">
          <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-300 font-bold">
            <span>3D Printable Configurators</span>
            <span aria-hidden="true">·</span>
            <span>Watertight Slicer-Ready Solids</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            Choose a Configurator
          </h1>
          <p className="text-xs sm:text-sm max-w-lg mx-auto text-zinc-700 dark:text-zinc-200 font-medium leading-relaxed">
            Select any template to customize dimensions, letters, and hole placements in the live 3D Studio with free STL export and commercial licenses.
          </p>
        </div>
      </section>

      {/* Filter Tabs with high readability */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'all' as const, label: `All (${allItems.length})` },
            { id: 'tag' as const, label: `Tags & Keychains (${allItems.filter(i => i.type === 'tag' && i.category !== 'plate').length})` },
            { id: 'plate' as const, label: `Plates & Signs (${allItems.filter(i => i.category === 'plate').length})` },
            { id: 'box' as const, label: `Desk Organizers (${allItems.filter(i => i.type === 'box').length})` },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? isLight 
                      ? 'bg-zinc-950 text-white shadow-sm' 
                      : 'bg-white text-zinc-950 shadow-sm'
                    : isLight 
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800' 
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Simplified Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map(renderCard)}
        </div>
      </section>

      {/* Footnote Bar */}
      <FoundationFootnote theme={theme} variant="studio" className="block shrink-0 z-20" />
    </div>
  );
};
