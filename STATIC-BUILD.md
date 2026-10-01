# STATIC-BUILD — how the site is built and shipped (from 2026-09-30)

`public/index.html` is still the file you edit (the "export"). It is no longer what Firebase serves.
`public-static/` is what Firebase serves: one folder per page, each with its own title, description, canonical
link and structured data, plus `sitemap.xml`, `robots.txt`, `404.html`, the images, and the hero video as a file.

**Every edit to `public/index.html` must be followed by the build step, or the live site silently stays on the previous version.**

## The loop (Terminal, in the repo folder)

    node prerender.mjs        # rewrites public-static/ from public/index.html — no npm install needed

Expect six "wrote …/index.html" lines, "wrote public-static/404.html", the sitemap line, then "done".
Then commit `public/index.html` AND `public-static/` together on a branch, open the PR, check the preview
channel, merge. The merge workflow deploys `public-static/` because `firebase.json` points at it.

## What lives where
- `prerender.mjs` — the build. Only three blocks are meant to be edited, at the top: `PAGES` (meta descriptions;
  titles come from each page's `data-title` in the export), `ORG` (structured data — must match visible text),
  `VERIFICATION` (Search Console / Bing meta-tag values).
- `firebase.json` — live hosting config (points at `public-static`, no catch-all rewrite). `firebase.pre-static.json`
  is the previous config (points at `public`); swapping it back and deploying is the rollback.
- `firebase.static.json` — the same as the live config; kept as the reference copy.
- `public-static/assets/hero.mp4` — the hero video, written out from the base64 in the export. Cached for a year by
  the CDN; if the video ever changes, change the file name in `prerender.mjs` too.

## What the build adds to each page (nothing visible changes)
`<title>` from the page's `data-title`; a meta description; `rel=canonical`; `og:url`; verification tags; three
JSON-LD blocks (NGO, WebSite, WebPage); a 3-line script that makes `#anchor` links open tabs and scroll the way the
in-page router did, and forwards old `#/page/anchor` links. The body loses `data-mode="preview"`, which turns the
export's own multi-page mode on.

## Do not
Hand-edit files in `public-static/` — they are overwritten on the next build. Edit the export or `prerender.mjs`.
