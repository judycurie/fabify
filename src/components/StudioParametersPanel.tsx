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
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  ShoppingBag, 
  Layers,
  Grid3X3,
  SlidersHorizontal,
  Ruler,
  Check
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
  
  // E-commerce & CAD Export
  onPurchaseTemplate: (tierId?: 'tier1_static' | 'tier2_subscription') => void;
  onExportSTEP?: () => void;
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
  onExportSTEP,
}) => {
  const isLight = theme === 'light';
  const isTag = activeConfigurator === 'tag';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCommercialTier, setSelectedCommercialTier] = useState<'tier1_static' | 'tier2_subscription'>('tier1_static');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Identify template profile to dynamically adjust parameter ranges
  const templateNameLower = activeTemplate.name.toLowerCase();
  const templateIdLower = activeTemplate.id.toLowerCase();

  const isDoorSignPlate = 
    templateNameLower.includes('plate') || 
    templateNameLower.includes('sign') || 
    templateNameLower.includes('door') || 
    templateNameLower.includes('nameplate') ||
    templateNameLower.includes('stencil');

  const isKeyTag = 
    templateNameLower.includes('key') || 
    templateIdLower.includes('keychain') ||
    templateNameLower.includes('tag keys');

  const isPetTag = templateNameLower.includes('pet');
  const isCableTag = templateNameLower.includes('cable');

  // Dynamic Parameter Ranges for Tags & Plates
  const tagRanges = React.useMemo(() => {
    if (isDoorSignPlate) {
      return {
        profileName: 'Architectural Door Sign Plate',
        minLenLabel: 'Starts at ~10 cm (100 mm)',
        fontSize: { min: 8.0, max: 32.0, step: 0.5 },
        fontSize2: { min: 4.5, max: 18.0, step: 0.5 },
        padding: { min: 5.0, max: 25.0, step: 0.5 },
        filletRadius: { min: 2.0, max: 20.0, step: 0.5 },
        baseThickness: { min: 2.4, max: 8.0, step: 0.2 },
        edgeBevel: { min: 0.2, max: 2.0, step: 0.05 },
        holeDiameter: { min: 3.5, max: 8.0, step: 0.5 },
      };
    }
    if (isKeyTag) {
      return {
        profileName: 'Pocket Keyring Tag',
        minLenLabel: 'Calibrated: 2.5 cm to 8 cm',
        fontSize: { min: 4.5, max: 11.5, step: 0.2 },
        fontSize2: { min: 3.0, max: 6.5, step: 0.2 },
        padding: { min: 1.5, max: 6.0, step: 0.2 },
        filletRadius: { min: 1.0, max: 7.0, step: 0.2 },
        baseThickness: { min: 1.6, max: 4.0, step: 0.2 },
        edgeBevel: { min: 0.1, max: 0.8, step: 0.05 },
        holeDiameter: { min: 2.5, max: 5.5, step: 0.2 },
      };
    }
    if (isPetTag) {
      return {
        profileName: 'Collar Pet Tag',
        minLenLabel: 'Calibrated: 2.5 cm to 4.5 cm',
        fontSize: { min: 4.0, max: 10.0, step: 0.2 },
        fontSize2: { min: 3.0, max: 6.0, step: 0.2 },
        padding: { min: 2.0, max: 6.0, step: 0.2 },
        filletRadius: { min: 1.0, max: 6.0, step: 0.2 },
        baseThickness: { min: 1.8, max: 4.0, step: 0.2 },
        edgeBevel: { min: 0.1, max: 0.6, step: 0.05 },
        holeDiameter: { min: 2.5, max: 5.0, step: 0.2 },
      };
    }
    // General tag (Travel, Cable, Industrial)
    return {
      profileName: 'Parametric Solid Tag',
      minLenLabel: 'Standard Multi-scale Tag',
      fontSize: { min: 4.5, max: 18.0, step: 0.5 },
      fontSize2: { min: 3.5, max: 12.0, step: 0.5 },
      padding: { min: 2.0, max: 12.0, step: 0.5 },
      filletRadius: { min: 1.0, max: 12.0, step: 0.5 },
      baseThickness: { min: 1.6, max: 5.5, step: 0.2 },
      edgeBevel: { min: 0.1, max: 1.2, step: 0.05 },
      holeDiameter: { min: 2.5, max: 6.5, step: 0.5 },
    };
  }, [isDoorSignPlate, isKeyTag, isPetTag]);

  // Ensure door sign plate does NOT have circle option and starts with at least 100mm min length
  React.useEffect(() => {
    if (isDoorSignPlate) {
      if (tagConfig.shape === 'circle') {
        onUpdateTagConfig({ shape: 'rounded', minBaseLength: 100.0 });
      } else if (!tagConfig.minBaseLength || tagConfig.minBaseLength < 100) {
        onUpdateTagConfig({ minBaseLength: 100.0 });
      }
    } else if (isKeyTag) {
      if (!tagConfig.minBaseLength || tagConfig.minBaseLength !== 25.0 || tagConfig.maxBaseLength !== 80.0) {
        onUpdateTagConfig({ minBaseLength: 25.0, maxBaseLength: 80.0 });
      }
    }
  }, [isDoorSignPlate, isKeyTag, tagConfig.shape, tagConfig.minBaseLength, tagConfig.maxBaseLength, onUpdateTagConfig]);

  // Stepper helper for tag config with contextual bounds
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Collapsed Minimal Handle on Right Edge
  if (isCollapsed) {
    return (
      <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl shadow-xl border backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isLight
              ? 'bg-white/95 border-zinc-300 text-zinc-950 shadow-zinc-300/60'
              : 'bg-[#18181c]/95 border-zinc-700 text-white shadow-black'
          }`}
          title="Open Parameters Panel"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-950 dark:text-white" />
          <span className="text-[11.5px] font-bold font-mono tracking-tight text-zinc-950 dark:text-white">Parameters</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="3D Studio Parameters Window"
      className={`absolute right-2 sm:right-3 top-2 sm:top-2.5 bottom-2 sm:bottom-2.5 z-20 w-[calc(100vw-16px)] sm:w-[305px] max-w-[315px] rounded-2xl border shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-200 ${
        isLight
          ? 'bg-white/98 border-zinc-300 text-zinc-950 shadow-zinc-400/25'
          : 'bg-[#121216]/98 border-zinc-700 text-white shadow-black/80'
      }`}
    >
      {/* 1. Header (Black & White with bright, readable labels in dark mode) */}
      <div className={`px-3 py-2 border-b flex items-center justify-between shrink-0 ${
        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181c] border-zinc-700'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <span className="font-bold text-xs truncate tracking-tight text-zinc-950 dark:text-white">
            {activeTemplate.name}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 shrink-0">
            {isTag ? (isDoorSignPlate ? 'DOOR PLATE' : (isKeyTag ? 'KEY TAG' : 'SOLID TAG')) : 'ORGANIZER'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className={`p-1 rounded-lg border text-xs transition-colors shrink-0 ${
            isLight
              ? 'hover:bg-zinc-200 border-zinc-300 text-zinc-800'
              : 'hover:bg-zinc-800 border-zinc-600 text-zinc-100 hover:text-white'
          }`}
          title="Collapse parameters"
        >
          <ChevronRight className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
        </button>
      </div>

      {/* 2. Quick Jump Ribbon (High contrast, bright text in dark mode) */}
      <div className={`px-2 py-1.5 border-b shrink-0 flex items-center gap-1 overflow-x-auto text-[10px] scrollbar-none ${
        isLight ? 'bg-zinc-100/70 border-zinc-200' : 'bg-[#16161a] border-zinc-800'
      }`}>
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 shrink-0 select-none pl-0.5">
          Jump:
        </span>
        {isTag ? (
          <>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-text')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-base')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Base
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-holes')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Holes
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-style')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Style
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-colors')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Colors
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-tag-export')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-950 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ml-auto"
            >
              Export ↓
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-dims')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Dims
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-grid')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-structure')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Lip
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-label')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Label
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-colors')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              Colors
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sec-box-export')}
              className="px-1.5 py-0.5 rounded font-bold text-zinc-950 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ml-auto"
            >
              Export ↓
            </button>
          </>
        )}
      </div>

      {/* 3. Vertically Aligned Continuous Scroll of ALL Parameters (All fonts bright & readable in dark mode) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-2.5 space-y-3.5 scroll-smooth"
      >
        {isTag ? (
          // ==================== TAGS & PLATES FLOW ====================
          <>
            {/* 1. TEXT & TYPOGRAPHY */}
            <section id="sec-tag-text" className="space-y-2 pt-0.5">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                  <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                    1. Text & Letters
                  </h3>
                </div>
                <span className="text-[9.5px] font-mono text-zinc-600 dark:text-zinc-300 font-semibold">
                  {tagRanges.minLenLabel}
                </span>
              </div>

              {/* Text Input */}
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-zinc-900 dark:text-white">Text Content</label>
                <input
                  type="text"
                  value={tagConfig.text}
                  onChange={(e) => onUpdateTagConfig({ text: e.target.value.toUpperCase() })}
                  placeholder="TAG NAME..."
                  className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs uppercase font-bold focus:outline-none focus:ring-1 ${
                    isLight 
                      ? 'bg-white border-zinc-300 text-zinc-950 focus:border-zinc-950' 
                      : 'bg-zinc-900 border-zinc-600 text-white focus:border-white'
                  }`}
                />
              </div>

              {/* Font Size (Contextual range: 4.5-11.5 for key tag, 8-32 for door sign plate) */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Font Size</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{tagConfig.fontSize} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTag('fontSize', tagConfig.fontSize, -tagRanges.fontSize.step, tagRanges.fontSize.min, tagRanges.fontSize.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={tagRanges.fontSize.min}
                    max={tagRanges.fontSize.max}
                    step={tagRanges.fontSize.step}
                    value={tagConfig.fontSize}
                    onChange={(e) => onUpdateTagConfig({ fontSize: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('fontSize', tagConfig.fontSize, tagRanges.fontSize.step, tagRanges.fontSize.min, tagRanges.fontSize.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Distance Between Letters (Letter Spacing) */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Distance Between Letters</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{(tagConfig.letterSpacing || 0).toFixed(1)} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTag('letterSpacing', tagConfig.letterSpacing || 0, -0.2, 0, 8, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    step={0.1}
                    value={tagConfig.letterSpacing || 0}
                    onChange={(e) => onUpdateTagConfig({ letterSpacing: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('letterSpacing', tagConfig.letterSpacing || 0, 0.2, 0, 8, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Edge Fillet Radius for the Letters */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Letter Edge Fillet</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{(tagConfig.letterFillet || 0).toFixed(2)} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTag('letterFillet', tagConfig.letterFillet || 0, -0.05, 0, 1.5, 2)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.05}
                    value={tagConfig.letterFillet || 0}
                    onChange={(e) => onUpdateTagConfig({ letterFillet: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('letterFillet', tagConfig.letterFillet || 0, 0.05, 0, 1.5, 2)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Second Subtitle Line Toggle */}
              <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-700'
              }`}>
                <div>
                  <span className="font-bold text-[11px] text-zinc-950 dark:text-white block">Second Subtitle Line</span>
                  <span className="text-[9.5px] text-zinc-600 dark:text-zinc-300 font-medium block">Extra text line</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateTagConfig({ hasSecondLine: !tagConfig.hasSecondLine })}
                  className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                    tagConfig.hasSecondLine ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    tagConfig.hasSecondLine 
                      ? 'translate-x-3.5 bg-white dark:bg-zinc-950' 
                      : 'translate-x-0 bg-white'
                  }`} />
                </button>
              </div>

              {tagConfig.hasSecondLine && (
                <div className="space-y-1.5 pl-1.5 border-l-2 border-zinc-950 dark:border-white">
                  <div className="space-y-0.5">
                    <label className="text-[10.5px] font-bold text-zinc-900 dark:text-white">Subtitle Text</label>
                    <input
                      type="text"
                      value={tagConfig.textLine2 || ''}
                      onChange={(e) => onUpdateTagConfig({ textLine2: e.target.value.toUpperCase() })}
                      placeholder="SUBTITLE..."
                      className={`w-full px-2 py-1 rounded-lg border font-mono text-xs uppercase font-bold focus:outline-none focus:ring-1 ${
                        isLight 
                          ? 'bg-white border-zinc-300 text-zinc-950 focus:border-zinc-950' 
                          : 'bg-zinc-900 border-zinc-600 text-white focus:border-white'
                      }`}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-zinc-900 dark:text-white">Subtitle Size</span>
                      <span className="font-mono font-black text-zinc-950 dark:text-white">{tagConfig.fontSize2} mm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => stepTag('fontSize2', tagConfig.fontSize2, -0.5, tagRanges.fontSize2.min, tagRanges.fontSize2.max, 1)}
                        className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        type="range"
                        min={tagRanges.fontSize2.min}
                        max={tagRanges.fontSize2.max}
                        step={tagRanges.fontSize2.step}
                        value={tagConfig.fontSize2}
                        onChange={(e) => onUpdateTagConfig({ fontSize2: Number(e.target.value) })}
                        className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                      />
                      <button
                        type="button"
                        onClick={() => stepTag('fontSize2', tagConfig.fontSize2, 0.5, tagRanges.fontSize2.min, tagRanges.fontSize2.max, 1)}
                        className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 2. BASE GEOMETRY & OUTLINE FILLETS */}
            <section id="sec-tag-base" className="space-y-2 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Box className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  2. Outline & Base Fillets
                </h3>
              </div>

              {/* Outline / Base Corner Fillet Radius */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Outline Corner Fillet</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{tagConfig.filletRadius} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTag('filletRadius', tagConfig.filletRadius, -tagRanges.filletRadius.step, tagRanges.filletRadius.min, tagRanges.filletRadius.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={tagRanges.filletRadius.min}
                    max={tagRanges.filletRadius.max}
                    step={tagRanges.filletRadius.step}
                    value={tagConfig.filletRadius}
                    onChange={(e) => onUpdateTagConfig({ filletRadius: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('filletRadius', tagConfig.filletRadius, tagRanges.filletRadius.step, tagRanges.filletRadius.min, tagRanges.filletRadius.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Edge Fillet Radius for Outline */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Outline Edge Bevel / Fillet</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{(tagConfig.edgeBevel || 0).toFixed(2)} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTag('edgeBevel', tagConfig.edgeBevel || 0, -tagRanges.edgeBevel.step, tagRanges.edgeBevel.min, tagRanges.edgeBevel.max, 2)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={tagRanges.edgeBevel.min}
                    max={tagRanges.edgeBevel.max}
                    step={tagRanges.edgeBevel.step}
                    value={tagConfig.edgeBevel || 0}
                    onChange={(e) => onUpdateTagConfig({ edgeBevel: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('edgeBevel', tagConfig.edgeBevel || 0, tagRanges.edgeBevel.step, tagRanges.edgeBevel.min, tagRanges.edgeBevel.max, 2)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Base Thickness */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Plate Thickness</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{tagConfig.baseThickness} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTag('baseThickness', tagConfig.baseThickness, -tagRanges.baseThickness.step, tagRanges.baseThickness.min, tagRanges.baseThickness.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={tagRanges.baseThickness.min}
                    max={tagRanges.baseThickness.max}
                    step={tagRanges.baseThickness.step}
                    value={tagConfig.baseThickness}
                    onChange={(e) => onUpdateTagConfig({ baseThickness: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('baseThickness', tagConfig.baseThickness, tagRanges.baseThickness.step, tagRanges.baseThickness.min, tagRanges.baseThickness.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Border Margin (Padding) */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Border Margin (Padding)</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{tagConfig.padding} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTag('padding', tagConfig.padding, -tagRanges.padding.step, tagRanges.padding.min, tagRanges.padding.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={tagRanges.padding.min}
                    max={tagRanges.padding.max}
                    step={tagRanges.padding.step}
                    value={tagConfig.padding}
                    onChange={(e) => onUpdateTagConfig({ padding: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepTag('padding', tagConfig.padding, tagRanges.padding.step, tagRanges.padding.min, tagRanges.padding.max, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* 3. MOUNTING HOLES */}
            <section id="sec-tag-holes" className="space-y-2 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <CircleDot className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  3. Mounting Holes
                </h3>
              </div>

              {/* Hole Placement */}
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-zinc-900 dark:text-white">Placement</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'top', label: 'Top' },
                    { id: 'left', label: 'Left' },
                    { id: 'right', label: 'Right' },
                    { id: 'both-ends', label: 'Both' },
                    { id: 'none', label: 'None' },
                  ].map((p) => {
                    const isSelected = tagConfig.holePlacement === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onUpdateTagConfig({ holePlacement: p.id as any })}
                        className={`py-1.5 px-1 rounded-md border text-[10px] font-bold transition-all ${
                          isSelected
                            ? isLight
                              ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                              : 'bg-white border-white text-zinc-950 shadow-xs'
                            : isLight
                            ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-300 text-zinc-900'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {tagConfig.holePlacement !== 'none' && (
                <div className="space-y-1">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-zinc-900 dark:text-white">Hole Diameter</span>
                      <span className="font-mono font-black text-zinc-950 dark:text-white">{tagConfig.holeDiameter} mm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => stepTag('holeDiameter', tagConfig.holeDiameter, -tagRanges.holeDiameter.step, tagRanges.holeDiameter.min, tagRanges.holeDiameter.max, 1)}
                        className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        type="range"
                        min={tagRanges.holeDiameter.min}
                        max={tagRanges.holeDiameter.max}
                        step={tagRanges.holeDiameter.step}
                        value={tagConfig.holeDiameter}
                        onChange={(e) => onUpdateTagConfig({ holeDiameter: Number(e.target.value) })}
                        className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                      />
                      <button
                        type="button"
                        onClick={() => stepTag('holeDiameter', tagConfig.holeDiameter, tagRanges.holeDiameter.step, tagRanges.holeDiameter.min, tagRanges.holeDiameter.max, 1)}
                        className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 4. 3D STYLE & STENCIL GAP */}
            <section id="sec-tag-style" className="space-y-2 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Palette className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  4. 3D Profile & Style
                </h3>
              </div>

              {/* Tag Style */}
              <div className="space-y-0.5">
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'embossed', label: 'Raised' },
                    { id: 'debossed', label: 'Carved' },
                    { id: 'cutout', label: 'Cutout' },
                  ].map((s) => {
                    const isSelected = tagConfig.tagStyle === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onUpdateTagConfig({ tagStyle: s.id as any })}
                        className={`py-1.5 px-1 rounded-md border text-[10px] font-bold text-center transition-all ${
                          isSelected
                            ? isLight
                              ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                              : 'bg-white border-white text-zinc-950 shadow-xs'
                            : isLight
                            ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-300 text-zinc-900'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-100'
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
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-zinc-900 dark:text-white">Relief Depth</span>
                    <span className="font-mono font-black text-zinc-950 dark:text-white">{tagConfig.reliefHeight} mm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepTag('reliefHeight', tagConfig.reliefHeight, -0.2, 0.6, 6, 1)}
                      className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <input
                      type="range"
                      min={0.6}
                      max={6}
                      step={0.2}
                      value={tagConfig.reliefHeight}
                      onChange={(e) => onUpdateTagConfig({ reliefHeight: Number(e.target.value) })}
                      className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                    />
                    <button
                      type="button"
                      onClick={() => stepTag('reliefHeight', tagConfig.reliefHeight, 0.2, 0.6, 6, 1)}
                      className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Min Gap in Cutout Stencil Font */}
              {tagConfig.tagStyle === 'cutout' && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-zinc-900 dark:text-white">Stencil Bridge Gap</span>
                      <span className="font-mono font-black text-zinc-950 dark:text-white">{(tagConfig.stencilGap || 1.0).toFixed(1)} mm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => stepTag('stencilGap', tagConfig.stencilGap || 1.0, -0.1, 0.6, 5.0, 1)}
                        className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        type="range"
                        min={0.6}
                        max={5.0}
                        step={0.1}
                        value={tagConfig.stencilGap || 1.0}
                        onChange={(e) => onUpdateTagConfig({ stencilGap: Number(e.target.value) })}
                        className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                      />
                      <button
                        type="button"
                        onClick={() => stepTag('stencilGap', tagConfig.stencilGap || 1.0, 0.1, 0.6, 5.0, 1)}
                        className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-700'
                  }`}>
                    <div>
                      <span className="font-bold text-[11px] text-zinc-950 dark:text-white block">Stencil Bridges</span>
                      <span className="text-[9.5px] text-zinc-600 dark:text-zinc-300 font-medium block">Bridge islands</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateTagConfig({ stencilBridges: !tagConfig.stencilBridges })}
                      className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                        tagConfig.stencilBridges ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full transition-transform ${
                        tagConfig.stencilBridges 
                          ? 'translate-x-3.5 bg-white dark:bg-zinc-950' 
                          : 'translate-x-0 bg-white'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 5. COLORS */}
            <section id="sec-tag-colors" className="space-y-2 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Palette className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  5. Materials & Colors
                </h3>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">Base Color</label>
                <div className="grid grid-cols-5 gap-1">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateTagConfig({ baseColor: c.value })}
                      className={`h-4.5 w-full rounded border border-zinc-300 dark:border-zinc-600 transition-all ${
                        tagConfig.baseColor === c.value ? 'ring-2 ring-zinc-950 dark:ring-white scale-105' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">Text Contrast</label>
                <div className="grid grid-cols-5 gap-1">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateTagConfig({ textColor: c.value })}
                      className={`h-4.5 w-full rounded border border-zinc-300 dark:border-zinc-600 transition-all ${
                        tagConfig.textColor === c.value ? 'ring-2 ring-zinc-950 dark:ring-white scale-105' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 6. SPECS */}
            <section className="space-y-1.5 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  6. Specifications
                </h3>
              </div>

              {tagDimensions && (
                <div className={`p-2 rounded-lg border space-y-1 text-[10.5px] font-mono ${
                  isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-950' : 'bg-zinc-900 border-zinc-700 text-white'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Dimensions:</span>
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {tagDimensions.totalLength} × {tagDimensions.totalWidth} × {tagDimensions.totalHeight} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Vol / Weight:</span>
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {tagDimensions.volumeCm3} cm³ (~{tagDimensions.weightGramsPLA}g)
                    </span>
                  </div>
                  <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold">
                    <div className="flex items-center gap-1 text-zinc-900 dark:text-white">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-950 dark:text-white shrink-0" />
                      <span>Watertight Slicer Ready</span>
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-300 font-mono text-[9.5px]">
                      {isDoorSignPlate ? '≥10cm door plate' : (isKeyTag ? '2.5-8cm key tag' : 'Solid format')}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          // ==================== BOXES & ORGANIZERS FLOW ====================
          <>
            {/* 1. OUTER DIMS */}
            <section id="sec-box-dims" className="space-y-2 pt-0.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Sliders className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  1. Outer Dimensions
                </h3>
              </div>

              {/* Length X */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Length (X)</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{boxConfig.width} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepBox('width', boxConfig.width, -5, 40, 260, 0)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={40}
                    max={260}
                    value={boxConfig.width}
                    onChange={(e) => onUpdateBoxConfig({ width: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('width', boxConfig.width, 5, 40, 260, 0)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Depth Y */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Depth (Y)</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{boxConfig.depth} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepBox('depth', boxConfig.depth, -5, 40, 200, 0)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    value={boxConfig.depth}
                    onChange={(e) => onUpdateBoxConfig({ depth: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('depth', boxConfig.depth, 5, 40, 200, 0)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Height Z */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Height (Z)</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{boxConfig.height} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepBox('height', boxConfig.height, -5, 18, 120, 0)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={18}
                    max={120}
                    value={boxConfig.height}
                    onChange={(e) => onUpdateBoxConfig({ height: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('height', boxConfig.height, 5, 18, 120, 0)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Corner Fillet Radius */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-zinc-900 dark:text-white">Outer Corner Fillet</span>
                  <span className="font-mono font-black text-zinc-950 dark:text-white">{boxConfig.filletRadius} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepBox('filletRadius', boxConfig.filletRadius, -0.5, 1, 15, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={boxConfig.filletRadius}
                    onChange={(e) => onUpdateBoxConfig({ filletRadius: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-zinc-950 dark:accent-white"
                  />
                  <button
                    type="button"
                    onClick={() => stepBox('filletRadius', boxConfig.filletRadius, 0.5, 1, 15, 1)}
                    className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* 2. GRID */}
            <section id="sec-box-grid" className="space-y-2 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Grid3X3 className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  2. Compartment Grid
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-zinc-900 dark:text-white">Columns</span>
                    <span className="font-mono font-black text-zinc-950 dark:text-white">{boxConfig.gridColumns}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => stepBox('gridColumns', boxConfig.gridColumns, -1, 1, 4, 0)}
                      className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-xs text-zinc-950 dark:text-white">{boxConfig.gridColumns}</span>
                    <button
                      type="button"
                      onClick={() => stepBox('gridColumns', boxConfig.gridColumns, 1, 1, 4, 0)}
                      className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-zinc-900 dark:text-white">Rows</span>
                    <span className="font-mono font-black text-zinc-950 dark:text-white">{boxConfig.gridRows}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => stepBox('gridRows', boxConfig.gridRows, -1, 1, 4, 0)}
                      className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-xs text-zinc-950 dark:text-white">{boxConfig.gridRows}</span>
                    <button
                      type="button"
                      onClick={() => stepBox('gridRows', boxConfig.gridRows, 1, 1, 4, 0)}
                      className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. STRUCTURE */}
            <section id="sec-box-structure" className="space-y-1.5 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Layers className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  3. Structure & Stacking
                </h3>
              </div>

              {/* Stacking Lip Toggle */}
              <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-700'
              }`}>
                <div>
                  <span className="font-bold text-[11px] text-zinc-950 dark:text-white block">Stacking Lip</span>
                  <span className="text-[9.5px] text-zinc-600 dark:text-zinc-300 font-medium block">Vertical interlock rim</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateBoxConfig({ hasStackingLip: !boxConfig.hasStackingLip })}
                  className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                    boxConfig.hasStackingLip ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    boxConfig.hasStackingLip 
                      ? 'translate-x-3.5 bg-white dark:bg-zinc-950' 
                      : 'translate-x-0 bg-white'
                  }`} />
                </button>
              </div>

              {/* Scoop Toggle */}
              <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-700'
              }`}>
                <div>
                  <span className="font-bold text-[11px] text-zinc-950 dark:text-white block">Finger Scoops</span>
                  <span className="text-[9.5px] text-zinc-600 dark:text-zinc-300 font-medium block">Curved bottom pick up</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateBoxConfig({ hasScoop: !boxConfig.hasScoop })}
                  className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                    boxConfig.hasScoop ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    boxConfig.hasScoop 
                      ? 'translate-x-3.5 bg-white dark:bg-zinc-950' 
                      : 'translate-x-0 bg-white'
                  }`} />
                </button>
              </div>
            </section>

            {/* 4. FRONT LABEL */}
            <section id="sec-box-label" className="space-y-1.5 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Type className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  4. Front Label
                </h3>
              </div>

              <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-700'
              }`}>
                <div>
                  <span className="font-bold text-[11px] text-zinc-950 dark:text-white block">Front Face Label</span>
                  <span className="text-[9.5px] text-zinc-600 dark:text-zinc-300 font-medium block">Embossed 3D text</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateBoxConfig({ hasLabel: !boxConfig.hasLabel })}
                  className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                    boxConfig.hasLabel ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    boxConfig.hasLabel 
                      ? 'translate-x-3.5 bg-white dark:bg-zinc-950' 
                      : 'translate-x-0 bg-white'
                  }`} />
                </button>
              </div>

              {boxConfig.hasLabel && (
                <div className="space-y-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[10.5px] font-bold text-zinc-900 dark:text-white">Label Text</label>
                    <input
                      type="text"
                      value={boxConfig.labelText}
                      onChange={(e) => onUpdateBoxConfig({ labelText: e.target.value.toUpperCase() })}
                      placeholder="NAME..."
                      className={`w-full px-2 py-1 rounded-lg border font-mono text-xs uppercase font-bold focus:outline-none focus:ring-1 ${
                        isLight 
                          ? 'bg-white border-zinc-300 text-zinc-950 focus:border-zinc-950' 
                          : 'bg-zinc-900 border-zinc-600 text-white focus:border-white'
                      }`}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10.5px] font-bold text-zinc-900 dark:text-white">Position</label>
                    <div className="grid grid-cols-3 gap-1">
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
                            className={`py-1 px-1 rounded-md border text-[9.5px] font-bold transition-all ${
                              isSelected
                                ? isLight
                                  ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                                  : 'bg-white border-white text-zinc-950 shadow-xs'
                                : isLight
                                ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-300 text-zinc-900'
                                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-100'
                            }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 5. COLORS */}
            <section id="sec-box-colors" className="space-y-1.5 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <Palette className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  5. Colors
                </h3>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">Shell Color</label>
                <div className="grid grid-cols-5 gap-1">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateBoxConfig({ primaryColor: c.value })}
                      className={`h-4.5 w-full rounded border border-zinc-300 dark:border-zinc-600 transition-all ${
                        boxConfig.primaryColor === c.value ? 'ring-2 ring-zinc-950 dark:ring-white scale-105' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">Label Accent</label>
                <div className="grid grid-cols-5 gap-1">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onUpdateBoxConfig({ accentColor: c.value })}
                      className={`h-4.5 w-full rounded border border-zinc-300 dark:border-zinc-600 transition-all ${
                        boxConfig.accentColor === c.value ? 'ring-2 ring-zinc-950 dark:ring-white scale-105' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 6. SPECS */}
            <section className="space-y-1.5 pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-950 dark:text-white">
                  6. Specifications
                </h3>
              </div>

              {boxDimensions && (
                <div className={`p-2 rounded-lg border space-y-1 text-[10.5px] font-mono ${
                  isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-950' : 'bg-zinc-900 border-zinc-700 text-white'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Dimensions:</span>
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {boxDimensions.totalLength} × {boxDimensions.totalWidth} × {boxDimensions.totalHeight} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Pockets:</span>
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {boxDimensions.compartmentCount} compartments
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Vol / Weight:</span>
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {boxDimensions.volumeCm3} cm³ (~{boxDimensions.weightGramsPLA}g)
                    </span>
                  </div>
                  <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold">
                    <div className="flex items-center gap-1 text-zinc-900 dark:text-white">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-950 dark:text-white shrink-0" />
                      <span>Watertight Slicer Ready</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* 7. ACTION SECTION: DOWNLOAD FREE STL & COMMERCIAL 2 TIERS */}
        <section id={isTag ? "sec-tag-export" : "sec-box-export"} className="pt-3 pb-1 border-t border-zinc-200 dark:border-zinc-700 space-y-2.5">
          <div className="flex items-center justify-between pb-0.5">
            <span className="font-black text-[10.5px] uppercase tracking-wider text-zinc-950 dark:text-white">
              Export & Licensing
            </span>
            <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-300 font-bold">
              Dual Options
            </span>
          </div>

          {/* Option 1: FREE STL DOWNLOAD (COLORED IN #4B00F2) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                if (isTag) onExportTagSTL(true);
                else onExportBoxSTL(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 bg-[#4B00F2] hover:bg-[#3D00C6] text-white transition-all cursor-pointer active:scale-95 shadow-[#4B00F2]/25"
            >
              <Download className="w-4 h-4" />
              <span>Download Free STL</span>
            </button>
            <div className="flex items-center justify-between px-1 text-[9.5px] text-zinc-600 dark:text-zinc-300 font-medium">
              <span>Personal non-commercial 3D printing</span>
              <span className="font-mono font-bold text-[#4B00F2] dark:text-[#A788FF]">$0.00</span>
            </div>

            {isTag && (
              <button
                type="button"
                onClick={() => onExportTagMultiPart()}
                className={`w-full py-1.5 px-2.5 rounded-xl border font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors ${
                  isLight ? 'hover:bg-zinc-100 border-zinc-300 text-zinc-900' : 'hover:bg-zinc-800 border-zinc-600 text-white'
                }`}
              >
                <Layers className="w-3 h-3 text-zinc-950 dark:text-white" />
                <span>Dual-Color Multi-Part (Free)</span>
              </button>
            )}
          </div>

          {/* Option 2: COMMERCIAL ADD TO BASKET ON 2 TIERS (COLORED IN #F26C65) */}
          <div className={`p-2.5 rounded-xl border space-y-2 ${
            isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-900 border-zinc-700'
          }`}>
            <div className="flex items-center justify-between text-[10.5px] font-bold">
              <span className="text-zinc-950 dark:text-white uppercase tracking-wide">
                Commercial Licenses
              </span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold border border-zinc-300 dark:border-zinc-600">
                PRINT & SELL
              </span>
            </div>

            {/* 2 Commercial Tiers Selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Tier 1: Static Model Commercial License ($5) */}
              <button
                type="button"
                onClick={() => setSelectedCommercialTier('tier1_static')}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  selectedCommercialTier === 'tier1_static'
                    ? isLight
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                      : 'bg-white text-zinc-950 border-white shadow-xs'
                    : isLight
                    ? 'bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-900 font-bold'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-600 text-zinc-100 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10.5px] leading-tight block">Tier 1</span>
                  <span className={`font-mono text-[11px] font-bold ${
                    selectedCommercialTier === 'tier1_static' ? (isLight ? 'text-amber-300' : 'text-amber-600') : 'text-[#F26C65]'
                  }`}>$5.00</span>
                </div>
                <span className="text-[9px] opacity-90 leading-tight block mt-0.5 font-medium">
                  Static Solid CAD + STEP
                </span>
              </button>

              {/* Tier 2: 1-Month Configurator Tool Access ($25) */}
              <button
                type="button"
                onClick={() => setSelectedCommercialTier('tier2_subscription')}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  selectedCommercialTier === 'tier2_subscription'
                    ? isLight
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                      : 'bg-white text-zinc-950 border-white shadow-xs'
                    : isLight
                    ? 'bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-900 font-bold'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-600 text-zinc-100 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10.5px] leading-tight block">Tier 2</span>
                  <span className={`font-mono text-[11px] font-bold ${
                    selectedCommercialTier === 'tier2_subscription' ? (isLight ? 'text-amber-300' : 'text-amber-600') : 'text-[#F26C65]'
                  }`}>$25/mo</span>
                </div>
                <span className="text-[9px] opacity-90 leading-tight block mt-0.5 font-medium">
                  1-Month Pass (No Sub)
                </span>
              </button>
            </div>

            {/* Explanatory Snippet */}
            <div className="text-[9.5px] text-zinc-700 dark:text-zinc-200 leading-tight font-medium">
              {selectedCommercialTier === 'tier1_static' ? (
                <span><strong>Production ISO STEP CAD Solid (.step)</strong> + commercial physical selling rights. Standard solid B-Rep for CAD tools and slicers.</span>
              ) : (
                <span>30-day live configurator tool access & batch STEP CAD exports. <strong>Payment of $25 works for the month, no need of subscription.</strong></span>
              )}
            </div>

            {/* When already purchased: Download STEP CAD Model Button */}
            {isTemplatePurchased && onExportSTEP ? (
              <div className="pt-1 space-y-1.5">
                <button
                  type="button"
                  onClick={onExportSTEP}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer active:scale-95 shadow-emerald-600/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Download STEP CAD (.step)</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Commercial License Active · STEP Solid Ready</span>
                </div>
              </div>
            ) : (
              /* The Colored Add to Basket Button */
              <button
                type="button"
                onClick={() => onPurchaseTemplate(selectedCommercialTier)}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 bg-[#F26C65] hover:bg-[#D9554E] text-white transition-all cursor-pointer active:scale-95 shadow-[#F26C65]/25"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Add to Basket · {selectedCommercialTier === 'tier1_static' ? '$5.00' : '$25.00'}
                </span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* 4. Bottom Quick Status Footer (High contrast in dark mode) */}
      <div className={`px-2.5 py-1.5 border-t shrink-0 flex items-center justify-between text-[10px] font-mono ${
        isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-900' : 'bg-[#18181c] border-zinc-700 text-white'
      }`}>
        <div className="flex items-center gap-1 truncate">
          <span className="text-zinc-600 dark:text-zinc-300 font-bold">Size:</span>
          {isTag && tagDimensions && (
            <span className="font-black text-zinc-950 dark:text-white truncate">
              {tagDimensions.totalLength}×{tagDimensions.totalWidth} mm
            </span>
          )}
          {!isTag && boxDimensions && (
            <span className="font-black text-zinc-950 dark:text-white truncate">
              {boxDimensions.totalLength}×{boxDimensions.totalWidth} mm
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (isTag) onExportTagSTL(true);
              else onExportBoxSTL(true);
            }}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-[#4B00F2] hover:bg-[#3D00C6] transition-all active:scale-95 shadow-xs"
            title="Download Free STL for personal printing"
          >
            Free STL
          </button>
          <button
            type="button"
            onClick={() => onPurchaseTemplate(selectedCommercialTier)}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-[#F26C65] hover:bg-[#D9554E] transition-all active:scale-95 shadow-xs"
            title="Add commercial license to basket"
          >
            {selectedCommercialTier === 'tier1_static' ? 'Add $5' : 'Add $25'}
          </button>
        </div>
      </div>
    </aside>
  );
};
