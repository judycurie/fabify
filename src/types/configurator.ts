export type ConfiguratorKind = 'native' | 'embed';

export interface ConfiguratorItem {
  id: string;
  name: string;
  description: string;
  category: 'Tags & Plates' | 'Desk & Storage' | 'Mechanical & Tools' | 'Home & Living' | 'Custom AI Studio';
  kind: ConfiguratorKind;
  nativeStudioType?: 'tag' | 'box';
  embedUrl?: string; // e.g. https://ais-dev-...run.app or https://aistudio.google.com/...
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'purple';
  imageUrl?: string;
  author: string;
  isCustom?: boolean; // Added by user via URL
  tags: string[];
  dimensions?: string;
  exportFormats: string[]; // ['STL', 'OBJ', etc.]
  monetizationType?: 'fab_foundation' | 'creator_stripe' | 'free_community';
  digitalPrice?: number;
  stripePaymentLink?: string; // Direct Stripe Payment Link configured by independent designer
  designerStripeAccountId?: string; // Connected Stripe Account ID
  createdAt?: string;
}
