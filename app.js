// Application State
class SkillCredApp {
    constructor() {
        this.currentScreen = 'landing-page';
        this.uploadedFile = null;
        this.analysisData = null;
        this.skillsDatabase = {
            programming_languages: ["JavaScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "TypeScript", "Swift", "Kotlin", "Scala", "R", "MATLAB", "SQL"],
            frameworks: ["React", "Angular", "Vue.js", "Django", "Flask", "Spring", "Express.js", "Laravel", "Ruby on Rails", "ASP.NET", "Flutter", "React Native"],
            databases: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "SQLite", "Cassandra", "DynamoDB", "Elasticsearch"],
            cloud_platforms: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Heroku", "DigitalOcean"],
            tools: ["Git", "Jenkins", "Docker", "Ansible", "Terraform", "Jira", "Confluence", "Slack", "Visual Studio Code", "IntelliJ"],
            soft_skills: ["Leadership", "Communication", "Project Management", "Team Collaboration", "Problem Solving", "Critical Thinking"]
        };

        this.sampleData = {
            resume_text: `John Doe
Software Engineer
Email: john@example.com
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

Experience:
Senior Software Engineer at TechCorp (2020-2023)
- Developed web applications using React, Node.js, and MongoDB
- Led a team of 5 developers on microservices architecture
- Implemented CI/CD pipelines using Jenkins and Docker
- Worked extensively with AWS services including EC2, S3, and Lambda

Software Developer at StartupXYZ (2018-2020)
- Built RESTful APIs using Python Flask and PostgreSQL
- Collaborated with cross-functional teams using Agile methodologies
- Implemented automated testing with Jest and PyTest

Education:
Bachelor of Science in Computer Science
University of Technology (2014-2018)

Skills:
Programming Languages: JavaScript, Python, Java, TypeScript
Frameworks: React, Node.js, Flask, Django
Databases: MongoDB, PostgreSQL, MySQL
Cloud: AWS, Docker, Kubernetes
Tools: Git, Jenkins, Jira`,

            github_data: {
                username: "johndoe",
                public_repos: 23,
                followers: 145,
                following: 89,
                repositories: [
                    {
                        name: "ecommerce-app",
                        description: "Full-stack e-commerce application built with React and Node.js",
                        language: "JavaScript",
                        languages: {"JavaScript": 65, "CSS": 20, "HTML": 15},
                        stars: 89,
                        forks: 12,
                        updated_at: "2023-11-15",
                        topics: ["react", "nodejs", "mongodb", "express"]
                    },
                    {
                        name: "ml-price-predictor",
                        description: "Machine learning model for real estate price prediction",
                        language: "Python", 
                        languages: {"Python": 90, "Jupyter Notebook": 10},
                        stars: 34,
                        forks: 8,
                        updated_at: "2023-10-22",
                        topics: ["machine-learning", "python", "scikit-learn", "pandas"]
                    },
                    {
                        name: "microservices-demo",
                        description: "Containerized microservices architecture demo",
                        language: "Java",
                        languages: {"Java": 70, "Dockerfile": 20, "YAML": 10},
                        stars: 156,
                        forks: 45,
                        updated_at: "2023-12-01",
                        topics: ["microservices", "docker", "kubernetes", "spring-boot"]
                    }
                ],
                commit_activity: [
                    {"date": "2023-12", "commits": 45},
                    {"date": "2023-11", "commits": 38},
                    {"date": "2023-10", "commits": 52},
                    {"date": "2023-09", "commits": 29}
                ]
            },

            verification_messages: [
                "Initializing AI verification system...",
                "Extracting text from uploaded resume...",
                "Running BERT NLP analysis on resume content...", 
                "Performing Named Entity Recognition for skills...",
                "Fetching GitHub repository data...",
                "Analyzing programming language distribution...",
                "Cross-referencing LinkedIn profile information...",
                "Calculating skill consistency scores...",
                "Validating certificates and endorsements...",
                "Generating comprehensive trust score...",
                "Compiling verification report..."
            ]
        };
    }

