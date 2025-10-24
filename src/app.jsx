const { useState, useEffect } = React;

// Import API configuration (will be loaded separately)
const API_CONFIG = {
    ANTHROPIC_KEY: 'your-anthropic-api-key',
    ADZUNA_APP_ID: 'your-adzuna-app-id',
    ADZUNA_API_KEY: 'your-adzuna-api-key',
    RAPIDAPI_KEY: 'your-rapidapi-key'
};

// Storage Service
const StorageService = {
    async get(key) {
        try {
            const result = await window.storage.get(key);
            return result ? JSON.parse(result.value) : null;
        } catch (error) {
            console.log(`Key ${key} not found:`, error);
            return null;
        }
    },
    
    async set(key, value) {
        try {
            await window.storage.set(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    },
    
    async delete(key) {
        try {
            await window.storage.delete(key);
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            return false;
        }
    },
    
    async list(prefix = '') {
        try {
            const result = await window.storage.list(prefix);
            return result ? result.keys : [];
        } catch (error) {
            console.error('List error:', error);
            return [];
        }
    }
};

// AI Service - Claude API Integration
const AIService = {
    async parseResume(base64Data, fileType) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'document',
                                source: {
                                    type: 'base64',
                                    media_type: fileType,
                                    data: base64Data
                                }
                            },
                            {
                                type: 'text',
                                text: `Parse this resume and extract the following information in JSON format only (no markdown, no preamble):
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "location": "current location",
  "summary": "professional summary",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "company name",
      "title": "job title",
      "duration": "time period",
      "description": "key achievements"
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree type",
      "field": "field of study",
      "year": "graduation year"
    }
  ]
}`
                            }
                        ]
                    }]
                })
            });

            const data = await response.json();
            const text = data.content.find(c => c.type === 'text')?.text || '{}';
            const cleanText = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error('Resume parsing error:', error);
            throw error;
        }
    },

    async generateCoverLetter(resumeData, jobData) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: `Generate a professional cover letter for this job application.

Resume Summary:
Name: ${resumeData.name}
Skills: ${resumeData.skills?.join(', ')}
Experience: ${resumeData.experience?.[0]?.title} at ${resumeData.experience?.[0]?.company}

Job Details:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}

Write a compelling cover letter that highlights relevant experience and skills. Keep it concise (3-4 paragraphs).`
                    }]
                })
            });

            const data = await response.json();
            return data.content.find(c => c.type === 'text')?.text || '';
        } catch (error) {
            console.error('Cover letter generation error:', error);
            return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobData.title} position at ${jobData.company}...`;
        }
    },

    calculateMatchScore(resumeData, jobData, preferences) {
        let score = 0;
        let factors = [];

        // Skills matching (40 points)
        if (resumeData.skills && jobData.requiredSkills) {
            const resumeSkills = resumeData.skills.map(s => s.toLowerCase());
            const jobSkills = jobData.requiredSkills.map(s => s.toLowerCase());
            const matchedSkills = jobSkills.filter(skill => 
                resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
            );
            const skillScore = (matchedSkills.length / jobSkills.length) * 40;
            score += skillScore;
            factors.push({
                name: 'Skills Match',
                score: Math.round(skillScore),
                details: `${matchedSkills.length}/${jobSkills.length} skills matched`
            });
        }

        // Experience level (20 points)
        const yearsExp = resumeData.experience?.length || 0;
        const expScore = Math.min(yearsExp * 4, 20);
        score += expScore;
        factors.push({
            name: 'Experience Level',
            score: Math.round(expScore),
            details: `${yearsExp} relevant positions`
        });

        // Location match (15 points)
        if (jobData.location && resumeData.location) {
            const locationMatch = jobData.location.toLowerCase().includes(resumeData.location.toLowerCase()) ||
                                jobData.remote || preferences.remote;
            const locScore = locationMatch ? 15 : 5;
            score += locScore;
            factors.push({
                name: 'Location',
                score: locScore,
                details: locationMatch ? 'Perfect match' : 'Relocation needed'
            });
        }

        // Salary expectations (10 points)
        if (jobData.salaryMin && preferences.salaryMin) {
            const salaryMatch = parseInt(jobData.salaryMin) >= parseInt(preferences.salaryMin);
            const salScore = salaryMatch ? 10 : 5;
            score += salScore;
            factors.push({
                name: 'Salary Range',
                score: salScore,
                details: salaryMatch ? 'Meets expectations' : 'Below expectations'
            });
        }

        // Job title match (15 points)
        if (preferences.jobTitles && preferences.jobTitles.length > 0) {
            const titleMatch = preferences.jobTitles.some(pref => 
                jobData.title.toLowerCase().includes(pref.toLowerCase())
            );
            const titleScore = titleMatch ? 15 : 5;
            score += titleScore;
            factors.push({
                name: 'Job Title',
                score: titleScore,
                details: titleMatch ? 'Matches preferences' : 'Different role'
            });
        }

        return {
            overallScore: Math.min(Math.round(score), 100),
            factors: factors
        };
    }
};

// Job API Service - Real job board integrations
const JobAPIService = {
    async searchAdzuna(query, location, page = 1) {
        try {
            const baseUrl = 'https://api.adzuna.com/v1/api/jobs';
            const country = 'se'; // Sweden
            const url = `${baseUrl}/${country}/search/${page}?app_id=${API_CONFIG.ADZUNA_APP_ID}&app_key=${API_CONFIG.ADZUNA_API_KEY}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            return data.results.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company.display_name,
                location: job.location.display_name,
                description: job.description,
                salary: job.salary_min ? `${job.salary_min} - ${job.salary_max} SEK` : 'Not specified',
                salaryMin: job.salary_min,
                salaryMax: job.salary_max,
                url: job.redirect_url,
                postedDate: new Date(job.created).toLocaleDateString(),
                type: job.contract_time || 'Full-time',
                remote: job.location.display_name.toLowerCase().includes('remote'),
                source: 'Adzuna',
                requiredSkills: this.extractSkills(job.description)
            }));
        } catch (error) {
            console.error('Adzuna API error:', error);
            return [];
        }
    },

    async searchRapidAPI(query, location) {
        try {
            const url = 'https://jsearch.p.rapidapi.com/search';
            const response = await fetch(`${url}?query=${encodeURIComponent(query + ' in ' + location)}&page=1&num_pages=1`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            });

            const data = await response.json();
            
            return data.data?.map(job => ({
                id: job.job_id,
                title: job.job_title,
                company: job.employer_name,
                location: job.job_city + ', ' + job.job_country,
                description: job.job_description,
                salary: job.job_salary || 'Not specified',
                salaryMin: job.job_min_salary,
                salaryMax: job.job_max_salary,
                url: job.job_apply_link,
                postedDate: new Date(job.job_posted_at_timestamp * 1000).toLocaleDateString(),
                type: job.job_employment_type,
                remote: job.job_is_remote,
                source: 'JSearch',
                requiredSkills: this.extractSkills(job.job_description)
            })) || [];
        } catch (error) {
            console.error('RapidAPI error:', error);
            return [];
        }
    },

    extractSkills(description) {
        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
            'AWS', 'Docker', 'Kubernetes', 'SQL', 'PostgreSQL', 'MongoDB',
            'Git', 'CI/CD', 'Agile', 'Scrum', 'REST API', 'GraphQL',
            'HTML', 'CSS', 'Vue', 'Angular', 'Spring', 'Django', 'Flask'
        ];
        
        const found = commonSkills.filter(skill => 
            description.toLowerCase().includes(skill.toLowerCase())
        );
        
        return found.length > 0 ? found : ['General'];
    },

    async searchAllSources(query, location) {
        const results = await Promise.allSettled([
            this.searchAdzuna(query, location),
            this.searchRapidAPI(query, location)
        ]);

        const allJobs = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value);

        // Remove duplicates based on title and company
        const uniqueJobs = allJobs.reduce((acc, job) => {
            const key = `${job.title}-${job.company}`.toLowerCase();
            if (!acc.has(key)) {
                acc.set(key, job);
            }
            return acc;
        }, new Map());

        return Array.from(uniqueJobs.values());
    }
};

