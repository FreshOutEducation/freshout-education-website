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

## Phase 4 — PR preview deploy (2026-09-30, ~15:20–15:30 PDT)

Path: branch `seo/static-build` (commit a270ee2, author Fresh Out Labs <info@freshouteducation.org>), committed from the session's shell with Julyanna's OK ("you run git for me"); pushed by Julyanna from GitHub Desktop (File → Add Local Repository → Publish branch — the repo was not open in Desktop yet). PR #2 opened by the session with the release-checklist template: https://github.com/FreshOutEducation/freshout-education-website/pull/2
Workflow "Deploy to Firebase Hosting on PR" run 36785853599: Success, 36 s. Log tail: `found 43 files in public-static` … `Deploy complete` … `Channel URL (freshout-education): https://freshout-education--pr-2-70bjf24l.web.app [expires 2026-10-07 22:29:51]`.
Live site untouched (main still 57efb91).

## Phase 5 — verification on the PR preview (browser pane, 2026-09-30 ~15:30–15:45 PDT)

Preview: https://freshout-education--pr-2-70bjf24l.web.app (same build main will serve; canonicals point at freshouteducation.org by design).

| # | Check | Result | Proof (fetch() from the pane, cache: no-store) |
|---|---|---|---|
| 1 | Every sitemap URL 200, distinct title, h1=1, canonical = own prod URL, ld+json=3, both verification tags | ✔ | / 121,028 B "FreshOut Education \| Fresh out of anything…" · /people 134,775 B "For people: programs \| …" · /organizations 118,404 B "For organizations: host, train, refer \| …" · /about 115,341 B "Why FreshOut: the name, the story, the people \| …" · /support 109,500 B "Support: donate, fund a cohort, partner \| …" · /contact 109,327 B "Contact \| …". All: h1=1, ld=3 (NGO, WebSite, WebPage), g=1, b=1, canonical https://freshouteducation.org/<slug>. Transfer ~23–30 KB compressed. |
| 2 | Text in HTML, no loading placeholder, fraction of old size | ✔ | raw / contains the H1 "Fresh out of anything…"; no Loading/Unpacking; 5,653,080 B → 121,028 B (−97.9%) |
| 3 | sitemap.xml / robots.txt live | ✔ | sitemap 200 application/xml, 6 `<loc>`; robots 200 text/plain: allow-all + Sitemap line |
| 3b | Real 404 | ✔ | /404-test-zz → HTTP 404, "Page not found \| FreshOut Education", `<meta name="robots" content="noindex">`; /support.html → 404 |
| 4 | Redirects | ✔ | /people/ → /people · /people/index.html → /people · /index.html → / · /about/ → /about. Legacy hash: fresh load of /#/people/ai → forwarded to /people#ai, AI tab selected, scrolled (scrollY 930). www→bare is a Firebase domain setting, unchanged. |
| 4b | Hash links (the injected helper) | ✔ | fresh load /people#ai → tab "03 AI for Everyday Life" selected + scrolled; same-page click "How to join" → smooth scroll to #join; same-page click "Money Basics" (/people#money) → tab switched (panel-money) + scrolled to data-anchor |
| 5 | Looks and works | ✔ | Desktop screenshots of /, /people, /support (in chat; Givebutter form renders on /support). Static mode confirmed: body data-page set, 1 `.page.active`, nav highlight follows page. Hero video plays from /assets/hero.mp4 (readyState 4, currentTime advancing), poster /assets/hero-poster.jpg. Phone width 375: menu opens (aria-expanded=true) and closes; menu → "For organizations" loads /organizations with menu closed, no horizontal overflow. Donate hover: bg rgb(201,191,227) → rgb(218,211,236). Console: zero CSP violations; only errors were the session's own 404 test fetches. mp4/jpg cache immutable 1y as configured. |
| 6 | Contact form, once | ✔ (site side) | Name "Deploy test", Organization "FreshOut Education", email info@freshouteducation.org, message "static site deploy check" → success message shown, form hidden, mailto composed to info@freshouteducation.org?subject=Message from the website. Form is mailto-based (D3); "receipt" = the draft opening in the operator's mail app; Julyanna to confirm. |
| 7 | Structured data | see below | JSON-LD parses on all 6 pages. Rich Results Test (preview URL, 2026-09-30 21:06 UTC): Organization — 1 valid item detected, FreshOut Education, 2 non-critical: Missing field "postalCode" (optional), Missing field "streetAddress" (optional) — expected, no public street address. All ORG fields read back correctly (NGO, legalName, email, foundingDate 2019, Nonprofit501c3, taxID, Los Angeles CA US). Test also reported "URL is not available to Google / crawl failed" for the temporary preview host; to be re-run on the live URL after merge. |
| 8 | PageSpeed baseline | see Phase 5b | taken on the live URL after merge |

