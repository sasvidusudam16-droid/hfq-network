# HFQ Network

HFQ Network is a Minecraft Lifesteal SMP website built with React, Vite, and a small Node.js store API. The public website and API are served from one origin. The production server listens on port 3001 by default.

## Deploy to an Ubuntu/Debian VPS

### Requirements

- Ubuntu or Debian VPS with systemd, `sudo`, `openssl`, Node.js 22+ (or 20.19+), and npm.
- The project checked out on the VPS under a regular, non-root deployment account. Do not clone the project into `/root`.
- A domain pointed at the VPS. The current canonical domain in this project is `https://hfqmc.xyz/`; update it in `index.html`, `public/robots.txt`, `public/sitemap.xml`, and `src/components/Seo.tsx` if deploying on another domain.

### Install and start

From the project directory, run:

```bash
sudo bash deploy.sh
```

The script asks twice for a strong store-admin password without echoing it, generates a random session secret, installs locked npm dependencies, builds the site, and installs/enables a `systemd` service named `hfq-network`. The password must have at least 14 characters and use letters, numbers, or `._!@#%+=-`. App secrets are saved in `/etc/hfq-network.env` with root-only file permissions; do not commit or share that file. The website and API run as the deployment account, while the API binds to `127.0.0.1:3001` so it is not directly exposed to the internet.

Check service health and logs:

```bash
curl http://127.0.0.1:3001/api/health
sudo systemctl status hfq-network
sudo journalctl -u hfq-network -f
```

After pulling an update, rebuild and restart:

```bash
npm ci && npm run build && sudo systemctl restart hfq-network
```

The service needs persistent write access to `data/store-products.json` and `public/uploads/`. Back up both locations regularly; store edits and uploaded product images are not stored in the environment file.

### Domain, HTTPS, and reverse proxy

Point the domain's A/AAAA records to the VPS. Configure Nginx or Caddy with a valid TLS certificate and proxy requests to `http://127.0.0.1:3001`. For Nginx, the important directives inside the TLS-enabled `server` block are:

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

Obtain and renew the certificate with your preferred ACME client (for example, Certbot). Allow public inbound HTTP/HTTPS (ports 80 and 443) in the VPS firewall and provider firewall. Do **not** open port 3001 to the public. The admin session cookie is marked `Secure` in production, so sign in at `https://your-domain/admin` after HTTPS is working.

### Store admin

Open `/admin` to manage product names, descriptions, prices, colors, artwork, purchase links, badges, and perks. Changes are saved to `data/store-products.json`; uploaded artwork is stored in `public/uploads/`. Store edits persist across restarts as long as those paths are on persistent writable disk.

The API uses an HttpOnly, SameSite session cookie, same-origin mutation checks, server-side validation, upload size/type checks, and basic login throttling. To change the admin password, edit `ADMIN_PASSWORD` in `/etc/hfq-network.env` and restart with `sudo systemctl restart hfq-network`. Protect that file and use a unique password.

## Google SEO and indexing

The site includes a descriptive page title and description, canonical URLs, social share metadata, `WebSite`/`Organization` structured data, a sitemap at `https://hfqmc.xyz/sitemap.xml`, and a `robots.txt` sitemap reference. The `/admin` route sets `noindex` metadata. The social preview image is `public/images/og-image.webp`; keep it publicly available and update its absolute URL if the domain changes.

To help Google discover the site:

1. Make sure the public domain resolves to this VPS and HTTPS works without certificate warnings.
2. Open [Google Search Console](https://search.google.com/search-console), add and verify the domain property, and submit `https://hfqmc.xyz/sitemap.xml`.
3. Use Search Console URL Inspection to request indexing of the homepage and check that Google can fetch the page and image.
4. Keep the site useful, fast, mobile-friendly, and publicly accessible; link to it from official community profiles and relevant sites.
5. If the domain changes, update every canonical, structured-data, sitemap, robots, and social-preview URL before deployment.

The structured site name is **HFQ Network** (with “Hfq Network” as an alternate spelling). Google chooses whether and how to display a site name, title, description, and ranking; metadata and Search Console submission improve eligibility but cannot guarantee a particular display or first-page position. This React SPA updates titles and descriptions on navigation; Google can render JavaScript, but indexing may take time.

## Local development

Install dependencies with `npm ci`. In one terminal set `ADMIN_PASSWORD` and a random `SESSION_SECRET` of at least 32 characters, then run `npm run dev:api`; in another terminal run `npm run dev`. Vite forwards `/api` calls to the API on port 3001. Build for production with `npm run build`.
