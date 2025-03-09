// ErrorDialog.js - Component for displaying detailed error information

class ErrorDialog {
    constructor() {
        this.createDialog();
    }
    
    createDialog() {
        // Create dialog element if it doesn't exist
        if (!document.getElementById('error-dialog-container')) {
            const dialogContainer = document.createElement('div');
            dialogContainer.id = 'error-dialog-container';
            dialogContainer.className = 'dialog-container';
            dialogContainer.style.display = 'none';
            
            dialogContainer.innerHTML = `
                <div class="error-dialog">
                    <div class="error-dialog-header">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            Error Details
                        </h3>
                        <button id="close-error-dialog" class="close-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="error-dialog-content">
                        <div class="error-summary">
                            <h4>Error Summary</h4>
                            <p id="error-message"></p>
                        </div>
                        <div class="error-details">
                            <h4>Detailed Information</h4>
                            <pre id="error-stack"></pre>
                        </div>
                        <div class="error-context">
                            <h4>Context</h4>
                            <div id="error-context"></div>
                        </div>
                    </div>
                    <div class="error-dialog-footer">
                        <button id="copy-error-details" class="copy-error-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy Error Details
                        </button>
                        <button id="close-error-button" class="close-error-button">Close</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialogContainer);
            
            // Add event listeners
            document.getElementById('close-error-dialog').addEventListener('click', () => this.hideDialog());
            document.getElementById('close-error-button').addEventListener('click', () => this.hideDialog());
            document.getElementById('copy-error-details').addEventListener('click', () => this.copyErrorDetails());
            
            // Close dialog when clicking outside
            dialogContainer.addEventListener('click', (e) => {
                if (e.target === dialogContainer) {
                    this.hideDialog();
                }
            });
            
            // Add ESC key handler
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && dialogContainer.style.display !== 'none') {
                    this.hideDialog();
                }
            });
        }
    }
    
    showDialog(error, context = {}) {
        const dialogContainer = document.getElementById('error-dialog-container');
        const messageElement = document.getElementById('error-message');
        const stackElement = document.getElementById('error-stack');
        const contextElement = document.getElementById('error-context');
        
        if (!dialogContainer || !messageElement || !stackElement || !contextElement) {
            console.error('Error dialog elements not found');
            return;
        }
        
        // Set error message
        messageElement.textContent = error.message || 'Unknown error occurred';
        
        // Set error stack trace
        stackElement.textContent = error.stack || error.toString();
        
        // Set context information
        contextElement.innerHTML = '';
        if (Object.keys(context).length > 0) {
            const table = document.createElement('table');
            table.className = 'error-context-table';
            
            // Create table rows for each context item
            for (const [key, value] of Object.entries(context)) {
                const row = document.createElement('tr');
                
                const keyCell = document.createElement('td');
                keyCell.className = 'context-key';
                keyCell.textContent = key;
                row.appendChild(keyCell);
                
                const valueCell = document.createElement('td');
                valueCell.className = 'context-value';
                valueCell.textContent = typeof value === 'object' ? JSON.stringify(value) : value;
                row.appendChild(valueCell);
                
                table.appendChild(row);
            }
            
            contextElement.appendChild(table);
        } else {
            contextElement.textContent = 'No additional context information available.';
        }
        
        // Show dialog with animation
        dialogContainer.style.display = 'flex';
        setTimeout(() => {
            dialogContainer.classList.add('visible');
        }, 10);
    }
    
    hideDialog() {
        const dialogContainer = document.getElementById('error-dialog-container');
        if (dialogContainer) {
            dialogContainer.classList.remove('visible');
            setTimeout(() => {
                dialogContainer.style.display = 'none';
            }, 300);
        }
    }
    
    copyErrorDetails() {
        const message = document.getElementById('error-message').textContent;
        const stack = document.getElementById('error-stack').textContent;
        const contextElement = document.getElementById('error-context');
        
        let contextText = 'No context information available.';
        const contextTable = contextElement.querySelector('table');
        if (contextTable) {
            contextText = Array.from(contextTable.rows).map(row => {
                const key = row.cells[0].textContent;
                const value = row.cells[1].textContent;
                return `${key}: ${value}`;
            }).join('\n');
        }
        
        const fullErrorText = `ERROR DETAILS
=============
Error Message: ${message}

Stack Trace:
${stack}

Context Information:
${contextText}

Date/Time: ${new Date().toLocaleString()}
Browser: ${navigator.userAgent}`;
        
        navigator.clipboard.writeText(fullErrorText)
            .then(() => {
                const copyButton = document.getElementById('copy-error-details');
                const originalHTML = copyButton.innerHTML;
                copyButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Copied!
                `;
                setTimeout(() => {
                    copyButton.innerHTML = originalHTML;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy error details:', err);
            });
    }
}

// Add CSS for error dialog
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .dialog-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .dialog-container.visible {
            opacity: 1;
        }
        
        .error-dialog {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 700px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            overflow: hidden;
        }
        
        .dialog-container.visible .error-dialog {
            transform: translateY(0);
        }
        
        .error-dialog-header {
            padding: 16px 20px;
            background-color: #ef476f;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .error-dialog-header h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
        }
        
        .close-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .close-button:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .error-dialog-content {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(90vh - 140px);
        }
        
        .error-summary, .error-details, .error-context {
            margin-bottom: 20px;
        }
        
        .error-summary h4, .error-details h4, .error-context h4 {
            margin-top: 0;
            margin-bottom: 8px;
            color: #333;
            font-size: 16px;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        }
        
        #error-message {
            color: #ef476f;
            font-weight: 600;
            padding: 8px;
            background-color: #fff5f7;
            border-radius: 4px;
            margin: 0;
        }
        
        #error-stack {
            background-color: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            overflow-x: auto;
            white-space: pre-wrap;
            margin: 0;
            color: #333;
            border: 1px solid #e0e0e0;
        }
        
        .error-context-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .error-context-table tr:nth-child(odd) {
            background-color: #f9f9f9;
        }
        
        .error-context-table td {
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
        }
        
        .context-key {
            font-weight: 600;
            width: 30%;
            color: #4a6fa5;
        }
        
        .context-value {
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 13px;
            word-break: break-word;
        }
        
        .error-dialog-footer {
            padding: 16px 20px;
            background-color: #f5f5f5;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        .copy-error-button, .close-error-button {
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        
        .copy-error-button {
            background-color: #4cc9f0;
            color: #333;
            border: none;
        }
        
        .copy-error-button:hover {
            background-color: #3ab7dc;
        }
        
        .close-error-button {
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .close-error-button:hover {
            background-color: #e0e0e0;
        }
        
        @media (max-width: 600px) {
            .error-dialog-footer {
                flex-direction: column;
            }
            
            .copy-error-button, .close-error-button {
                width: 100%;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(style);
});