# ⚡ Quick Start Guide - AI Job Hunter

Get your job application platform running in 15 minutes!

## 🎯 What You'll Build

A fully functional AI-powered job application platform that:
- Parses your resume with AI
- Searches multiple job boards automatically
- Matches jobs with intelligent scoring
- Applies to jobs with one click
- Tracks all your applications
- Shows analytics and insights

## 📦 5-Minute Setup

### Step 1: Get API Keys (5 minutes)

**Anthropic (Required)**
```
1. Go to: https://console.anthropic.com/
2. Sign up → Create API Key
3. Copy key (starts with sk-ant-api03-)
Cost: ~$1-3 per 100 applications
```

**Adzuna (Required)**
```
1. Go to: https://developer.adzuna.com/
2. Register → Get App ID & API Key
Free: 100 requests/day
```

**RapidAPI (Optional but Recommended)**
```
1. Go to: https://rapidapi.com/
2. Search "JSearch" → Subscribe
3. Copy API key
Free: 150 requests/month
```

### Step 2: Create GitHub Repository (2 minutes)

```bash
# On github.com
1. Click "+" → "New repository"
2. Name: "ai-job-hunter"
3. Public
4. Create repository

# On your computer
git clone https://github.com/YOUR_USERNAME/ai-job-hunter.git
cd ai-job-hunter
```

### Step 3: Add Files (3 minutes)

Copy these files from the artifacts into your repository:

```
ai-job-hunter/
├── index.html              ← Copy from artifact
├── src/
│   └── app.jsx            ← Copy from artifact
├── config/
│   ├── apiKeys.example.js ← Copy from artifact
│   └── apiKeys.js         ← Create and add YOUR keys
├── .gitignore             ← Copy from artifact
├── README.md              ← Copy from artifact
├── LICENSE                ← Copy from artifact
└── package.json           ← Copy from artifact
```

### Step 4: Configure Keys (2 minutes)

```bash
# Create config directory
mkdir config

# Copy example and create your config
cp config/apiKeys.example.js config/apiKeys.js

# Edit with your actual keys
nano config/apiKeys.js
```

**Edit config/apiKeys.js:**
```javascript
const API_CONFIG = {
    ANTHROPIC_KEY: 'sk-ant-api03-YOUR_KEY_HERE',
    ADZUNA_APP_ID: 'your_app_id_here',
    ADZUNA_API_KEY: 'your_api_key_here',
    RAPIDAPI_KEY: 'your_rapidapi_key_here'
};
```

### Step 5: Deploy (3 minutes)

```bash
# Add all files (apiKeys.js will be ignored)
git add .
git commit -m "Initial deployment"
git push origin main

# Enable GitHub Pages
# Go to: Repository → Settings → Pages
# Source: main branch, / (root)
# Save
```

**Your site will be live at:**
`https://YOUR_USERNAME.github.io/ai-job-hunter`

---

## 🚀 First Use (5 minutes)

### 1. Upload Resume
- Click "Upload Resume"
- Select your PDF or DOCX resume
- Wait for AI to parse it (~10 seconds)
- Review extracted information

### 2. Set Preferences
- Enter job titles (e.g., "Software Engineer, Full Stack Developer")
- Set salary range (e.g., 500000 - 800000 SEK)
- Choose location (e.g., "Stockholm, Sweden")
- Toggle remote work option
- Click "Save & Find Jobs"

### 3. Browse Jobs
- AI searches multiple job boards
- Each job shows a match score (0-100%)
- Click "View Match Details" to see why
- Review job descriptions and requirements

### 4. Apply to Jobs
- Click "Simple Apply" to apply with one click
- AI generates a custom cover letter
- Application is tracked automatically
- Or enable "Auto-Apply" for 85%+ matches

### 5. Track Progress
- Go to "Applications" tab
- See all submitted applications
- Monitor status changes
- View generated cover letters

### 6. View Analytics
- Go to "Analytics" tab
- See total applications
- Check response rate
- View application funnel
- Get AI insights

---

## 🎨 Customization Tips

### Change Colors
Edit `index.html` - find the gradient classes:
```html
<!-- Blue/Purple gradient (default) -->
from-blue-600 to-purple-600

<!-- Green gradient -->
from-green-600 to-emerald-600

<!-- Orange gradient -->
from-orange-600 to-red-600
```

### Adjust Matching Algorithm
Edit `src/app.jsx` - find `calculateMatchScore`:
```javascript
// Current weights
Skills Match:      40 points
Experience Level:  20 points
Location:          15 points
Salary Range:      10 points
Job Title:         15 points

// Adjust to your preference
```

### Change Auto-Apply Threshold
Edit `config/apiKeys.js`:
```javascript
AUTO_APPLY_THRESHOLD: 85  // Default: 85%
// Set higher (90) to be more selective
// Set lower (80) to apply to more jobs
```

