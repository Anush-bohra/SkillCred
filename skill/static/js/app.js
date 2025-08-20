// SkillCred Frontend JavaScript

class SkillCredApp {
    constructor() {
        this.uploadedFiles = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {
            search: '',
            trustScore: 'all',
            status: 'all'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // File upload
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => fileInput?.click());
        }

        // Search and filters
        const searchInput = document.getElementById('searchInput');
        const trustScoreFilter = document.getElementById('trustScoreFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (searchInput) {
            // Debounce search input
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.searchResumes();
                }, 300);
            });
        }

        if (trustScoreFilter) {
            trustScoreFilter.addEventListener('change', (e) => {
                this.filters.trustScore = e.target.value;
                this.searchResumes();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.searchResumes();
            });
        }

        // Bulk upload
        const bulkUploadBtn = document.getElementById('bulkUpload');
        if (bulkUploadBtn) {
            bulkUploadBtn.addEventListener('click', () => this.processBulkUpload());
        }
    } setupDragAndDrop() {
        const uploadZone = document.getElementById('uploadZone');
        if (!uploadZone) return;

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            this.handleFilesDrop(files);
        });
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.handleFilesDrop(files);
    }

    handleFilesDrop(files) {
        const validFiles = files.filter(file => this.validateFile(file));

        if (validFiles.length === 0) {
            this.showAlert('No valid files selected. Please upload PDF or DOCX files.', 'warning');
            return;
        }

        validFiles.forEach(file => this.addFileToQueue(file));
        this.updateFileList();
    }

    validateFile(file) {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const maxSize = 16 * 1024 * 1024; // 16MB

        if (!validTypes.includes(file.type)) {
            return false;
        }

        if (file.size > maxSize) {
            this.showAlert(`File ${file.name} is too large. Maximum size is 16MB.`, 'warning');
            return false;
        }

        return true;
    }

    addFileToQueue(file) {
        const fileData = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            status: 'queued',
            progress: 0,
            results: null
        };

        this.uploadedFiles.push(fileData);
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        fileList.innerHTML = '';

        this.uploadedFiles.forEach(fileData => {
            const fileElement = this.createFileElement(fileData);
            fileList.appendChild(fileElement);
        });
    }

    createFileElement(fileData) {
        const div = document.createElement('div');
        div.className = 'card mb-3';
        div.innerHTML = `
            <div class="d-flex align-center justify-between">
                <div class="d-flex align-center gap-3">
                    <div class="file-icon">
                        <i class="fas fa-file-${fileData.name.endsWith('.pdf') ? 'pdf' : 'word'}"></i>
                    </div>
                    <div>
                        <div class="file-name">${fileData.name}</div>
                        <div class="file-size text-muted">${this.formatFileSize(fileData.size)}</div>
                    </div>
                </div>
                <div class="d-flex align-center gap-3">
                    <div class="status-badge">
                        ${this.getStatusBadge(fileData.status)}
                    </div>
                    <button class="btn btn-outline" onclick="app.removeFile('${fileData.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            ${fileData.progress > 0 ? `
                <div class="progress mt-3">
                    <div class="progress-bar" style="width: ${fileData.progress}%"></div>
                </div>
            ` : ''}
        `;
        return div;
    }

    getStatusBadge(status) {
        const badges = {
            'queued': '<span class="badge badge-review">Queued</span>',
            'processing': '<span class="badge badge-review">Processing...</span>',
            'completed': '<span class="badge badge-verified">Completed</span>',
            'error': '<span class="badge badge-flagged">Error</span>'
        };
        return badges[status] || badges.queued;
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id != fileId);
        this.updateFileList();
    }

    async processBulkUpload() {
        const queuedFiles = this.uploadedFiles.filter(file => file.status === 'queued');

        if (queuedFiles.length === 0) {
            this.showAlert('No files to process.', 'warning');
            return;
        }

        this.showAlert(`Processing ${queuedFiles.length} files...`, 'success');

        for (const fileData of queuedFiles) {
            await this.processFile(fileData);
        }

        this.showAlert('All files processed successfully!', 'success');
        this.loadDashboardData();
    }

    async processFile(fileData) {
        try {
            fileData.status = 'processing';
            this.updateFileList();

            const formData = new FormData();
            formData.append('resume', fileData.file);

            // Create a dummy JSON file for verification
            const dummyData = {
                skills: ['Python', 'JavaScript', 'React', 'Node.js'],
                certificates: ['AWS Certified', 'Google Cloud'],
                companies: ['Microsoft', 'Google', 'Amazon']
            };
            const dummyBlob = new Blob([JSON.stringify(dummyData)], { type: 'application/json' });
            formData.append('dummy_data', dummyBlob, 'dummy_data.json');

            // Simulate progress
            this.simulateProgress(fileData);

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const results = await response.json();
                fileData.status = 'completed';
                fileData.progress = 100;
                fileData.results = results;
            } else {
                throw new Error('Upload failed');
            }

        } catch (error) {
            fileData.status = 'error';
            fileData.progress = 0;
            console.error('Error processing file:', error);
        }

        this.updateFileList();
    }

    simulateProgress(fileData) {
        const interval = setInterval(() => {
            if (fileData.progress < 90) {
                fileData.progress += Math.random() * 15;
                this.updateFileList();
            } else {
                clearInterval(interval);
            }
        }, 500);
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="d-flex align-center justify-between">
                <span>${message}</span>
                <button class="btn btn-outline" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        alertContainer.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard');
            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data);
                this.updateCharts(data);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats(data) {
        const statElements = {
            'totalResumes': document.getElementById('totalResumes'),
            'avgTrustScore': document.getElementById('avgTrustScore'),
            'verificationRate': document.getElementById('verificationRate'),
            'fraudAlerts': document.getElementById('fraudAlerts')
        };

        Object.entries(statElements).forEach(([key, element]) => {
            if (element && data[key] !== undefined) {
                element.textContent = data[key];
            }
        });
    }

    updateCharts(data) {
        // Trust Score Distribution Chart
        this.updateTrustScoreChart(data.trustScoreDistribution);

        // Verification Status Chart
        this.updateStatusChart(data.verificationStatus);

        // Skills Frequency Chart
        this.updateSkillsChart(data.skillsFrequency);
    }

    updateTrustScoreChart(data) {
        const ctx = document.getElementById('trustScoreChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['90-100%', '70-89%', '50-69%', '0-49%'],
                datasets: [{
                    data: data || [25, 45, 20, 10],
                    backgroundColor: [
                        '#22c55e',
                        '#84cc16',
                        '#f59e0b',
                        '#ef4444'
                    ]
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

    updateStatusChart(data) {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Verified', 'Review Needed', 'Flagged'],
                datasets: [{
                    data: data || [65, 25, 10],
                    backgroundColor: [
                        '#22c55e',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateSkillsChart(data) {
        const ctx = document.getElementById('skillsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: Object.keys(data || {
                    'JavaScript': 45,
                    'Python': 38,
                    'React': 32,
                    'Node.js': 28,
                    'Java': 25
                }),
                datasets: [{
                    data: Object.values(data || {
                        'JavaScript': 45,
                        'Python': 38,
                        'React': 32,
                        'Node.js': 28,
                        'Java': 25
                    }),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    filterResumes() {
        // This method is replaced by searchResumes() for live server-side filtering
        this.searchResumes();
    }

    async searchResumes() {
        try {
            // Show loading state
            this.showSearchLoading(true);

            const params = new URLSearchParams();
            if (this.filters.search) params.append('search', this.filters.search);
            if (this.filters.trustScore !== 'all') params.append('trustScore', this.filters.trustScore);
            if (this.filters.status !== 'all') params.append('status', this.filters.status);
            params.append('page', this.currentPage);
            params.append('per_page', this.itemsPerPage);

            const response = await fetch(`/api/search_resumes?${params}`);
            if (response.ok) {
                const data = await response.json();
                this.updateResumeTable(data.resumes);
                this.updatePagination(data);
                this.updateSearchResults(data.total);
            } else {
                console.error('Search failed:', response.statusText);
                this.showAlert('Search failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showAlert('Search error. Please check your connection.', 'danger');
        } finally {
            this.showSearchLoading(false);
        }
    }

    showSearchLoading(isLoading) {
        const tbody = document.querySelector('#resumeTable tbody');
        if (!tbody) return;

        if (isLoading) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 3rem;">
                        <div class="loading" style="margin: 0 auto 1rem;"></div>
                        <div>Searching resumes...</div>
                    </td>
                </tr>
            `;
        }
    }

    updateResumeTable(resumes) {
        const tbody = document.querySelector('#resumeTable tbody');
        if (!tbody) return;

        if (resumes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted" style="padding: 3rem;">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <div>No resumes found matching your criteria</div>
                        <div style="margin-top: 1rem;">
                            <button class="btn btn-outline" onclick="app.clearFilters()">
                                <i class="fas fa-times"></i>
                                Clear Filters
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = resumes.map(resume => `
            <tr>
                <td>
                    <div>
                        <div style="font-weight: 500;">${resume.name}</div>
                        <div class="text-muted" style="font-size: 0.875rem;">
                            ${resume.email}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="text-muted">${resume.upload_date}</span>
                </td>
                <td>
                    <div class="d-flex align-center gap-2">
                        <div class="trust-score-mini" style="
                            width: 40px; 
                            height: 40px; 
                            border-radius: 50%; 
                            background: conic-gradient(
                                ${resume.trust_score >= 80 ? 'var(--success-color)' : resume.trust_score >= 60 ? 'var(--warning-color)' : 'var(--danger-color)'} ${resume.trust_score}%, 
                                var(--border-color) ${resume.trust_score}%
                            );
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                        ">
                            <div style="
                                position: absolute;
                                width: 80%;
                                height: 80%;
                                background: var(--card-bg);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 0.75rem;
                                font-weight: 600;
                            ">
                                ${resume.trust_score}
                            </div>
                        </div>
                        <span style="font-weight: 500;">${resume.trust_score}%</span>
                    </div>
                </td>
                <td>
                    ${this.getStatusBadgeHtml(resume.status)}
                </td>
                <td>
                    ${resume.flags_count > 0 ?
                `<span class="badge badge-flagged">
                            <i class="fas fa-flag"></i>
                            ${resume.flags_count}
                        </span>` :
                '<span class="text-muted">None</span>'
            }
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <a href="/results/${resume.id}" class="btn btn-outline" style="padding: 0.5rem;">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="btn btn-outline" style="padding: 0.5rem;" onclick="downloadReport('${resume.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-outline" style="padding: 0.5rem;" onclick="copyToClipboard('${resume.id}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusBadgeHtml(status) {
        switch (status) {
            case 'verified':
                return `<span class="badge badge-verified">
                    <i class="fas fa-check-circle"></i>
                    Verified
                </span>`;
            case 'review':
                return `<span class="badge badge-review">
                    <i class="fas fa-exclamation-triangle"></i>
                    Review
                </span>`;
            case 'flagged':
                return `<span class="badge badge-flagged">
                    <i class="fas fa-flag"></i>
                    Flagged
                </span>`;
            default:
                return `<span class="badge badge-review">Unknown</span>`;
        }
    }

    updatePagination(data) {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer || data.total_pages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        paginationContainer.innerHTML = `
            <div class="d-flex justify-between align-center" style="width: 100%; padding: 1rem 0;">
                <div class="text-muted">
                    Showing ${((data.page - 1) * data.per_page) + 1} to ${Math.min(data.page * data.per_page, data.total)} of ${data.total} results
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline" ${data.page <= 1 ? 'disabled' : ''} onclick="app.changePage(${data.page - 1})">
                        <i class="fas fa-chevron-left"></i>
                        Previous
                    </button>
                    <span class="d-flex align-center" style="padding: 0 1rem;">
                        Page ${data.page} of ${data.total_pages}
                    </span>
                    <button class="btn btn-outline" ${data.page >= data.total_pages ? 'disabled' : ''} onclick="app.changePage(${data.page + 1})">
                        Next
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateSearchResults(total) {
        const resultsCounter = document.getElementById('searchResultsCounter');
        if (resultsCounter) {
            resultsCounter.textContent = `${total} resume${total !== 1 ? 's' : ''} found`;
        }
    }

    changePage(page) {
        this.currentPage = page;
        this.searchResumes();
    }

    clearFilters() {
        this.filters = {
            search: '',
            trustScore: 'all',
            status: 'all'
        };
        this.currentPage = 1;

        // Reset form inputs
        const searchInput = document.getElementById('searchInput');
        const trustScoreFilter = document.getElementById('trustScoreFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (searchInput) searchInput.value = '';
        if (trustScoreFilter) trustScoreFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';

        this.searchResumes();
    }

    // Trust Score Meter Animation
    animateTrustScore(element, targetScore) {
        if (!element) return;

        let currentScore = 0;
        const increment = targetScore / 50;

        const animation = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(animation);
            }

            element.textContent = Math.round(currentScore);
            element.style.setProperty('--score-percentage', `${currentScore}%`);
        }, 20);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SkillCredApp();

    // Animate trust scores on page load
    const scoreElements = document.querySelectorAll('.score-value');
    scoreElements.forEach(element => {
        const targetScore = parseInt(element.textContent) || 0;
        element.textContent = '0';
        app.animateTrustScore(element, targetScore);
    });
});

// Utility Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        app.showAlert('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function downloadReport(resumeId, format = 'pdf') {
    const url = `/api/report/${resumeId}?format=${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_report_${resumeId}.${format}`;
    link.click();
}

function exportDashboard(format = 'csv') {
    const url = `/api/export/dashboard?format=${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillcred_dashboard.${format}`;
    link.click();
}
