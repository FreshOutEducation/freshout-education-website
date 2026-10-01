// prerender.mjs — builds public-static/ from public/index.html (the editor export).
// Plain Node (>=18); no headless browser, no npm install. Run: node prerender.mjs
// Edit only the three blocks below (PAGES, ORG, VERIFICATION). Everything else is mechanical.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://freshouteducation.org';

// Titles come from the export's own data-title attributes (D4: keep current). Descriptions are metadata only.
const PAGES = {
  index:         { slug: '',              type: 'WebPage',     description: 'A Los Angeles nonprofit teaching money, technology, AI, and career skills to anyone starting over, and training the nonprofits that serve them.' },
  people:        { slug: 'people',        type: 'WebPage',     description: 'Four programs that teach what nobody taught you: how money works, how your phone works, how AI can work for you, and how to get hired. In person or virtually, in Los Angeles, in plain English.' },
  organizations: { slug: 'organizations', type: 'WebPage',     description: 'Bring FreshOut to your building. We bring the money, tech, and AI teaching, for your clients and for your staff. Host a program, train your team, or refer someone.' },
  why:           { slug: 'about',         type: 'AboutPage',   description: 'We started in reentry. We stayed for everyone starting over. Why FreshOut Education is called what it is, how it began in 2019, and the people behind it.' },
  support:       { slug: 'support',       type: 'WebPage',     description: 'Fund the room where a fresh start becomes a real one. Give to FreshOut Education, a Los Angeles 501(c)(3) public charity teaching money, tech, AI, and career skills.' },
  contact:       { slug: 'contact',       type: 'ContactPage', description: 'Say hello. A person will reply. Whether you want a seat, want to bring FreshOut to your organization, want to refer someone, or want to fund the work, start here.' },
};

// Every value below is visible on the site (About/Support pages) or in the project's Canonical Numbers. Nothing else goes in.
const ORG = {
  '@type': 'NGO',
  '@id': SITE + '/#organization',
  name: 'FreshOut Education',
  legalName: 'FreshOut Education',
  url: SITE + '/',
  email: 'info@freshouteducation.org',
  foundingDate: '2019',
  nonprofitStatus: 'https://schema.org/Nonprofit501c3',
  taxID: '87-4636609',
  address: { '@type': 'PostalAddress', addressLocality: 'Los Angeles', addressRegion: 'CA', addressCountry: 'US' },
  areaServed: { '@type': 'City', name: 'Los Angeles' },
  description: PAGES.index.description,
};

// Search Console / Bing Webmaster meta-tag values (public by design). Empty string = tag omitted.
const VERIFICATION = { google: 'yYZQkcymZPC_yohzPWkTuNiuaS7Z9MPDUB_fkaIVtMQ', bing: 'A11781633B642FE82C6EA8B13609193E' };

// ---------------------------------------------------------------------------------------------
const SRC = 'public/index.html';
const OUT = 'public-static';
let html = readFileSync(SRC, 'utf8');
const die = (m) => { console.error('ERROR: ' + m); process.exit(1); };

// 1. Externalise the inline hero video + poster (bytes unchanged; only where they are served from).
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });
const vid = html.match(/<source src="data:video\/mp4;base64,([A-Za-z0-9+/=]+)"/);
if (!vid) die('hero video base64 not found');
writeFileSync(join(OUT, 'assets', 'hero.mp4'), Buffer.from(vid[1], 'base64'));
html = html.replace(vid[0], '<source src="/assets/hero.mp4"');
const pos = html.match(/poster="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/);
if (!pos) die('hero poster base64 not found');
writeFileSync(join(OUT, 'assets', 'hero-poster.jpg'), Buffer.from(pos[1], 'base64'));
html = html.replace(pos[0], 'poster="/assets/hero-poster.jpg"');
if (/;base64,[A-Za-z0-9+/=]{2000,}/.test(html)) die('a large base64 blob is still inline');

// 2. Split the document: [before main] [page blocks] [after main]
const mainOpen = html.indexOf('<main id="main">');
const mainClose = html.indexOf('</main>');
if (mainOpen < 0 || mainClose < 0) die('main not found');
const before = html.slice(0, mainOpen + '<main id="main">'.length);
const after = html.slice(mainClose);
const inner = html.slice(mainOpen + '<main id="main">'.length, mainClose);
const starts = [...inner.matchAll(/<div class="page" data-page="([a-z]+)" data-title="([^"]+)">/g)];
if (starts.length !== Object.keys(PAGES).length) die('expected ' + Object.keys(PAGES).length + ' page blocks, found ' + starts.length);
const blocks = {};
starts.forEach((m, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].index : inner.length;
  blocks[m[1]] = { title: m[2], body: inner.slice(m.index, end) };
});

