class MathWallApp {
    constructor() {
        this.apiClient = null;
        this.promptModules = {};
        this.results = {};
        this.errorDialog = null;
        
        // Initialize UI elements
        this.initUI();
        
        // Initialize error dialog
        this.initErrorDialog();
    }

    initErrorDialog() {
        // Create error dialog component if it doesn't exist
        if (!this.errorDialog) {
            this.errorDialog = new ErrorDialog();
        }
    }

    initUI() {
        // Button event listener
        document.getElementById('generate-button').addEventListener('click', () => this.startGeneration());
        
        // Modified tab switching functionality to keep raw output visible
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Get current active tab
                const currentActiveTab = document.querySelector('.tab-content.active');
                const currentTabId = currentActiveTab ? currentActiveTab.id : null;
                
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get the tab to activate
                const tabId = button.getAttribute('data-tab');
                
                // Check if the tab is a raw output tab
                const isRawOutputTab = tabId.includes('raw') || currentTabId && currentTabId.includes('raw');
                
                // Use animation manager if available and not switching to/from raw output
                if (window.animationManager && currentTabId && !isRawOutputTab) {
                    window.animationManager.animateTabTransition(currentTabId, tabId);
                } else {
                    // Fall back to simple class toggling, but keep raw output visible
                    document.querySelectorAll('.tab-content').forEach(content => {
                        if (!content.id.includes('raw') || isRawOutputTab) {
                            content.classList.remove('active');
                        }
                    });
                    document.getElementById(tabId).classList.add('active');
                }
            });
        });
        
        // Make sure raw output tabs are always visible initially
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id.includes('raw')) {
                content.classList.add('always-visible');
                // Apply appropriate CSS styles to make them always visible
                content.style.display = 'block';
            }
        });
        
        // Copy button functionality for LaTeX code
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', () => {
                const sourceId = button.getAttribute('data-source');
                const sourceElement = document.getElementById(sourceId);
                if (sourceElement) {
                    navigator.clipboard.writeText(sourceElement.textContent)
                        .then(() => {
                            // Show temporary success message
                            const originalHTML = button.innerHTML;
                            button.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                Copied!
                            `;
                            setTimeout(() => {
                                button.innerHTML = originalHTML;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy text: ', err);
                        });
                }
            });
        });
        
        // Animate progress steps on load
        if (window.animationManager) {
            window.animationManager.animateProgressSteps();
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (!document.getElementById('generate-button').disabled) {
                    this.startGeneration();
                }
                e.preventDefault();
            }
            
            // Number keys 1-3 to switch paper tabs when results are visible
            if (document.getElementById('results-section').style.display === 'block' &&
                ['1', '2', '3'].includes(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const tabIndex = parseInt(e.key);
                document.querySelector(`.tab-button[data-tab="paper-${tabIndex}"]`).click();
            }
        });
    }

    startGeneration() {
        // Get user input and API details
        const userInput = document.getElementById('idea-input').value.trim();
        const platform = document.getElementById('api-platform').value;
        const apiKey = document.getElementById('api-key').value.trim();
        
        // Validate input
        if (!userInput) {
            alert('Please enter a math idea before generating.');
            return;
        }
        
        if (!apiKey) {
            alert('Please enter an API key.');
            return;
        }
        
        // Initialize API client
        this.apiClient = new ApiClient(platform, apiKey);
        
        // Initialize prompt modules
        this.initPromptModules();
        
        // Reset all progress elements
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Show progress section and hide results
        document.getElementById('progress-section').style.display = 'block';
        document.getElementById('results-section').style.display = 'block';
        document.getElementById('step-logs').innerHTML = '';
        document.getElementById('progress-fill').style.width = '0%';
        
        // Disable generate button and update its text
        const generateButton = document.getElementById('generate-button');
        generateButton.disabled = true;
        generateButton.innerHTML = `
            <div class="button-content">
                <span>Generating...</span>
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // Scroll to progress section
        document.getElementById('progress-section').scrollIntoView({ behavior: 'smooth' });
        
        // Start the generation pipeline
        this.runGenerationPipeline(userInput)
            .then(() => {
                // Enable generate button and restore its text
                generateButton.disabled = false;
                generateButton.innerHTML = `
                    <div class="button-content">
                        <span>Generate Math Papers</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m9 12 2 2 4-4"></path>
                        </svg>
                    </div>
                `;
                
                // Show results section with animation
                const resultsSection = document.getElementById('results-section');
                resultsSection.style.display = 'block';
                
                // Display the results in UI
                this.displayResults();
                
                // Make sure raw output tabs are visible
                this.ensureRawOutputVisible();
                
                // Scroll to results section
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Generation pipeline failed:', error);
                // Show general error in logs with view details button
                this.promptModules.formalization.addStepLog(`
                    ❌ Error: ${error.message}
                    <button id="view-error-details" class="error-details-button">
                        View Complete Error Details
                    </button>
                `);
                
                
                // Add click handler for viewing error details
                setTimeout(() => {
                    const detailsButton = document.getElementById('view-error-details');
                    if (detailsButton) {
                        detailsButton.addEventListener('click', () => {
                            this.showErrorDetails(error);
                        });
                    }
                }, 100);
                
                // Enable generate button and restore its text
                generateButton.disabled = false;
                generateButton.innerHTML = `
                    <div class="button-content">
                        <span>Try Again</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m9 12 2 2 4-4"></path>
                        </svg>
                    </div>
                `;
            });
    }

    // New method to ensure raw output is visible
    ensureRawOutputVisible() {
        // Make all raw output tabs visible
        const rawOutputTabs = [
            'formalization-raw',
            'combining-raw',
            'theory-raw',
            'reviews-raw',
            'rewritten-raw',
            'latex-raw'
        ];
        
        rawOutputTabs.forEach(tabId => {
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                // Make the tab always visible and ensure it has proper styling
                tabElement.style.display = 'block';
                tabElement.classList.add('always-visible');
                
                // Add a section header if it doesn't exist
                if (!document.getElementById(`${tabId}-header`)) {
                    const header = document.createElement('h3');
                    header.id = `${tabId}-header`;
                    header.className = 'raw-output-header';
                    header.textContent = this.formatRawHeaderName(tabId);
                    tabElement.parentNode.insertBefore(header, tabElement);
                }
            }
        });
    }

    // Helper method to format raw header names
    formatRawHeaderName(tabId) {
        const nameMap = {
            'formalization-raw': 'Formalization Raw Output',
            'combining-raw': 'Combining & Reranking Raw Output',
            'theory-raw': 'High-Level Theory Raw Output',
            'reviews-raw': 'Reviewer Comments Raw Output',
            'rewritten-raw': 'Final Theory Raw Output',
            'latex-raw': 'LaTeX Generation Raw Output'
        };
        
        return nameMap[tabId] || 'Raw Output';
    }

    initPromptModules() {
        this.promptModules = {
            formalization: new FormalizationPrompt(this.apiClient),
            combine: new CombinePrompt(this.apiClient),
            theory: new TheoryPrompt(this.apiClient),
            reviewer: new ReviewerPrompt(this.apiClient),
            rewrite: new RewritePrompt(this.apiClient),
            latex: new LatexPrompt(this.apiClient)
        };
    }

    async runGenerationPipeline(userInput) {
        try {
            // Step 1: Formalization
            const formalizationResult = await this.promptModules.formalization.execute(userInput);
            this.results.formalization = formalizationResult;
            this.displayResults();
            
            // Step 2: Combine & Rerank
            const abstractsResult = await this.promptModules.combine.execute(formalizationResult);
            this.results.abstracts = abstractsResult;
            this.displayResults();
            
            // Extract individual abstracts
            const abstracts = this.parseAbstracts(abstractsResult);
            this.results.individualAbstracts = abstracts;
            this.displayResults();
            
            // Step 3: High-Level Theory
            const theoriesResult = await this.promptModules.theory.execute(abstracts);
            this.results.theories = theoriesResult;
            this.displayResults();
            
            // Step 4: Reviewer Comments
            const reviewsResult = await this.promptModules.reviewer.execute(theoriesResult);
            this.results.reviews = reviewsResult;
            this.displayResults();
            
            // Step 5: Rewrite based on reviews
            const rewrittenResult = await this.promptModules.rewrite.execute(theoriesResult, reviewsResult);
            this.results.rewritten = rewrittenResult;
            this.displayResults();
            
            // Step 6: LaTeX Generation
            const latexResult = await this.promptModules.latex.execute(rewrittenResult);
            this.results.latex = latexResult;
            this.displayResults();
            
            return this.results;
        } catch (error) {
            console.error('Error in generation pipeline:', error);
            throw error;
        }
    }

    parseAbstracts(combinedText) {
        const abstracts = [];
        
        const xmlTagPattern = /<abstract(\d+)>([\s\S]*?)<\/abstract\1>/gi;
        const xmlMatches = [...combinedText.matchAll(xmlTagPattern)];
        
        if (xmlMatches.length > 0) {
            // XML tags found, extract abstracts using them
            for (const match of xmlMatches) {
                const abstractNumber = match[1];
                const content = match[2].trim();
                
                if (content) {
                    // Extract title from content if possible
                    const contentLines = content.split('\n');
                    let title = `Approach ${abstractNumber}`;
                    let abstractContent = content;
                    
                    // Check if first line contains a title or starts with "Title:"
                    if (contentLines.length > 0) {
                        const firstLine = contentLines[0].trim();
                        if (firstLine.startsWith('Title:')) {
                            title = firstLine.substring('Title:'.length).trim();
                            abstractContent = contentLines.slice(1).join('\n').trim();
                        } else if (!firstLine.includes('\n') && firstLine.length > 0) {
                            title = firstLine.replace(/^#+\s*/, '').replace(/:$/, '');
                            abstractContent = contentLines.slice(1).join('\n').trim();
                        }
                    }
                    
                    abstracts.push(`${title}\n\n${abstractContent}`);
                }
            }
        } else {
            // Fallback to traditional parsing methods if no XML tags found
            // Look for patterns like "Approach X:" or "## Approach X:"
            const approachPattern = /(?:^|\n)(?:##\s*)?(?:Approach\s*(\d+)|([^:\n]+))(?::|)\s*\n([\s\S]*?)(?=(?:\n(?:##\s*)?(?:Approach|$)))/gi;
            let matches = [...combinedText.matchAll(approachPattern)];
            
            // Also try finding Abstract patterns
            if (matches.length === 0) {
                const abstractPattern = /(?:"([^"]+)"|Abstract\s*\d+:)([\s\S]*?)(?=(?:"[^"]+"|Abstract\s*\d+:|$))/gi;
                matches = [...combinedText.matchAll(abstractPattern)];
            }
            
            for (const match of matches) {
                const title = match[1] || match[2] || 'Untitled Approach';
                const content = match[3] ? match[3].trim() : (match[2] ? match[2].trim() : '');
                
                if (content) {
                    const formatTitle = title.startsWith('Approach') || title.startsWith('Abstract') 
                        ? title 
                        : `Approach: ${title}`;
                    abstracts.push(`${formatTitle}\n\n${content}`);
                }
            }
            
            // If still no abstracts, try simple chunk splitting
            if (abstracts.length === 0) {
                const chunks = combinedText.split(/\n{3,}/).filter(chunk => chunk.trim().length > 0);
                for (let i = 0; i < chunks.length; i++) {
                    const lines = chunks[i].split('\n');
                    let title = `Approach ${i + 1}`;
                    let content = chunks[i];
                    
                    // Try to extract title from the first line
                    if (lines.length > 0 && lines[0].trim().length > 0) {
                        title = lines[0].trim().replace(/^#+\s*/, '').replace(/:$/, '');
                        content = lines.slice(1).join('\n').trim();
                    }
                    
                    if (content) {
                        abstracts.push(`${title}\n\n${content}`);
                    }
                }
            }
        }
        
        // Ensure we have exactly 3 abstracts
        while (abstracts.length < 3) {
            abstracts.push(`Approach ${abstracts.length + 1}\n\nNo content available.`);
        }
        
        // If we have more than 3, take the first 3
        return abstracts.slice(0, 3);
    }

    displayResults() {
        // Update raw output tabs
        document.getElementById('formalization-raw').textContent = this.results.formalization || 'No data';
        document.getElementById('combining-raw').textContent = this.results.abstracts || 'No data';
        document.getElementById('theory-raw').textContent = this.results.theories ? this.results.theories.join('\n\n---\n\n') : 'No data';
        document.getElementById('reviews-raw').textContent = this.results.reviews ? this.results.reviews.join('\n\n---\n\n') : 'No data';
        document.getElementById('rewritten-raw').textContent = this.results.rewritten ? this.results.rewritten.join('\n\n---\n\n') : 'No data';
        document.getElementById('latex-raw').textContent = this.results.latex ? this.results.latex.join('\n\n---\n\n') : 'No data';
        
        // Create paper tabs content
        for (let i = 0; i < 3; i++) {
            if (this.results.individualAbstracts && this.results.individualAbstracts[i]) {
                this.createPaperTab(i + 1, 
                    this.results.individualAbstracts[i], 
                    this.results.theories ? this.results.theories[i] : null, 
                    this.results.reviews ? this.results.reviews[i] : null, 
                    this.results.rewritten ? this.results.rewritten[i] : null, 
                    this.results.latex ? this.results.latex[i] : null
                );
            }
        }
        
        // Render LaTeX content
        this.renderLatexContent();
        
        // Ensure raw output is visible
        this.ensureRawOutputVisible();
    }

    createPaperTab(tabNumber, abstract, theory, reviews, rewritten, latex) {
        // Clear existing content if any
        const paperTab = document.getElementById(`paper-${tabNumber}`);
        paperTab.innerHTML = '';
        
        // Create paper content sections with icons
        paperTab.innerHTML = `
            <div class="step-result">
                <div class="step-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Abstract
                </div>
                <div id="abstract-${tabNumber}" class="abstract">${abstract || 'No abstract available.'}</div>
            </div>
            <div class="step-result">
                <div class="step-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    High-Level Theory
                </div>
                <div id="theory-${tabNumber}" class="abstract">${theory || 'No theory available.'}</div>
            </div>
            <div class="step-result">
                <div class="step-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Reviewer Comments
                </div>
                <div id="reviews-${tabNumber}" class="reviewer-comments">${reviews || 'No reviews available.'}</div>
            </div>
            <div class="step-result">
                <div class="step-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Final Theory
                </div>
                <div id="final-${tabNumber}" class="final-theory">${rewritten || 'No final theory available.'}</div>
            </div>
            <div class="step-result">
                <div class="step-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Rendered LaTeX
                </div>
                <div id="latex-rendered-${tabNumber}"></div>
                <button class="copy-button" data-source="latex-${tabNumber}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy LaTeX Code
                </button>
            </div>
            <div class="step-result">
                <div class="step-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    LaTeX Code
                </div>
                <pre id="latex-${tabNumber}" class="latex-section">${latex || 'No LaTeX code available.'}</pre>
            </div>
        `;
        
        // Add event listener to new copy button
        const copyButton = paperTab.querySelector(`.copy-button[data-source="latex-${tabNumber}"]`);
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const sourceId = copyButton.getAttribute('data-source');
                const sourceElement = document.getElementById(sourceId);
                if (sourceElement) {
                    navigator.clipboard.writeText(sourceElement.textContent)
                        .then(() => {
                            // Show temporary success message
                            const originalText = copyButton.textContent;
                            copyButton.textContent = 'Copied!';
                            setTimeout(() => {
                                copyButton.textContent = originalText;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy text: ', err);
                        });
                }
            });
        }
    }

    renderLatexContent() {
        // Use KaTeX to render LaTeX if available
        if (this.results.latex) {
            for (let i = 0; i < this.results.latex.length; i++) {
                const latex = this.results.latex[i];
                if (latex) {
                    this.promptModules.latex.renderLatex(latex, `latex-rendered-${i+1}`);
                }
            }
        }
    }
        // Show detailed error information in dialog
    showErrorDetails(error) {
        if (!this.errorDialog) {
            this.initErrorDialog();
        }
        
        // Collect context information for troubleshooting
        const context = {
            'Current Step': document.getElementById('current-step').textContent.trim(),
            'API Platform': document.getElementById('api-platform').value,
            'Input Length': document.getElementById('idea-input').value.length,
            'Browser': navigator.userAgent,
            'Date/Time': new Date().toLocaleString(),
            'App State': this.getCurrentState()
        };
        
        // Show error dialog with context
        this.errorDialog.showDialog(error, context);
    }

    // Get current application state for error context
    getCurrentState() {
        const state = {
            promptsInitialized: Object.keys(this.promptModules).length > 0,
            results: {}
        };
        
        // Add each result key and its content length/type
        for (const [key, value] of Object.entries(this.results)) {
            if (Array.isArray(value)) {
                state.results[key] = `Array[${value.length}]`;
            } else if (typeof value === 'string') {
                state.results[key] = `String(${value.length} chars)`;
            } else if (value === null) {
                state.results[key] = 'null';
            } else if (typeof value === 'object') {
                state.results[key] = `Object(${Object.keys(value).length} keys)`;
            } else {
                state.results[key] = typeof value;
            }
        }
        
        return state;
    }

}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mathWallApp = new MathWallApp();
    
    // Add CSS styles for always-visible raw output
    const style = document.createElement('style');
    style.textContent = `
        .tab-content.always-visible {
            display: block !important;
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background-color: #f8f9fa;
        }
        
        .raw-output-header {
            font-size: 1.2em;
            margin-top: 30px;
            margin-bottom: 10px;
            color: #333;
            font-weight: 600;
            border-bottom: 2px solid #eaeaea;
            padding-bottom: 8px;
        }
    `;
    document.head.appendChild(style);
});