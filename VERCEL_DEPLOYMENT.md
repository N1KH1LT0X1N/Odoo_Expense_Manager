# Vercel Deployment Guide

## Requirements

- Node.js 18.x (specified in `.nvmrc` and `package.json`)
- PostgreSQL database (Neon)
- Vercel account

## Environment Variables

Add these environment variables in your Vercel dashboard:

```
DATABASE_URL=postgresql://your_connection_string
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
NODE_ENV=production
```

## Deployment Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Add Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all the required variables listed above

4. **Redeploy** (if needed):
   ```bash
   vercel --prod
   ```

## Important Notes

- The app uses PostgreSQL (Neon). Make sure your `DATABASE_URL` is accessible from Vercel's servers
- Static files are served from `dist/public` after build
- API routes are handled by the serverless function in `api/index.ts`
- Uploads are handled via the file system (consider using cloud storage for production)

## Troubleshooting

### "Crazy text" / Encoding Issues
- ✅ Fixed by adding proper UTF-8 charset meta tags
- ✅ Added Content-Type header in HTML

### Database Connection Issues
- Make sure DATABASE_URL includes `?sslmode=require` for Neon
- Verify the connection string is correct in Vercel environment variables

### API Routes Not Working
- All API routes should start with `/api/`
- Check the `vercel.json` rewrites configuration
- Verify environment variables are set

### Static Assets Not Loading
- Run `npm run build` locally to test the build
- Check that `dist/public` directory is generated
- Verify the outputDirectory in vercel.json

## Local Testing

Build and test locally before deploying:

```bash
# Build the project
npm run build

# Test the production build
npm start
```

## Build Output

The build process:
1. Runs `vite build` to compile React app → `dist/public`
2. API is served via serverless functions
3. Static files are served from the build output
