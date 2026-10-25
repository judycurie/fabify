/**
 * Top Navigation Header for Fabify 3D Digital CAD Platform
 * Includes:
 * - Brand identity
 * - Multi-page navigation (3D Studio, Catalog, My Downloads)
 * - Studio Engine Switcher (Tag Configurator vs Desk Box Configurator)
 * - Dynamic Presets menu for the active engine
 * - Caliper toggles & Free STL downloads
 * - Digital cart trigger with badge
 * - Dark / Light theme toggle
 */

import React, { useState } from 'react';
import { TagConfig, TagDimensions, AppTheme } from '../types/tag';
import { BoxConfig, BoxDimensions } from '../types/box';
import { TAG_PRESETS } from '../utils/presets';
import { BOX_PRESETS } from '../utils/boxPresets';
import { 
  Download, 
  Ruler, 
  Grid3X3, 
  Sparkles, 
  ChevronDown, 
  Sun, 
  Moon, 
  ShoppingBag, 
  BookOpen, 
  Sliders, 
  Menu, 
  X,
  Tag as TagIcon,
  Box as BoxIcon
} from 'lucide-react';

export type NavPage = 'studio' | 'catalog' | 'downloads';
export type StudioConfigurator = 'tag' | 'box';

interface TopHeaderProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  activeConfigurator: StudioConfigurator;
  onChangeConfigurator: (mode: StudioConfigurator) => void;
  tagConfig: TagConfig;
  boxConfig: BoxConfig;
  tagDimensions: TagDimensions | null;
  boxDimensions: BoxDimensions | null;
  theme: AppTheme;
  cartItemCount: number;
  onOpenCart: () => void;
  onToggleTheme: () => void;
  onUpdateTagConfig: (partial: Partial<TagConfig>) => void;
  onUpdateBoxConfig: (partial: Partial<BoxConfig>) => void;
  onExportTagSTL: (binary: boolean) => void;
  onExportBoxSTL: (binary: boolean) => void;
  onOpenSpecsModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentPage,
  onNavigate,
  activeConfigurator,
  onChangeConfigurator,
  tagConfig,
  boxConfig,
  tagDimensions,
  boxDimensions,
  theme,
  cartItemCount,
  onOpenCart,
  onToggleTheme,
  onUpdateTagConfig,
  onUpdateBoxConfig,
  onExportTagSTL,
  onExportBoxSTL,
  onOpenSpecsModal,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isLight = theme === 'light';
  const isTagMode = activeConfigurator === 'tag';

  const applyTagPreset = (presetId: string) => {
    const found = TAG_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onUpdateTagConfig(found.config);
      onNavigate('studio');
    }
    setShowPresetsMenu(false);
  };

  const applyBoxPreset = (presetId: string) => {
    const found = BOX_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onUpdateBoxConfig(found.config);
      onNavigate('studio');
    }
    setShowPresetsMenu(false);
  };

  const currentDimensions = isTagMode ? tagDimensions : boxDimensions;

  return (
    <header
      className={`h-14 px-3 sm:px-4 flex items-center justify-between z-40 select-none border-b transition-colors duration-200 shrink-0 ${
        isLight
          ? 'bg-white border-zinc-200 text-zinc-900'
          : 'bg-zinc-950 border-zinc-800 text-zinc-100'
      }`}
    >
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`md:hidden p-2 rounded-xl transition-colors ${
            isLight ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-zinc-900 text-zinc-300'
          }`}
          aria-label="Toggle Navigation Menu"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <div 
          onClick={() => onNavigate('studio')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs tracking-wider transition-all shadow-sm ${
              isLight
                ? 'bg-zinc-900 text-white group-hover:bg-black'
                : 'bg-white text-zinc-950 group-hover:bg-zinc-100'
            }`}
          >
            3D
          </div>
          <div className="flex flex-col justify-center">
            <span className={`text-sm font-bold tracking-tight whitespace-nowrap ${isLight ? 'text-zinc-950' : 'text-zinc-100'}`}>
              Fabify CAD
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: 'studio' as NavPage, label: '3D Studio' },
            { id: 'catalog' as NavPage, label: 'Catalog' },
            { id: 'downloads' as NavPage, label: 'My Downloads' },
          ].map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? isLight
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'bg-zinc-900 text-white font-bold'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Zone: Configurator Switcher (when in studio) */}
      {currentPage === 'studio' && (
        <div className="flex items-center gap-1 p-1 rounded-2xl border bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onChangeConfigurator('tag')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isTagMode
                ? isLight
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>Tag & Label</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeConfigurator('box')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isTagMode
                ? isLight
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <BoxIcon className="w-3.5 h-3.5" />
            <span>Desk Organizer</span>
          </button>
        </div>
      )}

      {/* Right Controls Zone */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Presets Dropdown */}
        {currentPage === 'studio' && (
          <div className="relative">
            <button
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              aria-label="Preset Templates"
              className={`flex items-center justify-center gap-1 text-xs p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline font-medium">Templates</span>
              <ChevronDown className="w-3 h-3 opacity-60 hidden sm:inline" />
            </button>

            {showPresetsMenu && (
              <div
                className={`absolute right-0 mt-1.5 w-64 rounded-2xl shadow-2xl p-1.5 z-50 text-xs border ${
                  isLight
                    ? 'bg-white border-zinc-300 text-zinc-900 shadow-zinc-300/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black'
                }`}
              >
                <div className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {isTagMode ? 'Tag Templates' : 'Desk Organizer Templates'}
                </div>
                {isTagMode ? (
                  TAG_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyTagPreset(p.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors flex flex-col gap-0.5 ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-900' : 'hover:bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-[9px] font-mono px-1 rounded uppercase font-bold text-emerald-600 dark:text-emerald-400">
                          {p.isFree ? 'FREE' : `$${(p.digitalPrice || 2.99).toFixed(2)}`}
                        </span>
                      </div>
                      <span className={`text-[11px] leading-tight ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {p.description}
                      </span>
                    </button>
                  ))
                ) : (
                  BOX_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyBoxPreset(p.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors flex flex-col gap-0.5 ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-900' : 'hover:bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-[9px] font-mono px-1 rounded uppercase font-bold text-emerald-600 dark:text-emerald-400">
                          {p.isFree ? 'FREE' : `$${p.digitalPrice.toFixed(2)}`}
                        </span>
                      </div>
                      <span className={`text-[11px] leading-tight ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {p.description}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 3D Calipers Dimension Toggle (Desktop) */}
        {currentPage === 'studio' && (
          <button
            onClick={() => {
              if (isTagMode) {
                onUpdateTagConfig({ showDimensions3D: !tagConfig.showDimensions3D });
              } else {
                onUpdateBoxConfig({ showDimensions3D: !boxConfig.showDimensions3D });
              }
            }}
            title="Toggle 3D Dimension Calipers"
            aria-label="Toggle 3D Dimension Calipers"
            className={`p-2 sm:p-1.5 rounded-xl border transition-colors flex items-center justify-center ${
              (isTagMode ? tagConfig.showDimensions3D : boxConfig.showDimensions3D)
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-950 border-white'
                : isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-200'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
            }`}
          >
            <Ruler className="w-4 h-4" />
          </button>
        )}

        {/* 1-Click Free STL Download Button */}
        {currentPage === 'studio' && (
          <button
            type="button"
            onClick={() => {
              if (isTagMode) {
                onExportTagSTL(true);
              } else {
                onExportBoxSTL(true);
              }
            }}
            className={`hidden sm:flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95 ${
              isLight
                ? 'bg-zinc-900 hover:bg-black text-white'
                : 'bg-white hover:bg-zinc-100 text-zinc-950'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download STL</span>
          </button>
        )}

        {/* Digital Downloads Cart Button */}
        <button
          type="button"
          onClick={onOpenCart}
          aria-label={`Downloads Queue (${cartItemCount})`}
          className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl border transition-colors relative ${
            cartItemCount > 0
              ? isLight
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-white text-zinc-950 border-white shadow-sm'
              : isLight
              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Queue</span>
          {cartItemCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
              isLight ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'
            }`}>
              {cartItemCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
          className={`p-2 rounded-xl border transition-colors ${
            isLight
              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
          }`}
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className={`w-72 h-full p-5 border-r shadow-2xl flex flex-col justify-between ${
              isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="font-bold text-base">Navigation</div>
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'studio' as NavPage, label: '3D Studio' },
                  { id: 'catalog' as NavPage, label: 'Catalog' },
                  { id: 'downloads' as NavPage, label: 'My Downloads' },
                ].map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      onNavigate(link.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      currentPage === link.id
                        ? isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                        : isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-900'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t text-xs text-zinc-500">
              <span>Watertight Sliced 3D CAD Engine</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
