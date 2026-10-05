import profile from './profile.json';
import ui from './ui.json';
import projectsData from './projects.json';
import mediaData from './media.json';
import site from '../config/site.json';
import type { MediaAsset, Project } from './types';
export { profile, site, ui };
export const projects = (projectsData as Project[]).filter(p => p.visible).sort((a, b) => a.order - b.order);
export const media = mediaData as Record<string, MediaAsset>;