    init() {
        this.bindEvents();
        this.showScreen('landing-page');
        console.log('SkillCred App initialized');
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Navigation events - with better error handling
        const startBtn = document.getElementById('start-verification-btn');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Start verification clicked');
                this.showScreen('upload-screen');
            });
            console.log('Start verification button event bound');
        } else {
            console.error('Start verification button not found');
        }

        const backBtn = document.getElementById('back-to-landing');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showScreen('landing-page');
            });
        }

        const newVerificationBtn = document.getElementById('new-verification');
        if (newVerificationBtn) {
            newVerificationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.reset();
                this.showScreen('landing-page');
            });
        }

        // File upload events
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('resume-file');

        if (fileUploadArea && fileInput) {
            fileUploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('dragover');
            });

            fileUploadArea.addEventListener('dragleave', () => {
                fileUploadArea.classList.remove('dragover');
            });

            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }

        // Form validation
        const githubInput = document.getElementById('github-username');
        const linkedinInput = document.getElementById('linkedin-url');
        
        if (githubInput) {
            githubInput.addEventListener('input', () => this.validateForm());
        }
        if (linkedinInput) {
            linkedinInput.addEventListener('input', () => this.validateForm());
        }

        // Analysis start
        const startAnalysisBtn = document.getElementById('start-analysis-btn');
        if (startAnalysisBtn) {
            startAnalysisBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startAnalysis();
            });
        }

        // Results actions
        const exportBtn = document.getElementById('export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportReport();
            });
        }

        const detailedBtn = document.getElementById('view-detailed-analysis');
        if (detailedBtn) {
            detailedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDetailedAnalysis();
            });
        }

        // Modal events
        const closeModalBtn = document.getElementById('close-skill-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideModal('skill-modal');
            });
        }

        const modalOverlay = document.querySelector('#skill-modal .modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.hideModal('skill-modal');
            });
        }

        // Toast close
        const toastClose = document.querySelector('.toast-close');
        if (toastClose) {
            toastClose.addEventListener('click', () => {
                this.hideToast();
            });
        }

        console.log('All events bound successfully');
    }

    showScreen(screenId) {
        console.log(`Switching to screen: ${screenId}`);
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            console.log(`Successfully switched to ${screenId}`);
            
            // Trigger form validation on upload screen
            if (screenId === 'upload-screen') {
                setTimeout(() => this.validateForm(), 100);
            }
        } else {
            console.error(`Screen ${screenId} not found`);
        }
    }

    handleFileUpload(file) {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            this.showToast('Please upload a PDF or DOCX file', 'error');
            return;
        }

        if (file.size > maxSize) {
            this.showToast('File size must be less than 10MB', 'error');
            return;
        }

        this.uploadedFile = file;
        this.displayFileInfo(file);
        this.validateForm();
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        if (fileInfo) {
            fileInfo.innerHTML = `
                <div class="flex items-center gap-8">
                    <span class="file-icon">📄</span>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <span class="status status--success">✓ Valid</span>
                </div>
            `;
            fileInfo.classList.add('visible');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    validateForm() {
        const githubUsername = document.getElementById('github-username')?.value.trim() || '';
        const linkedinUrl = document.getElementById('linkedin-url')?.value.trim() || '';
        const startButton = document.getElementById('start-analysis-btn');

        const isValid = this.uploadedFile && githubUsername && linkedinUrl;
        
        if (startButton) {
            startButton.disabled = !isValid;
        }
    }

    async startAnalysis() {
        this.showScreen('processing-screen');
        await this.runAnalysis();
    }

    async runAnalysis() {
        const messages = this.sampleData.verification_messages;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const processingSteps = document.getElementById('processing-steps');
        const timeRemaining = document.getElementById('time-remaining');

        const totalSteps = messages.length;
        const totalTime = 8000; // 8 seconds total
        const stepTime = totalTime / totalSteps;

        for (let i = 0; i < totalSteps; i++) {
            const progress = ((i + 1) / totalSteps) * 100;
            const remaining = Math.ceil((totalSteps - i - 1) * (stepTime / 1000));

            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${Math.round(progress)}%`;
            if (timeRemaining) timeRemaining.textContent = remaining > 0 ? `${remaining} seconds` : 'Finalizing...';

            if (processingSteps) {
                processingSteps.innerHTML = `<div class="processing-step active">${messages[i]}</div>`;
            }

            await this.delay(stepTime);
        }

        // Generate analysis results
        this.generateAnalysisResults();
        this.showScreen('results-screen');
    }

    generateAnalysisResults() {
        const resumeSkills = this.extractSkillsFromResume();
        const githubSkills = this.extractSkillsFromGitHub();
        const verifiedSkills = this.crossReferenceSkills(resumeSkills, githubSkills);
        const trustScore = this.calculateTrustScore(verifiedSkills);

        this.analysisData = {
            skills: verifiedSkills,
            trustScore: trustScore,
            githubData: this.sampleData.github_data
        };

        this.displayResults();
    }

    extractSkillsFromResume() {
        const resumeText = this.sampleData.resume_text.toLowerCase();
        const foundSkills = [];

        // Check all skill categories
        Object.entries(this.skillsDatabase).forEach(([category, skills]) => {
            skills.forEach(skill => {
                if (resumeText.includes(skill.toLowerCase())) {
                    foundSkills.push({
                        name: skill,
                        category: category,
                        source: 'resume',
                        confidence: 0.85 + Math.random() * 0.1
                    });
                }
            });
        });

        return foundSkills;
    }

    extractSkillsFromGitHub() {
        const foundSkills = [];
        const repos = this.sampleData.github_data.repositories;

        // Extract from repository languages
        repos.forEach(repo => {
            Object.keys(repo.languages).forEach(language => {
                if (this.skillsDatabase.programming_languages.includes(language)) {
                    foundSkills.push({
                        name: language,
                        category: 'programming_languages',
                        source: 'github',
                        confidence: 0.9,
                        evidence: `Used in ${repo.name} (${repo.languages[language]}%)`
                    });
                }
            });

            // Extract from topics
            repo.topics.forEach(topic => {
                const skillName = this.mapTopicToSkill(topic);
                if (skillName) {
                    foundSkills.push({
                        name: skillName,
                        category: this.getSkillCategory(skillName),
                        source: 'github',
                        confidence: 0.8,
                        evidence: `Project topic in ${repo.name}`
                    });
                }
            });
        });

        return foundSkills;
    }

    mapTopicToSkill(topic) {
        const mapping = {
            'react': 'React',
            'nodejs': 'Node.js',
            'mongodb': 'MongoDB',
            'express': 'Express.js',
            'python': 'Python',
            'docker': 'Docker',
            'kubernetes': 'Kubernetes',
            'spring-boot': 'Spring',
            'machine-learning': 'Machine Learning'
        };
        return mapping[topic] || null;
    }

    getSkillCategory(skillName) {
        for (const [category, skills] of Object.entries(this.skillsDatabase)) {
            if (skills.includes(skillName)) {
                return category;
            }
        }
        return 'other';
    }

    crossReferenceSkills(resumeSkills, githubSkills) {
        const skillMap = new Map();

        // Add resume skills
        resumeSkills.forEach(skill => {
            if (!skillMap.has(skill.name)) {
                skillMap.set(skill.name, {
                    name: skill.name,
                    category: skill.category,
                    sources: [],
                    trustScore: 0,
                    evidence: []
                });
            }
            const skillData = skillMap.get(skill.name);
            skillData.sources.push('resume');
            skillData.evidence.push(`Mentioned in resume with ${Math.round(skill.confidence * 100)}% confidence`);
        });

        // Add GitHub skills
        githubSkills.forEach(skill => {
            if (!skillMap.has(skill.name)) {
                skillMap.set(skill.name, {
                    name: skill.name,
                    category: skill.category,
                    sources: [],
                    trustScore: 0,
                    evidence: []
                });
            }
            const skillData = skillMap.get(skill.name);
            if (!skillData.sources.includes('github')) {
                skillData.sources.push('github');
            }
            skillData.evidence.push(skill.evidence || `Found in GitHub repositories`);
        });

        // Calculate trust scores for each skill
        const skills = Array.from(skillMap.values());
        skills.forEach(skill => {
            skill.trustScore = this.calculateSkillTrustScore(skill);
        });

        return skills;
    }

    calculateSkillTrustScore(skill) {
        let score = 0;

        // Cross-platform consistency (40%)
        const consistencyScore = skill.sources.length > 1 ? 40 : 20;
        score += consistencyScore;

        // Recency and frequency (30%)
        const recencyScore = 30; // Assume recent based on sample data
        score += recencyScore;

        // External validation (20%)
        const validationScore = skill.sources.includes('github') ? 20 : 10;
        score += validationScore;

        // Project complexity (10%)
        const complexityScore = 10;
        score += complexityScore;

        return Math.min(score, 100);
    }

    calculateTrustScore(skills) {
        if (skills.length === 0) return 0;
        
        const totalScore = skills.reduce((sum, skill) => sum + skill.trustScore, 0);
        const averageScore = totalScore / skills.length;
        
        // Apply weights based on consistency across skills
        const consistentSkills = skills.filter(skill => skill.sources.length > 1).length;
        const consistencyBonus = (consistentSkills / skills.length) * 10;
        
        return Math.min(Math.round(averageScore + consistencyBonus), 100);
    }

    displayResults() {
        const { skills, trustScore, githubData } = this.analysisData;

        // Update overall trust score
        const scoreEl = document.getElementById('overall-trust-score');
        const skillsEl = document.getElementById('skills-verified');
        const consistencyEl = document.getElementById('consistency-score');
        const activityEl = document.getElementById('recent-activity');

        if (scoreEl) scoreEl.textContent = trustScore;
        if (skillsEl) skillsEl.textContent = skills.length;
        if (consistencyEl) consistencyEl.textContent = `${Math.round((skills.filter(s => s.sources.length > 1).length / skills.length) * 100)}%`;
        if (activityEl) activityEl.textContent = '85%';

        // Update trust score circle color
        const trustCircle = document.querySelector('.trust-score-circle');
        const trustStatus = document.querySelector('.score-status');
        
        if (trustCircle && trustStatus) {
            if (trustScore >= 80) {
                trustCircle.classList.add('high-score');
                trustStatus.className = 'score-status high-trust';
                trustStatus.textContent = 'High Trust';
            } else if (trustScore >= 60) {
                trustCircle.classList.add('medium-score');
                trustStatus.className = 'score-status medium-trust';
                trustStatus.textContent = 'Medium Trust';
            } else {
                trustCircle.classList.add('low-score');
                trustStatus.className = 'score-status low-trust';
                trustStatus.textContent = 'Low Trust';
            }
        }

        // Display skills table
        this.displaySkillsTable(skills);

        // Generate charts
        this.generateCharts();
    }

    displaySkillsTable(skills) {
        const table = document.getElementById('skills-table');
        if (!table) return;
        
        let html = `
            <div class="skill-header">
                <div>Skill</div>
                <div>Sources</div>
                <div>Evidence</div>
                <div>Trust</div>
            </div>
        `;

        skills.forEach(skill => {
            const trustLevel = skill.trustScore >= 80 ? 'high' : skill.trustScore >= 60 ? 'medium' : 'low';
            
            html += `
                <div class="skill-row" data-skill="${skill.name}">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-sources">
                        ${skill.sources.map(source => `<span class="source-badge ${source}">${source}</span>`).join('')}
                    </div>
                    <div class="evidence-count">${skill.evidence.length} items</div>
                    <div class="trust-badge ${trustLevel}">${skill.trustScore}</div>
                </div>
            `;
        });

        table.innerHTML = html;

        // Add click events for skill details
        table.querySelectorAll('.skill-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const skillName = e.currentTarget.dataset.skill;
                this.showSkillDetail(skillName);
            });
        });
    }

    generateCharts() {
        this.generateLanguagesChart();
        this.generateConsistencyChart();
        this.generateActivityChart();
    }

    generateLanguagesChart() {
        const ctx = document.getElementById('languages-chart')?.getContext('2d');
        if (!ctx) return;

        const languages = {};

        this.sampleData.github_data.repositories.forEach(repo => {
            Object.entries(repo.languages).forEach(([lang, percentage]) => {
                languages[lang] = (languages[lang] || 0) + percentage;
            });
        });

        const sortedLanguages = Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sortedLanguages.map(([lang]) => lang),
                datasets: [{
                    data: sortedLanguages.map(([,percentage]) => percentage),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    generateConsistencyChart() {
        const ctx = document.getElementById('consistency-chart')?.getContext('2d');
        if (!ctx) return;

        const skills = this.analysisData.skills;
        
        const consistencyData = {
            'High (80-100)': skills.filter(s => s.trustScore >= 80).length,
            'Medium (60-79)': skills.filter(s => s.trustScore >= 60 && s.trustScore < 80).length,
            'Low (0-59)': skills.filter(s => s.trustScore < 60).length
        };

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(consistencyData),
                datasets: [{
                    label: 'Number of Skills',
                    data: Object.values(consistencyData),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    generateActivityChart() {
        const ctx = document.getElementById('activity-chart')?.getContext('2d');
        if (!ctx) return;

        const activity = this.sampleData.github_data.commit_activity;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: activity.map(a => a.date),
                datasets: [{
                    label: 'Commits',
                    data: activity.map(a => a.commits),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    showSkillDetail(skillName) {
        const skill = this.analysisData.skills.find(s => s.name === skillName);
        if (!skill) return;

        const titleEl = document.getElementById('skill-modal-title');
        const trustValueEl = document.getElementById('skill-trust-value');
        const confidenceEl = document.getElementById('skill-confidence');

        if (titleEl) titleEl.textContent = `${skill.name} - Verification Details`;
        if (trustValueEl) trustValueEl.textContent = skill.trustScore;
        
        const confidenceLevel = skill.trustScore >= 80 ? 'High Confidence' : 
                               skill.trustScore >= 60 ? 'Medium Confidence' : 'Low Confidence';
        if (confidenceEl) confidenceEl.textContent = confidenceLevel;

        // Evidence list
        const evidenceList = document.getElementById('evidence-list');
        if (evidenceList) {
            evidenceList.innerHTML = skill.evidence.map(evidence => `
                <div class="evidence-item">
                    <span class="evidence-source">${evidence}</span>
                    <span class="evidence-confidence">Verified</span>
                </div>
            `).join('');
        }

        // Recommendations
        const recommendations = document.getElementById('recommendations-list');
        if (recommendations) {
            const recs = this.generateRecommendations(skill);
            recommendations.innerHTML = recs.map(rec => `
                <div class="recommendation-item">${rec}</div>
            `).join('');
        }

        this.showModal('skill-modal');
    }

    generateRecommendations(skill) {
        const recommendations = [];
        
        if (skill.sources.length === 1) {
            if (skill.sources[0] === 'resume') {
                recommendations.push('Consider creating public GitHub projects showcasing this skill to increase verification confidence.');
            } else {
                recommendations.push('Add this skill to your resume to improve consistency across platforms.');
            }
        }
        
        if (skill.trustScore < 80) {
            recommendations.push('Create more recent projects or contributions to demonstrate current proficiency.');
            recommendations.push('Consider obtaining certifications or endorsements for this skill.');
        }
        
        recommendations.push('Continue practicing and building projects to maintain skill relevancy.');
        
        return recommendations;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showToast(message, type = 'error') {
        const toast = document.getElementById('error-toast');
        const messageEl = document.getElementById('error-message');
        
        if (toast && messageEl) {
            messageEl.textContent = message;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                this.hideToast();
            }, 5000);
        }
    }

    hideToast() {
        const toast = document.getElementById('error-toast');
        if (toast) {
            toast.classList.add('hidden');
        }
    }

    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overallTrustScore: this.analysisData.trustScore,
            skillsAnalyzed: this.analysisData.skills.length,
            skillsDetails: this.analysisData.skills.map(skill => ({
                name: skill.name,
                category: skill.category,
                trustScore: skill.trustScore,
                sources: skill.sources,
                evidenceCount: skill.evidence.length
            }))
        };

        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `skillcred-report-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    showDetailedAnalysis() {
        const message = 'Detailed analysis feature would provide comprehensive insights into skill verification methodology, confidence intervals, and improvement recommendations.';
        this.showToast(message, 'info');
    }

    reset() {
        this.uploadedFile = null;
        this.analysisData = null;
        
        const fileInput = document.getElementById('resume-file');
        const githubInput = document.getElementById('github-username');
        const linkedinInput = document.getElementById('linkedin-url');
        const fileInfo = document.getElementById('file-info');
        const startBtn = document.getElementById('start-analysis-btn');

        if (fileInput) fileInput.value = '';
        if (githubInput) githubInput.value = 'johndoe';
        if (linkedinInput) linkedinInput.value = 'https://linkedin.com/in/johndoe';
        if (fileInfo) fileInfo.classList.remove('visible');
        if (startBtn) startBtn.disabled = true;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SkillCred App...');
    try {
        window.skillCredApp = new SkillCredApp();
        window.skillCredApp.init();
    } catch (error) {
        console.error('Error initializing SkillCred App:', error);
    }
});