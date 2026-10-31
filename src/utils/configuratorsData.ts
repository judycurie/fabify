import { ConfiguratorItem } from '../types/configurator';

export const DEFAULT_CONFIGURATORS: ConfiguratorItem[] = [
  {
    id: 'native-tags-forge',
    name: 'Parametric Tag & Keyring Forge',
    description: 'Precision typographic tags with customizable hole placement, corner fillets, live millimeter dimension calipers, and instant watertight binary STL export.',
    category: 'Tags & Plates',
    kind: 'native',
    nativeStudioType: 'tag',
    badge: 'FFP Engine',
    badgeColor: 'emerald',
    imageUrl: '/images/render_keychain_tag_1793271969252.jpg',
    author: 'Fab Foundation Poland',
    monetizationType: 'fab_foundation',
    digitalPrice: 0,
    tags: ['Keychains', 'Everyday Carry', 'Watertight STL', 'Free Community'],
    dimensions: 'Variable (50 - 160 mm)',
    exportFormats: ['Binary STL', 'Multi-material STL'],
  },
  {
    id: 'native-plates-forge',
    name: 'Architectural Plates & Stencil Signs',
    description: 'Large-format freestanding desk nameplates, heavy-duty machine rating plates, office door signs, and laser/backlit bridged cutout stencils.',
    category: 'Tags & Plates',
    kind: 'native',
    nativeStudioType: 'tag',
    badge: 'FFP Engine',
    badgeColor: 'emerald',
    imageUrl: '/images/render_desk_nameplate_1793271970611.jpg',
    author: 'Fab Foundation Poland',
    monetizationType: 'fab_foundation',
    digitalPrice: 3.50,
    tags: ['Nameplates', 'Machine Badges', 'Cutout Stencil', 'Signs'],
    dimensions: 'Variable (80 - 240 mm)',
    exportFormats: ['Binary STL', 'Dual-Color STL'],
  },
  {
    id: 'native-boxes-forge',
    name: 'Modular Desk Organizer & Tray Forge',
    description: 'Parametric multi-compartment catchalls, stationery holders, and stackable interlocking hardware organizer bins with finger scoops.',
    category: 'Desk & Storage',
    kind: 'native',
    nativeStudioType: 'box',
    badge: 'FFP Engine',
    badgeColor: 'emerald',
    imageUrl: '/images/render_catchall_tray_1793271971232.jpg',
    author: 'Fab Foundation Poland',
    monetizationType: 'fab_foundation',
    digitalPrice: 3.50,
    tags: ['Desk Trays', 'Stackable Bins', 'Hardware Bins', 'Compartments'],
    dimensions: 'Variable (60 - 220 mm)',
    exportFormats: ['Watertight STL'],
  },
  {
    id: 'embed-gridfinity-generator',
    name: 'Gridfinity Modular Bin Generator',
    description: 'Autonomous AI Studio applet that generates standardized 42mm-pitch Gridfinity baseplates, stacking lips, and slotted organizer bins with magnet holes.',
    category: 'Desk & Storage',
    kind: 'embed',
    embedUrl: 'https://ais-dev-ftwzx3eth7ocfrviel7tut-493219649253.us-west2.run.app',
    badge: 'AI Studio Embed',
    badgeColor: 'purple',
    imageUrl: '/images/stackable_bin_tray_1793276524465.jpg',
    author: 'Maker Community',
    monetizationType: 'free_community',
    digitalPrice: 0,
    tags: ['Gridfinity', '42mm Standard', 'Magnets', 'Stackable'],
    dimensions: '42x42x50 mm units',
    exportFormats: ['Binary STL'],
  },
  {
    id: 'embed-cable-management',
    name: 'Snap-Fit Cable Clip & Conduit Forge',
    description: 'Specialized parametric generator created with Google AI Studio for desktop cable channels, zip-tie conduits, and snap-fit under-desk wire guides.',
    category: 'Mechanical & Tools',
    kind: 'embed',
    embedUrl: 'https://ais-dev-ftwzx3eth7ocfrviel7tut-493219649253.us-west2.run.app',
    badge: 'AI Studio Embed',
    badgeColor: 'purple',
    imageUrl: '/images/render_cable_tag_1793271973358.jpg',
    author: 'Indie Studio Designer',
    monetizationType: 'creator_stripe',
    stripePaymentLink: 'https://buy.stripe.com/test_designer_sample_link',
    digitalPrice: 2.99,
    tags: ['Cable Routing', 'Snap-fit', 'Desk Management', 'Clips'],
    dimensions: '12 - 45 mm',
    exportFormats: ['Binary STL', 'STEP'],
  },
  {
    id: 'embed-honeycomb-mount',
    name: 'Hexagonal Honeycomb Wall Storage Mounts',
    description: 'AI Studio generative 3D applet that designs custom honeycomb pegboard inserts, caliper hangers, screwdriver rings, and nozzle holders.',
    category: 'Home & Living',
    kind: 'embed',
    embedUrl: 'https://ais-dev-ftwzx3eth7ocfrviel7tut-493219649253.us-west2.run.app',
    badge: 'AI Studio Embed',
    badgeColor: 'purple',
    imageUrl: '/images/industrial_tag_mount_1793276537221.jpg',
    author: 'Indie Studio Designer',
    monetizationType: 'creator_stripe',
    stripePaymentLink: 'https://buy.stripe.com/test_designer_sample_link',
    digitalPrice: 3.50,
    tags: ['Honeycomb Wall', 'Tool Holders', 'Nozzle Rack', 'Pegboard'],
    dimensions: 'Custom Grid',
    exportFormats: ['Binary STL'],
  },
];