Observation, not changed: Firebase returns `cache-control: max-age=3600` for extension-less page URLs because the `**/*.html` header rule matches file names, not clean URLs. Same as before this change. Ops ticket, not part of this deploy.

## Phase 4b — LIVE deploy (2026-09-30)

Merge gate: branch protection required 1 approving review and GitHub does not let the PR author approve; no admin bypass was offered. Julyanna (admin) temporarily relaxed the `main` rule herself and merged PR #2 (the session was not permitted to edit the rule and did not). **Reminder: re-enable "Require approvals" on the `main` rule (Settings → Branches → Edit).**
Merge commit `090a45d` → workflow "Deploy to Firebase Hosting on merge" run 36815467066 (#8): Success, 37 s. Log: `found 43 files in public-static` … `release complete` … `Deploy complete!` · `Hosting URL: https://freshout-education.web.app` · `Project Console: https://console.firebase.google.com/project/freshout-education/overview`. Live at https://freshouteducation.org ~14:30 PDT (21:30 UTC).

## Phase 5b — verification on the LIVE domain (browser pane, 2026-09-30 ~14:32–14:36 PDT)

| # | Check | Result | Proof |
|---|---|---|---|
| 1 | Every sitemap URL | ✔ | / 200 "FreshOut Education \| Fresh out of anything…" canonical https://freshouteducation.org/ · /people 200 "For people: programs \| …" · /organizations 200 "For organizations: host, train, refer \| …" · /about 200 "Why FreshOut: …" (AboutPage) · /support 200 "Support: donate, fund a cohort, partner \| …" · /contact 200 "Contact \| …" (ContactPage). All: h1=1, ld+json=3 valid (NGO, WebSite, WebPage/AboutPage/ContactPage), google-site-verification=1, msvalidate.01=1, canonical = own URL, no loading placeholder. |
| 2 | Text in HTML, size | ✔ | raw / = 121,028 B (was 5,653,080 B, −97.9%), H1 "Fresh out of anything…" present; transfer 26,367 B compressed |
| 3 | sitemap / robots / tags | ✔ | /sitemap.xml 200 application/xml, 6 `<loc>`; /robots.txt 200 allow-all + Sitemap; both tags on / |
| 3b | Real 404 | ✔ | /zz-not-a-page → 404 "Page not found \| FreshOut Education", noindex |
| 4 | Redirects | ✔ | https://www.freshouteducation.org/people → https://freshouteducation.org/people (Firebase domain redirect, unchanged) · /people/ → /people · /index.html → / |
| 5 | Looks and works | ✔ | Home renders identically (screenshot in chat); hero video from /assets/hero.mp4 playing (readyState 4); 1 `.page.active`, static mode (no data-mode). Console: zero CSP violations; only errors = the session's own test fetches (404 probe, cross-origin www probe). Phone-width menu, tabs, hash links, hover, Givebutter and the contact form were verified on the identical build in Phase 5 (preview). |
| 6 | Contact form | ✔ (Phase 5) | one submission on the preview; mailto draft composed; not repeated on live (playbook: do not submit twice) |
| 7 | Rich Results Test (live /) | ✔ | "Crawled successfully on Sep 30, 2026, 9:33:50 PM" · Organization: 1 valid item detected · non-critical: Missing postalCode / streetAddress (optional). WebSite/WebPage are not rich-result types; validated by JSON.parse on every page. |
| 8 | PageSpeed Insights, mobile (lab baseline, not acted on) | recorded | Report 2026-09-30 9:34:41 PM — Performance 84 · Accessibility 98 · Best Practices 77 · SEO 100 · Agentic Browsing 2/2. FCP 3.0 s · LCP 3.7 s · TBT 0 ms · CLS 0 · Speed Index 3.0 s. Field data: none ("No Data"). |

Evidence note: the pane cannot write screenshots to disk; the before/after captures that exist as files are the raw HTML + metrics in seo-evidence/. Visual proof lives in this chat session (https://claude.ai/code/session_01NsoVNeZGfzhqNALHLj16my).

## Phase 6 — consoles (browser pane, account info@freshouteducation.org, 2026-09-30 ~14:38–14:50 PDT)

| # | Step | Result | Proof |
|---|---|---|---|
| 1 | Search Console verify | ✔ | "Ownership auto verified — Verification method: HTML tag" (property https://freshouteducation.org/, URL-prefix). Property URL: https://search.google.com/search-console?resource_id=https://freshouteducation.org/ |
| 2 | Sitemap submitted | ✔ | /sitemap.xml · Submitted Sep 30, 2026 · Last read: — · Status "Couldn't fetch" · Discovered 0. Day-one placeholder per playbook; URL returns XML (checked). Do not resubmit; week-2 check confirms Success. |
| 3 | URL Inspection live tests | ✔ | /people: "URL is available to Google — Page can be indexed" (tested Sep 30, 2026 9:38 PM); View tested page → HTML shows both verification tags, title "For people: programs \| FreshOut Education", description, canonical https://freshouteducation.org/people; SCREENSHOT tab (Google Inspection Tool smartphone) renders the H1 "You don't need experience. You need a seat." · /: "URL is available to Google" (9:40 PM); HTML shows both tags + canonical https://freshouteducation.org/; render shows the hero H1 "Fresh out of … Ready for what's next." Note: Google's stored copy of / dated Sep 13, 2026 was "Page with redirect" with user-declared canonical https://www.freshouteducation.org/ (pre-custom-domain era); the live test + indexing request supersede it. |
| 4 | Request indexing (operator OK given) | ✔ | "Indexing requested — URL was added to a priority crawl queue" for https://freshouteducation.org/ , /people , /organizations (3 of max 3). |
| 5 | Performance report initialised | ✔ | Overview opened; Performance/Indexing show "Processing data, please check again in a day or so". |
| 6 | Bing verify + sitemap | ✔ | Add site manually → HTML Meta Tag → Verify → site home shows "Your data and reports are being processed … up to 48 hours". Sitemaps → Submit → https://freshouteducation.org/sitemap.xml · "Success: … successfully submitted for processing" · Last submit 10/1/2026 (UTC) · Status Processing. Bing site URL: https://www.bing.com/webmasters/home?siteUrl=https%3A%2F%2Ffreshouteducation.org%2F |

Skipped without comment per Phase 8: Domain property (DNS TXT), Google Business Profile, Bing import-from-GSC (meta-tag route succeeded).

## Phase 7 — editor tickets
Written to `EXEC-TICKETS-2026-09-30.md` (T1 sharp images ≥1,600 px if soft; T2 decision note on the "Our Software" nav link vs. the FreshOut360 guardrail; T3 optional clean-URL cache header; T4 og:image is a stock photo). None required for this deploy. Rebuild-and-deploy loop stated at the top of that file and in `STATIC-BUILD.md`.

## Phase 9 — close out (2026-09-30)

Deploy: merge commit `090a45d` on `main`, GitHub Actions run 36815467066, Firebase "Deploy complete!", live ~14:30 PDT 2026-09-30 at https://freshouteducation.org (also https://freshout-education.web.app).
Property URLs: Google Search Console https://search.google.com/search-console?resource_id=https://freshouteducation.org/ · Bing https://www.bing.com/webmasters/home?siteUrl=https%3A%2F%2Ffreshouteducation.org%2F
Verification values (public by design): google-site-verification=yYZQkcymZPC_yohzPWkTuNiuaS7Z9MPDUB_fkaIVtMQ · msvalidate.01=A11781633B642FE82C6EA8B13609193E — both baked in by prerender.mjs VERIFICATION.
Decisions: D1 FreshOut Education (Los Angeles) · D2 no named person · D3 mailto:info@freshouteducation.org · D4 titles unchanged (data-title) · D5/D6 nothing · D7 URL-prefix · key fact: none. Approach: static per-page build, hero video externalised, previewed on PR channel before merge.
Rollback (if ever needed, get an OK first): on a branch `cp firebase.pre-static.json firebase.json`, commit, PR, merge → Actions redeploys the old single-document site from `public/`.

seo-evidence/ file list: before-home-raw.html (git-ignored, = public/index.html @ 57efb91, sha256 9d6a8512…) · before-sitemap-xml-response.html · before-robots-txt-response.html (git-ignored copies of the same document) · before-home-fetch-metrics.txt (committed). Not produced as files (pane screenshots cannot be saved to disk from this session): before-home.png, after-*.png, rich-results-*.png, pagespeed-*.png, gsc-*.png, bing-*.png — the corresponding screenshots and readings are in the chat session and transcribed above.

Skipped, and why:
- "AI assistants, before" (ChatGPT / Perplexity / Claude asked what FreshOut offers and costs) — not captured before the deploy; the session prioritised the build and the window closed at merge. The week-2 and week-6 check-ins ask the same questions; without the before-snapshot the comparison is against "unknown", not against a recorded miss.
- Phase 8 items (Domain property, Google Business Profile, Bing import) — access not at hand / not needed.
- Contact-form receipt confirmation by the operator — the form is mailto; the draft composed correctly; Julyanna to confirm a draft opened in her mail app.

Open for Julyanna:
1. Re-enable "Require approvals" on the `main` branch-protection rule (temporarily relaxed to merge PR #2).
2. Commit this log + EXEC-TICKETS (left on the local branch `docs/seo-deploy-log-2026-09-30`, see below).
3. Week-2 (2026-10-14) and week-6 (2026-11-11) check-ins are scheduled tasks; Appendix A tables apply.
