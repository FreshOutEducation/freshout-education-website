# DEPLOY LOG — freshouteducation.org — 2026-09-30

Playbook: "Make a JavaScript-rendered site crawlable, measurable and consistent" v1 (2026-09-30), run by a Claude Cowork session with the repo folder connected.
Operator, decision owner and content owner: Julyanna Mendez (confirmed 2026-09-30). Search Console / Bing property owner: info@freshouteducation.org.
Site: https://freshouteducation.org/ · host Firebase Hosting, project `freshout-education` · repo FreshOutEducation/freshout-education-website, branch main, HEAD 57efb91 at start.
Folder on this Mac: "/Users/julyannamendez/Claude -cowork/Freshout Education /freshout-education-website" (note the trailing space in "Freshout Education ").

Layout differs from the playbook's assumed layout: the repo root IS the site folder (there is no `website/` subfolder). This log and `seo-evidence/` therefore live at the repo root. `public/index.html` is the export; `public/` is what Firebase serves.

## Phase 0 — diagnosis and "before" evidence (2026-09-30, ~13:10 PDT)

Network: the session's shells cannot reach the domain (curl → status 000 from the Mac VM and from the cloud container, egress allowlist). All live checks below were made with fetch() in the Claude desktop browser pane at origin https://freshouteducation.org. Raw files were taken from disk after confirming the hash matches the live response.

| Check | Result | Proof |
|---|---|---|
| Live / SHA-256 equals public/index.html on disk | ✔ | both `9d6a85125c996a7e6defd6bd57fad874d2fd3039d93141b48385e376cb556058`, 5,653,080 bytes |
| Raw / is a bundle export with a loading placeholder | ✘ (not the case) | no "Loading"/"Unpacking" text; the document is hand-written HTML with real text — crawlers DO receive the page copy |
| Raw / contains `<h1>` | ✔ | 6 H1s (one document); first: "Fresh out of anything. …" |
| Size of raw / | ✘ 5.65 MB | hero video is inlined as base64 (see Deployment & File Locations); crawlers must download 5.65 MB of HTML to read ~30 KB of text |
| Per-page `<title>` | ✘ | one title for every path: "FreshOut Education \| Fresh out of anything. Ready for what's next." |
| meta description | ✔ 1 (site-wide) | same on every path |
| rel="canonical" | ✘ 0 | none on any path |
| JSON-LD structured data | ✘ 0 | none |
| Open Graph | ✔ | og:title, og:description, og:image, og:type |
| /sitemap.xml | ✘ | does not exist — returns the home document (200, text/html, 5.65 MB) |
| /robots.txt | ✘ | does not exist — returns the home document (200, text/html) |
| Distinct pages | ✘ | /, /people, /organizations, /about, /support, /contact and ANY path (tested /nonexistent-zz) all return the identical 5.65 MB document with status 200 — `firebase.json` rewrites `**` → /index.html. To Google these are one URL's worth of content served at six addresses, plus a soft-404 for everything else. |
| Static build (`public-static/`, `prerender.*`, `firebase.static.json`) | ✘ | none exists. Per the operator's instruction: stop after Phase 0 and report; do not build one without asking. |

Evidence written to `seo-evidence/`:
- before-home-raw.html — byte-exact copy of the live / response (hash-verified against the fetch)
- before-sitemap-xml-response.html, before-robots-txt-response.html — what those URLs actually return today (the home document); there is no sitemap.xml or robots.txt to save
- before-home-fetch-metrics.txt — status / bytes / counts per path, response headers
- before-home.png — NOT captured: the browser-pane screenshot cannot be written to disk from this session. Operator: take one (⌘⇧4) before anything is deployed.
- "AI assistants, before" (ChatGPT / Perplexity / Claude asked what FreshOut offers and what it costs) — NOT yet captured; to be done before any deploy, after the open questions below are answered (needs sign-ins in the pane).

Conclusion of Phase 0: the site is not a JS-rendered export, so the playbook's headline problem (no text for crawlers) does not apply. What DOES apply: no per-page titles/descriptions/canonicals, no structured data, no sitemap, no robots.txt, no real 404, and a 5.65 MB HTML document. That is a smaller job than the playbook's full static rebuild, but it still needs a decision on approach (see report in chat).

## Open questions (asked 2026-09-30) — all answered, see Phase 1
- Decision owner and content owner names; Google account that must own the Search Console property.
- Legal entity string for the ORG schema (default per project: "FreshOut Education"); contact email; location "Los Angeles".
- The one price/offer that must appear in the fetched HTML — the site is a nonprofit; confirm what the "key fact" is (e.g. "free" programs, or none).
- Whether to build a static, per-page version (playbook path) or add the missing metadata to the existing single document (smaller change, but /about etc. keep sharing one title). Not started without an answer.

