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

### Step 1: Prepare files

Keep all files in one folder and include:

- `index.html`
- `styles.css`
- `app.js`
- `site.webmanifest`
- `robots.txt`
- `404.html`
- `.htaccess` (for Apache/cPanel hosting)

### Step 2: Open your hosting web root

Use your hosting panel and open your site root:

- Main domain usually: `public_html/`
- Addon domain usually: `public_html/your-domain/`

### Step 3: Upload project files

You can upload with either method:

1. File Manager (cPanel/Plesk): upload all files directly to web root.
2. FTP/SFTP: connect with your host credentials and upload files to web root.

Important: do not place files inside an extra nested folder unless you want the app under a subpath.

### Step 4: Set default page

Make sure `index.html` is in the web root so opening your domain loads MultiSize.

### Step 5: Connect domain and DNS

If your domain is not already connected:

1. Point nameservers to your hosting provider, or
2. Set DNS records from your domain provider:
   - `A` record for root (`@`) -> your hosting server IP
   - `CNAME` for `www` -> root domain (or host target from your provider)

Wait for propagation (can take a few minutes up to 24h).

### Step 6: Enable SSL (HTTPS)

In hosting panel, enable free Let's Encrypt SSL (or your paid SSL).

After SSL is issued, force HTTPS in panel if available.

### Step 7: Verify in browser

Check these URLs:

1. `https://yourdomain.com/`
2. `https://yourdomain.com/robots.txt`
3. `https://yourdomain.com/site.webmanifest`

Then test app flow:

1. Upload a logo.
2. Generate sizes.
3. Download single file.
4. Download ZIP.

### Step 8: If something breaks

1. Blank page: open browser dev tools and check Console/Network for blocked JS or CDN errors.
2. CSS missing: confirm `styles.css` path and file casing.
3. JS not running: confirm `app.js` path and file casing.
4. 404 errors: verify files are in the correct web root.
5. SSL warning: reissue SSL certificate and re-check DNS.

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
