# GitHub Pages Setup Guide

This guide explains how to deploy the Grid landing page to GitHub Pages.

## Configuration Done

1. **next.config.ts** - Configured for static export
   - `output: 'export'` - Enables static HTML export
   - `images.unoptimized: true` - Required for static export
   - `basePath` - Set to repository name for GitHub Pages
   - `assetPrefix` - Ensures assets load correctly
   - `serverExternalPackages: ['@prisma/client']` - Preserved for local development

2. **package.json** - Added export script
   - `bun run export` - Builds and prepares for deployment

3. **.github/workflows/deploy.yml** - GitHub Actions workflow
   - Automatically deploys on push to main branch
   - Uses Bun for faster builds
   - Uploads to GitHub Pages

## Steps to Enable GitHub Pages

### 1. Push to GitHub
```bash
git add .
git commit -m "ci(deploy): add GitHub Pages deployment workflow"
git push origin main
```

### 2. Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Pages** in the left sidebar
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Save

### 3. Wait for Deployment

The GitHub Action will automatically:
- Install dependencies with Bun
- Build the Next.js app as static HTML
- Deploy to GitHub Pages

Check the **Actions** tab to see deployment progress.

### 4. Access Your Site

Your landing page will be available at:
```
https://[your-username].github.io/frontend_II_projeto/
```

## Local Testing

To test the static export locally:

```bash
# Build static export
bun run export

# Serve the out directory (install serve if needed)
bunx serve out
```

## Important Notes

1. **Static Export Only**: GitHub Pages only serves static files
   - No server-side rendering (SSR)
   - No API routes
   - No dynamic routes with getServerSideProps
   - Prisma/Database features won't work on GitHub Pages

2. **Landing Page Only**: This configuration is for the landing page
   - The barbershop booking app ([slug] routes) won't work on GitHub Pages
   - Those require a server (deploy to Vercel/Netlify for full app)

3. **Base Path**: All links use the repository name as base path
   - Development: `http://localhost:3000`
   - Production: `https://[username].github.io/frontend_II_projeto/`

4. **Prisma Config Preserved**: The `serverExternalPackages` config is kept for local development

## Troubleshooting

### Assets not loading
- Check that `basePath` in next.config.ts matches your repository name
- Ensure `.nojekyll` file exists in the out directory

### 404 errors
- Verify GitHub Pages is enabled in repository settings
- Check that the workflow completed successfully in Actions tab

### Build fails
- Check the Actions tab for error logs
- Ensure all dependencies are in package.json
- Test build locally with `bun run build`

## Alternative: Deploy Full App

For the complete barbershop booking application with database:

**Recommended platforms:**
- **Vercel** (easiest, made for Next.js)
- **Netlify**
- **Railway** (includes database)
- **Render**

These platforms support:
- Server-side rendering
- API routes
- Database connections (Prisma)
- Environment variables
