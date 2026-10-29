/**
 * Top Navigation Header for Fabify 3D Digital CAD Platform
 * Includes:
 * - Brand identity
 * - Multi-page navigation (3D Studio, Catalog, My Downloads)
 * - Unified 3D Studio Toolset Bar (Tags & Plates, Desk Organizers, and Templates grouped together)
 * - 1-Click Free STL Download in emerald colors & Add to Basket for paid CAD
 * - Caliper toggles & Digital Cart trigger with badge
 * - Dark / Light theme toggle
 */

import React, { useState, useEffect } from 'react';
import { TagConfig, TagDimensions, AppTheme, TagPreset } from '../types/tag';
import { BoxConfig, BoxDimensions, BoxPreset } from '../types/box';
import { ActiveTemplateInfo } from '../types/cart';
import { TAG_PRESETS } from '../utils/presets';
import { BOX_PRESETS } from '../utils/boxPresets';
import { 
  Download, 
  Ruler, 
  Sparkles, 
  ChevronDown, 
  Sun, 
  Moon, 
  ShoppingBag, 
  Menu, 
  X,
  Tag as TagIcon,
  Box as BoxIcon,
  Lock,
  ShieldCheck,
  Check,
  User,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types/auth';

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
  activeTemplate: ActiveTemplateInfo;
  isTemplatePurchased: boolean;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenCart: () => void;
  onToggleTheme: () => void;
  onUpdateTagConfig: (partial: Partial<TagConfig>) => void;
  onUpdateBoxConfig: (partial: Partial<BoxConfig>) => void;
  onSelectTagPreset?: (preset: TagPreset) => void;
  onSelectBoxPreset?: (preset: BoxPreset) => void;
  onExportTagSTL: (binary: boolean) => void;
  onExportBoxSTL: (binary: boolean) => void;
  onOpenSpecsModal: () => void;
  onPurchaseTemplate: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentPage,
  onNavigate,
  activeConfigurator,
  onChangeConfigurator,
  tagConfig,
  boxConfig,
  theme,
  cartItemCount,
  activeTemplate,
  isTemplatePurchased,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenCart,
  onToggleTheme,
  onUpdateTagConfig,
  onUpdateBoxConfig,
  onSelectTagPreset,
  onSelectBoxPreset,
  onExportTagSTL,
  onExportBoxSTL,
  onPurchaseTemplate,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileTemplates, setShowMobileTemplates] = useState(false);
  const [mobileTemplateFilter, setMobileTemplateFilter] = useState<'all' | 'tags' | 'plates' | 'boxes'>('all');

  const isLight = theme === 'light';
  const isUnlocked = activeTemplate.isFree || isTemplatePurchased;

  // Close templates dropdown when clicking outside
  useEffect(() => {
    if (!showPresetsMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-presets-menu]')) {
        setShowPresetsMenu(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showPresetsMenu]);

  const handleApplyTagPreset = (preset: TagPreset) => {
    if (onSelectTagPreset) {
      onSelectTagPreset(preset);
    } else {
      onUpdateTagConfig(preset.config);
    }
    onChangeConfigurator('tag');
    onNavigate('studio');
    setShowPresetsMenu(false);
    setShowMobileTemplates(false);
  };

  const handleApplyBoxPreset = (preset: BoxPreset) => {
    if (onSelectBoxPreset) {
      onSelectBoxPreset(preset);
    } else {
      onUpdateBoxConfig(preset.config);
    }
    onChangeConfigurator('box');
    onNavigate('studio');
    setShowPresetsMenu(false);
    setShowMobileTemplates(false);
  };

  // Group tag presets into Free Tags vs Plates
  const freeTags = TAG_PRESETS.filter((p) => p.itemKind === 'tag' || p.category !== 'plate');
  const plates = TAG_PRESETS.filter((p) => p.itemKind === 'plate' || p.category === 'plate');

  return (
    <header
      className={`h-14 px-3 sm:px-4 flex items-center justify-between z-40 select-none border-b transition-colors duration-200 shrink-0 ${
        isLight
          ? 'bg-white border-zinc-200 text-zinc-900'
          : 'bg-zinc-950 border-zinc-800 text-zinc-100'
      }`}
    >
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
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

      {/* Center Zone: 3D Studio Suite Bar (Grouping Tags & Plates, Desk Organizers, and Templates) */}
      {currentPage === 'studio' && (
        <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl border shadow-sm transition-all bg-zinc-100/90 dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800">
          {/* Explicit 3D Studio Suite Label (No green dot) */}
          <div className="flex items-center px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 select-none">
            <span className="hidden lg:inline">3D Studio:</span>
            <span className="lg:hidden">Studio:</span>
          </div>

          {/* Segmented Control Toggle between Tags & Plates and Desk Organizers */}
          <div 
            className="flex items-center p-0.5 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/50"
            role="tablist"
            aria-label="Studio Mode Toggle"
          >
            {/* Toggle Option 1: Tags & Plates */}
            <button
              type="button"
              role="tab"
              aria-selected={activeConfigurator === 'tag'}
              onClick={() => onChangeConfigurator('tag')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeConfigurator === 'tag'
                  ? isLight
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-white shadow-sm'
                  : isLight
                  ? 'text-zinc-600 hover:text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TagIcon className="w-3.5 h-3.5 opacity-70" />
              <span>Tags & Plates</span>
            </button>

            {/* Toggle Option 2: Desk Organizers */}
            <button
              type="button"
              role="tab"
              aria-selected={activeConfigurator === 'box'}
              onClick={() => onChangeConfigurator('box')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeConfigurator === 'box'
                  ? isLight
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-white shadow-sm'
                  : isLight
                  ? 'text-zinc-600 hover:text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BoxIcon className="w-3.5 h-3.5 opacity-70" />
              <span>Desk Organizers</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Templates Dropdown Button (Belongs to 3D Studio, monochrome icon) */}
          <div className="relative" data-presets-menu>
            <button
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              aria-label="Preset Templates"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showPresetsMenu
                  ? isLight
                    ? 'bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-300'
                    : 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                  : isLight
                  ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 opacity-70" />
              <span>Templates</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${showPresetsMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Presets Dropdown */}
            {showPresetsMenu && (
              <div
                className={`absolute left-0 mt-1.5 w-72 max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl p-2 z-50 text-xs border ${
                  isLight
                    ? 'bg-white border-zinc-300 text-zinc-900 shadow-zinc-300/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black'
                }`}
              >
                {/* TAGS & PLATES PRESETS */}
                {activeConfigurator === 'tag' && (
                  <div className="space-y-2">
                    {/* Free Community Tags (ALL TAGS ARE FREE) */}
                    <div>
                      <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        <span>Free Tags & Keychains</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-mono">
                          ALL FREE
                        </span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {freeTags.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleApplyTagPreset(p)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                              isLight ? 'hover:bg-zinc-100 text-zinc-900' : 'hover:bg-zinc-800 text-zinc-200'
                            }`}
                          >
                            <span className="font-semibold text-xs">{p.name}</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              FREE
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dedicated Plates Category */}
                    <div className="pt-1">
                      <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        <span className="flex items-center gap-1">
                          <TagIcon className="w-3 h-3" />
                          Plates & Signs
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-mono">
                          LARGE FORMAT
                        </span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {plates.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleApplyTagPreset(p)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                              isLight ? 'hover:bg-amber-50/60 text-zinc-900' : 'hover:bg-zinc-800 text-zinc-200'
                            }`}
                          >
                            <span className="font-semibold text-xs">{p.name}</span>
                            <span className={`text-[10px] font-mono font-bold ${
                              p.isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {p.isFree ? 'FREE' : `$${(p.digitalPrice || 3.50).toFixed(2)}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* DESK BOX PRESETS */}
                {activeConfigurator === 'box' && (
                  <div className="space-y-2">
                    {/* Free Boxes */}
                    <div>
                      <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        <span>Free Community Boxes</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-mono">
                          FREE STL
                        </span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {BOX_PRESETS.filter((p) => p.isFree).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleApplyBoxPreset(p)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                              isLight ? 'hover:bg-zinc-100 text-zinc-900' : 'hover:bg-zinc-800 text-zinc-200'
                            }`}
                          >
                            <span className="font-semibold text-xs">{p.name}</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              FREE
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Paid Commercial Boxes */}
                    <div className="pt-1">
                      <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Commercial CAD Licenses
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-mono">
                          PAID
                        </span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {BOX_PRESETS.filter((p) => !p.isFree).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleApplyBoxPreset(p)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                              isLight ? 'hover:bg-amber-50/60 text-zinc-900' : 'hover:bg-zinc-800 text-zinc-200'
                            }`}
                          >
                            <span className="font-semibold text-xs">{p.name}</span>
                            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                              ${p.digitalPrice.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Controls Zone */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 3D Calipers Dimension Toggle (Desktop) */}
        {currentPage === 'studio' && (
          <button
            onClick={() => {
              if (activeConfigurator === 'tag') {
                onUpdateTagConfig({ showDimensions3D: !tagConfig.showDimensions3D });
              } else {
                onUpdateBoxConfig({ showDimensions3D: !boxConfig.showDimensions3D });
              }
            }}
            title="Toggle 3D Dimension Calipers"
            aria-label="Toggle 3D Dimension Calipers"
            className={`p-2 sm:p-1.5 rounded-xl border transition-colors flex items-center justify-center ${
              (activeConfigurator === 'tag' ? tagConfig.showDimensions3D : boxConfig.showDimensions3D)
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

        {/* 1-CLICK FREE STL DOWNLOAD (IN THE COLORS OF THE FREE STL) / ADD TO BASKET FOR PAID */}
        {currentPage === 'studio' && (
          isUnlocked ? (
            <button
              type="button"
              onClick={() => {
                if (activeConfigurator === 'tag') {
                  onExportTagSTL(true);
                } else {
                  onExportBoxSTL(true);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 border border-emerald-500/40 cursor-pointer"
              title="Download direct slicer-ready watertight STL"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{activeTemplate.isFree ? 'Download Free STL' : 'Download STL (Licensed)'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPurchaseTemplate}
              className="hidden sm:flex items-center gap-1.5 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Basket (${activeTemplate.price.toFixed(2)})</span>
            </button>
          )
        )}

        {/* Digital Downloads Basket Button */}
        <button
          type="button"
          onClick={onOpenCart}
          aria-label={`Basket (${cartItemCount})`}
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
          <span className="hidden sm:inline">Basket</span>
          {cartItemCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
              isLight ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'
            }`}>
              {cartItemCount}
            </span>
          )}
        </button>

        {/* User Account / Sign In Trigger */}
        <div className="relative">
          {currentUser ? (
            <div>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-1.5 p-1.5 sm:px-2 sm:py-1.5 rounded-xl border transition-all ${
                  isLight
                    ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-100'
                }`}
                title={`Logged in as ${currentUser.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <span className="text-xs font-semibold hidden md:inline max-w-[90px] truncate">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60 hidden sm:inline" />
              </button>

              {showUserMenu && (
                <div
                  className={`absolute right-0 mt-1.5 w-56 rounded-2xl p-3 shadow-2xl border z-50 text-xs ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
                  }`}
                >
                  <div className="pb-2.5 mb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="font-bold text-xs truncate">{currentUser.name || 'Maker'}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3 h-3" />
                      <span>Free Downloads Unlocked</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className={`w-full py-1.5 px-2 rounded-lg flex items-center gap-2 text-xs font-semibold transition-colors ${
                      isLight ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-950/50 text-red-400'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-xl border transition-all ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
              }`}
              title="Log in to download free STLs"
            >
              <User className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Dark / Light Theme"
          className={`p-2 sm:p-1.5 rounded-xl border transition-colors flex items-center justify-center ${
            isLight
              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
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

              {/* User Account Card in Mobile Drawer */}
              <div className="p-3 rounded-2xl border bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
                {currentUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowMobileMenu(false);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sign In for Free Downloads</span>
                  </button>
                )}
              </div>

              {/* 3D Studio Tools in Mobile Drawer */}
              <div className="space-y-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">
                  <span>3D Studio Tools</span>
                </div>
                {/* Segmented Toggle in Mobile Drawer */}
                <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700/60">
                  <button
                    onClick={() => {
                      onChangeConfigurator('tag');
                      onNavigate('studio');
                      setShowMobileMenu(false);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeConfigurator === 'tag' && currentPage === 'studio'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <TagIcon className="w-3.5 h-3.5 opacity-70" />
                    <span>Tags & Plates</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeConfigurator('box');
                      onNavigate('studio');
                      setShowMobileMenu(false);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeConfigurator === 'box' && currentPage === 'studio'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <BoxIcon className="w-3.5 h-3.5 opacity-70" />
                    <span>Desk Organizers</span>
                  </button>
                </div>

                {/* Templates trigger in Mobile Drawer */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowMobileTemplates(true);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all ${
                    isLight 
                      ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800' 
                      : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 opacity-70" />
                    <span>Preset Templates</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 font-normal">View All →</span>
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

      {/* Mobile-Only Floating 3D Studio Toolset Bar (Toggle + Templates) */}
      {currentPage === 'studio' && (
        <div className="sm:hidden fixed top-16 left-1/2 -translate-x-1/2 z-25 flex items-center gap-1 p-1 rounded-2xl border shadow-xl backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border-zinc-200/90 dark:border-zinc-800 max-w-[96vw]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-2 pr-1 select-none shrink-0">
            Studio:
          </span>

          {/* Toggle between Tags & Plates and Desk Organizers on Mobile */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/70 shrink-0">
            <button
              type="button"
              onClick={() => onChangeConfigurator('tag')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeConfigurator === 'tag'
                  ? isLight ? 'bg-white text-zinc-950 shadow-sm' : 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <TagIcon className="w-3 h-3 opacity-70" />
              <span>Tags & Plates</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeConfigurator('box')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeConfigurator === 'box'
                  ? isLight ? 'bg-white text-zinc-950 shadow-sm' : 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <BoxIcon className="w-3 h-3 opacity-70" />
              <span>Organizers</span>
            </button>
          </div>

          <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

          {/* Mobile Templates Button */}
          <button
            type="button"
            onClick={() => setShowMobileTemplates(true)}
            aria-label="Open Templates"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <Sparkles className="w-3 h-3 opacity-70" />
            <span>Templates</span>
          </button>
        </div>
      )}

      {/* Mobile Templates Bottom Sheet Modal */}
      {showMobileTemplates && (
        <div 
          className="fixed inset-0 z-50 sm:hidden bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setShowMobileTemplates(false)}
        >
          <div 
            className={`w-full max-h-[85vh] rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 opacity-70" />
                  <span className="font-bold text-sm">3D Studio Templates</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileTemplates(false)}
                  className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all' as const, label: 'All Templates' },
                  { id: 'tags' as const, label: 'Tags (Free)' },
                  { id: 'plates' as const, label: 'Plates & Signs' },
                  { id: 'boxes' as const, label: 'Desk Organizers' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileTemplateFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                      mobileTemplateFilter === tab.id
                        ? isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                        : isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets List */}
            <div className="overflow-y-auto p-4 space-y-4">
              {/* Tags & Keychains */}
              {(mobileTemplateFilter === 'all' || mobileTemplateFilter === 'tags') && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center justify-between">
                    <span>Free Community Tags & Keychains</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950">ALL FREE</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {freeTags.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyTagPreset(p)}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                          isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{p.name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{p.description}</div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800">
                          FREE
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Plates & Signs */}
              {(mobileTemplateFilter === 'all' || mobileTemplateFilter === 'plates') && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center justify-between">
                    <span>Large Format Plates & Signs</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950">ARCHITECTURAL</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {plates.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyTagPreset(p)}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                          isLight ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50' : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{p.name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{p.description}</div>
                        </div>
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.isFree 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800' 
                            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {p.isFree ? 'FREE' : `$${(p.digitalPrice || 3.50).toFixed(2)}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Desk Organizers */}
              {(mobileTemplateFilter === 'all' || mobileTemplateFilter === 'boxes') && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2 flex items-center justify-between">
                    <span>Desk Organizers & Trays</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">PARAMETRIC</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {BOX_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyBoxPreset(p)}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                          isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{p.name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{p.description}</div>
                        </div>
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.isFree 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800' 
                            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {p.isFree ? 'FREE' : `$${p.digitalPrice.toFixed(2)}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
