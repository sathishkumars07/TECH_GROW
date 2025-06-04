document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const jobSearchForm = document.getElementById('jobSearchForm');
    const jobSearchInput = document.getElementById('jobSearch');
    const locationInput = document.getElementById('location');
    const searchButton = document.querySelector('.search-button');
    const ctaButtons = document.querySelectorAll('.cta-button, .resume-button');
    const signInButton = document.querySelector('.sign-in');
    const signUpButton = document.querySelector('.sign-up');
    const advancedSearchLink = document.querySelector('.advanced-search a:first-child');
    const feedbackLink = document.querySelector('.advanced-search a:last-child');
    const navLinks = document.querySelectorAll('.nav-links a');
    const applyButtons = document.querySelectorAll('.apply-button');
    const applyFiltersButton = document.querySelector('.apply-filters');
    const industryTags = document.querySelectorAll('.industry-tags .tag');

    // Current User State
    let currentUser = null;
    let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    // Initialize the page
    initPage();

    // Event Listeners
    if (jobSearchForm) {
        jobSearchForm.addEventListener('submit', handleJobSearch);
    }

    if (searchButton) {
        searchButton.addEventListener('click', handleJobSearch);
    }

    ctaButtons.forEach(button => {
        button.addEventListener('click', handleResumeUpload);
    });

    if (signInButton) {
        signInButton.addEventListener('click', handleSignIn);
    }

    if (signUpButton) {
        signUpButton.addEventListener('click', handleSignUp);
    }

    if (advancedSearchLink) {
        advancedSearchLink.addEventListener('click', showAdvancedSearch);
    }

    if (feedbackLink) {
        feedbackLink.addEventListener('click', showFeedbackModal);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', setActiveNavLink);
    });

    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', applyJobFilters);
    }

    if (industryTags) {
        industryTags.forEach(tag => {
            tag.addEventListener('click', filterCompaniesByIndustry);
        });
    }

    // Functions
    function initPage() {
        // Check for saved user session
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            currentUser = JSON.parse(userSession);
            updateAuthUI();
        }

        // Load recent searches if any
        if (recentSearches.length > 0) {
            displayRecentSearches();
        }

        // Check URL for search parameters
        checkUrlForSearchParams();

        const path = window.location.pathname.split('/').pop();
        if (path === 'find_job.html') {
            loadJobListings();
        } else if (path === 'companies.html') {
            loadCompanies();
        }
    }

    function handleJobSearch(e) {
        if (e) e.preventDefault();
        
        const jobSearch = jobSearchInput ? jobSearchInput.value.trim() : '';
        const location = locationInput ? locationInput.value.trim() : '';
        
        if (!jobSearch && !location) {
            showAlert('Please enter a job title, skill, company or location to search.');
            return;
        }
        
        // Save to recent searches
        saveRecentSearch(jobSearch, location);
        
        // Update URL
        updateUrlWithSearchParams(jobSearch, location);
        
        // Display results
        displaySearchResults(jobSearch, location);
    }

    function displaySearchResults(jobSearch, location) {
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h3>Search Results for "${jobSearch}" ${location ? 'in ' + location : ''}</h3>
                <p>Showing ${Math.floor(Math.random() * 5) + 5} sample results (simulated)</p>
                <div class="search-actions">
                    <button class="save-search">Save this search</button>
                    <button class="create-alert">Create job alert</button>
                </div>
            </div>
            <div class="results-list">
                ${generateMockJobs(jobSearch, location)}
            </div>
        `;
        
        // Remove existing results if any
        const existingResults = document.querySelector('.search-results');
        if (existingResults) {
            existingResults.remove();
        }
        
        // Append new results
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            searchSection.appendChild(resultsContainer);
        }
        
        // Add event listeners to new buttons
        document.querySelector('.save-search')?.addEventListener('click', () => saveCurrentSearch(jobSearch, location));
        document.querySelector('.create-alert')?.addEventListener('click', createJobAlert);
        
        // Add event listeners to apply buttons
        document.querySelectorAll('.job-listing .apply-button').forEach(button => {
            button.addEventListener('click', handleApplyJob);
        });
        
        // Add event listeners to save job buttons
        document.querySelectorAll('.job-listing .save-job').forEach(button => {
            button.addEventListener('click', handleSaveJob);
        });
    }

    function loadJobListings() {
        const jobsContainer = document.querySelector('.jobs-container');
        if (!jobsContainer) return;

        const mockJobs = [
            {
                title: "Frontend Developer",
                company: "TechCorp",
                location: "San Francisco, CA",
                type: "Full-time",
                salary: "$90,000 - $120,000",
                description: "We're looking for a skilled Frontend Developer to join our team and help build amazing user experiences."
            },
            {
                title: "UX Designer",
                company: "Digital Solutions",
                location: "Remote",
                type: "Contract",
                salary: "$70 - $90 per hour",
                description: "Join our design team to create beautiful and intuitive interfaces for our clients."
            },
            {
                title: "Data Scientist",
                company: "DataDriven",
                location: "New York, NY",
                type: "Full-time",
                salary: "$110,000 - $140,000",
                description: "Use your data skills to help us uncover insights and drive business decisions."
            },
            {
                title: "Product Manager",
                company: "InnovateCo",
                location: "Chicago, IL",
                type: "Full-time",
                salary: "$100,000 - $130,000",
                description: "Lead product development from conception to launch."
            },
            {
                title: "DevOps Engineer",
                company: "CloudNine",
                location: "Remote",
                type: "Full-time",
                salary: "$95,000 - $125,000",
                description: "Implement and maintain our cloud infrastructure and CI/CD pipelines."
            }
        ];

        jobsContainer.innerHTML = mockJobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p class="company">${job.company} • ${job.location}</p>
                <div class="job-meta">
                    <span>${job.type}</span>
                    <span>${job.salary}</span>
                </div>
                <p class="job-description">${job.description}</p>
                <button class="view-job">View Job</button>
            </div>
        `).join('');

        // Add event listeners to view job buttons
        document.querySelectorAll('.view-job').forEach(button => {
            button.addEventListener('click', () => {
                alert('This would show job details in a real application');
            });
        });
    }

    function loadCompanies() {
        const companiesContainer = document.querySelector('.companies-container');
        if (!companiesContainer) return;

        const mockCompanies = [
            {
                name: "TechCorp",
                logo: "💻",
                industry: "Technology",
                description: "Leading provider of innovative tech solutions",
                jobs: 24
            },
            {
                name: "FinancePro",
                logo: "💰",
                industry: "Financial Services",
                description: "Modern financial services for the digital age",
                jobs: 15
            },
            {
                name: "HealthPlus",
                logo: "🏥",
                industry: "Healthcare",
                description: "Improving lives through better healthcare",
                jobs: 32
            },
            {
                name: "EduFuture",
                logo: "📚",
                industry: "Education",
                description: "Transforming education through technology",
                jobs: 18
            },
            {
                name: "MarketGuru",
                logo: "🛒",
                industry: "Retail",
                description: "E-commerce and retail solutions leader",
                jobs: 21
            }
        ];

        companiesContainer.innerHTML = mockCompanies.map(company => `
            <div class="company-card">
                <div class="company-logo">${company.logo}</div>
                <h3>${company.name}</h3>
                <p class="company-info">${company.industry} • ${company.description}</p>
                <p class="open-positions">${company.jobs} open positions</p>
                <button class="view-company">View Company</button>
            </div>
        `).join('');

        // Add event listeners to view company buttons
        document.querySelectorAll('.view-company').forEach(button => {
            button.addEventListener('click', () => {
                alert('This would show company details in a real application');
            });
        });
    }

    function generateMockJobs(jobSearch, location) {
        const titles = [
            'Senior ' + jobSearch,
            'Junior ' + jobSearch,
            jobSearch + ' Developer',
            jobSearch + ' Specialist',
            jobSearch + ' Engineer',
            jobSearch + ' Manager',
            'Lead ' + jobSearch,
            jobSearch + ' Consultant',
            jobSearch + ' Analyst',
            'Remote ' + jobSearch
        ];
        
        const companies = [
            'TechCorp', 'InnovateCo', 'Digital Solutions', 'WebWorks', 'SoftSys',
            'DataDriven', 'CodeMasters', 'FutureTech', 'ByteSize', 'CloudNine'
        ];
        
        const salaries = [
            '$70,000 - $90,000', '$50,000 - $70,000', '$90,000 - $120,000',
            '$60,000 - $80,000', '$80,000 - $110,000', '$75,000 - $95,000'
        ];
        
        const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
        
        let html = '';
        for (let i = 0; i < 10; i++) {
            const title = titles[i % titles.length];
            const company = companies[i % companies.length];
            const loc = location || ['New York', 'San Francisco', 'Chicago', 'Austin', 'Remote'][i % 5];
            const days = Math.floor(Math.random() * 30) + 1;
            const salary = salaries[Math.floor(Math.random() * salaries.length)];
            const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
            const isRemote = Math.random() > 0.7;
            const jobId = 'job-' + Math.random().toString(36).substr(2, 9);
            const isSaved = savedJobs.some(job => job.id === jobId);
            
            html += `
                <div class="job-listing" data-job-id="${jobId}">
                    <div class="job-header">
                        <h4>${title}</h4>
                        <button class="save-job ${isSaved ? 'saved' : ''}">
                            <i class="far ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}"></i>
                        </button>
                    </div>
                    <p class="company">${company} • ${loc} ${isRemote ? '• Remote' : ''}</p>
                    <div class="job-meta">
                        <span class="salary">${salary}</span>
                        <span class="job-type">${jobType}</span>
                    </div>
                    <p class="description">We are looking for a skilled ${jobSearch} to join our team. You will be responsible for ${['developing', 'implementing', 'designing', 'maintaining', 'optimizing'][i % 5]} ${['web applications', 'software solutions', 'digital platforms', 'technical systems', 'IT infrastructure'][i % 5]}.</p>
                    <div class="job-footer">
                        <p class="posted">Posted ${days} day${days === 1 ? '' : 's'} ago</p>
                        <button class="apply-button">Apply Now</button>
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    function handleResumeUpload() {
        if (!currentUser) {
            showSignInPrompt('You need to sign in to upload your resume.');
            return;
        }
        
        // In a real app, this would open a file upload dialog
        const resumeModal = createModal(`
            <h3>Upload Your Resume</h3>
            <div class="resume-upload-area">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop your resume here or click to browse</p>
                <input type="file" id="resumeFile" accept=".pdf,.doc,.docx">
            </div>
            <div class="form-group">
                <label for="resumeTitle">Resume Title</label>
                <input type="text" id="resumeTitle" placeholder="e.g. Senior Web Developer Resume">
            </div>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="upload-btn">Upload Resume</button>
            </div>
        `);
        
        document.body.appendChild(resumeModal);
        
        // Add event listeners for the modal
        resumeModal.querySelector('.cancel-btn').addEventListener('click', () => {
            resumeModal.remove();
        });
        
        resumeModal.querySelector('.upload-btn').addEventListener('click', () => {
            const fileInput = resumeModal.querySelector('#resumeFile');
            const titleInput = resumeModal.querySelector('#resumeTitle');
            
            if (!fileInput.files.length) {
                showAlert('Please select a resume file to upload.');
                return;
            }
            
            if (!titleInput.value.trim()) {
                showAlert('Please provide a title for your resume.');
                return;
            }
            
            // Simulate upload
            setTimeout(() => {
                currentUser.resumes.push({
                    id: 'resume-' + Math.random().toString(36).substr(2, 9),
                    title: titleInput.value.trim(),
                    date: new Date().toISOString()
                });
                localStorage.setItem('userSession', JSON.stringify(currentUser));
                resumeModal.remove();
                showAlert('Your resume has been uploaded successfully!', 'success');
            }, 1500);
        });

        // Handle file selection
        resumeModal.querySelector('.resume-upload-area').addEventListener('click', () => {
            resumeModal.querySelector('#resumeFile').click();
        });

        resumeModal.querySelector('#resumeFile').addEventListener('change', (e) => {
            if (e.target.files.length) {
                resumeModal.querySelector('.resume-upload-area p').textContent = e.target.files[0].name;
            }
        });
    }

    function handleSignIn() {
        const signInModal = createModal(`
            <h3>Sign In to Your Account</h3>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="your@email.com">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="••••••••">
            </div>
            <div class="form-options">
                <label>
                    <input type="checkbox" id="rememberMe"> Remember me
                </label>
                <a href="#" class="forgot-password">Forgot password?</a>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="signin-btn">Sign In</button>
            </div>
            <div class="auth-footer">
                <p>Don't have an account? <a href="#" class="switch-to-signup">Sign up</a></p>
            </div>
        `);
        
        document.body.appendChild(signInModal);
        
        // Add event listeners
        signInModal.querySelector('.cancel-btn').addEventListener('click', () => {
            signInModal.remove();
        });
        
        signInModal.querySelector('.signin-btn').addEventListener('click', () => {
            const email = signInModal.querySelector('#email').value.trim();
            const password = signInModal.querySelector('#password').value;
            
            if (!email || !password) {
                showAlert('Please enter both email and password.');
                return;
            }
            
            // Simulate authentication
            setTimeout(() => {
                currentUser = {
                    id: 'user-' + Math.random().toString(36).substr(2, 9),
                    email: email,
                    name: email.split('@')[0],
                    resumes: []
                };
                
                localStorage.setItem('userSession', JSON.stringify(currentUser));
                updateAuthUI();
                signInModal.remove();
                showAlert('You have successfully signed in!', 'success');
            }, 1000);
        });
        
        signInModal.querySelector('.switch-to-signup').addEventListener('click', (e) => {
            e.preventDefault();
            signInModal.remove();
            handleSignUp();
        });
        
        signInModal.querySelector('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPassword();
        });
    }

    function handleSignUp() {
        const signUpModal = createModal(`
            <h3>Create Your Account</h3>
            <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" placeholder="John Doe">
            </div>
            <div class="form-group">
                <label for="signupEmail">Email</label>
                <input type="email" id="signupEmail" placeholder="your@email.com">
            </div>
            <div class="form-group">
                <label for="signupPassword">Password</label>
                <input type="password" id="signupPassword" placeholder="••••••••">
                <p class="hint">Minimum 8 characters</p>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="••••••••">
            </div>
            <div class="form-options">
                <label>
                    <input type="checkbox" id="agreeTerms"> I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="signup-btn">Sign Up</button>
            </div>
            <div class="auth-footer">
                <p>Already have an account? <a href="#" class="switch-to-signin">Sign in</a></p>
            </div>
        `);
        
        document.body.appendChild(signUpModal);
        
        // Add event listeners
        signUpModal.querySelector('.cancel-btn').addEventListener('click', () => {
            signUpModal.remove();
        });
        
        signUpModal.querySelector('.signup-btn').addEventListener('click', () => {
            const name = signUpModal.querySelector('#fullName').value.trim();
            const email = signUpModal.querySelector('#signupEmail').value.trim();
            const password = signUpModal.querySelector('#signupPassword').value;
            const confirmPassword = signUpModal.querySelector('#confirmPassword').value;
            const agreeTerms = signUpModal.querySelector('#agreeTerms').checked;
            
            if (!name || !email || !password || !confirmPassword) {
                showAlert('Please fill in all fields.');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match.');
                return;
            }
            
            if (password.length < 8) {
                showAlert('Password must be at least 8 characters long.');
                return;
            }
            
            if (!agreeTerms) {
                showAlert('You must agree to the Terms of Service and Privacy Policy.');
                return;
            }
            
            // Simulate account creation
            setTimeout(() => {
                currentUser = {
                    id: 'user-' + Math.random().toString(36).substr(2, 9),
                    email: email,
                    name: name,
                    resumes: []
                };
                
                localStorage.setItem('userSession', JSON.stringify(currentUser));
                updateAuthUI();
                signUpModal.remove();
                showAlert('Your account has been created successfully!', 'success');
            }, 1500);
        });
        
        signUpModal.querySelector('.switch-to-signin').addEventListener('click', (e) => {
            e.preventDefault();
            signUpModal.remove();
            handleSignIn();
        });
    }

    function handleApplyJob(e) {
        if (!currentUser) {
            showSignInPrompt('You need to sign in to apply for jobs.');
            return;
        }
        
        const jobCard = e.target.closest('.job-listing');
        const jobTitle = jobCard.querySelector('h4').textContent;
        const company = jobCard.querySelector('.company').textContent;
        
        const applyModal = createModal(`
            <h3>Apply for ${jobTitle}</h3>
            <p class="company-name">${company}</p>
            <div class="form-group">
                <label>Resume to use</label>
                <select id="resumeSelect">
                    ${currentUser.resumes.length > 0 ? 
                        currentUser.resumes.map(resume => 
                            `<option value="${resume.id}">${resume.title}</option>`
                        ).join('') : 
                        '<option value="">No resumes uploaded</option>'
                    }
                </select>
            </div>
            <div class="form-group">
                <label for="coverLetter">Cover Letter (optional)</label>
                <textarea id="coverLetter" placeholder="Write a cover letter to include with your application"></textarea>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="submit-application">Submit Application</button>
            </div>
        `);
        
        document.body.appendChild(applyModal);
        
        // Add event listeners
        applyModal.querySelector('.cancel-btn').addEventListener('click', () => {
            applyModal.remove();
        });
        
        applyModal.querySelector('.submit-application').addEventListener('click', () => {
            if (currentUser.resumes.length === 0) {
                showAlert('You need to upload a resume before applying.');
                applyModal.remove();
                handleResumeUpload();
                return;
            }
            
            // Simulate application submission
            setTimeout(() => {
                applyModal.remove();
                showAlert('Your application has been submitted successfully!', 'success');
                
                // Mark job as applied
                const jobId = jobCard.dataset.jobId;
                const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
                if (!appliedJobs.includes(jobId)) {
                    appliedJobs.push(jobId);
                    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
                }
                
                // Update button
                e.target.textContent = 'Applied';
                e.target.disabled = true;
                e.target.classList.add('applied');
            }, 1000);
        });
    }

    function handleSaveJob(e) {
        if (!currentUser) {
            showSignInPrompt('You need to sign in to save jobs.');
            return;
        }
        
        const jobCard = e.target.closest('.job-listing');
        const jobId = jobCard.dataset.jobId;
        const jobTitle = jobCard.querySelector('h4').textContent;
        const company = jobCard.querySelector('.company').textContent;
        
        // Check if job is already saved
        const jobIndex = savedJobs.findIndex(job => job.id === jobId);
        
        if (jobIndex === -1) {
            // Save job
            savedJobs.push({
                id: jobId,
                title: jobTitle,
                company: company,
                date: new Date().toISOString()
            });
            
            e.target.innerHTML = '<i class="fas fa-bookmark"></i>';
            e.target.classList.add('saved');
            showAlert('Job saved to your profile!', 'success');
        } else {
            // Remove job
            savedJobs.splice(jobIndex, 1);
            e.target.innerHTML = '<i class="far fa-bookmark"></i>';
            e.target.classList.remove('saved');
            showAlert('Job removed from saved jobs.', 'info');
        }
        
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }

    function showAdvancedSearch(e) {
        e.preventDefault();
        
        const advancedSearchModal = createModal(`
            <h3>Advanced Job Search</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="exactPhrase">Exact phrase</label>
                    <input type="text" id="exactPhrase" placeholder="e.g. 'web developer'">
                </div>
                <div class="form-group">
                    <label for="excludeWords">Exclude words</label>
                    <input type="text" id="excludeWords" placeholder="e.g. senior, manager">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="jobTitle">Job title</label>
                    <input type="text" id="jobTitle" placeholder="e.g. software engineer">
                </div>
                <div class="form-group">
                    <label for="company">Company</label>
                    <input type="text" id="company" placeholder="e.g. Google">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="salaryRange">Salary range</label>
                    <select id="salaryRange">
                        <option value="">Any</option>
                        <option value="30">$30,000+</option>
                        <option value="50">$50,000+</option>
                        <option value="70">$70,000+</option>
                        <option value="90">$90,000+</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="jobType">Job type</label>
                    <select id="jobType">
                        <option value="">Any</option>
                        <option value="fulltime">Full-time</option>
                        <option value="parttime">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="postedWithin">Posted within</label>
                <select id="postedWithin">
                    <option value="">Any time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="3">Last 3 days</option>
                    <option value="7">Last week</option>
                    <option value="30">Last month</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="search-btn">Search Jobs</button>
            </div>
        `);
        
        document.body.appendChild(advancedSearchModal);
        
        // Add event listeners
        advancedSearchModal.querySelector('.cancel-btn').addEventListener('click', () => {
            advancedSearchModal.remove();
        });
        
        advancedSearchModal.querySelector('.search-btn').addEventListener('click', () => {
            const exactPhrase = advancedSearchModal.querySelector('#exactPhrase').value;
            const excludeWords = advancedSearchModal.querySelector('#excludeWords').value;
            const jobTitle = advancedSearchModal.querySelector('#jobTitle').value;
            const company = advancedSearchModal.querySelector('#company').value;
            const salaryRange = advancedSearchModal.querySelector('#salaryRange').value;
            const jobType = advancedSearchModal.querySelector('#jobType').value;
            const postedWithin = advancedSearchModal.querySelector('#postedWithin').value;
            
            // In a real app, this would trigger an advanced search
            advancedSearchModal.remove();
            showAlert('Advanced search performed with your criteria.', 'info');
            
            // For demo purposes, we'll just do a regular search with the job title
            if (jobTitle && jobSearchInput) {
                jobSearchInput.value = jobTitle;
                handleJobSearch(new Event('submit'));
            }
        });
    }

    function showFeedbackModal(e) {
        e.preventDefault();
        
        const feedbackModal = createModal(`
            <h3>Send Feedback</h3>
            <div class="form-group">
                <label for="feedbackType">Feedback type</label>
                <select id="feedbackType">
                    <option value="general">General feedback</option>
                    <option value="bug">Bug report</option>
                    <option value="suggestion">Feature suggestion</option>
                </select>
            </div>
            <div class="form-group">
                <label for="feedbackMessage">Your feedback</label>
                <textarea id="feedbackMessage" placeholder="Tell us what you think..." rows="5"></textarea>
            </div>
            <div class="form-group">
                <label for="feedbackEmail">Your email (optional)</label>
                <input type="email" id="feedbackEmail" placeholder="your@email.com">
            </div>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="submit-feedback">Submit Feedback</button>
            </div>
        `);
        
        document.body.appendChild(feedbackModal);
        
        // Add event listeners
        feedbackModal.querySelector('.cancel-btn').addEventListener('click', () => {
            feedbackModal.remove();
        });
        
        feedbackModal.querySelector('.submit-feedback').addEventListener('click', () => {
            const feedbackType = feedbackModal.querySelector('#feedbackType').value;
            const feedbackMessage = feedbackModal.querySelector('#feedbackMessage').value.trim();
            const feedbackEmail = feedbackModal.querySelector('#feedbackEmail').value.trim();
            
            if (!feedbackMessage) {
                showAlert('Please provide your feedback message.');
                return;
            }
            
            // Simulate feedback submission
            setTimeout(() => {
                feedbackModal.remove();
                showAlert('Thank you for your feedback!', 'success');
            }, 1000);
        });
    }

    function applyJobFilters() {
        const jobType = document.getElementById('job-type').value;
        const experience = document.getElementById('experience').value;
        const salary = document.getElementById('salary').value;
        
        // In a real app, this would filter the job listings
        showAlert(`Filters applied: ${jobType || 'Any type'}, ${experience || 'Any level'}, ${salary ? '$' + salary + ',000+' : 'Any salary'}`, 'info');
        
        // For demo, we'll just reload the listings
        loadJobListings();
    }

    function filterCompaniesByIndustry(e) {
        const industry = e.target.textContent;
        
        // Update active tag
        document.querySelectorAll('.industry-tags .tag').forEach(tag => {
            tag.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // In a real app, this would filter companies by industry
        showAlert(`Showing companies in: ${industry === 'All' ? 'All industries' : industry}`, 'info');
        
        // For demo, we'll just reload the companies
        loadCompanies();
    }

    function saveRecentSearch(jobSearch, location) {
        // Add to recent searches if not already there
        const existingSearch = recentSearches.find(search => 
            search.job === jobSearch && search.location === location
        );
        
        if (!existingSearch && (jobSearch || location)) {
            recentSearches.unshift({
                job: jobSearch,
                location: location,
                date: new Date().toISOString()
            });
            
            // Keep only last 5 searches
            if (recentSearches.length > 5) {
                recentSearches.pop();
            }
            
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        }
    }

    function displayRecentSearches() {
        const recentSearchesContainer = document.createElement('div');
        recentSearchesContainer.className = 'recent-searches';
        recentSearchesContainer.innerHTML = `
            <h4>Recent Searches</h4>
            <ul>
                ${recentSearches.map(search => `
                    <li>
                        <a href="#" class="recent-search-link" 
                           data-job="${search.job}" 
                           data-location="${search.location}">
                            ${search.job || 'Any job'} ${search.location ? 'in ' + search.location : ''}
                        </a>
                        <span class="search-date">${formatSearchDate(search.date)}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            const existingRecent = document.querySelector('.recent-searches');
            if (existingRecent) existingRecent.remove();
            
            searchSection.appendChild(recentSearchesContainer);
            
            // Add event listeners to recent search links
            document.querySelectorAll('.recent-search-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const job = link.dataset.job;
                    const location = link.dataset.location;
                    
                    if (jobSearchInput) jobSearchInput.value = job;
                    if (locationInput) locationInput.value = location;
                    
                    handleJobSearch(new Event('submit'));
                });
            });
        }
    }

    function saveCurrentSearch(jobSearch, location) {
        if (!currentUser) {
            showSignInPrompt('You need to sign in to save searches.');
            return;
        }
        
        const savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || [];
        
        // Check if search is already saved
        const existingSearch = savedSearches.find(search => 
            search.job === jobSearch && search.location === location
        );
        
        if (existingSearch) {
            showAlert('This search is already saved.');
            return;
        }
        
        savedSearches.push({
            job: jobSearch,
            location: location,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        showAlert('Search saved! You will be notified of new matches.', 'success');
    }

    function createJobAlert() {
        if (!currentUser) {
            showSignInPrompt('You need to sign in to create job alerts.');
            return;
        }
        
        const jobSearch = jobSearchInput ? jobSearchInput.value.trim() : '';
        const location = locationInput ? locationInput.value.trim() : '';
        
        if (!jobSearch && !location) {
            showAlert('Please perform a search first to create an alert.');
            return;
        }
        
        const jobAlerts = JSON.parse(localStorage.getItem('jobAlerts')) || [];
        
        // Check if alert already exists
        const existingAlert = jobAlerts.find(alert => 
            alert.job === jobSearch && alert.location === location
        );
        
        if (existingAlert) {
            showAlert('You already have an alert for this search.');
            return;
        }
        
        jobAlerts.push({
            job: jobSearch,
            location: location,
            date: new Date().toISOString(),
            frequency: 'daily',
            active: true
        });
        
        localStorage.setItem('jobAlerts', JSON.stringify(jobAlerts));
        showAlert('Job alert created! You will receive email notifications.', 'success');
    }

    function updateAuthUI() {
        if (currentUser) {
            // Update UI for logged in user
            document.querySelector('.sign-in').textContent = currentUser.name;
            document.querySelector('.sign-up').textContent = 'Sign Out';
            
            // Change sign out functionality
            document.querySelector('.sign-up').removeEventListener('click', handleSignUp);
            document.querySelector('.sign-up').addEventListener('click', handleSignOut);
        } else {
            // Update UI for guest
            document.querySelector('.sign-in').textContent = 'Sign in';
            document.querySelector('.sign-up').textContent = 'Sign Up';
            
            // Restore original functionality
            document.querySelector('.sign-up').removeEventListener('click', handleSignOut);
            document.querySelector('.sign-up').addEventListener('click', handleSignUp);
        }
    }

    function handleSignOut() {
        currentUser = null;
        localStorage.removeItem('userSession');
        updateAuthUI();
        showAlert('You have been signed out.', 'info');
    }

        function setActiveNavLink(e) {
        e.preventDefault();
        
        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        e.target.classList.add('active');
        
        // Get the target page from the link's href
        const targetPage = e.target.getAttribute('href');
        
        // Use a small delay to allow the UI to update before navigation
        setTimeout(() => {
            window.location.href = targetPage;
        }, 100);
    }

    function createModal(content) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = content;
        
        modalContainer.appendChild(modalContent);
        modalOverlay.appendChild(modalContainer);
        
        // Close modal when clicking outside content
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
        
        return modalOverlay;
    }

    function showAlert(message, type = 'error') {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        // Remove alert after 3 seconds
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 3000);
    }

    function showSignInPrompt(message) {
        showAlert(message);
        setTimeout(() => {
            handleSignIn();
        }, 1000);
    }

    function showForgotPassword() {
        const forgotPasswordModal = createModal(`
            <h3>Reset Password</h3>
            <div class="form-group">
                <label for="resetEmail">Email Address</label>
                <input type="email" id="resetEmail" placeholder="your@email.com">
            </div>
            <p class="info-text">Enter your email address and we'll send you a link to reset your password.</p>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="reset-btn">Reset Password</button>
            </div>
        `);
        
        document.body.appendChild(forgotPasswordModal);
        
        forgotPasswordModal.querySelector('.cancel-btn').addEventListener('click', () => {
            forgotPasswordModal.remove();
        });
        
        forgotPasswordModal.querySelector('.reset-btn').addEventListener('click', () => {
            const email = forgotPasswordModal.querySelector('#resetEmail').value.trim();
            
            if (!email) {
                showAlert('Please enter your email address.');
                return;
            }
            
            // Simulate password reset
            setTimeout(() => {
                forgotPasswordModal.remove();
                showAlert('Password reset link has been sent to your email.', 'success');
            }, 1000);
        });
    }

    function checkUrlForSearchParams() {
        if (jobSearchInput && locationInput) {
            const params = new URLSearchParams(window.location.search);
            const job = params.get('job');
            const location = params.get('location');
            
            if (job) jobSearchInput.value = job;
            if (location) locationInput.value = location;
            
            if (job || location) {
                handleJobSearch();
            }
        }
    }

    function updateUrlWithSearchParams(jobSearch, location) {
        if (window.history.pushState) {
            const params = new URLSearchParams();
            if (jobSearch) params.set('job', jobSearch);
            if (location) params.set('location', location);
            
            const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
            window.history.pushState({}, '', newUrl);
        }
    }

    function formatSearchDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
        }
    }
});