// 3. Static-mode helper: hash → tab/anchor (the export's router did this only in preview mode) + legacy #/page/anchor forwarder.
const HELPER = `<script>(function(){var P={'':'','index':'','people':'people','organizations':'organizations','about':'about','why':'about','support':'support','donate':'support','contact':'contact'};var m=location.hash.match(/^#\\/([a-z-]*)\\/?([a-z-]*)$/i);if(m&&(m[1].toLowerCase() in P)){location.replace('/'+P[m[1].toLowerCase()]+location.search+(m[2]?'#'+m[2]:''));return;}
function go(smooth){var a=location.hash.replace(/^#\\/?/,'').split('/')[0];if(!a)return;var t=document.querySelector('.tabs');if(t&&t.activateTab)t.activateTab(a);var el=document.getElementById(a)||document.querySelector('[data-anchor="'+a+'"]');if(el)el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});}
window.addEventListener('load',function(){setTimeout(function(){go(false)},120)});window.addEventListener('hashchange',function(){go(true)});})();</script>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const ld = (o) => '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', ...o }) + '</script>';
const urlOf = (slug) => SITE + '/' + slug;

function buildPage(id) {
  const p = PAGES[id], b = blocks[id];
  const url = urlOf(p.slug);
  let doc = before + b.body.replace('<div class="page" data-page="' + id + '"', '<div class="page active" data-page="' + id + '"') + after;
  // body: static mode (no data-mode="preview"), page id for nav highlighting
  doc = doc.replace(/<body data-page="index" data-mode="preview">/, '<body data-page="' + id + '">');
  if (!doc.includes('<body data-page="' + id + '">')) die('body tag not rewritten for ' + id);
  // head
  doc = doc.replace(/<title>[^<]*<\/title>/, '<title>' + esc(b.title) + '</title>');
  doc = doc.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + esc(p.description) + '">');
  doc = doc.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + esc(b.title) + '">');
  doc = doc.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + esc(p.description) + '"><meta property="og:url" content="' + url + '"><link rel="canonical" href="' + url + '">');
  const ver = (VERIFICATION.google ? '<meta name="google-site-verification" content="' + VERIFICATION.google + '">' : '') + (VERIFICATION.bing ? '<meta name="msvalidate.01" content="' + VERIFICATION.bing + '">' : '');
  doc = doc.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + ver);
  const jsonld = ld(ORG) + ld({ '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: 'FreshOut Education', publisher: { '@id': ORG['@id'] } })
    + ld({ '@type': p.type, '@id': url + '#webpage', url, name: b.title, description: p.description, isPartOf: { '@id': SITE + '/#website' }, about: { '@id': ORG['@id'] }, inLanguage: 'en' });
  doc = doc.replace('</head>', jsonld + '\n</head>');
  doc = doc.replace('</body>', HELPER + '\n</body>');
  const dir = p.slug ? join(OUT, p.slug) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), doc);
  console.log('wrote ' + join(dir, 'index.html') + ' (' + statSync(join(dir, 'index.html')).size + ' bytes)');
  return url;
}
const urls = Object.keys(PAGES).map(buildPage);

// 4. 404 page: the site shell (same head, header, footer, styles) around one line. Not linked from anywhere.
{
  let doc = before + '<div class="page active" data-page="contact"><section class="page-hero" aria-label="Not found"><div class="container"><h1>That page doesn\'t exist.</h1><p class="lead">Try the <a href="/">home page</a> or <a href="/contact">say hello</a>.</p></div></section></div>' + after;
  doc = doc.replace(/<body data-page="index" data-mode="preview">/, '<body data-page="">');
  doc = doc.replace(/<title>[^<]*<\/title>/, '<title>Page not found | FreshOut Education</title>');
  doc = doc.replace('<head>', '<head><meta name="robots" content="noindex">');
  writeFileSync(join(OUT, '404.html'), doc);
  console.log('wrote ' + join(OUT, '404.html'));
}

// 5. Images referenced relatively by the export, sitemap, robots.
const copyDir = (src, dst) => { mkdirSync(dst, { recursive: true }); for (const e of readdirSync(src, { withFileTypes: true })) { if (e.name.startsWith('.')) continue; e.isDirectory() ? copyDir(join(src, e.name), join(dst, e.name)) : copyFileSync(join(src, e.name), join(dst, e.name)); } };
copyDir('public/FOE Site Images', join(OUT, 'FOE Site Images'));
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map((u) => '  <url><loc>' + u + '</loc><lastmod>' + today + '</lastmod></url>').join('\n') + '\n</urlset>\n');
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n');
console.log('wrote sitemap.xml (' + urls.length + ' urls), robots.txt; copied FOE Site Images');
console.log('done');
