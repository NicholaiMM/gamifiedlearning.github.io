# Nexus Arcade

A gamified learning platform for developers — unlock nodes, earn XP, and level up your skills.

## 🚀 Live App

Deployed via **GitHub Pages**: https://nicholaimm.github.io/

## ✨ Features

- **Overworld Map** – Navigate arcade nodes and unlock new areas
- **Arcade Terminal** – Run commands and interact with the system
- **Vault** – Collect and download earned certificates
- **Profile** – View your identity, rank, and stats
- **DevOps Studio** – Access handshake tools and resources

## 📱 Progressive Web App

Nexus Arcade is installable as a PWA:
- Add to Home Screen on iOS / Android
- Works offline (service worker caches local assets)
- Standalone app experience (no browser chrome)

## 🛠 Tech Stack

- **React 18** (UMD, no build step required)
- **Tailwind CSS** (CDN)
- **Firebase** (Auth + Firestore – swap in your own config)
- **Lucide React** icons

## 🔧 Local Development

```bash
# Serve from the repo root (any static server will work)
python3 -m http.server 8080
# Then open http://localhost:8080
```

## ⚙️ GitHub Pages Setup

1. Go to **Settings → Pages** in your repository
2. Set **Source** to `Deploy from a branch`, branch `main`, folder `/`
3. The `.nojekyll` file at the root ensures GitHub Pages serves the raw HTML without Jekyll processing
