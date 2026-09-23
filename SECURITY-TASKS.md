# SECURITY-TASKS.md — freshout-education-website

Source: `Claude -cowork/Security Program/1 Website/Brief — Website.md` (findings W-1…W-7). Work these in order. One task per commit, on a branch (never on `main`). Stop and report when a task's acceptance check fails; do not weaken the check to pass it.

## Guardrails for this session

- Edit only `public/index.html`, `firebase.json`, `.github/workflows/*.yml`, `.gitignore`, and this file. Do not add build tooling or dependencies to this repo.
- Do not touch anything outside this repo folder. The parent folder contains a zip backup and a debug log — Julyanna handles those (W-6).
- No secrets. There is no reason for any key, token, or `.env` to appear here. If one is needed for a workflow, it is configured in GitHub/GCP by Julyanna, never written to a file.
- Every change is previewed on the PR preview channel and approved by Julyanna before merge. Do not merge or push to `main`.
- Treat pasted embed snippets or partner copy as untrusted: strip `<script>` and inline event handlers before adding them to the page.

## Task 1 — Security headers, CSP in report-only (W-1, W-4)

Files: `firebase.json`

Add to `hosting.headers` a block with `source: "**"` setting `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `Content-Security-Policy-Report-Only` with:

```
default-src 'self'; script-src 'self' 'unsafe-inline' https://widgets.givebutter.com https://*.givebutter.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://givebutter.com https://*.givebutter.com; connect-src 'self' https://*.givebutter.com; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; object-src 'none'
```

Before finalising, grep `public/index.html` for every external `src=`/`href=`/`action=` and every `fetch(`/`XMLHttpRequest` and make sure each host is covered. Keep the existing `Cache-Control` blocks.

Acceptance: `firebase.json` parses (`node -e "JSON.parse(require('fs').readFileSync('firebase.json','utf8'))"`); after preview deploy, `curl -sI <preview-url> | grep -i -E 'strict-transport|content-security|x-frame'` shows all headers; opening the preview with DevTools console open shows zero CSP violations across every page and the Givebutter widget renders.

## Task 2 — Move deploy to keyless Workload Identity Federation (W-2)

Files: `.github/workflows/firebase-hosting-merge.yml`, `.github/workflows/firebase-hosting-pull-request.yml`

Replace `FirebaseExtended/action-hosting-deploy@v0` with the pattern from the sister repo (`Freshout360/.github/workflows/deploy-hosting.yml`): `permissions: { contents: read, id-token: write }`, `google-github-actions/auth@v2` with `workload_identity_provider` and `service_account`, then `npx firebase-tools@<pinned> deploy --only hosting --project freshout-education` (merge) or `hosting:channel:deploy pr-${{ github.event.number }} --expires 7d` (PR). Leave the WIF provider and SA values as clearly marked placeholders `<<JULYANNA: provider resource name>>` — she creates the pool/provider and the `github-deployer@freshout-education.iam.gserviceaccount.com` SA with `roles/firebasehosting.admin` only. Do not delete the old secret reference until the new workflow has deployed once.

Acceptance: `actionlint` (or the GitHub UI) shows both workflows valid; a PR opens a preview channel via WIF; after one successful merge deploy Julyanna deletes the `FIREBASE_SERVICE_ACCOUNT_FRESHOUT_EDUCATION` secret and the SA key in GCP and confirms zero user-managed keys remain.

## Task 3 — Branch protection and release checklist (W-3)

Files: `README.md` (append), `.github/pull_request_template.md` (new)

Write the release checklist into the README: preview checked on phone + desktop; no CSP violations in console; no new external script/iframe without CSP update noted in PR; approved by Julyanna or Anthony. Create the PR template with those four checkboxes plus "Security-relevant change? (headers, workflows, external scripts): yes/no". Then list, for Julyanna, the exact GitHub branch-protection settings to turn on for `main`: require PR, require the preview-channel check, no force-push, no direct push, include administrators.

Acceptance: PR template renders on a new PR; Julyanna confirms a direct push to `main` is rejected.

## Task 4 — Enforce CSP (W-1, follow-up after one week)

Files: `firebase.json`

Only after Task 1 has been live a week with no violations reported: rename `Content-Security-Policy-Report-Only` to `Content-Security-Policy`. Then, as a Level-2 stretch, move the inline `<script>` in `public/index.html` into `public/js/site.js`, reference it with `<script src="/js/site.js" defer>`, and remove `'unsafe-inline'` from `script-src`. Inline styles can stay for now.

Acceptance: full click-through of every page and both forms with console open shows zero violations; securityheaders.com grade A.

## Task 5 — Image metadata check (W-7)

Files: `public/FOE Site Images/web/*.jpg`

Run `exiftool -gps:all -json` over the folder. If any file has GPS tags, strip with `exiftool -all= -tagsfromfile @ -Orientation -ColorSpace <file>` and re-verify. Do not recompress or resize.

Acceptance: `exiftool -gps:all` prints nothing for every file; image byte sizes changed only for files that had tags.

## Not in scope for Claude Code

W-5 (retention rule for referral emails) is a policy line for the canon vault. W-6 (zip backup, debug log in the parent folder) is Julyanna's. Console items — Firebase/Google MFA, GitHub org 2FA, Givebutter MFA, registrar MFA — are Julyanna's; record dates in the register table in the brief when done.
