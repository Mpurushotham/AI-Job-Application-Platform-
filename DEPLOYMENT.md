# 🚀 Deployment Guide - AI Job Hunter

Complete step-by-step guide to deploy your AI Job Hunter platform to GitHub Pages with a custom domain.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] GitHub account created
- [ ] Git installed on your computer
- [ ] Domain name registered (optional, but recommended)
- [ ] Text editor (VS Code, Sublime, etc.)
- [ ] API keys obtained (see API Setup section)

## 🔑 Part 1: API Keys Setup

### 1. Anthropic Claude API

**Purpose**: Resume parsing, cover letter generation, AI matching

**Steps**:
1. Visit https://console.anthropic.com/
2. Sign up for an account
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy your key (starts with `sk-ant-api03-`)
6. **Cost**: $0.015 per 1K tokens (input), $0.075 per 1K tokens (output)
   - Estimated cost: ~$0.50-2.00 per 100 applications

### 2. Adzuna Job Search API

**Purpose**: Job listings from Sweden and Europe

**Steps**:
1. Go to https://developer.adzuna.com/
2. Click "Register" and create account
3. After email verification, go to "Your Account"
4. Find your App ID and API Key
5. **Free Tier**: 100 requests per day
6. **Paid Plans**: Start at $99/month for 25,000 requests

### 3. RapidAPI (JSearch)

**Purpose**: Additional job listings from multiple sources

**Steps**:
1. Visit https://rapidapi.com/
2. Create an account
3. Search for "JSearch API"
4. Go to https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
5. Click "Subscribe to Test"
6. Choose a plan:
   - **Basic (Free)**: 150 requests/month
   - **Pro**: $9.99/month - 1,500 requests
   - **Ultra**: $29.99/month - 5,000 requests
7. Copy your RapidAPI key from the "X-RapidAPI-Key" header

### Cost Breakdown Example

For **100 job applications per month**:
- Anthropic API: ~$1-3
- Adzuna: Free (under 100/day)
- RapidAPI: Free or $9.99
- **Total**: ~$1-13/month

## 📦 Part 2: Repository Setup

### Step 1: Create GitHub Repository

```bash
# On GitHub.com
1. Click "+" → "New repository"
2. Name: "ai-job-hunter" (or your choice)
3. Description: "AI-powered job application platform"
4. Public repository
5. ✅ Initialize with README (optional)
6. Create repository
```

### Step 2: Clone to Your Computer

```bash
# Open terminal/command prompt
cd ~/Desktop  # or your preferred location

# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-job-hunter.git
cd ai-job-hunter
```

### Step 3: Add Source Files

Create the following file structure:

```
ai-job-hunter/
├── index.html
├── src/
│   └── app.jsx
├── config/
│   ├── apiKeys.example.js
│   └── apiKeys.js  # You'll create this
├── .gitignore
├── README.md
├── LICENSE
├── package.json
└── CNAME  # For custom domain
```

Copy the files I provided into this structure.

### Step 4: Configure API Keys

```bash
# Copy the example config
cp config/apiKeys.example.js config/apiKeys.js

# Edit with your actual keys
nano config/apiKeys.js  # or use your text editor
```

**Edit apiKeys.js**:
```javascript
const API_CONFIG = {
    ANTHROPIC_KEY: 'sk-ant-api03-YOUR_ACTUAL_KEY',
    ADZUNA_APP_ID: 'your_actual_app_id',
    ADZUNA_API_KEY: 'your_actual_api_key',
    RAPIDAPI_KEY: 'your_actual_rapidapi_key'
};
```

⚠️ **CRITICAL**: Never commit `apiKeys.js` to GitHub! It's already in `.gitignore`.

### Step 5: Commit and Push

```bash
# Add all files (apiKeys.js will be ignored)
git add .

# Commit changes
git commit -m "Initial commit: AI Job Hunter platform"

# Push to GitHub
git push origin main
```

## 🌐 Part 3: GitHub Pages Setup

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" in left sidebar
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"

### Step 2: Wait for Deployment

- GitHub will build your site (takes 1-2 minutes)
- Visit: `https://YOUR_USERNAME.github.io/ai-job-hunter`
- You should see your application live!

### Step 3: Test Basic Functionality

1. Upload a test resume (PDF)
2. Check if resume parsing works
3. Set preferences
4. Search for jobs
5. Verify results appear

## 🔧 Part 4: Custom Domain Setup (Optional)

### Step 1: Purchase Domain

Recommended registrars:
- **Namecheap**: $8-15/year
- **Google Domains**: $12/year
- **Cloudflare**: $8-10/year
- **GoDaddy**: $12-20/year

### Step 2: Configure DNS Records

