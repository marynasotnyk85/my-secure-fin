# my-secure-fin
# MySecureFinDashboard

A security‑hardened, performance‑optimized, SEO‑friendly **financial dashboard** that fetches real‑time stock data, caches it offline, and renders it efficiently in the browser.

> Built to showcase practical skills in Web Security (CORS, clickjacking, CSP), Loading & Rendering Performance (critical CSS, prefetching, service workers), and SEO. 

---

## ✨ What this project demonstrates

### 🔐 Security
- Tight **CORS** configuration (allow‑list of trusted origins)
- **Clickjacking** protection via `X-Frame-Options` / CSP `frame-ancestors`
- Hardened **Content-Security-Policy**
- Helmet and other HTTP security headers
- Sanitized API responses & defensive error handling

### ⚡ Loading Performance
- Critical CSS inlined; remaining CSS loaded non‑blocking
- Script `defer`/`preload`, route/data **prefetch**
- **Service Worker** for offline caching & instant reloads
- HTTP caching & cache‑busting strategy

### 🧠 Rendering Performance
- Batched DOM updates (DocumentFragments)
- Avoided layout thrash: CSS `contain`, `will-change`
- Idle-time chunking with `requestIdleCallback`

### 🔎 SEO
- Semantic HTML5 structure (`main`, `section`, `article`)
- Meta, Open Graph, canonical tags
- JSON‑LD structured data
- Sitemap & robots.txt (optional SSR / prerender step)

---

## 🏗️ Tech Stack

- **Node.js + Express** (API proxy & SSR-ready)
- **Axios** (external API calls)
- **Helmet** (security headers)
- **Chart.js** (client-side charts)
- **Service Worker API** (offline caching)
- **Vanilla JS / HTML / CSS** (no frameworks needed)

---

## 📁 Project Structure