### Add More Job Boards
Edit `src/app.jsx` - add to `JobAPIService`:
```javascript
async searchNewJobBoard(query, location) {
    // Add your integration here
}
```

---

## 🐛 Common Issues & Fixes

### Resume Not Parsing
```
❌ Problem: Upload fails or no data extracted
✅ Solution: 
   1. Check API key is correct
   2. Ensure file is PDF or DOCX
   3. Try a different resume format
   4. Check browser console for errors
```

### No Jobs Found
```
❌ Problem: Search returns empty
✅ Solution:
   1. Verify API keys are configured
   2. Check internet connection
   3. Try broader search terms
   4. Ensure rate limits not exceeded
```

### Applications Not Saving
```
❌ Problem: Applications disappear after refresh
✅ Solution:
   1. Check browser supports localStorage
   2. Clear browser cache
   3. Try different browser
   4. Check browser console
```

### Site Not Loading
```
❌ Problem: GitHub Pages shows 404
✅ Solution:
   1. Wait 2-3 minutes for deployment
   2. Check GitHub Actions tab
   3. Verify files are in root directory
   4. Check Pages settings
```

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing)
- **Anthropic**: $5 free credit (100-300 applications)
- **Adzuna**: Free (100 requests/day)
- **RapidAPI**: Free (150 requests/month)
- **GitHub Pages**: Free (100GB bandwidth/month)
- **Domain**: Optional ($10-15/year)

**Total**: $0/month (plus domain if wanted)

### Paid Tier (For Heavy Use)
- **Anthropic**: ~$2-5/month (500+ applications)
- **Adzuna**: Free or $99/month (unlimited)
- **RapidAPI**: $9.99/month (1,500 requests)
- **GitHub Pages**: Free
- **Domain**: $10-15/year

**Total**: ~$12-115/month

---

## 📈 Optimization Tips

### Improve Match Quality
1. **Update resume regularly** - Add new skills
2. **Refine preferences** - Be specific with job titles
3. **Review failed matches** - Adjust scoring weights
4. **Test different searches** - Try various keywords

### Reduce Costs
1. **Cache results** - Jobs cached for 1 hour
2. **Batch applications** - Apply to multiple jobs at once
3. **Use free tier wisely** - Stay under rate limits
4. **Manual review first** - Don't auto-apply to all jobs

### Increase Success Rate
1. **Customize cover letters** - Edit AI-generated letters
2. **Apply early** - New postings get more attention
3. **Follow up** - Track and follow up on applications
4. **Network** - Combine with LinkedIn outreach

---

## 🎯 Best Practices

### For Job Seekers
- ✅ Review all auto-applied jobs
- ✅ Customize top-match applications
- ✅ Set daily application limits
- ✅ Track response rates
- ✅ Iterate based on data

### For Developers
- ✅ Never commit API keys
- ✅ Test in staging first
- ✅ Monitor API usage
- ✅ Implement rate limiting
- ✅ Keep dependencies updated

### For Success
- ✅ Apply to 20-30 jobs per week
- ✅ Target 80%+ match scores
- ✅ Personalize high-priority applications
- ✅ Follow up after 1 week
- ✅ Track what works

---

## 📞 Getting Help

### Self-Service
1. **Read the docs**: Check README.md and DEPLOYMENT.md
2. **Search issues**: See if others had same problem
3. **Check console**: Browser dev tools show errors
4. **Test locally**: Run on localhost first

### Community Support
- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share tips
- **Discord**: Join the community (link in README)

### Professional Support
- **Email**: your-email@example.com
- **Consultation**: Available for custom implementations
- **Training**: Workshops on AI tools for job searching

---

## 🎉 You're Ready!

Your AI Job Hunter is now set up and ready to go!

**What to do now:**
1. ✅ Upload your resume
2. ✅ Set preferences
3. ✅ Apply to 5 test jobs
4. ✅ Monitor results
5. ✅ Adjust and optimize

**Expected Results:**
- **Week 1**: 10-20 applications
- **Week 2**: 1-3 responses
- **Week 3-4**: 1-2 interviews
- **Month 2**: Job offer! 🎉

**Track Your Progress:**
```
Applications Sent:  _____
Responses Received: _____
Interviews Scheduled: _____
Offers Received: _____
```

---

## 🚀 Advanced Usage

Once you're comfortable with the basics:

1. **Add more job boards** - Integrate LinkedIn, Indeed
2. **Improve matching** - Fine-tune the algorithm
3. **Custom workflows** - Add interview prep
4. **Email notifications** - Get alerts for responses
5. **Team features** - Share with friends

**Next Level:**
- 📱 Build mobile app
- 🤖 Add interview AI coach
- 💼 Create job market insights
- 🔔 Real-time job alerts
- 🤝 Networking automation

---

**Good luck with your job search!**

*Questions? Open an issue on GitHub!*