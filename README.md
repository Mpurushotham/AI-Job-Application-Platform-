# 🎯 AI Job Hunter

An intelligent job application platform powered by AI that automatically finds, matches, and applies to jobs on your behalf.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### ✨ Core Functionality

- **AI Resume Parsing**: Upload your resume and let Claude AI extract all relevant information
- **Smart Job Matching**: Advanced algorithm scores job compatibility (0-100%)
- **Multi-Source Aggregation**: Searches across Adzuna, JSearch, and more job boards
- **One-Click Applications**: Apply to jobs with a single click
- **Auto-Apply Mode**: Automatically apply to high-match jobs (85%+)
- **Cover Letter Generation**: AI creates personalized cover letters for each job
- **Application Tracking**: Monitor all applications with status updates
- **Analytics Dashboard**: Visualize your job search performance

### 🧠 AI-Powered Matching

The platform uses a sophisticated scoring algorithm that considers:
- **Skills Match** (40%): Compares your skills with job requirements
- **Experience Level** (20%): Evaluates your years of experience
- **Location Preference** (15%): Matches location or remote preferences
- **Salary Expectations** (10%): Ensures salary meets your requirements
- **Job Title Alignment** (15%): Matches desired roles

## 📦 Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- GitHub account
- Domain name (optional, for custom domain)
- API keys (see Configuration section)

### Quick Setup

1. **Fork or Clone Repository**
```bash
git clone https://github.com/yourusername/ai-job-hunter.git
cd ai-job-hunter
```

2. **Configure API Keys**
```bash
# Copy example config
cp config/apiKeys.example.js config/apiKeys.js

# Edit with your API keys
nano config/apiKeys.js
```

3. **Deploy to GitHub Pages**
```bash
# Push to GitHub
git add .
git commit -m "Initial deployment"
git push origin main

# Enable GitHub Pages in repository settings
# Settings → Pages → Source: main branch
```

4. **Access Your Site**
- Default: `https://yourusername.github.io/ai-job-hunter`
- Custom domain: `https://yourdomain.com` (after DNS setup)

## 🔑 Configuration

### Required API Keys

#### 1. Anthropic API (Claude AI)
- Sign up: https://console.anthropic.com/
- Get API key from dashboard
- Used for: Resume parsing, cover letter generation, job matching

#### 2. Adzuna API
- Sign up: https://developer.adzuna.com/
- Get App ID and API Key
- Used for: Job search (Sweden and other countries)
- Free tier: 100 requests/day

#### 3. RapidAPI (JSearch)
- Sign up: https://rapidapi.com/
- Subscribe to JSearch API: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- Used for: Additional job listings
- Free tier: 150 requests/month

### API Configuration File

Edit `config/apiKeys.js`:

```javascript
const API_CONFIG = {
    ANTHROPIC_KEY: 'sk-ant-api03-xxxxx',
    ADZUNA_APP_ID: 'your-app-id',
    ADZUNA_API_KEY: 'your-api-key',
    RAPIDAPI_KEY: 'your-rapidapi-key'
};
```

⚠️ **Never commit this file to GitHub!** It's already in `.gitignore`.

## 🌐 Custom Domain Setup

### Step 1: DNS Configuration

Add these DNS records at your domain registrar:

```
Type    Host    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     yourusername.github.io
```

### Step 2: Add CNAME File

