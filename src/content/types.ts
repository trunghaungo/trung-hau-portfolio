export type MediaAsset = {
  posterSrc: string; alt: string; width: number; height: number;
  objectPosition?: string; isPlaceholder: boolean; caption?: string;
  srcSet?: string; sizes?: string; previewSrc?: string; fullVideoSrc?: string;
};
export type Project = {
  slug: string; visible: boolean; order: number; title: string; titleVi?: string;
  kind: string; year?: number; role?: string; summary: string; overview?: string;
  coverMediaId: string; galleryMediaIds: string[]; contentLevel: 'case' | 'showcase';
  contributions?: string[];
  decisions?: {title: string; body: string; mediaId?: string}[];
  recognition?: {label: string; sourceUrl: string}[];
};
