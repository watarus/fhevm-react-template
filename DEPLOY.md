# Deployment Guide - Universal FHEVM SDK Template

This guide covers deploying the FHEVM React Template with Universal SDK to Vercel.

## 🚀 Quick Deploy to Vercel

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- Repository pushed to GitHub

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/fhevm-react-template)

### Manual Deployment

#### 1. Push to GitHub

```bash
# Add remote (if not already done)
git remote add origin https://github.com/YOUR-USERNAME/fhevm-react-template.git

# Push all commits
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Next.js framework

#### 3. Configure Build Settings

Vercel should automatically detect settings from `vercel.json`, but verify:

**Framework Preset**: Next.js
**Root Directory**: `./` (leave as root)
**Build Command**:
```bash
pnpm install && pnpm --filter @fhevm-sdk build && pnpm --filter site build
```

**Output Directory**: `packages/nextjs/.next`
**Install Command**: `pnpm install`

#### 4. Environment Variables (Optional)

For production deployment with Sepolia testnet, add these in Vercel dashboard:

```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
```

> ⚠️ **Note**: For localhost testing, these are optional. The app works with MetaMask on local Hardhat network without API keys.

#### 5. Deploy

Click "Deploy" and wait ~2-3 minutes for the build to complete.

## 📦 Deployment Architecture

```
GitHub Repository
    ↓
Vercel Build Process
    ↓
1. pnpm install (all workspaces)
    ↓
2. Build @fhevm-sdk (34 artifacts)
    ↓
3. Build Next.js site (uses SDK)
    ↓
4. Deploy to Vercel Edge Network
    ↓
Live Demo URL 🎉
```

## 🔧 Troubleshooting

### Build Fails: "Cannot find module '@fhevm-sdk'"

**Solution**: Ensure `pnpm --filter @fhevm-sdk build` runs before the Next.js build.

The correct build command sequence:
```bash
pnpm install && pnpm --filter @fhevm-sdk build && pnpm --filter site build
```

### Build Fails: "pnpm: command not found"

**Solution**: Vercel should auto-detect pnpm from `package.json`. If not, add in Vercel settings:
- Enable "PNPM" in Framework Preset settings
- Or use `npm install -g pnpm && pnpm install` as install command

### TypeScript Errors During Build

**Solution**:
1. Check that all dependencies are in the correct `package.json` files
2. Ensure peer dependencies (React, Vue) are marked as optional
3. Verify TypeScript version ~5.9.2

### Runtime Error: MetaMask Not Detected

This is expected behavior - users need MetaMask installed. The demo includes:
- Clear "Connect Wallet" instructions
- MetaMask installation links
- Network setup guidance

## 🌐 Post-Deployment

### 1. Test the Live Demo

Visit your Vercel URL (e.g., `your-app.vercel.app`)

**Expected Behavior:**
- Page loads showing two demos (NEW API + Legacy)
- "Connect Wallet" button visible
- After connecting MetaMask, FHEVM initializes
- Can interact with counter (increment/decrement/decrypt)

### 2. Update README

Add your live demo URL to the README:

```markdown
## 🌐 Live Demo

Try the live demo: [https://your-app.vercel.app](https://your-app.vercel.app)
```

### 3. Share

Your Universal FHEVM SDK demo is now live! Share it with:
- Zama community
- Twitter/X with #FHEVM
- GitHub repository description
- Developer documentation

## 📊 Vercel Analytics (Optional)

Enable Vercel Analytics to track:
- Page views
- User interactions
- Performance metrics

1. Go to your Vercel project dashboard
2. Navigate to "Analytics" tab
3. Enable Web Analytics (free tier available)

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to `main`:

```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel auto-deploys in ~2 minutes ✨
```

## 🎯 Production Checklist

Before announcing your deployment:

- [ ] Live demo URL is working
- [ ] Both NEW API and Legacy demos function correctly
- [ ] MetaMask connection works
- [ ] FHEVM initialization succeeds
- [ ] Encryption/decryption operations work
- [ ] UI is responsive on mobile
- [ ] README includes live demo link
- [ ] No console errors in browser devtools
- [ ] Performance is acceptable (< 3s load time)

## 🔓 Vercel Deployment Protection

After deployment, you may need to disable Deployment Protection to make the demo publicly accessible.

### Issue

Vercel enables Deployment Protection by default, requiring authentication (401 error).

### Solution

1. Go to **Vercel Dashboard**:
   ```
   https://vercel.com/[your-team]/fhevm-react-template/settings/deployment-protection
   ```

2. Find "Vercel Authentication" section

3. Set "Protection Bypass for Automation" to **OFF**
   - Or disable "Deployment Protection" completely

4. Click **Save**

5. Verify by accessing your URL (should work without authentication):
   ```
   https://fhevm-react-template-[your-team].vercel.app
   ```

### Troubleshooting

- Clear browser cache if 401 error persists
- Wait a few minutes for settings to propagate
- Check Vercel Dashboard to confirm settings are saved

## 📝 Deployment Info for Zama Bounty

When submitting to Zama bounty program, include:

**Live Demo URL**: `https://your-app.vercel.app`

**Repository URL**: `https://github.com/YOUR-USERNAME/fhevm-react-template`

**Key Features Demonstrated**:
- ✅ Universal FHEVM SDK (Framework-agnostic core)
- ✅ React hooks (`useFhevm`, `useEncrypt`, `useDecrypt`)
- ✅ Vue composables (`useFhevm`, `useEncrypt`, `useDecrypt`)
- ✅ Next.js demo (React) with API comparison
- ✅ Nuxt demo (Vue 3 Composition API)
- ✅ Event-driven architecture
- ✅ Builder pattern encryption
- ✅ Automatic signature management
- ✅ TypeScript full support
- ✅ 58 build artifacts (Core + React + Vue)

## 🚨 Common Issues

### Issue: Build succeeds but site shows "404 Not Found"

**Cause**: Incorrect output directory

**Solution**: Verify `vercel.json` has correct paths:
```json
{
  "outputDirectory": "packages/nextjs/.next"
}
```

### Issue: "Module not found" errors at runtime

**Cause**: Dependencies not properly bundled

**Solution**: Check `next.config.ts` includes webpack configuration for workspace packages

### Issue: FHEVM initialization fails in production

**Cause**: Missing environment variables or incorrect network

**Solution**:
1. Check browser console for specific error
2. Verify network configuration in `scaffold.config.ts`
3. For Sepolia, ensure `NEXT_PUBLIC_ALCHEMY_API_KEY` is set

## 📞 Support

If deployment issues persist:
- Check Vercel build logs in dashboard
- Review this guide's troubleshooting section
- Open GitHub issue with build logs
- Ask in Zama Discord #developer-support

---

**Deployed with ❤️ using Vercel**

*Universal FHEVM SDK v0.1.0 - Making FHEVM development accessible to everyone*
