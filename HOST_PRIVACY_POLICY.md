# How to Host Your Privacy Policy

## Option 1: GitHub Pages (Recommended - Free)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it something like `couple-of-wagers-privacy`
3. Make it public

### Step 2: Upload Privacy Policy
1. Upload the `privacy-policy.html` file to your repository
2. Rename it to `index.html` (this makes it the default page)

### Step 3: Enable GitHub Pages
1. Go to your repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Save

### Step 4: Get Your URL
Your privacy policy will be available at:
```
https://yourusername.github.io/couple-of-wagers-privacy/
```

## Option 2: Netlify (Free & Fast)

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### Step 2: Deploy
1. Create a new site from Git
2. Connect your repository
3. Deploy

### Step 3: Get Your URL
Your privacy policy will be available at:
```
https://your-site-name.netlify.app
```

## Option 3: Vercel (Free & Fast)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Deploy
1. Import your repository
2. Deploy

### Step 3: Get Your URL
Your privacy policy will be available at:
```
https://your-project.vercel.app
```

## Option 4: Simple File Hosting

### Using Surge.sh (Free)
```bash
npm install -g surge
cd /path/to/privacy-policy
surge
# Follow prompts to get a URL like: https://your-site.surge.sh
```

## Quick Setup Commands

If you want to use GitHub Pages, here are the commands:

```bash
# Create a new directory for privacy policy
mkdir couple-of-wagers-privacy
cd couple-of-wagers-privacy

# Copy the privacy policy
cp /Users/shubhamjain/exploring/bet-platform/privacy-policy.html ./index.html

# Initialize git repository
git init
git add index.html
git commit -m "Add privacy policy"

# Create GitHub repository (do this on GitHub.com first)
# Then push:
git remote add origin https://github.com/yourusername/couple-of-wagers-privacy.git
git branch -M main
git push -u origin main
```

## Final Privacy Policy URL

Once hosted, your privacy policy URL will be:
```
https://yourusername.github.io/couple-of-wagers-privacy/
```

Use this URL in your Google Play Console privacy policy field.

## Alternative: Use Existing Domain

If you have a website, you can:
1. Upload `privacy-policy.html` to your website
2. Access it at: `https://yourwebsite.com/privacy-policy.html`
