import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
function read(path) {
  try { return JSON.parse(readFileSync(resolve(root, path), 'utf8')); }
  catch (e) { console.error(`Invalid JSON in ${path}: ${e.message}`); process.exit(1); }
}
const profile = read('src/content/profile.json');
const ui = read('src/content/ui.json');
const projects = read('src/content/projects.json');
const media = read('src/content/media.json');
const site = read('src/config/site.json');
const motion = read('src/config/motion.json');
const presentation = read('src/config/presentation.json');
const requireString = (v, label) => { if (typeof v !== 'string' || !v.trim()) errors.push(`${label}: a nonempty string is required.`); };
const requireArray = (v, label) => { if (!Array.isArray(v)) { errors.push(`${label}: an array is required.`); return []; } return v; };
const checkMediaId = (id, label) => { if (typeof id !== 'string' || !media[id]) errors.push(`${label}: media ID "${id}" does not exist in media.json.`); };
const checkUrl = (url, label) => { try { if (new URL(url).protocol !== 'https:') throw Error(); } catch { errors.push(`${label}: use a full HTTPS URL.`); } };
Object.entries(ui).forEach(([key, value]) => requireString(value, `ui.${key}`));
for (const key of ['name', 'alias', 'role', 'tagline', 'location', 'workIntro', 'portraitsIntro']) requireString(profile[key], `profile.${key}`);
requireArray(profile.bio, 'profile.bio').forEach((p, i) => requireString(p, `profile.bio[${i}]`));
for (const key of ['email', 'phone', 'phoneLink', 'heading']) requireString(profile.contact?.[key], `profile.contact.${key}`);
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contact?.email || '')) errors.push('profile.contact.email: enter a valid email.');
if (!/^\+\d{7,15}$/.test(profile.contact?.phoneLink || '')) errors.push('profile.contact.phoneLink: use an international number such as +84385941520.');
const socialIds = new Set();
requireArray(profile.contact?.socials, 'profile.contact.socials').forEach((s, i) => {
  for (const key of ['id', 'name', 'icon']) requireString(s[key], `socials[${i}].${key}`);
  if (socialIds.has(s.id)) errors.push(`socials[${i}].id: use a unique ID.`);
  socialIds.add(s.id);
  checkUrl(s.url, `socials[${i}].url`);
});
requireArray(profile.experience, 'profile.experience').forEach((entry, i) => { ['company', 'role', 'period'].forEach(k => requireString(entry[k], `experience[${i}].${k}`)); if (entry.description !== undefined) requireString(entry.description, `experience[${i}].description`); });
['school', 'course', 'period'].forEach(k => requireString(profile.education?.[k], `education.${k}`));
requireArray(profile.tools, 'profile.tools').forEach((v, i) => requireString(v, `tools[${i}]`));
requireArray(profile.approach, 'profile.approach').forEach((v, i) => ['title', 'body'].forEach(k => requireString(v[k], `approach[${i}].${k}`)));
['eyebrow', 'primaryAction', 'secondaryAction'].forEach(k => requireString(profile.hero?.[k], `hero.${k}`));
for (const key of ['stackProjects', 'pointerFollow', 'sectionDrift']) if (typeof motion[key] !== 'boolean') errors.push(`motion.${key}: use true or false.`);
for (const key of ['enabled', 'oncePerSession', 'imageHandoff']) if (typeof motion.intro?.[key] !== 'boolean') errors.push(`motion.intro.${key}: use true or false.`);
if (motion.intro?.mediaIds?.length !== 2) errors.push('motion.intro.mediaIds: use two opening photos; the final photo comes from site.heroMediaId.');
requireArray(motion.intro?.mediaIds, 'motion.intro.mediaIds').forEach(id => checkMediaId(id, 'motion.intro.mediaIds'));
if (!Number.isFinite(motion.intro?.durationMs) || motion.intro.durationMs < 1800 || motion.intro.durationMs > 4000) errors.push('motion.intro.durationMs: use a number between 1800 and 4000.');
if (!Number.isFinite(motion.revealDurationMs) || motion.revealDurationMs < 100 || motion.revealDurationMs > 1500) errors.push('motion.revealDurationMs: use a number between 100 and 1500.');
if (!Array.isArray(presentation.projectTones) || presentation.projectTones.length === 0 || presentation.projectTones.some(tone => !['paper', 'ink', 'accent'].includes(tone))) errors.push('presentation.projectTones: use a nonempty array of paper, ink or accent.');
if (!['demo', 'live'].includes(site.mediaMode)) errors.push('site.mediaMode must be "demo" or "live".');
for (const key of ['enableMotion', 'enableHoverPreview', 'enableViewTransitions']) if (typeof site[key] !== 'boolean') errors.push(`site.${key}: use true or false.`);
for (const key of ['language', 'siteTitle', 'description']) requireString(site[key], `site.${key}`);
requireArray(site.navigation, 'site.navigation').forEach((link, i) => { requireString(link.label, `navigation[${i}].label`); if (!/^\/(?:#[a-z0-9-]+)?$/.test(link.href)) errors.push(`navigation[${i}].href must link to the homepage or a homepage section.`); });
for (const key of ['heroMediaId', 'aboutMediaId']) checkMediaId(site[key], `site.${key}`);
const retouchPairs = requireArray(site.retouchPairs, 'site.retouchPairs');
if (!retouchPairs.length) errors.push('site.retouchPairs: add at least one before/after pair.');
retouchPairs.forEach((pair, index) => {
  const label = `site.retouchPairs[${index}]`;
  checkMediaId(pair.beforeMediaId, `${label}.beforeMediaId`);
  checkMediaId(pair.afterMediaId, `${label}.afterMediaId`);
  const before = media[pair.beforeMediaId], after = media[pair.afterMediaId];
  if (before && after && (before.width !== after.width || before.height !== after.height)) errors.push(`${label}: before and after must have identical dimensions.`);
});
const slugs = new Set(), orders = new Set();
for (const [i, project] of requireArray(projects, 'projects').entries()) {
  const label = `projects[${i}] (${project.slug || '?'})`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) errors.push(`${label}: slug must use lowercase letters, numbers and hyphens.`);
  if (slugs.has(project.slug)) errors.push(`${label}: duplicate slug.`);
  slugs.add(project.slug);
  if (typeof project.visible !== 'boolean') errors.push(`${label}.visible: use true or false.`);
  if (!Number.isFinite(project.order)) errors.push(`${label}.order: use a number.`);
  if (project.visible && orders.has(project.order)) errors.push(`${label}: visible projects must have different order numbers.`);
  if (project.visible) orders.add(project.order);
  for (const key of ['title', 'kind', 'summary']) requireString(project[key], `${label}.${key}`);
  if (project.year !== undefined && (!Number.isInteger(project.year) || project.year < 1900 || project.year > 2100)) errors.push(`${label}.year: use a year number or omit it.`);
  if (project.role !== undefined) requireString(project.role, `${label}.role`);
  for (const key of ['alternateTitle', 'titleLanguage']) if (project[key] !== undefined) requireString(project[key], `${label}.${key}`);
  if (!['case', 'showcase'].includes(project.contentLevel)) errors.push(`${label}.contentLevel must be "case" or "showcase".`);
  if (project.trailerMediaId !== undefined) checkMediaId(project.trailerMediaId, `${label}.trailerMediaId`);
  if (project.galleryLayout !== undefined && !['grid','scroll','album'].includes(project.galleryLayout)) errors.push(`${label}.galleryLayout: use grid, scroll or album.`);
  if (project.galleryTitle !== undefined) requireString(project.galleryTitle, `${label}.galleryTitle`);
  checkMediaId(project.coverMediaId, `${label}.coverMediaId`);
  requireArray(project.galleryMediaIds, `${label}.galleryMediaIds`).forEach(id => checkMediaId(id, label));
  if (project.photoAlbums !== undefined) {
    const albums = requireArray(project.photoAlbums, `${label}.photoAlbums`);
    if (!albums.length) errors.push(`${label}.photoAlbums: add at least one album.`);
    const titles = new Set();
    albums.forEach((album, albumIndex) => {
      const albumLabel = `${label}.photoAlbums[${albumIndex}]`;
      requireString(album.title, `${albumLabel}.title`);
      if (titles.has(album.title)) errors.push(`${albumLabel}.title: use a unique album title.`);
      titles.add(album.title);
      const ids = requireArray(album.mediaIds, `${albumLabel}.mediaIds`);
      if (!ids.length) errors.push(`${albumLabel}.mediaIds: add at least one photograph.`);
      ids.forEach(id => checkMediaId(id, albumLabel));
    });
  }
  if (project.contributions) requireArray(project.contributions, `${label}.contributions`).forEach(v => requireString(v, label));
  if (project.decisions) requireArray(project.decisions, `${label}.decisions`).forEach(d => { requireString(d.title, label); requireString(d.body, label); if (d.mediaId) checkMediaId(d.mediaId, label); });
  if (project.recognition) requireArray(project.recognition, `${label}.recognition`).forEach(r => { requireString(r.label, label); checkUrl(r.sourceUrl, label); if (r.description !== undefined) requireString(r.description, `${label}.recognition.description`); });
  if (project.musicVideos) requireArray(project.musicVideos, `${label}.musicVideos`).forEach((video, videoIndex) => {
    const videoLabel = `${label}.musicVideos[${videoIndex}]`;
    requireString(video.title, `${videoLabel}.title`);
    if (!Number.isInteger(video.year) || video.year < 1900 || video.year > 2100) errors.push(`${videoLabel}.year: use a valid year.`);
    requireString(video.role, `${videoLabel}.role`);
    checkUrl(video.videoUrl, `${videoLabel}.videoUrl`);
    const clipIds = requireArray(video.clipMediaIds, `${videoLabel}.clipMediaIds`);
    if (!clipIds.length) errors.push(`${videoLabel}.clipMediaIds: add at least one clip.`);
    clipIds.forEach(id => { checkMediaId(id, videoLabel); if (media[id] && !media[id].motionVideoSrc) errors.push(`${videoLabel}: media ID "${id}" needs motionVideoSrc.`); });
  });
  if (project.shortLong) {
    const clips = requireArray(project.shortLong.clipMediaIds, `${label}.shortLong.clipMediaIds`);
    if (!clips.length) errors.push(`${label}.shortLong.clipMediaIds: add at least one clip.`);
    clips.forEach(id => { checkMediaId(id, label); if (media[id] && !media[id].fullVideoSrc) errors.push(`${label}: media ID "${id}" needs fullVideoSrc.`); });
    const longVideos = requireArray(project.shortLong.longVideos, `${label}.shortLong.longVideos`);
    if (!longVideos.length) errors.push(`${label}.shortLong.longVideos: add at least one video.`);
    longVideos.forEach((video, index) => {
      const videoLabel = `${label}.shortLong.longVideos[${index}]`;
      requireString(video.title, `${videoLabel}.title`);
      checkUrl(video.videoUrl, `${videoLabel}.videoUrl`);
      checkMediaId(video.posterMediaId, `${videoLabel}.posterMediaId`);
      try {
        const url = new URL(video.videoUrl);
        if (!['youtube.com', 'www.youtube.com'].includes(url.hostname) || !/^[\w-]{11}$/.test(url.searchParams.get('v') || '')) throw Error();
      } catch { errors.push(`${videoLabel}.videoUrl: use a YouTube watch URL with a video ID.`); }
    });
  }
  if (project.production) {
    checkMediaId(project.production.storyboard?.mediaId, `${label}.production.storyboard.mediaId`);
    requireString(project.production.storyboard?.title, `${label}.production.storyboard.title`);
    requireString(project.production.storyboard?.description, `${label}.production.storyboard.description`);
    checkMediaId(project.production.crew?.mediaId, `${label}.production.crew.mediaId`);
    requireString(project.production.crew?.title, `${label}.production.crew.title`);
    requireString(project.production.credits?.title, `${label}.production.credits.title`);
    requireString(project.production.credits?.subtitle, `${label}.production.credits.subtitle`);
    requireArray(project.production.credits?.groups, `${label}.production.credits.groups`).forEach((group, groupIndex) => {
      requireString(group.title, `${label}.production.credits.groups[${groupIndex}].title`);
      requireArray(group.entries, `${label}.production.credits.groups[${groupIndex}].entries`).forEach((entry, entryIndex) => {
        requireString(entry.role, `${label}.production.credits.groups[${groupIndex}].entries[${entryIndex}].role`);
        requireArray(entry.names, `${label}.production.credits.groups[${groupIndex}].entries[${entryIndex}].names`).forEach(name => requireString(name, `${label}.production.credits.groups[${groupIndex}].names`));
      });
    });
  }
}
for (const [id, asset] of Object.entries(media)) {
  requireString(asset.alt, `media.${id}.alt`);
  if (!(asset.width > 0 && asset.height > 0)) errors.push(`media.${id}: width and height must be positive numbers.`);
  if (typeof asset.isPlaceholder !== 'boolean') errors.push(`media.${id}.isPlaceholder: use true or false.`);
  if (asset.objectFit !== undefined && !['cover', 'contain'].includes(asset.objectFit)) errors.push(`media.${id}.objectFit: use "cover" or "contain".`);
  if (asset.frameAspectRatio !== undefined && !(typeof asset.frameAspectRatio === 'number' && asset.frameAspectRatio > 0)) errors.push(`media.${id}.frameAspectRatio: use a positive number.`);
  if (asset.srcSet !== undefined) {
    requireString(asset.srcSet, `media.${id}.srcSet`);
    for (const candidate of String(asset.srcSet).split(',')) {
      const match = candidate.trim().match(/^(\S+)\s+([1-9]\d*)w$/);
      if (!match) { errors.push(`media.${id}.srcSet: use paths with width descriptors, e.g. /media/cover-480.webp 480w.`); continue; }
      const path = match[1];
      if (!path.startsWith('https://') && (!path.startsWith('/') || path.includes('..') || !existsSync(resolve(root, 'public', path.slice(1))))) errors.push(`media.${id}.srcSet: file "${path}" is missing under public/.`);
    }
  }
  for (const key of ['posterSrc', 'previewSrc', 'fullVideoSrc', 'motionVideoSrc']) {
    const path = asset[key];
    if (path === undefined && key !== 'posterSrc') continue;
    if (typeof path !== 'string') { errors.push(`media.${id}.${key}: a path is required.`); continue; }
    if (path.startsWith('https://')) continue;
    if (!path.startsWith('/') || path.includes('..') || !existsSync(resolve(root, 'public', path.slice(1)))) errors.push(`media.${id}.${key}: file "${path}" is missing under public/ (or use HTTPS).`);
  }
}
if (errors.length) { console.error('Content checks failed:\n' + errors.map(e => `- ${e}`).join('\n')); process.exit(1); }
console.log(`Content valid: ${projects.filter(p => p.visible).length} visible projects, ${Object.keys(media).length} media assets, mode=${site.mediaMode}.`);
