import React, { useState, useRef } from 'react';
import { TagConfig, TagDimensions, AppTheme } from '../types/tag';
import { BoxConfig, BoxDimensions } from '../types/box';
import { ActiveTemplateInfo } from '../types/cart';
import { StudioConfigurator } from './TopHeader';
import { 
  Type, 
  Box, 
  CircleDot, 
  Palette, 
  Download, 
  Sliders, 
  Minus, 
  Plus, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  ShoppingBag, 
  Lock,
  Layers,
  Sparkles,
  Grid3X3,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface StudioParametersPanelProps {
  theme: AppTheme;
  activeConfigurator: StudioConfigurator;
  onChangeConfigurator: (mode: StudioConfigurator) => void;
  activeTemplate: ActiveTemplateInfo;
  isTemplatePurchased: boolean;
  
  // Tag Configuration
  tagConfig: TagConfig;
  tagDimensions: TagDimensions | null;
  onUpdateTagConfig: (partial: Partial<TagConfig>) => void;
  onExportTagSTL: (binary: boolean) => void;
  onExportTagMultiPart: () => void;
  
  // Box Configuration
  boxConfig: BoxConfig;
  boxDimensions: BoxDimensions | null;
  onUpdateBoxConfig: (partial: Partial<BoxConfig>) => void;
  onExportBoxSTL: (binary: boolean) => void;
  
  // E-commerce
  onPurchaseTemplate: () => void;
}

const COLOR_PALETTE = [
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Jet Black', value: '#09090b' },
  { name: 'Matte Carbon', value: '#18181b' },
  { name: 'Dark Slate', value: '#27272a' },
  { name: 'Mid Grey', value: '#52525b' },
  { name: 'FFP Accent Violet', value: '#4B00F2' },
  { name: 'Coral Rose', value: '#F26C65' },
  { name: 'Electric Cyan', value: '#06b6d4' },
  { name: 'Signal Orange', value: '#ea580c' },
  { name: 'Forest Green', value: '#16a34a' },
];

export const StudioParametersPanel: React.FC<StudioParametersPanelProps> = ({
  theme,
  activeConfigurator,
  onChangeConfigurator,
  activeTemplate,
  isTemplatePurchased,
  tagConfig,
  tagDimensions,
  onUpdateTagConfig,
  onExportTagSTL,
  onExportTagMultiPart,
  boxConfig,
  boxDimensions,
  onUpdateBoxConfig,
  onExportBoxSTL,
  onPurchaseTemplate,
}) => {
  const isLight = theme === 'light';
  const isTag = activeConfigurator === 'tag';
  const isUnlocked = activeTemplate.isFree || isTemplatePurchased;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Stepper helper for tag config
  const stepTag = (
    key: keyof TagConfig,
    currentVal: number,
    delta: number,
    minVal: number,
    maxVal: number,
    precision = 1
  ) => {
    const next = Math.max(minVal, Math.min(maxVal, currentVal + delta));
    const factor = Math.pow(10, precision);
    const rounded = Math.round(next * factor) / factor;
    onUpdateTagConfig({ [key]: rounded });
  };

  // Stepper helper for box config
  const stepBox = (
    key: keyof BoxConfig,
    currentVal: number,
    delta: number,
    minVal: number,
    maxVal: number,
    precision = 1
  ) => {
    const next = Math.max(minVal, Math.min(maxVal, currentVal + delta));
    const factor = Math.pow(10, precision);
    const rounded = Math.round(next * factor) / factor;
    onUpdateBoxConfig({ [key]: rounded });
  };

  const isDoorSignPlate = 
    activeTemplate.name.toLowerCase().includes('door') || 
    activeTemplate.name.toLowerCase().includes('plate') || 
    activeTemplate.name.toLowerCase().includes('sign');

  // Ensure door sign plate does NOT have circle option
  React.useEffect(() => {
    if (isDoorSignPlate && tagConfig.shape === 'circle') {
      onUpdateTagConfig({ shape: 'rounded' });
    }
  }, [isDoorSignPlate, tagConfig.shape, onUpdateTagConfig]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Collapsed Tab on Right Edge - Positioned strictly inside the studio viewport above footage
  if (isCollapsed) {
    return (
      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-2 py-3 px-3.5 rounded-2xl shadow-xl border backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isLight
              ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/60'
              : 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black'
          }`}
          title="Open Parameters Panel"
        >
          <ChevronLeft className="w-4 h-4 text-[#4B00F2] dark:text-[#855BFF]" />
          <span className="text-xs font-bold font-mono tracking-tight">Parameters</span>
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold text-white ${
            activeTemplate.isFree ? 'bg-[#4B00F2]' : 'bg-[#F26C65]'
          }`}>
            {activeTemplate.isFree ? 'FREE' : `$${activeTemplate.price.toFixed(2)}`}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="3D Studio Parameters Window"
      className={`absolute right-2 sm:right-4 top-2 sm:top-3 bottom-2 sm:bottom-3 z-20 w-[calc(100vw-16px)] sm:w-[390px] max-w-[430px] rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-200 ${
        isLight
          ? 'bg-white/98 border-zinc-200 text-zinc-900 shadow-zinc-400/30'
          : 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-black'
      }`}
    >
      {/* 1. Header with Mode Switcher & Collapse */}
      <div className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between shrink-0 ${
        isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm truncate tracking-tight">
                {activeTemplate.name}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-white shrink-0 ${
                activeTemplate.isFree ? 'bg-[#4B00F2]' : 'bg-[#F26C65]'
              }`}>
                {activeTemplate.isFree ? 'FREE STL' : `$${activeTemplate.price.toFixed(2)} CAD`}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono truncate">
              {isTag ? 'Parametric Tag & Plate Forge' : 'Parametric Desk Organizer Forge'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Configurator Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => onChangeConfigurator('tag')}
              title="Switch to Tags & Plates"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                isTag
                  ? isLight ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeConfigurator('box')}
              title="Switch to Desk Organizers"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                !isTag
                  ? isLight ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              isLight ? 'hover:bg-zinc-200 border-zinc-200 text-zinc-500' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
            title="Collapse parameters window"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Quick Navigation Ribbon (Smooth scrolls to category without hiding others) */}
      <div className={`px-2.5 py-1.5 border-b shrink-0 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none ${
        isLight ? 'bg-zinc-100/70 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
      }`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 select-none pl-1">
          Jump:
        </span>
        {isTag ? (
          <>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-text')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-base')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Base
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-holes')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Holes
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-style')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Style
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-colors')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Colors
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-export')}
              className="px-2 py-0.5 rounded-lg font-bold whitespace-nowrap text-[#4B00F2] dark:text-[#855BFF] hover:bg-[#4B00F2]/10 transition-colors ml-auto"
            >
              {isUnlocked ? 'Download ↓' : 'Basket ↓'}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-dims')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Size
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-grid')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-structure')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Structure
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-label')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Label
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-colors')}
              className="px-2 py-0.5 rounded-lg font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Colors
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-export')}
              className="px-2 py-0.5 rounded-lg font-bold whitespace-nowrap text-[#4B00F2] dark:text-[#855BFF] hover:bg-[#4B00F2]/10 transition-colors ml-auto"
            >
              {isUnlocked ? 'Download ↓' : 'Basket ↓'}
            </button>
          </>
        )}
      </div>

      {/* 3. Vertically Aligned Continuous Scroll of ALL Parameter Categories */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scroll-smooth"
      >
        {isTag ? (
          // ==================== TAGS & PLATES VERTICAL FLOW ====================
          <>
            {/* CATEGORY 1: TEXT & TYPOGRAPHY */}
            <section id="sec-tag-text" className="space-y-4 pt-1">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Type className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  1. Text & Typography
                </h3>
              </div>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs">Primary Text Content</label>
                <input
                  type="text"
                  value={tagConfig.text}
                  onChange={(e) => onUpdateTagConfig({ text: e.target.value.toUpperCase() })}
                  placeholder="KEYS, ROOM 101, WORKSHOP..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs uppercase focus:outline-none focus:ring-1 ${
                    isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-900 border-zinc-700 focus:border-white'
                  }`}
                />
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Text Font Size</span>
                  <span className="font-mono font-bold">{tagConfig.fontSize} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepTag('fontSize', tagConfig.fontSize, -1, 6, 80, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={6}
                    max={80}
                    value={tagConfig.fontSize}
                    onChange={(e) => onUpdateTagConfig({ fontSize: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('fontSize', tagConfig.fontSize, 1, 6, 80, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Second Subtitle Line Toggle */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div>
                  <span className="font-bold text-xs block">Second Subtitle Line</span>
                  <span className="text-[11px] text-zinc-400 block">Add descriptor or phone number</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateTagConfig({ hasSecondLine: !tagConfig.hasSecondLine })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    tagConfig.hasSecondLine ? 'bg-[#4B00F2]' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    tagConfig.hasSecondLine ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {tagConfig.hasSecondLine && (
                <div className="space-y-3 pl-2.5 border-l-2 border-[#4B00F2]">
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs">Subtitle Text</label>
                    <input
                      type="text"
                      value={tagConfig.textLine2 || ''}
                      onChange={(e) => onUpdateTagConfig({ textLine2: e.target.value.toUpperCase() })}
                      placeholder="SUBTITLE / NUMBER..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs uppercase focus:outline-none focus:ring-1 ${
                        isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-900 border-zinc-700 focus:border-white'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">Subtitle Font Size</span>
                      <span className="font-mono font-bold">{tagConfig.fontSize2} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => stepTag('fontSize2', tagConfig.fontSize2, -1, 4, 40, 0)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min={4}
                        max={40}
                        value={tagConfig.fontSize2}
                        onChange={(e) => onUpdateTagConfig({ fontSize2: Number(e.target.value) })}
                        className="flex-1 accent-zinc-900 dark:accent-white"
                      />
                      <button
                        type="button"
                        onClick={() => stepTag('fontSize2', tagConfig.fontSize2, 1, 4, 40, 0)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Letter Fillet / Outline Smoothing */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Letter Curve Fillet</span>
                  <span className="font-mono font-bold">{(tagConfig.letterFillet || 0).toFixed(2)} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepTag('letterFillet', tagConfig.letterFillet || 0, -0.1, 0, 1.5, 2)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.05}
                    value={tagConfig.letterFillet || 0}
                    onChange={(e) => onUpdateTagConfig({ letterFillet: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('letterFillet', tagConfig.letterFillet || 0, 0.1, 0, 1.5, 2)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* CATEGORY 2: BASE GEOMETRY & FILLETS */}
            <section id="sec-tag-base" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  2. Base Geometry & Fillets
                </h3>
              </div>

              {/* Tag Shape Selector (excludes circle for door sign plates) */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs">Tag Base Outline Shape</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'rounded', label: 'Rounded Rect' },
                    { id: 'rectangle', label: 'Sharp Rect' },
                    { id: 'capsule', label: 'Capsule Oval' },
                    { id: 'chamfered', label: 'Chamfered' },
                    ...(!isDoorSignPlate ? [{ id: 'circle', label: 'Round Circle' }] : []),
                  ].map((shape) => {
                    const isSelected = tagConfig.shape === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => onUpdateTagConfig({ shape: shape.id as any })}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? isLight
                              ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                              : 'bg-white border-white text-zinc-950 shadow-sm'
                            : isLight
                            ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {shape.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Base Thickness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Base Plate Thickness</span>
                  <span className="font-mono font-bold">{tagConfig.baseThickness} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepTag('baseThickness', tagConfig.baseThickness, -0.4, 1.2, 10, 1)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={1.2}
                    max={10}
                    step={0.2}
                    value={tagConfig.baseThickness}
                    onChange={(e) => onUpdateTagConfig({ baseThickness: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('baseThickness', tagConfig.baseThickness, 0.4, 1.2, 10, 1)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Padding Margin */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Padding Margin Around Text</span>
                  <span className="font-mono font-bold">{tagConfig.padding} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepTag('padding', tagConfig.padding, -1, 2, 25, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={2}
                    max={25}
                    value={tagConfig.padding}
                    onChange={(e) => onUpdateTagConfig({ padding: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('padding', tagConfig.padding, 1, 2, 25, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Corner Fillet Radius */}
              {tagConfig.shape !== 'rectangle' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Corner Fillet Radius</span>
                    <span className="font-mono font-bold">{tagConfig.filletRadius} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => stepTag('filletRadius', tagConfig.filletRadius, -1, 1, 30, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={tagConfig.filletRadius}
                      onChange={(e) => onUpdateTagConfig({ filletRadius: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      type="button"
                      onClick={() => stepTag('filletRadius', tagConfig.filletRadius, 1, 1, 30, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* CATEGORY 3: MOUNTING HOLES */}
            <section id="sec-tag-holes" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <CircleDot className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  3. Mounting Holes
                </h3>
              </div>

              {/* Hole Placement */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs">Hole Placement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'top', label: 'Top' },
                    { id: 'left', label: 'Left' },
                    { id: 'right', label: 'Right' },
                    { id: 'both-ends', label: 'Both Ends' },
                    { id: 'none', label: 'No Hole' },
                  ].map((p) => {
                    const isSelected = tagConfig.holePlacement === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onUpdateTagConfig({ holePlacement: p.id as any })}
                        className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? isLight
                              ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                              : 'bg-white border-white text-zinc-950 shadow-sm'
                            : isLight
                            ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {tagConfig.holePlacement !== 'none' && (
                <>
                  {/* Hole Diameter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">Hole Diameter</span>
                      <span className="font-mono font-bold">{tagConfig.holeDiameter} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => stepTag('holeDiameter', tagConfig.holeDiameter, -0.5, 2, 12, 1)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min={2}
                        max={12}
                        step={0.5}
                        value={tagConfig.holeDiameter}
                        onChange={(e) => onUpdateTagConfig({ holeDiameter: Number(e.target.value) })}
                        className="flex-1 accent-zinc-900 dark:accent-white"
                      />
                      <button
                        type="button"
                        onClick={() => stepTag('holeDiameter', tagConfig.holeDiameter, 0.5, 2, 12, 1)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hole Margin */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">Edge Clearance Margin</span>
                      <span className="font-mono font-bold">{tagConfig.holeEdgeMargin} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => stepTag('holeEdgeMargin', tagConfig.holeEdgeMargin, -0.5, 2, 20, 1)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min={2}
                        max={20}
                        step={0.5}
                        value={tagConfig.holeEdgeMargin}
                        onChange={(e) => onUpdateTagConfig({ holeEdgeMargin: Number(e.target.value) })}
                        className="flex-1 accent-zinc-900 dark:accent-white"
                      />
                      <button
                        type="button"
                        onClick={() => stepTag('holeEdgeMargin', tagConfig.holeEdgeMargin, 0.5, 2, 20, 1)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* CATEGORY 4: 3D STYLE & RELIEF */}
            <section id="sec-tag-style" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  4. 3D Style & Relief
                </h3>
              </div>

              {/* Tag Style */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs">Text 3D Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'embossed', label: 'Embossed (Raised)' },
                    { id: 'debossed', label: 'Debossed (Carved)' },
                    { id: 'cutout', label: 'Cutout (Through)' },
                  ].map((s) => {
                    const isSelected = tagConfig.tagStyle === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onUpdateTagConfig({ tagStyle: s.id as any })}
                        className={`py-2 px-1.5 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                          isSelected
                            ? isLight
                              ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                              : 'bg-white border-white text-zinc-950 shadow-sm'
                            : isLight
                            ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Relief Height */}
              {tagConfig.tagStyle !== 'cutout' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Text Relief Height / Depth</span>
                    <span className="font-mono font-bold">{tagConfig.reliefHeight} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => stepTag('reliefHeight', tagConfig.reliefHeight, -0.2, 0.6, 6, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={0.6}
                      max={6}
                      step={0.2}
                      value={tagConfig.reliefHeight}
                      onChange={(e) => onUpdateTagConfig({ reliefHeight: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      type="button"
                      onClick={() => stepTag('reliefHeight', tagConfig.reliefHeight, 0.2, 0.6, 6, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* CATEGORY 5: MATERIAL & COLOR PALETTE */}
            <section id="sec-tag-colors" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  5. Material & Colors
                </h3>
              </div>

              {/* Base Color Swatches */}
              <div className="space-y-2">
                <label className="font-bold text-xs">Plate Solid Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateTagConfig({ baseColor: c.value })}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${
                        tagConfig.baseColor === c.value ? 'scale-110 shadow-md ring-2 ring-[#4B00F2]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Text Accent Color */}
              <div className="space-y-2">
                <label className="font-bold text-xs">Text & Contrast Accent Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateTagConfig({ textColor: c.value })}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${
                        tagConfig.textColor === c.value ? 'scale-110 shadow-md ring-2 ring-[#4B00F2]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* CATEGORY 6: WATERTIGHT 3D SLICER SPECIFICATIONS */}
            <section className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  6. 3D Slicer Specifications
                </h3>
              </div>

              {tagDimensions && (
                <div className={`p-3.5 rounded-2xl border space-y-2.5 text-xs font-mono ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Dimensions:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {tagDimensions.totalLength} × {tagDimensions.totalWidth} × {tagDimensions.totalHeight} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Volume / Weight:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {tagDimensions.volumeCm3} cm³ (~{tagDimensions.weightGramsPLA}g PLA)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Print Layers (0.2mm):</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      ~{tagDimensions.estimatedLayers} layers (~{tagDimensions.estimatedPrintMinutes} min)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-emerald-500 text-[11px] font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Watertight 2-Manifold Mesh (Slicer-Ready)</span>
                  </div>
                </div>
              )}
            </section>

            {/* CATEGORY 7: EXPORT / ADD TO BASKET ACTION */}
            <section id="sec-tag-export" className="pt-3 pb-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${
                  isUnlocked ? 'bg-[#4B00F2]' : 'bg-[#F26C65]'
                }`}>
                  {isUnlocked ? <Download className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  7. {isUnlocked ? 'Download 3D Model' : 'Order Commercial License'}
                </h3>
              </div>

              {!isUnlocked ? (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-[#F26C65]/10 border border-[#F26C65]/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#F26C65]">
                      <span>Commercial CAD License</span>
                      <span>${(activeTemplate.price > 0 ? activeTemplate.price : 3.50).toFixed(2)} CAD</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                      Includes STEP solid model + watertight binary STL delivered instantly to your account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onPurchaseTemplate}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 bg-[#F26C65] hover:bg-[#D9554E] text-white transition-all cursor-pointer active:scale-95 shadow-[#F26C65]/25"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Add to Basket · ${(activeTemplate.price > 0 ? activeTemplate.price : 3.50).toFixed(2)} CAD</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onExportTagSTL(true)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 bg-[#4B00F2] hover:bg-[#3D00C6] text-white transition-all cursor-pointer active:scale-95 shadow-[#4B00F2]/25"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Download Free STL (Watertight)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onExportTagMultiPart()}
                    className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                      isLight ? 'hover:bg-zinc-100 border-zinc-300 text-zinc-800' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[#4B00F2]" />
                    <span>Download Dual-Color Multi-Part STLs</span>
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          // ==================== BOXES & ORGANIZERS VERTICAL FLOW ====================
          <>
            {/* CATEGORY 1: DIMENSIONS & OUTER SHELL */}
            <section id="sec-box-dims" className="space-y-4 pt-1">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  1. Dimensions & Outer Shell
                </h3>
              </div>

              {/* Length X */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Length (X axis)</span>
                  <span className="font-mono font-bold">{boxConfig.width} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepBox('width', boxConfig.width, -5, 40, 300, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={40}
                    max={300}
                    value={boxConfig.width}
                    onChange={(e) => onUpdateBoxConfig({ width: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('width', boxConfig.width, 5, 40, 300, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Width / Depth Y */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Width / Depth (Y axis)</span>
                  <span className="font-mono font-bold">{boxConfig.depth} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepBox('depth', boxConfig.depth, -5, 40, 250, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={40}
                    max={250}
                    value={boxConfig.depth}
                    onChange={(e) => onUpdateBoxConfig({ depth: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('depth', boxConfig.depth, 5, 40, 250, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Height Z */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Total Height (Z axis)</span>
                  <span className="font-mono font-bold">{boxConfig.height} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepBox('height', boxConfig.height, -5, 20, 150, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={20}
                    max={150}
                    value={boxConfig.height}
                    onChange={(e) => onUpdateBoxConfig({ height: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('height', boxConfig.height, 5, 20, 150, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Outer Corner Fillet */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Outer Corner Fillet</span>
                  <span className="font-mono font-bold">{boxConfig.filletRadius} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepBox('filletRadius', boxConfig.filletRadius, -1, 1, 25, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={boxConfig.filletRadius}
                    onChange={(e) => onUpdateBoxConfig({ filletRadius: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('filletRadius', boxConfig.filletRadius, 1, 1, 25, 0)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* CATEGORY 2: COMPARTMENT GRID */}
            <section id="sec-box-grid" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Grid3X3 className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  2. Compartment Grid
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Columns */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Columns</span>
                    <span className="font-mono font-bold">{boxConfig.gridColumns}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepBox('gridColumns', boxConfig.gridColumns, -1, 1, 6, 0)}
                      className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-xs">{boxConfig.gridColumns}</span>
                    <button
                      type="button"
                      onClick={() => stepBox('gridColumns', boxConfig.gridColumns, 1, 1, 6, 0)}
                      className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Rows */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Rows</span>
                    <span className="font-mono font-bold">{boxConfig.gridRows}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepBox('gridRows', boxConfig.gridRows, -1, 1, 6, 0)}
                      className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-xs">{boxConfig.gridRows}</span>
                    <button
                      type="button"
                      onClick={() => stepBox('gridRows', boxConfig.gridRows, 1, 1, 6, 0)}
                      className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider Thickness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Internal Divider Thickness</span>
                  <span className="font-mono font-bold">{boxConfig.dividerThickness} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepBox('dividerThickness', boxConfig.dividerThickness, -0.4, 1.2, 6, 1)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={1.2}
                    max={6}
                    step={0.2}
                    value={boxConfig.dividerThickness}
                    onChange={(e) => onUpdateBoxConfig({ dividerThickness: Number(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('dividerThickness', boxConfig.dividerThickness, 0.4, 1.2, 6, 1)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* CATEGORY 3: STRUCTURE & MODULARITY */}
            <section id="sec-box-structure" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  3. Structure & Stacking
                </h3>
              </div>

              {/* Stacking Lip Toggle */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div>
                  <span className="font-bold text-xs block">Interlocking Stacking Lip</span>
                  <span className="text-[11px] text-zinc-400 block">Enables stable vertical stacking</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateBoxConfig({ hasStackingLip: !boxConfig.hasStackingLip })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    boxConfig.hasStackingLip ? 'bg-[#4B00F2]' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    boxConfig.hasStackingLip ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Finger Scoop Toggle */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div>
                  <span className="font-bold text-xs block">Ergonomic Finger Scoops</span>
                  <span className="text-[11px] text-zinc-400 block">Curved bottom for easy retrieval</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateBoxConfig({ hasScoop: !boxConfig.hasScoop })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    boxConfig.hasScoop ? 'bg-[#4B00F2]' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    boxConfig.hasScoop ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </section>

            {/* CATEGORY 4: FRONT LABEL & TYPOGRAPHY */}
            <section id="sec-box-label" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Type className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  4. Front Label & Typography
                </h3>
              </div>

              {/* Enable Label Toggle */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div>
                  <span className="font-bold text-xs block">Custom Front Surface Label</span>
                  <span className="text-[11px] text-zinc-400 block">Embossed 3D text bounded within front wall</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateBoxConfig({ hasLabel: !boxConfig.hasLabel })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    boxConfig.hasLabel ? 'bg-[#4B00F2]' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    boxConfig.hasLabel ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {boxConfig.hasLabel && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs">Label Text</label>
                    <input
                      type="text"
                      value={boxConfig.labelText}
                      onChange={(e) => onUpdateBoxConfig({ labelText: e.target.value.toUpperCase() })}
                      placeholder="HEX BOLTS, RESISTORS, EDC..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs uppercase focus:outline-none focus:ring-1 ${
                        isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-900 border-zinc-700 focus:border-white'
                      }`}
                    />
                  </div>

                  {/* Position of Text Parameter */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs">Text Alignment on Front Surface</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'front_left', label: 'Left' },
                        { id: 'front_center', label: 'Center' },
                        { id: 'front_right', label: 'Right' },
                        { id: 'front_top', label: 'Top' },
                        { id: 'front_bottom', label: 'Bottom' },
                      ].map((pos) => {
                        const isSelected = (boxConfig.textPosition || 'front_center') === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => onUpdateBoxConfig({ textPosition: pos.id as any })}
                            className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                              isSelected
                                ? isLight
                                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                                  : 'bg-white border-white text-zinc-950 shadow-sm'
                                : isLight
                                ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
                            }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">Label Font Size</span>
                      <span className="font-mono font-bold">{boxConfig.labelFontSize} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => stepBox('labelFontSize', boxConfig.labelFontSize, -1, 6, 30, 0)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min={6}
                        max={30}
                        value={boxConfig.labelFontSize}
                        onChange={(e) => onUpdateBoxConfig({ labelFontSize: Number(e.target.value) })}
                        className="flex-1 accent-zinc-900 dark:accent-white"
                      />
                      <button
                        type="button"
                        onClick={() => stepBox('labelFontSize', boxConfig.labelFontSize, 1, 6, 30, 0)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* CATEGORY 5: MATERIAL & COLOR PALETTE */}
            <section id="sec-box-colors" className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  5. Material & Colors
                </h3>
              </div>

              {/* Primary Box Solid Color */}
              <div className="space-y-2">
                <label className="font-bold text-xs">Organizer Shell Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateBoxConfig({ primaryColor: c.value })}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${
                        boxConfig.primaryColor === c.value ? 'scale-110 shadow-md ring-2 ring-[#4B00F2]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Accent Color for Label */}
              <div className="space-y-2">
                <label className="font-bold text-xs">Embossed Label Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateBoxConfig({ accentColor: c.value })}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${
                        boxConfig.accentColor === c.value ? 'scale-110 shadow-md ring-2 ring-[#4B00F2]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* CATEGORY 6: WATERTIGHT 3D SLICER SPECIFICATIONS */}
            <section className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  6. 3D Slicer Specifications
                </h3>
              </div>

              {boxDimensions && (
                <div className={`p-3.5 rounded-2xl border space-y-2.5 text-xs font-mono ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Dimensions:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {boxDimensions.totalLength} × {boxDimensions.totalWidth} × {boxDimensions.totalHeight} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Compartments:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {boxDimensions.compartmentCount} pockets ({boxDimensions.compartmentWidth} × {boxDimensions.compartmentDepth} mm)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Volume / Weight:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {boxDimensions.volumeCm3} cm³ (~{boxDimensions.weightGramsPLA}g PLA)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-emerald-500 text-[11px] font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Watertight 2-Manifold Mesh (Slicer-Ready)</span>
                  </div>
                </div>
              )}
            </section>

            {/* CATEGORY 7: EXPORT / ADD TO BASKET ACTION */}
            <section id="sec-box-export" className="pt-3 pb-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${
                  isUnlocked ? 'bg-[#4B00F2]' : 'bg-[#F26C65]'
                }`}>
                  {isUnlocked ? <Download className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  7. {isUnlocked ? 'Download 3D Model' : 'Order Commercial License'}
                </h3>
              </div>

              {!isUnlocked ? (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-[#F26C65]/10 border border-[#F26C65]/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#F26C65]">
                      <span>Commercial CAD License</span>
                      <span>${(activeTemplate.price > 0 ? activeTemplate.price : 3.50).toFixed(2)} CAD</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                      Includes STEP solid CAD model + watertight binary STL delivered instantly to your email.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onPurchaseTemplate}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 bg-[#F26C65] hover:bg-[#D9554E] text-white transition-all cursor-pointer active:scale-95 shadow-[#F26C65]/25"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Add to Basket · ${(activeTemplate.price > 0 ? activeTemplate.price : 3.50).toFixed(2)} CAD</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onExportBoxSTL(true)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 bg-[#4B00F2] hover:bg-[#3D00C6] text-white transition-all cursor-pointer active:scale-95 shadow-[#4B00F2]/25"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Download Free STL (Watertight)</span>
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* 4. Bottom Quick Status Footer (Above the page footage) */}
      <div className={`px-4 py-2.5 border-t shrink-0 flex items-center justify-between text-[11px] font-mono ${
        isLight ? 'bg-zinc-50/90 border-zinc-200 text-zinc-600' : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
      }`}>
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-zinc-500">Size:</span>
          {isTag && tagDimensions && (
            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {tagDimensions.totalLength} × {tagDimensions.totalWidth} × {tagDimensions.totalHeight} mm
            </span>
          )}
          {!isTag && boxDimensions && (
            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {boxDimensions.totalLength} × {boxDimensions.totalWidth} × {boxDimensions.totalHeight} mm
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isUnlocked) {
              onPurchaseTemplate();
            } else {
              if (isTag) onExportTagSTL(true);
              else onExportBoxSTL(true);
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 shrink-0 shadow-sm ${
            !isUnlocked ? 'bg-[#F26C65] hover:bg-[#D9554E]' : 'bg-[#4B00F2] hover:bg-[#3D00C6]'
          }`}
        >
          {!isUnlocked ? 'Add to Basket' : 'Download STL'}
        </button>
      </div>
    </aside>
  );
};
