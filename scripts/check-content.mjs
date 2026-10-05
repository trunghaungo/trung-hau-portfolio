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
requireArray(profile.contact?.socials, 'profile.contact.socials').forEach((s, i) => { requireString(s.label, `socials[${i}].label`); checkUrl(s.url, `socials[${i}].url`); });
requireArray(profile.experience, 'profile.experience').forEach((entry, i) => ['company', 'role', 'period'].forEach(k => requireString(entry[k], `experience[${i}].${k}`)));
['school', 'course', 'period'].forEach(k => requireString(profile.education?.[k], `education.${k}`));
requireArray(profile.tools, 'profile.tools').forEach((v, i) => requireString(v, `tools[${i}]`));
requireArray(profile.approach, 'profile.approach').forEach((v, i) => ['title', 'body'].forEach(k => requireString(v[k], `approach[${i}].${k}`)));
['eyebrow', 'primaryAction', 'secondaryAction'].forEach(k => requireString(profile.hero?.[k], `hero.${k}`));
if (!['demo', 'live'].includes(site.mediaMode)) errors.push('site.mediaMode must be "demo" or "live".');
for (const key of ['enableMotion', 'enableHoverPreview', 'enableViewTransitions']) if (typeof site[key] !== 'boolean') errors.push(`site.${key}: use true or false.`);
for (const key of ['language', 'siteTitle', 'description']) requireString(site[key], `site.${key}`);
requireArray(site.navigation, 'site.navigation').forEach((link, i) => { requireString(link.label, `navigation[${i}].label`); if (!/^\/(?:#[a-z0-9-]+)?$/.test(link.href)) errors.push(`navigation[${i}].href must link to the homepage or a homepage section.`); });
for (const key of ['heroMediaId', 'aboutMediaId']) checkMediaId(site[key], `site.${key}`);
for (const key of ['originalMediaId', 'editedMediaId']) checkMediaId(site.retouch?.[key], `site.retouch.${key}`);
const original = media[site.retouch?.originalMediaId], edited = media[site.retouch?.editedMediaId];
if (original && edited && original.width / original.height !== edited.width / edited.height) errors.push('Retouch images must have the same aspect ratio.');
requireArray(site.portraitMediaIds, 'site.portraitMediaIds').forEach(id => checkMediaId(id, 'site.portraitMediaIds'));
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
  checkMediaId(project.coverMediaId, `${label}.coverMediaId`);
  requireArray(project.galleryMediaIds, `${label}.galleryMediaIds`).forEach(id => checkMediaId(id, label));
  if (project.contributions) requireArray(project.contributions, `${label}.contributions`).forEach(v => requireString(v, label));
  if (project.decisions) requireArray(project.decisions, `${label}.decisions`).forEach(d => { requireString(d.title, label); requireString(d.body, label); if (d.mediaId) checkMediaId(d.mediaId, label); });
  if (project.recognition) requireArray(project.recognition, `${label}.recognition`).forEach(r => { requireString(r.label, label); checkUrl(r.sourceUrl, label); if (r.description !== undefined) requireString(r.description, `${label}.recognition.description`); });
}
for (const [id, asset] of Object.entries(media)) {
  requireString(asset.alt, `media.${id}.alt`);
  if (!(asset.width > 0 && asset.height > 0)) errors.push(`media.${id}: width and height must be positive numbers.`);
  if (typeof asset.isPlaceholder !== 'boolean') errors.push(`media.${id}.isPlaceholder: use true or false.`);
  for (const key of ['posterSrc', 'previewSrc', 'fullVideoSrc']) {
    const path = asset[key];
    if (path === undefined && key !== 'posterSrc') continue;
    if (typeof path !== 'string') { errors.push(`media.${id}.${key}: a path is required.`); continue; }
    if (path.startsWith('https://')) continue;
    if (!path.startsWith('/') || path.includes('..') || !existsSync(resolve(root, 'public', path.slice(1)))) errors.push(`media.${id}.${key}: file "${path}" is missing under public/ (or use HTTPS).`);
  }
}
if (errors.length) { console.error('Content checks failed:\n' + errors.map(e => `- ${e}`).join('\n')); process.exit(1); }
console.log(`Content valid: ${projects.filter(p => p.visible).length} visible projects, ${Object.keys(media).length} media assets, mode=${site.mediaMode}.`);