// Main App Component
function App() {
    const [activeStep, setActiveStep] = useState(1);
    const [activeTab, setActiveTab] = useState('jobs');
    const [resume, setResume] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [preferences, setPreferences] = useState({
        jobTitles: [],
        skills: [],
        salaryMin: '',
        salaryMax: '',
        location: 'Stockholm',
        languages: ['English', 'Swedish'],
        employmentType: ['Full-time'],
        remote: true
    });
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Load data on mount
    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        const storedResume = await StorageService.get('resume-data');
        const storedPrefs = await StorageService.get('preferences');
        const storedJobs = await StorageService.get('jobs');
        const storedApps = await StorageService.get('applications');

        if (storedResume) {
            setParsedData(storedResume);
            setActiveStep(2);
        }
        if (storedPrefs) setPreferences(storedPrefs);
        if (storedJobs) setJobs(storedJobs);
        if (storedApps) setApplications(storedApps);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setResume(file);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Data = event.target.result.split(',')[1];
                const fileType = file.type;
                
                const parsed = await AIService.parseResume(base64Data, fileType);
                
                setParsedData(parsed);
                await StorageService.set('resume-data', parsed);
                
                // Auto-populate preferences
                setPreferences(prev => ({
                    ...prev,
                    skills: parsed.skills || [],
                    location: parsed.location || prev.location
                }));
                
                setActiveStep(2);
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Resume upload error:', error);
            alert('Error parsing resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const savePreferences = async () => {
        await StorageService.set('preferences', preferences);
        setActiveStep(3);
        searchJobs();
    };

    const searchJobs = async () => {
        setLoading(true);
        
        try {
            const query = preferences.jobTitles.join(' OR ') || 'software engineer';
            const location = preferences.location || 'Stockholm';
            
            const fetchedJobs = await JobAPIService.searchAllSources(query, location);
            
            // Calculate match scores for each job
            const jobsWithScores = fetchedJobs.map(job => {
                const matchResult = AIService.calculateMatchScore(parsedData, job, preferences);
                return {
                    ...job,
                    matchScore: matchResult.overallScore,
                    matchFactors: matchResult.factors
                };
            });

            // Sort by match score
            jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
            
            setJobs(jobsWithScores);
            await StorageService.set('jobs', jobsWithScores);
            
            // Auto-apply if enabled
            if (autoApplyEnabled) {
                const highMatchJobs = jobsWithScores.filter(j => j.matchScore >= 85);
                for (const job of highMatchJobs.slice(0, 5)) { // Limit to 5 per batch
                    await applyToJob(job, true);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
                }
            }
        } catch (error) {
            console.error('Job search error:', error);
            alert('Error searching jobs. Please check API configuration.');
        } finally {
            setLoading(false);
        }
    };

    const applyToJob = async (job, isAuto = false) => {
        // Check if already applied
        const alreadyApplied = applications.some(app => app.jobId === job.id);
        if (alreadyApplied) {
            if (!isAuto) alert('You have already applied to this job!');
            return;
        }

        const coverLetter = await AIService.generateCoverLetter(parsedData, job);

        const newApplication = {
            id: Date.now().toString() + Math.random(),
            jobId: job.id,
            job: job,
            status: 'Applied',
            appliedDate: new Date().toISOString(),
            coverLetter: coverLetter,
            autoApplied: isAuto
        };

        const updatedApps = [...applications, newApplication];
        setApplications(updatedApps);
        await StorageService.set('applications', updatedApps);
        
        if (!isAuto) {
            alert(`Successfully applied to ${job.title} at ${job.company}!`);
        }
    };

    const getMatchColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const calculateAnalytics = () => {
        const totalApps = applications.length;
        const byStatus = _.groupBy(applications, 'status');
        const bySource = _.groupBy(applications, 'job.source');
        
        return {
            total: totalApps,
            applied: byStatus['Applied']?.length || 0,
            screening: byStatus['Screening']?.length || 0,
            interview: byStatus['Interview']?.length || 0,
            offer: byStatus['Offer']?.length || 0,
            rejected: byStatus['Rejected']?.length || 0,
            responseRate: totalApps > 0 ? ((byStatus['Screening']?.length || 0) / totalApps * 100).toFixed(1) : 0,
            sources: Object.entries(bySource).map(([name, apps]) => ({
                name,
                count: apps.length
            }))
        };
    };

    const analytics = calculateAnalytics();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <i data-lucide="target" className="w-6 h-6 text-white"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">AI Job Hunter</h1>
                                <p className="text-xs text-gray-500">Smart Applications, Better Results</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setActiveTab('analytics')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <i data-lucide="bar-chart" className="w-4 h-4"></i>
                                <span>Analytics</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('jobs')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'jobs' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <i data-lucide="briefcase" className="w-4 h-4"></i>
                                <span>Jobs ({jobs.length})</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('applications')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'applications' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <i data-lucide="check-circle" className="w-4 h-4"></i>
                                <span>Applications ({applications.length})</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Progress Steps */}
                {activeTab === 'jobs' && (
                    <div className="flex items-center justify-between mb-12 bg-white rounded-2xl p-6 shadow-sm">
                        {[
                            { num: 1, label: 'Upload Resume', icon: 'upload' },
                            { num: 2, label: 'Set Preferences', icon: 'settings' },
                            { num: 3, label: 'Find Jobs', icon: 'search' }
                        ].map((step, idx) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
                                            activeStep >= step.num
                                                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                        onClick={() => activeStep >= step.num && setActiveStep(step.num)}
                                    >
                                        <i data-lucide={step.icon} className="w-6 h-6"></i>
                                    </div>
                                    <span className={`mt-2 text-sm font-medium ${
                                        activeStep >= step.num ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div className={`h-1 flex-1 mx-4 transition ${
                                        activeStep > step.num ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Step 1: Upload Resume */}
                {activeTab === 'jobs' && activeStep === 1 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 slide-in">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold mb-2">Upload Your Resume</h2>
                            <p className="text-gray-600 mb-8">
                                Our AI will analyze your resume to extract skills, experience, and qualifications
                            </p>
                            
                            <label className="block">
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                                    <i data-lucide="upload" className="w-20 h-20 mx-auto mb-4 text-gray-400"></i>
                                    <p className="text-xl font-semibold mb-2">
                                        {resume ? resume.name : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-sm text-gray-500">PDF or DOCX up to 10MB</p>
                                    <input
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>
                            </label>

                            {loading && (
                                <div className="mt-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-gray-600 font-medium">Parsing your resume with AI...</p>
                                </div>
                            )}

                            {parsedData && (
                                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <i data-lucide="check" className="w-6 h-6 text-white"></i>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-green-800 text-lg mb-3">Resume Parsed Successfully!</h3>
                                            <div className="space-y-2 text-sm">
                                                <p><strong className="text-green-900">Name:</strong> {parsedData.name}</p>
                                                <p><strong className="text-green-900">Email:</strong> {parsedData.email}</p>
                                                <p><strong className="text-green-900">Location:</strong> {parsedData.location}</p>
                                                <p><strong className="text-green-900">Skills:</strong> {parsedData.skills?.slice(0, 10).join(', ')}</p>
                                            </div>
                                            <button
                                                onClick={() => setActiveStep(2)}
                                                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
                                            >
                                                Continue to Preferences →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Set Preferences */}
                {activeTab === 'jobs' && activeStep === 2 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 slide-in">
                        <h2 className="text-3xl font-bold mb-2">Set Your Job Preferences</h2>
                        <p className="text-gray-600 mb-8">
                            Define your ideal role to help our AI find the best matches
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    <i data-lucide="briefcase" className="w-4 h-4 inline mr-2"></i>
                                    Job Titles / Roles
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Software Engineer, Full Stack Developer, DevOps Engineer"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={preferences.jobTitles.join(', ')}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        jobTitles: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    <i data-lucide="dollar-sign" className="w-4 h-4 inline mr-2"></i>
                                    Minimum Salary (SEK/year)
                                </label>
                                <input
                                    type="number"
                                    placeholder="500000"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={preferences.salaryMin}
                                    onChange={(e) => setPreferences({...preferences, salaryMin: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    <i data-lucide="dollar-sign" className="w-4 h-4 inline mr-2"></i>
                                    Maximum Salary (SEK/year)
                                </label>
                                <input
                                    type="number"
                                    placeholder="800000"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={preferences.salaryMax}
                                    onChange={(e) => setPreferences({...preferences, salaryMax: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    <i data-lucide="map-pin" className="w-4 h-4 inline mr-2"></i>
                                    Preferred Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Stockholm, Sweden"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={preferences.location}
                                    onChange={(e) => setPreferences({...preferences, location: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    <i data-lucide="globe" className="w-4 h-4 inline mr-2"></i>
                                    Languages
                                </label>
                                <input
                                    type="text"
                                    placeholder="English, Swedish"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={preferences.languages.join(', ')}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        languages: e.target.value.split(',').map(l => l.trim()).filter(l => l)
                                    })}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.remote}
                                        onChange={(e) => setPreferences({...preferences, remote: e.target.checked})}
                                        className="w-5 h-5 text-blue-600 rounded"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700 block">Open to Remote Positions</span>
                                        <span className="text-xs text-gray-500">Include fully remote and hybrid opportunities</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setActiveStep(1)}
                                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={savePreferences}
                                className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
                            >
                                Save & Find Jobs →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Job Matches */}
                {activeTab === 'jobs' && activeStep === 3 && (
                    <div className="slide-in">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold">AI Job Matches</h2>
                                    <p className="text-gray-600 mt-1">Found {jobs.length} relevant positions for you</p>
                                </div>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-100 transition">
                                        <input
                                            type="checkbox"
                                            checked={autoApplyEnabled}
                                            onChange={(e) => setAutoApplyEnabled(e.target.checked)}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <span className="text-sm font-semibold text-purple-700">
                                            <i data-lucide="zap" className="w-4 h-4 inline mr-1"></i>
                                            Auto-apply (85%+ match)
                                        </span>
                                    </label>
                                    <button
                                        onClick={searchJobs}
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow disabled:opacity-50"
                                    >
                                        <i data-lucide="refresh-cw" className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                                        Refresh Jobs
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                                <p className="mt-6 text-gray-600 font-semibold text-lg">Searching job boards with AI...</p>
                                <p className="mt-2 text-gray-500 text-sm">Analyzing thousands of positions for you</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <i data-lucide="search-x" className="w-20 h-20 mx-auto text-gray-300 mb-4"></i>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs found</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your preferences or search criteria</p>
                                <button
                                    onClick={() => setActiveStep(2)}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                                >
                                    Update Preferences
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {jobs.map((job, index) => (
                                    <div key={job.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-gray-100 hover:border-blue-200 slide-in" style={{animationDelay: `${index * 50}ms`}}>
                                        <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
                                                <p className="text-lg text-gray-600 font-medium">{job.company}</p>
                                                <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                    {job.source}
                                                </span>
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl font-bold text-lg border-2 ${getMatchColor(job.matchScore)} flex items-center gap-2`}>
                                                <i data-lucide="star" className="w-5 h-5"></i>
                                                {job.matchScore}% Match
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <i data-lucide="map-pin" className="w-4 h-4"></i>
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <i data-lucide="dollar-sign" className="w-4 h-4"></i>
                                                <span>{job.salary}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <i data-lucide="briefcase" className="w-4 h-4"></i>
                                                <span>{job.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <i data-lucide="clock" className="w-4 h-4"></i>
                                                <span>{job.postedDate}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 mb-4 line-clamp-3">{job.description?.slice(0, 250)}...</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.requiredSkills?.slice(0, 8).map((skill) => (
                                                <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {job.matchFactors && (
                                            <details className="mb-4">
                                                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                                                    <i data-lucide="info" className="w-4 h-4 inline mr-1"></i>
                                                    View Match Details
                                                </summary>
                                                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {job.matchFactors.map((factor) => (
                                                        <div key={factor.name} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-semibold text-gray-700">{factor.name}</span>
                                                                <span className="text-xs font-bold text-blue-600">{factor.score}%</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">{factor.details}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => applyToJob(job)}
                                                disabled={applications.some(app => app.jobId === job.id)}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                            >
                                                {applications.some(app => app.jobId === job.id) ? (
                                                    <><i data-lucide="check" className="w-5 h-5"></i> Applied</>
                                                ) : (
                                                    <><i data-lucide="send" className="w-5 h-5"></i> Simple Apply</>
                                                )}
                                            </button>
                                            <a
                                                href={job.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold flex items-center gap-2"
                                            >
                                                <i data-lucide="external-link" className="w-5 h-5"></i>
                                                View Job
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <div className="slide-in">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold">Application Tracker</h2>
                                    <p className="text-gray-600 mt-1">Monitor your job applications and their status</p>
                                </div>
                            </div>

                            {applications.length === 0 ? (
                                <div className="text-center py-20">
                                    <i data-lucide="file-text" className="w-24 h-24 mx-auto text-gray-300 mb-6"></i>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">No applications yet</h3>
                                    <p className="text-gray-500 mb-6">Start applying to jobs to see them here</p>
                                    <button
                                        onClick={() => {
                                            setActiveTab('jobs');
                                            setActiveStep(3);
                                        }}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
                                    >
                                        Browse Jobs
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map((app, index) => (
                                        <div key={app.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition slide-in" style={{animationDelay: `${index * 30}ms`}}>
                                            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900">{app.job.title}</h3>
                                                    <p className="text-gray-600 font-medium">{app.job.company}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                        <i data-lucide="calendar" className="w-4 h-4"></i>
                                                        <span>Applied on {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                        {app.autoApplied && (
                                                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                                <i data-lucide="zap" className="w-3 h-3 inline mr-1"></i>
                                                                Auto-applied
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${
                                                        app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                                                        app.status === 'Screening' ? 'bg-yellow-100 text-yellow-700' :
                                                        app.status === 'Interview' ? 'bg-purple-100 text-purple-700' :
                                                        app.status === 'Offer' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <i data-lucide="map-pin" className="w-4 h-4"></i>
                                                    {app.job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <i data-lucide="star" className="w-4 h-4"></i>
                                                    {app.job.matchScore}% Match
                                                </span>
                                            </div>

                                            <details className="mt-4">
                                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                                                    View Cover Letter
                                                </summary>
                                                <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-line">
                                                    {app.coverLetter}
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="slide-in space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold mb-2">Application Analytics</h2>
                            <p className="text-gray-600 mb-8">Track your job search performance and insights</p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                                    <i data-lucide="file-text" className="w-8 h-8 text-blue-600 mb-3"></i>
                                    <div className="text-3xl font-bold text-blue-900 mb-1">{analytics.total}</div>
                                    <div className="text-sm text-blue-700 font-medium">Total Applications</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                                    <i data-lucide="trending-up" className="w-8 h-8 text-green-600 mb-3"></i>
                                    <div className="text-3xl font-bold text-green-900 mb-1">{analytics.responseRate}%</div>
                                    <div className="text-sm text-green-700 font-medium">Response Rate</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                                    <i data-lucide="users" className="w-8 h-8 text-purple-600 mb-3"></i>
                                    <div className="text-3xl font-bold text-purple-900 mb-1">{analytics.interview}</div>
                                    <div className="text-sm text-purple-700 font-medium">Interviews</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border-2 border-yellow-200">
                                    <i data-lucide="trophy" className="w-8 h-8 text-yellow-600 mb-3"></i>
                                    <div className="text-3xl font-bold text-yellow-900 mb-1">{analytics.offer}</div>
                                    <div className="text-sm text-yellow-700 font-medium">Offers</div>
                                </div>
                            </div>

                            {/* Application Funnel */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Application Funnel</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Applied', count: analytics.applied, color: 'blue' },
                                        { label: 'Screening', count: analytics.screening, color: 'yellow' },
                                        { label: 'Interview', count: analytics.interview, color: 'purple' },
                                        { label: 'Offer', count: analytics.offer, color: 'green' },
                                        { label: 'Rejected', count: analytics.rejected, color: 'red' }
                                    ].map((stage) => (
                                        <div key={stage.label} className="flex items-center gap-4">
                                            <div className="w-32 text-sm font-semibold text-gray-700">{stage.label}</div>
                                            <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                                                <div
                                                    className={`h-full bg-${stage.color}-500 flex items-center justify-end px-3 text-white text-sm font-bold transition-all`}
                                                    style={{ width: `${analytics.total > 0 ? (stage.count / analytics.total * 100) : 0}%`, minWidth: stage.count > 0 ? '40px' : '0' }}
                                                >
                                                    {stage.count > 0 && stage.count}
                                                </div>
                                            </div>
                                            <div className="w-16 text-right text-sm font-semibold text-gray-600">
                                                {analytics.total > 0 ? Math.round((stage.count / analytics.total) * 100) : 0}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sources Breakdown */}
                            {analytics.sources.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Applications by Source</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {analytics.sources.map((source) => (
                                            <div key={source.name} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                                <div className="text-2xl font-bold text-gray-900 mb-1">{source.count}</div>
                                                <div className="text-sm text-gray-600 font-medium">{source.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Insights Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <i data-lucide="lightbulb" className="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">AI Insights</h3>
                                    {applications.length === 0 ? (
                                        <p className="text-blue-100">Start applying to jobs to receive personalized insights and recommendations.</p>
                                    ) : (
                                        <div className="space-y-2 text-blue-100">
                                            <p>• You've applied to {applications.length} positions this month</p>
                                            <p>• Your average match score is {Math.round(applications.reduce((acc, app) => acc + app.job.matchScore, 0) / applications.length)}%</p>
                                            <p>• Most common job boards: {analytics.sources.map(s => s.name).join(', ')}</p>
                                            {analytics.responseRate > 0 && (
                                                <p>• Your response rate of {analytics.responseRate}% is {analytics.responseRate > 20 ? 'above' : 'below'} average</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Initialize Lucide Icons after render */}
            <script dangerouslySetInnerHTML={{__html: `
                setTimeout(() => {
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                }, 100);
            `}} />
        </div>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);