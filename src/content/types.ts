export type MediaAsset = {
  posterSrc: string; alt: string; width: number; height: number;
  objectPosition?: string; isPlaceholder: boolean; caption?: string;
  objectFit?: 'cover' | 'contain'; frameAspectRatio?: number;
  srcSet?: string; sizes?: string; previewSrc?: string; fullVideoSrc?: string;
};
export type Profile = {
  name: string; alias: string; role: string; tagline: string; location: string;
  hero: { eyebrow: string; primaryAction: string; secondaryAction: string };
  workIntro: string; portraitsIntro: string; bio: string[];
  contact: { heading: string; email: string; phone: string; phoneLink: string; socials: { label: string; url: string }[] };
  experience: { company: string; role: string; period: string; description?: string }[];
  education: { school: string; course: string; period: string };
  approach: { title: string; body: string }[];
  tools: string[];
};
export type Project = {
  slug: string; visible: boolean; order: number; title: string; alternateTitle?: string; titleLanguage?: string;
  kind: string; year?: number; role?: string; summary: string; overview?: string;
  coverMediaId: string; galleryMediaIds: string[]; contentLevel: 'case' | 'showcase';
  contributions?: string[];
  decisions?: {title: string; body: string; mediaId?: string}[];
  recognition?: {label: string; sourceUrl: string; description?: string}[];
};