```bash
echo "yourdomain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

### Step 3: Enable HTTPS

1. Go to repository Settings → Pages
2. Enter your custom domain
3. Wait for DNS check to complete
4. Enable "Enforce HTTPS"

## 📖 Usage Guide

### 1. Upload Resume

1. Click "Upload Resume" on the home page
2. Select your PDF or DOCX resume
3. AI will automatically extract your information
4. Review parsed data

### 2. Set Preferences

1. Enter desired job titles (e.g., "Software Engineer, Full Stack Developer")
2. Set salary range (in SEK or your currency)
3. Choose location preferences
4. Toggle remote work option
5. Add languages you speak
6. Save preferences

### 3. Browse Jobs

1. AI automatically searches multiple job boards
2. Each job shows a match score (0-100%)
3. View detailed match factors
4. Click "Simple Apply" to apply instantly
5. Or enable "Auto-Apply" for 85%+ matches

### 4. Track Applications

1. Navigate to "Applications" tab
2. See all submitted applications
3. Monitor status changes
4. View generated cover letters
5. Track application dates

### 5. Analyze Performance

1. Go to "Analytics" tab
2. View application funnel
3. Check response rates
4. See top job sources
5. Get AI-powered insights

## 🛠️ Tech Stack

- **Frontend**: React 18 (via CDN)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Anthropic Claude Sonnet 4
- **Storage**: Claude Storage API (persistent)
- **APIs**: Adzuna, JSearch (RapidAPI)
- **Deployment**: GitHub Pages
- **Domain**: Custom domain support

## 📊 Features Breakdown

### Resume Parsing
- Extracts name, email, phone, location
- Identifies skills and technologies
- Parses work experience with details
- Captures education history
- Generates professional summary

### Job Matching Algorithm
```javascript
// Scoring breakdown
Skills Match:      40 points max
Experience Level:  20 points max
Location:          15 points max
Salary Range:      10 points max
Job Title:         15 points max
─────────────────────────────
Total:            100 points
```

### Auto-Application System
- Generates unique cover letters
- Respects rate limits (2 second delay)
- Only applies to 85%+ matches
- Tracks all submissions
- Prevents duplicate applications

### Analytics Tracking
- Total applications count
- Response rate percentage
- Interview conversion rate
- Offer acceptance rate
- Application funnel visualization
- Source performance comparison

## 🔒 Security & Privacy

### Data Storage
- All data stored locally using Claude Storage API
- No data sent to external servers (except job APIs)
- Resume and preferences encrypted in transit
- No cookies or tracking scripts

### API Key Safety
- Never commit API keys to repository
- Use environment variables in production
- Rotate keys regularly
- Monitor API usage for anomalies

### Best Practices
- Review applications before auto-apply
- Set reasonable daily application limits
- Keep resume data up-to-date
- Monitor application responses

## 🚨 Troubleshooting

### Resume Not Parsing
- Ensure file is PDF or DOCX format
- Check file size (must be under 10MB)
- Verify Anthropic API key is valid
- Try a different resume format

### No Jobs Found
- Check API keys are configured correctly
- Verify internet connection
- Try broader search terms
- Check API rate limits

### Application Failed
- Ensure job URL is still active
- Check if already applied
- Verify storage quota not exceeded
- Review browser console for errors

### Page Not Loading
- Clear browser cache
- Check GitHub Pages deployment status
- Verify DNS records (if using custom domain)
- Test in incognito/private mode

## 📈 Performance Optimization

- **Lazy Loading**: Components load on demand
- **Debounced Search**: Reduces API calls
- **Cached Results**: Jobs cached for 1 hour
- **Rate Limiting**: Respects API constraints
- **Optimized Images**: SVG icons, no external images

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Update documentation
- Keep commits atomic

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Anthropic** for Claude AI API
- **Adzuna** for job search API
- **RapidAPI** for JSearch integration
- **Tailwind CSS** for styling framework
- **Lucide** for icon library

## 📞 Support

- **GitHub Issues**: https://github.com/yourusername/ai-job-hunter/issues
- **Email**: your-email@example.com
- **Documentation**: https://github.com/yourusername/ai-job-hunter/wiki

## 🗺️ Roadmap

### Version 1.1
- [ ] LinkedIn integration
- [ ] Indeed direct API
- [ ] Email notifications
- [ ] Interview scheduling

### Version 1.2
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Salary negotiation AI
- [ ] Interview preparation

### Version 2.0
- [ ] Multi-language support
- [ ] Team collaboration
- [ ] Advanced analytics
- [ ] Machine learning improvements

## ⚠️ Legal Disclaimer

This tool is for personal use only. Users must:
- Comply with job board Terms of Service
- Not exceed API rate limits
- Provide accurate information in applications
- Review all AI-generated content before submission
- Respect copyright and data protection laws

The developers are not responsible for:
- Application outcomes
- API costs incurred
- Violations of third-party terms
- Data loss or corruption

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ using AI and modern web technologies**

Last updated: October 2025