const STORAGE_KEY = 'fabify_custom_configurators_v1';

export function getStoredConfigurators(): ConfiguratorItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIGURATORS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge defaults with custom so built-ins are always up-to-date
      const customOnes = parsed.filter((item: ConfiguratorItem) => item.isCustom);
      return [...DEFAULT_CONFIGURATORS, ...customOnes];
    }
  } catch (e) {
    console.warn('Failed to load custom configurators:', e);
  }
  return DEFAULT_CONFIGURATORS;
}

export function saveStoredConfigurators(items: ConfiguratorItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save custom configurators:', e);
  }
}

export function addCustomConfigurator(item: Omit<ConfiguratorItem, 'id' | 'isCustom' | 'createdAt'>): ConfiguratorItem {
  const newItem: ConfiguratorItem = {
    ...item,
    id: `custom-ais-${Date.now()}`,
    isCustom: true,
    kind: 'embed',
    createdAt: new Date().toISOString(),
  };

  const current = getStoredConfigurators();
  const updated = [...current, newItem];
  saveStoredConfigurators(updated);
  return newItem;
}

export function deleteCustomConfigurator(id: string): ConfiguratorItem[] {
  const current = getStoredConfigurators();
  const updated = current.filter((item) => item.id !== id);
  saveStoredConfigurators(updated);
  return updated;
}

/**
 * Generate standard responsive HTML iframe snippet for third-party websites
 */
export function generateIframeEmbedCode(configurator: ConfiguratorItem): string {
  const url = configurator.embedUrl || window.location.origin;
  return `<!-- ${configurator.name} 3D Configurator - Embedded with Fabify CAD & Google AI Studio -->
<div style="position: relative; width: 100%; max-width: 1200px; height: 750px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid rgba(120,120,120,0.2);">
  <iframe
    src="${url}"
    title="${configurator.name} 3D Configurator"
    width="100%"
    height="100%"
    frameborder="0"
    allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="width: 100%; height: 100%; border: none; display: block;"
  ></iframe>
</div>`;
}

/**
 * Generate React component JSX snippet for developers
 */
export function generateReactEmbedCode(configurator: ConfiguratorItem): string {
  const url = configurator.embedUrl || window.location.origin;
  return `import React from 'react';

export function ${configurator.name.replace(/[^a-zA-Z0-9]/g, '')}Configurator() {
  return (
    <div className="w-full h-[750px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
      <iframe
        src="${url}"
        title="${configurator.name}"
        className="w-full h-full border-0"
        allow="accelerometer; camera; gyroscope; clipboard-write; encrypted-media; web-share"
        allowFullScreen
      />
    </div>
  );
}`;
}
