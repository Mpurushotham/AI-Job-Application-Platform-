// API Configuration Template
// Copy this file to apiKeys.js and fill in your actual API keys
// NEVER commit apiKeys.js to GitHub!

const API_CONFIG = {
    // Anthropic Claude API
    // Get your API key from: https://console.anthropic.com/
    // Used for: Resume parsing, cover letter generation, AI matching
    ANTHROPIC_KEY: 'sk-ant-api03-your-key-here',
    
    // Adzuna Job Search API
    // Sign up at: https://developer.adzuna.com/
    // Free tier: 100 requests per day
    // Used for: Job search in Sweden and other countries
    ADZUNA_APP_ID: 'your-adzuna-app-id',
    ADZUNA_API_KEY: 'your-adzuna-api-key',
    
    // RapidAPI - JSearch
    // Sign up at: https://rapidapi.com/
    // Subscribe to: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
    // Free tier: 150 requests per month
    // Used for: Additional job listings from multiple sources
    RAPIDAPI_KEY: 'your-rapidapi-key-here',
    
    // Optional: The Muse API (if you want to add another source)
    // Sign up at: https://www.themuse.com/developers/api/v2
    // Free tier: 500 requests per day
    THEMUSE_API_KEY: 'your-themuse-key-optional',
    
    // Optional: GitHub Jobs API (free, no key required)
    // Backup source if other APIs fail
    USE_GITHUB_JOBS: true,
    
    // Rate Limiting Configuration
    MAX_REQUESTS_PER_MINUTE: 10,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    
    // Application Settings
    AUTO_APPLY_THRESHOLD: 85, // Only auto-apply to jobs with 85%+ match
    MAX_AUTO_APPLY_PER_DAY: 20, // Limit auto-applications per day
    APPLICATION_DELAY_MS: 2000, // Delay between applications (2 seconds)
    
    // Storage Settings
    CACHE_DURATION_HOURS: 1, // Cache job results for 1 hour
    MAX_STORED_APPLICATIONS: 1000,
    
    // Feature Flags
    ENABLE_AUTO_APPLY: true,
    ENABLE_COVER_LETTER_AI: true,
    ENABLE_ANALYTICS: true,
    ENABLE_EMAIL_NOTIFICATIONS: false // Not implemented yet
};

// Export for use in application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}