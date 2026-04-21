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

## Deploy-Ready Files Included

This project now includes production hosting defaults out of the box:

- `netlify.toml` (Netlify publish + security/cache headers)
- `vercel.json` (Vercel security/cache headers)
- `robots.txt` (search crawler allow rules)
- `site.webmanifest` (PWA metadata)
- `404.html` (custom not found page)
- `.nojekyll` (GitHub Pages static handling)
- `.github/workflows/deploy-pages.yml` (automatic GitHub Pages deployment)

## Deploy Free (Static Hosting)

### Netlify

1. Push this folder to a Git repository.
2. In Netlify, click **Add new site** -> **Import an existing project**.
3. Select your repository.
4. Build command: leave empty.
5. Publish directory: `.` (already set in `netlify.toml`).
6. Deploy.

### Vercel

1. Push this folder to a Git repository.
2. In Vercel, click **Add New Project** and import the repository.
3. Framework preset: **Other**.
4. Build command: leave empty.
5. Output directory: `.`
6. Deploy.

### Cloudflare Pages

1. Push this folder to a Git repository.
2. In Cloudflare Pages, create a new project from that repo.
3. Framework preset: **None**.
4. Build command: leave empty.
5. Build output directory: `.`
6. Deploy.

### GitHub Pages

1. Push this folder to a GitHub repository.
2. Open repository **Settings** -> **Pages**.
3. Source: **GitHub Actions**.
4. Keep the included workflow `.github/workflows/deploy-pages.yml`.
5. Push to `main` to trigger deploy.

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