## Housekeeping
- `git status` from the session's shell left `.git/index.lock` behind; removed the same session (2026-09-30) with the operator's delete permission. GitHub Desktop is unblocked.

## Phase 1 — decisions (2026-09-30, decision owner: Julyanna)

Approach: static per-page build (playbook path) WITHOUT a headless browser — the export already contains a multi-page mode (body without `data-mode="preview"`), so `prerender.mjs` is a plain text transform. Hero video and poster written out to `public-static/assets/` (Julyanna's call, "with the video moved to a file"). Nothing goes live before every Phase 5 check passes on the PR preview channel.

| # | Item | Answer |
|---|---|---|
| D1 | Legal entity | FreshOut Education (Los Angeles) — legalName in ORG |
| D2 | Named person in schema | no |
| D3 | Contact form | stays mailto:info@freshouteducation.org (the export's FORM_TO); live test = the mail draft opens |
| D4 | Titles | keep the six `data-title` values already in the export; no rebuild-for-title needed |
| D5 | Platforms/vendors named | none to add. Note for the decision owner: the live nav already links "Our Software" → freshout360.com (pre-existing visible copy; not touched) |
| D6 | Traction lines | nothing to change |
| D7 | Search Console property | URL-prefix https://freshouteducation.org/ |
| — | Key fact / price | none — skip that check (nonprofit; the site says "Free, always") |

## Build (Phase 0 step 3 re-run on the new build, 2026-09-30 ~14:57 PDT)

`node prerender.mjs` → six "wrote" lines + 404 + sitemap + "done". Files: prerender.mjs, firebase.static.json, STATIC-BUILD.md, public-static/ (8.5 MB incl. 3.95 MB hero.mp4 and 3.2 MB images). No package.json, no node_modules, no dependencies.

| file | title | desc | canonical | ld+json | h1 | bytes |
|---|---|---|---|---|---|---|
| public-static/index.html | 1 | 1 | 1 | 3 | 1 | 120,885 |
| public-static/people/index.html | 1 | 1 | 1 | 3 | 1 | 134,632 |
| public-static/organizations/index.html | 1 | 1 | 1 | 3 | 1 | 118,261 |
| public-static/about/index.html | 1 | 1 | 1 | 3 | 1 | 115,252 |
| public-static/support/index.html | 1 | 1 | 1 | 3 | 1 | 109,357 |
| public-static/contact/index.html | 1 | 1 | 1 | 3 | 1 | 109,184 |

✔ all six: title=1 desc=1 canonical=1 ld=3 h1=1; titles distinct; canonical = own URL (no trailing slash, matching today's URLs). ✔ sitemap.xml lists 6 `<loc>`. ✔ robots.txt allow-all + sitemap. ✔ JSON-LD parses on every page (NGO, WebSite, WebPage/AboutPage/ContactPage). ✔ no base64 blob left inline; hero refs → /assets/hero.mp4, /assets/hero-poster.jpg (CSP media-src/img-src 'self' already allow them). ✔ firebase.static.json parses: public=public-static, cleanUrls, trailingSlash=false, same headers, catch-all rewrite removed so 404.html serves. 32/32 images copied.
Build-time additions disclosed: a 3-line inline helper per page (hash → tab/anchor scroll, legacy `#/page/anchor` forwarder) and a `404.html` (site shell + one line, noindex). Page size 5.65 MB → ~110–135 KB.

## Phase 2 — verification tokens (browser pane, 2026-09-30 ~15:05 PDT)

✔ Browser pane signed in to Google as Fresh Out Education <info@freshouteducation.org> (managed by freshouteducation.org) — confirmed from the account menu before adding anything.
✔ Search Console → Add property → URL prefix → https://freshouteducation.org/ → property created, "Verify ownership" dialog left open (not verified yet). HTML tag value: `google-site-verification=yYZQkcymZPC_yohzPWkTuNiuaS7Z9MPDUB_fkaIVtMQ` → set in prerender.mjs VERIFICATION.google, rebuilt; tag present on all six pages (grep = 1 each).
✘→✔ Bing Webmaster Tools: pane was signed in as Chronicles Consulting <consulting@vettingchronicles.com> — wrong account; stopped and reported (nothing touched in that account). Julyanna switched the pane to Fresh Out Education <info@freshouteducation.org> (confirmed from the profile panel). Add site manually → https://freshouteducation.org/ → HTML Meta Tag value `msvalidate.01=A11781633B642FE82C6EA8B13609193E` → set in VERIFICATION.bing, rebuilt; both tags on all six pages (grep = 1 each). Bing dialog left open, not verified yet.
Standing instruction from Julyanna (2026-09-30): whenever a browser account is the wrong one, notify her right away before doing anything else.
