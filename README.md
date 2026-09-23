# FreshOut Education — website

Static marketing site for FreshOut Education (freshouteducation.org).

- `public/index.html` — the entire site (single page; hero video is embedded inline)
- `public/FOE Site Images/web/` — the optimized images the page references
- `firebase.json` / `.firebaserc` — Firebase Hosting config (project `freshout-education`)
- `.github/workflows/firebase-hosting-merge.yml` — deploys `main` to Firebase Hosting; `firebase-hosting-pull-request.yml` — deploys each PR to a preview channel

## Deploy manually

    npm install -g firebase-tools   # once
    firebase login                  # once
    firebase deploy --only hosting

Live at https://freshout-education.web.app

## Editing

Edit `public/index.html` on a branch and open a pull request. The PR workflow
deploys a preview channel; once the release checklist below is ticked and the PR
is approved, merging to `main` deploys the live site. Never push to `main`
directly. The repo + commit hash is the record of what is live.

## Release checklist

Every change ships through a pull request. Before merging, the PR author checks:

- [ ] Preview channel checked on a phone and on desktop
- [ ] No Content-Security-Policy violations in the browser console on any page or form
- [ ] No new external script or iframe added without a matching CSP update noted in the PR
- [ ] Approved by Julyanna or Anthony

## Branch protection on `main` (GitHub → Settings → Branches → Add rule for `main`)

Julyanna turns these on once; they make the checklist enforceable.

- Require a pull request before merging (1 approval)
- Require status checks to pass before merging → select the PR preview-channel check ("Deploy to Firebase Hosting on PR / preview")
- Do not allow bypassing the above settings (include administrators)
- Block force pushes
- Restrict who can push to matching branches (no direct pushes; everyone goes through a PR)
- Do not allow deletions
