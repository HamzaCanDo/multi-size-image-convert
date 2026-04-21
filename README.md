# MultiSize

MultiSize is a fully client-side web app that resizes a logo/image into many website-ready outputs in one click.

- No backend
- No server upload
- No database
- No cloud storage
- Everything runs in-browser only

## Features

- Upload main logo image (required)
- Upload icon-only image for square outputs (optional)
- Resize all required outputs in one click
- Preserve aspect ratio with two fit modes:
  - `contain` (default, transparent padding)
  - `cover` (crop to fill)
- Default: no upscaling (targets needing upscale are skipped)
- Add optional custom size rows (type, width, height)
- Insert auto helper presets for responsive logos, social previews, and app icon extensions
- Preserves PNG transparency
- Shows progress while processing
- Preview grid with thumbnail, filename, dimensions, and file size
- Download individual files
- Download all generated files as ZIP
- Generates `favicon.ico` containing 16x16, 32x32, and 48x48 entries

## Tech Stack

- Plain HTML + CSS + JavaScript
- [pica](https://github.com/nodeca/pica) for high-quality image resize
- [JSZip](https://stuk.github.io/jszip/) for ZIP creation

Libraries are loaded from CDN in `index.html`.

## Run Locally

1. Download or clone this project.
2. Open `index.html` in a browser.

Optional (recommended) local static server:

```bash
npx serve .
```

Then open the printed local URL.

## Deploy On Your Hosting

This project is static (HTML/CSS/JS), so it works on almost any paid hosting.

### Recommended: Auto-Deploy From GitHub on Every Push

Use this when you want the easiest update flow from VS Code:

1. Edit locally.
2. Push to `main`.
3. Site updates automatically.

#### Step 1: Confirm hosting deploy details

In your hosting panel, collect these values:

1. Protocol: `sftp` (recommended), or `ftps`, or `ftp`.
2. Host: usually your FTP/SFTP host (example: `ftp.yourdomain.com`).
3. Port: usually `22` for SFTP, `21` for FTP/FTPS.
4. Username: hosting FTP/SFTP user.
5. Password: hosting FTP/SFTP password.
6. Remote path: your site web root folder.

Typical remote path values:

1. Main domain: `/public_html/`
2. Addon domain: `/public_html/your-domain/`

#### Step 2: Add GitHub repository secrets

Open your GitHub repository:

1. Go to **Settings**.
2. Go to **Secrets and variables** -> **Actions**.
3. Click **New repository secret** and create:

1. `DEPLOY_PROTOCOL`
2. `DEPLOY_HOST`
3. `DEPLOY_PORT`
4. `DEPLOY_USERNAME`
5. `DEPLOY_PASSWORD`
6. `DEPLOY_REMOTE_PATH`
7. `DEPLOY_FTPS_INSECURE` (optional, default `false`)

Notes:

1. `DEPLOY_PROTOCOL` should be exactly one of: `sftp`, `ftps`, `ftp`.
2. `DEPLOY_PORT` is optional if you use default ports, but adding it is best.
3. Keep `DEPLOY_FTPS_INSECURE=false` unless your hosting FTPS certificate does not match host name.

#### Step 3: Verify workflow file exists

This repo includes automatic deployment workflow:

1. `.github/workflows/deploy-hosting.yml`

It deploys on push to `main` and supports manual run from Actions tab.

#### Step 4: Run first deployment manually

1. Open **Actions** in GitHub.
2. Select workflow **Deploy to Paid Hosting**.
3. Click **Run workflow**.
4. Wait for green check.

If it fails, read the failing step log. Most failures are wrong secret values or wrong remote path.

#### Step 5: Point domain and SSL

1. Ensure domain DNS points to your hosting.
2. Enable SSL in hosting panel (Let's Encrypt or paid SSL).
3. Open `https://yourdomain.com/` and confirm the site loads.

#### Step 6: Daily update workflow (easy mode)

After one-time setup, your normal process is:

1. Edit in VS Code.
2. Commit and push to `main`.
3. GitHub Action deploys automatically.
4. Refresh site and verify your update is live.

### Manual Deployment (Fallback)

If you ever want manual deploy instead:

1. Upload these files to hosting web root:
  - `index.html`
  - `styles.css`
  - `app.js`
  - `site.webmanifest`
  - `robots.txt`
  - `404.html`
  - `.htaccess` (Apache/cPanel)
2. Make sure `index.html` is in web root.
3. Test upload, resize, single download, and ZIP download.

### Troubleshooting

1. Workflow says missing secret: add all `DEPLOY_*` secrets exactly with same names.
2. Login fails: verify host, protocol, port, username, password.
3. Files not updating: verify `DEPLOY_REMOTE_PATH` points to actual web root.
4. Site loads old version: hard refresh browser (`Ctrl+F5`) and clear CDN cache if used.
5. SSL warning: reissue certificate and verify DNS is fully propagated.
6. FTPS certificate name mismatch: first switch to `sftp` on port `22`; if host only supports FTPS, use the exact FTP server host from cPanel. As a last resort, set `DEPLOY_FTPS_INSECURE=true`.
7. `mirror: Fatal error: max-retries exceeded`: hosting did not accept connection reliably from GitHub runner. Verify `DEPLOY_PROTOCOL` and `DEPLOY_PORT`, use exact FTP/SFTP host from cPanel, and confirm remote FTP/SFTP access is allowed by hosting firewall/security rules.

## Output Matrix

### Hero logos

- 1200x360 -> `hero-1200x360.png`
- 600x180 -> `hero-600x180.png`
- 640x192 -> `hero-640x192.png`

### Header logos

- 280x84 -> `header-280x84.png`
- 240x72 -> `header-240x72.png`
- 220x66 -> `header-220x66.png`
- 180x54 -> `header-180x54.png`
- 160x48 -> `header-160x48.png`
- 120x36 -> `header-120x36.png`

### Favicons

- 16x16 -> `favicon-16x16.png`
- 32x32 -> `favicon-32x32.png`
- 48x48 -> `favicon-48x48.png`
- Multi-size icon -> `favicon.ico` (16, 32, 48)

### Square app/icons

- 64x64 -> `icon-64x64.png`
- 128x128 -> `icon-128x128.png`
- 180x180 -> `icon-180x180.png`
- 192x192 -> `icon-192x192.png`
- 256x256 -> `icon-256x256.png`
- 512x512 -> `icon-512x512.png`
- 1024x1024 -> `icon-1024x1024.png`

## ZIP Output Rules

- ZIP file name format: `multisize-assets-YYYY-MM-DD.zip`
- Folder structure inside ZIP:
  - `hero/`
  - `header/`
  - `favicon/`
  - `icon/`
- Filenames remain exactly as generated in the output matrix.

## Validation Checklist

Use this checklist after clicking **Resize All** and then **Download All ZIP**.

### Core behavior

- [ ] Main logo upload works (drag-and-drop and browse)
- [ ] Optional icon-only upload works (drag-and-drop and browse)
- [ ] Resize All generates outputs in-browser only
- [ ] Progress indicator updates during processing
- [ ] Preview cards show thumbnail, filename, dimensions, and file size
- [ ] Individual file download works from each card
- [ ] Download All ZIP works

### Fit and scaling rules

- [ ] Default fit mode is `contain`
- [ ] Optional fit mode `cover` is available
- [ ] Aspect ratio is preserved for both modes
- [ ] Default upscaling is off
- [ ] Targets requiring upscale are marked skipped when upscaling is off
- [ ] PNG outputs preserve transparency

### Required filenames and sizes

- [ ] `hero-1200x360.png`
- [ ] `hero-600x180.png`
- [ ] `hero-640x192.png`
- [ ] `header-280x84.png`
- [ ] `header-240x72.png`
- [ ] `header-220x66.png`
- [ ] `header-180x54.png`
- [ ] `header-160x48.png`
- [ ] `header-120x36.png`
- [ ] `favicon-16x16.png`
- [ ] `favicon-32x32.png`
- [ ] `favicon-48x48.png`
- [ ] `icon-64x64.png`
- [ ] `icon-128x128.png`
- [ ] `icon-180x180.png`
- [ ] `icon-192x192.png`
- [ ] `icon-256x256.png`
- [ ] `icon-512x512.png`
- [ ] `icon-1024x1024.png`
- [ ] `favicon.ico`

### ZIP rules

- [ ] ZIP filename is `multisize-assets-YYYY-MM-DD.zip`
- [ ] ZIP contains folders: `hero/`, `header/`, `favicon/`, `icon/`
- [ ] ZIP contains expected files in each folder with exact names
