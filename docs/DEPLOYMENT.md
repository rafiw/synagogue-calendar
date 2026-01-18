# 📦 Deployment Guide

This guide covers deploying the Synagogue Calendar app to various platforms.

## Table of Contents

- [Web Deployment](#web-deployment)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)

---

## 🌐 Web Deployment

The app can be deployed to any web hosting service. Here are the most popular options:

### Netlify

Netlify offers free hosting with automatic SSL and continuous deployment.

#### Step 1: Install Netlify CLI

```bash
yarn global add netlify-cli
```

#### Step 2: Build the Web Version

```bash
npx expo export --platform web
```

This creates a `dist` folder with your web app.

#### Step 3: Deploy to Netlify

```bash
netlify deploy --dir dist --prod
```

Or use the Netlify dashboard:

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder
3. Your site is live!

#### Optional: Continuous Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npx expo export --platform web`
3. Set publish directory: `dist`
4. Every push to main branch auto-deploys!

---

### GitHub Pages

Free hosting directly from your GitHub repository.

#### Step 1: Update package.json

Add your GitHub Pages URL:

```json
{
  "homepage": "https://yourusername.github.io/synagogue-calendar"
}
```

#### Step 2: Install gh-pages

```bash
yarn add --dev gh-pages
```

#### Step 3: Add Deploy Script

Add to `package.json` scripts:

```json
{
  "scripts": {
    "deploy": "expo export --platform web && gh-pages -d dist"
  }
}
```

#### Step 4: Deploy

```bash
yarn deploy
```

Your app will be live at `https://yourusername.github.io/synagogue-calendar`

[⬅️ Back to Main README](../README.md)
