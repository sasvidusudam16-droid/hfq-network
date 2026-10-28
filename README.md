# HFQ Network

HFQ Network is a Minecraft Lifesteal SMP website built with React, Vite, and a Node.js store API. The public website, store, and admin panel are all served from one origin. The production server listens on port 3001 by default.

## Deploy to an Ubuntu/Debian VPS

### Requirements

- Ubuntu or Debian VPS with systemd, `sudo`, `openssl`, Node.js 22+ (or 20.19+), and npm.
- The project checked out on the VPS under a regular, non-root deployment account. Do not clone into `/root`.
- A domain pointed at the VPS. The canonical domain is `https://hfqmc.xyz/`; update it in `index.html`, `public/robots.txt`, `public/sitemap.xml`, and `src/components/Seo.tsx` if deploying under a different domain.

### Install and start

From the project directory:

```bash
sudo bash deploy.sh
```

The script prompts for a strong store-admin password, generates a random session secret, installs dependencies, builds the site, and installs a `systemd` service named `hfq-network`. Secrets are saved in `/etc/hfq-network.env` with root-only permissions — do not commit or share that file. The API binds to `127.0.0.1:3001` and is not directly exposed to the internet.

Check health and logs:

```bash
curl http://127.0.0.1:3001/api/health
sudo systemctl status hfq-network
sudo journalctl -u hfq-network -f
```

After pulling an update, rebuild and restart:

```bash
npm ci && npm run build && sudo systemctl restart hfq-network
```

The service needs persistent write access to `data/store-products.json`, `data/news.json`, and `public/uploads/`. Back those up regularly — store edits, news posts, and uploaded images are not stored in the environment file.

### Domain, HTTPS, and reverse proxy

Point the domain's A/AAAA records at the VPS. Configure Nginx or Caddy with a TLS certificate and proxy requests to `http://127.0.0.1:3001`. For Nginx:

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Use Certbot or another ACME client for the certificate. Allow ports 80 and 443 in your firewall. Do **not** open port 3001 publicly. The admin session cookie is marked `Secure` in production, so sign in at `https://your-domain/admin` after HTTPS is set up.

### Admin panel

Open `/admin` to manage the store and news.

**Store** — edit ranks, upgrades, crate keys, and shards: names, descriptions, prices, colors, images, purchase links, badges, and perks. Products can be reordered and duplicated. Unsaved changes are highlighted; press **Ctrl+S** to save.

**News** — create, edit, and reorder the news posts shown on the home page. Each post has a title, excerpt, date, tag, image, and optional link.

**Images** — view all uploaded images, copy their URLs, or delete them.

Changes are saved to `data/store-products.json` and `data/news.json`. Uploaded images are stored in `public/uploads/`. To change the admin password, update `ADMIN_PASSWORD` in `/etc/hfq-network.env` and restart the service.

## Google SEO and indexing

The site includes a descriptive title, canonical URLs, social share metadata, `WebSite`/`Organization` structured data, a sitemap at `https://hfqmc.xyz/sitemap.xml`, and a `robots.txt` reference. The `/admin` route is set to `noindex`.

To get indexed by Google:

1. Confirm the domain resolves to the VPS and HTTPS works without warnings.
2. Open [Google Search Console](https://search.google.com/search-console), verify the domain, and submit the sitemap.
3. Use URL Inspection to request indexing of the homepage.
4. Keep the site fast, mobile-friendly, and publicly accessible; link to it from Discord and community profiles.
5. If the domain changes, update every canonical, sitemap, robots, and social-preview URL before deploying.

## Local development

```bash
npm ci
```

In one terminal, set the required env vars and start the API:

```bash
ADMIN_PASSWORD=yourpassword SESSION_SECRET=a-random-string-at-least-32-chars npm run dev:api
```

In another terminal, start Vite:

```bash
npm run dev
```

Vite forwards `/api` requests to `localhost:3001`. Open `http://localhost:5173` for the site and `/admin` for the panel. Build for production with `npm run build`.