Log into your domain registrar and add these DNS records:

```
Type    Name/Host    Value/Points To          TTL
A       @            185.199.108.153          3600
A       @            185.199.109.153          3600
A       @            185.199.110.153          3600
A       @            185.199.111.153          3600
CNAME   www          YOUR_USERNAME.github.io  3600
```

**Example for Namecheap**:
1. Go to Dashboard → Domain List
2. Click "Manage" next to your domain
3. Go to "Advanced DNS" tab
4. Add the A records and CNAME record above
5. Save changes

**Example for Cloudflare**:
1. Log into Cloudflare dashboard
2. Select your domain
3. Go to "DNS" section
4. Add records (orange cloud can be ON or OFF)
5. Save

### Step 3: Add CNAME File to Repository

```bash
# In your local repository
echo "yourdomain.com" > CNAME

# Commit and push
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

### Step 4: Configure Custom Domain in GitHub

1. Go to repository Settings → Pages
2. Under "Custom domain", enter: `yourdomain.com`
3. Click "Save"
4. Wait for DNS check (can take 24-48 hours)
5. Once verified, enable "Enforce HTTPS"

### Step 5: Verify Domain is Working

```bash
# Check DNS propagation
nslookup yourdomain.com

# Should show GitHub's IP addresses
# 185.199.108.153, 185.199.109.153, etc.

# Visit your domain
https://yourdomain.com
```

## 🔒 Part 5: Security Setup

### Protect API Keys

**Method 1: Environment Variables (Recommended for Production)**

Since GitHub Pages doesn't support backend environment variables, you have two options:

**Option A: Client-Side with Build Tool**

Use a build process to inject keys at build time (not in this simple version).

**Option B: Serverless Functions (Advanced)**

Use Netlify Functions or Vercel Edge Functions to keep keys server-side.

**For Now**: Use the direct approach but be aware keys are visible in browser.

### Recommended: Use Serverless Backend

For production, consider deploying to:

1. **Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

2. **Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Add environment variables in Netlify dashboard
```

3. **Cloudflare Pages**
- Better for static sites
- Add Workers for API key protection

## 🧪 Part 6: Testing

### Local Testing

```bash
# Install http-server
npm install -g http-server

# Run local server
http-server -p 8080 -o

# Visit http://localhost:8080
```

### Browser Testing

Test in multiple browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### Feature Testing Checklist

- [ ] Resume upload works
- [ ] Resume parsing extracts data correctly
- [ ] Preferences save properly
- [ ] Job search returns results
- [ ] Match scores calculate accurately
- [ ] Simple Apply creates application
- [ ] Auto-Apply mode works (test carefully!)
- [ ] Application tracker shows history
- [ ] Analytics display correctly
- [ ] Data persists after page reload

## 📊 Part 7: Monitoring & Maintenance

### Monitor API Usage

**Anthropic Console**:
1. Visit https://console.anthropic.com/
2. Go to "Usage" section
3. Track token consumption
4. Set up billing alerts

**Adzuna**:
1. Check developer dashboard
2. Monitor daily request count
3. Upgrade if approaching limits

**RapidAPI**:
1. Visit RapidAPI dashboard
2. Check usage statistics
3. Upgrade plan if needed

### Set Up Alerts

Create a simple monitoring script:

```javascript
// Add to your app
const checkAPIUsage = async () => {
    const usage = await StorageService.get('api-usage');
    if (usage && usage.daily > 80) {
        console.warn('⚠️ Approaching API limits!');
    }
};
```

### Regular Maintenance Tasks

**Weekly**:
- [ ] Review application success rate
- [ ] Check for broken job links
- [ ] Update job board integrations if needed

**Monthly**:
- [ ] Rotate API keys
- [ ] Review API costs
- [ ] Update resume parsing logic
- [ ] Clear old cached data

**Quarterly**:
- [ ] Update dependencies
- [ ] Review security practices
- [ ] Optimize matching algorithm
- [ ] Add new job board integrations

## 🐛 Part 8: Troubleshooting

### Issue: Resume Not Parsing

**Solution**:
```javascript
// Check API key validity
console.log('API Key:', API_CONFIG.ANTHROPIC_KEY.slice(0, 10) + '...');

// Test API call manually
fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
            role: 'user',
            content: 'Test'
        }]
    })
}).then(r => r.json()).then(console.log);
```

### Issue: No Jobs Appearing

**Solution**:
```javascript
// Check API responses
// Add to JobAPIService.searchAdzuna:
console.log('Adzuna Response:', data);

// Verify API keys are loaded
console.log('Config loaded:', !!API_CONFIG.ADZUNA_API_KEY);
```

### Issue: Applications Not Saving

