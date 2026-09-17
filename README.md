# FreshOut Education — website

Static marketing site for FreshOut Education (freshouteducation.org).

- `public/index.html` — the entire site (single page; hero video is embedded inline)
- `public/FOE Site Images/web/` — the optimized images the page references
- `firebase.json` / `.firebaserc` — Firebase Hosting config (project `freshout-education`)
- `.github/workflows/firebase-hosting.yml` — auto-deploys `main` to Firebase Hosting

## Deploy manually

    npm install -g firebase-tools   # once
    firebase login                  # once
    firebase deploy --only hosting

Live at https://freshout-education.web.app

## Editing

Edit `public/index.html`, commit, push to `main`. The GitHub Action deploys it
(or run `firebase deploy --only hosting`). The repo + commit hash is the record
of what is live.
