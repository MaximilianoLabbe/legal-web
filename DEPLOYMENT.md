# Deployment Guide - FGN Abogados Frontend

This guide covers deploying the FGN Abogados frontend application to Vercel.

## Prerequisites

- Node.js 18+ installed locally
- npm 9+ or yarn/pnpm
- A GitHub account with repository access
- A Vercel account (free tier available at https://vercel.com)

## Local Development

Before deploying, make sure everything works locally:

```bash
# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local

# Start development server
npm run dev

# Build for production (optional testing)
npm run build
npm run preview
```

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. Make sure your repository is public or you have connected it to Vercel

### Step 2: Connect to Vercel

1. Visit https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select your GitHub repository containing this code
4. Vercel will automatically detect the Vite configuration

### Step 3: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Project Name**: `frontend-ls` (or your preferred name)
- **Framework**: Vite (auto-detected)
- **Root Directory**: `./` (or leave blank)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Set Environment Variables

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add the following variables for each environment:

#### Development Environment
```
VITE_API_URL=http://localhost:3000/api
```

#### Preview Environment
```
VITE_API_URL=https://staging-api.your-domain.com/api
```

#### Production Environment
```
VITE_API_URL=https://api.your-domain.com/api
```

**Note**: Replace `your-domain.com` with your actual backend API domain.

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Run `npm run build`
   - Upload the `dist` folder
   - Create a deployment

3. Your application will be available at:
   - **Default URL**: `https://frontend-ls-[randomstring].vercel.app`
   - **Preview URL**: `https://frontend-ls-git-[branch-name]-[account].vercel.app`

## Automatic Deployments

Once connected, Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every pull request to any branch
- **Development**: Available through Vercel CLI

## Custom Domain

To use a custom domain (e.g., `app.fgn-abogados.com`):

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Click **"Add" → "Add Domain"**
3. Enter your custom domain
4. Follow DNS configuration:
   - Add CNAME record pointing to `cname.vercel.app`
   - Or use Vercel's nameservers (NS records)
5. Wait for DNS propagation (usually 24-48 hours)

## Environment-Specific Configuration

### Development
- API URL: Local backend
- Console logging: Enabled
- Debugging: Available

### Preview (Staging)
- API URL: Staging backend
- Used for testing before production
- Accessible via pull request URLs

### Production
- API URL: Production backend
- Optimized builds
- Custom domain
- SSL/TLS enabled

## Monitoring and Analytics

In Vercel Dashboard, you can:
- View deployment history
- Check build logs
- Monitor runtime errors
- View page performance metrics
- Analyze request logs

## Troubleshooting

### Build Failures

If the build fails:

1. Check build logs in Vercel Dashboard
2. Common issues:
   - Missing environment variables (set in Vercel Settings)
   - TypeScript errors (run `npm run build` locally to debug)
   - Missing dependencies (update package.json)

### Runtime Errors

If the app crashes after deployment:

1. Check browser console for errors (F12)
2. Check Vercel runtime logs
3. Verify environment variables are correct
4. Test API connectivity

### API Connection Issues

If the frontend can't connect to backend:

1. Verify `VITE_API_URL` environment variable is correct
2. Check backend CORS settings
3. Ensure backend is accessible from Vercel's servers
4. Check browser network tab for failed requests

## Rolling Back

To revert to a previous deployment:

1. In Vercel Dashboard, go to **Deployments**
2. Find the previous deployment
3. Click the menu (•••) → **Promote to Production**

## Performance Optimization

The build is already optimized with:

- Code splitting (vendor, UI chunks)
- Minification with Terser
- CSS optimization
- Tree-shaking of unused code

Additional tips:

1. Enable Vercel Analytics (optional paid feature)
2. Use Vercel Edge Functions for API middleware
3. Implement caching headers for static assets
4. Monitor Core Web Vitals

## Updating Dependencies

After deploying, to update dependencies:

```bash
# Locally
npm update
npm test  # If tests exist
git push origin main

# Vercel automatically deploys the new build
```

## Security Best Practices

1. **Never commit sensitive data**:
   - Use environment variables for API keys
   - Use .gitignore for .env files

2. **Regular updates**:
   - Keep dependencies updated
   - Watch for security advisories: `npm audit`

3. **HTTPS**:
   - Vercel provides free SSL/TLS
   - Always use HTTPS URLs

4. **API Security**:
   - Use CORS properly
   - Validate all inputs on backend
   - Use authentication tokens

## Support

For Vercel-specific issues:
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/next.js/discussions
- Support: https://vercel.com/support

For application issues:
- Check GitHub repository
- Review error logs
- Contact development team

---

**Last Updated**: May 2026
**Maintainer**: FGN Abogados Development Team