**Solution**:
```javascript
// Test storage
window.storage.set('test', JSON.stringify({test: 'data'}))
    .then(() => window.storage.get('test'))
    .then(result => console.log('Storage working:', result))
    .catch(err => console.error('Storage error:', err));
```

### Issue: CORS Errors

**Solution**:
Some job APIs may have CORS restrictions. Use a CORS proxy:

```javascript
// Add CORS proxy for problematic APIs
const CORS_PROXY = 'https://corsproxy.io/?';
const url = CORS_PROXY + encodeURIComponent(apiUrl);
```

### Issue: Custom Domain Not Working

**Check DNS**:
```bash
# Test DNS propagation
dig yourdomain.com

# Should show GitHub IPs
# 185.199.108.153, etc.

# Check from different DNS servers
nslookup yourdomain.com 8.8.8.8
```

**Common Fixes**:
1. Wait 24-48 hours for DNS propagation
2. Clear browser cache
3. Try incognito/private mode
4. Verify CNAME file is in repository root
5. Check GitHub Pages settings

## 🚀 Part 9: Advanced Features

### Add Email Notifications

```javascript
// Use EmailJS (free tier: 200 emails/month)
// 1. Sign up at https://www.emailjs.com/
// 2. Create email service
// 3. Add to your app:

const sendNotification = async (jobTitle, company) => {
    emailjs.send('service_id', 'template_id', {
        job_title: jobTitle,
        company: company,
        to_email: 'your-email@example.com'
    });
};
```

### Add More Job Boards

```javascript
// Add LinkedIn Jobs (via RapidAPI)
const searchLinkedIn = async (query) => {
    const url = 'https://linkedin-data-api.p.rapidapi.com/search-jobs';
    // Implementation...
};

// Add Glassdoor (via web scraping - use carefully)
const searchGlassdoor = async (query) => {
    // Requires backend service
};
```

### Improve Matching Algorithm

```javascript
// Add ML-based matching
const enhancedMatch = async (resume, job) => {
    // Use embeddings for semantic similarity
    const resumeEmbedding = await getEmbedding(resume.summary);
    const jobEmbedding = await getEmbedding(job.description);
    const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
    return similarity * 100;
};
```

## 📱 Part 10: Mobile Optimization

The app is already responsive, but for better mobile experience:

### Add to Home Screen Support

Create `manifest.json`:
```json
{
  "name": "AI Job Hunter",
  "short_name": "JobHunter",
  "description": "AI-powered job application platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3b82f6">
```

## 🎯 Part 11: Success Metrics

Track these KPIs to measure success:

### Application Metrics
- Total applications sent
- Response rate (%)
- Interview rate (%)
- Offer rate (%)
- Time to first response
- Average match score of applied jobs

### System Metrics
- API costs per application
- Average processing time
- Error rate
- User satisfaction

### Set Goals
- **Week 1**: 10-20 applications
- **Month 1**: 50-100 applications
- **Target**: 5-10% interview rate
- **Success**: 1-2% offer rate

## 📚 Additional Resources

### Documentation
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Anthropic API**: https://docs.anthropic.com/
- **GitHub Pages**: https://docs.github.com/pages

### Community
- **GitHub Discussions**: Enable in your repository
- **Discord/Slack**: Create community channel
- **Reddit**: r/cscareerquestions, r/jobsearchhacks

### Learning
- **AI Prompting**: https://www.promptingguide.ai/
- **Job Search**: https://www.levels.fyi/
- **Resume Tips**: https://www.careercup.com/resume

## ✅ Final Checklist

Before going live:

- [ ] All API keys configured
- [ ] .gitignore includes apiKeys.js
- [ ] README updated with your info
- [ ] LICENSE file included
- [ ] Custom domain configured (if using)
- [ ] HTTPS enabled
- [ ] Tested on multiple browsers
- [ ] Tested resume upload
- [ ] Tested job search
- [ ] Tested application flow
- [ ] Analytics working
- [ ] Mobile responsive
- [ ] Legal disclaimer added
- [ ] Privacy policy created (if collecting data)
- [ ] Terms of service added
- [ ] Contact information updated

## 🎉 Congratulations!

Your AI Job Hunter platform is now live! 

**Next Steps**:
1. Upload your resume
2. Set your preferences
3. Start applying to jobs
4. Monitor your success rate
5. Iterate and improve

**Share Your Success**:
- Star the repository on GitHub
- Share with friends looking for jobs
- Write a blog post about your experience
- Contribute improvements back to the project

---

**Need Help?**
- Open an issue on GitHub
- Check the troubleshooting section
- Review the documentation
- Contact support

**Good luck with your job search! 🚀**