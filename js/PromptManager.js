// PromptManager.js - Base class for all prompt classes

class PromptManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.results = {};
    }

    // Replace placeholders in template with actual values
    fillTemplate(template, values) {
        let filledTemplate = template;
        for (const [key, value] of Object.entries(values)) {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            filledTemplate = filledTemplate.replace(placeholder, value);
        }
        return filledTemplate;
    }
    
    // Execute a prompt and return the result
    async executePrompt(promptTemplate, values = {}, temperature = 0.7) {
        const filledPrompt = this.fillTemplate(promptTemplate, values);
        try {
            const result = await this.apiClient.callLLM(filledPrompt, temperature);
            return result;
        } catch (error) {
            console.error('Error executing prompt:', error);
            throw error;
        }
    }
    
    // Add a step log to the UI with enhanced error styling
    addStepLog(message) {
        const stepLogsDiv = document.getElementById('step-logs');
        const logElement = document.createElement('div');
        
        // Check if this is an error message
        if (message.includes('❌ Error:')) {
            logElement.className = 'step-log error-log';
        } else {
            logElement.className = 'step-log';
        }
        
        // Add timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString();
        
        logElement.innerHTML = `
            ${message}
            <span class="log-timestamp">${timestamp}</span>
        `;
        
        stepLogsDiv.appendChild(logElement);
        
        // Auto-scroll to the bottom
        stepLogsDiv.scrollTop = stepLogsDiv.scrollHeight;
        
        // Apply fade-in animation
        setTimeout(() => {
            logElement.style.opacity = '1';
        }, 10);
    }
    
    // Update progress bar
    updateProgress(percentage, stepDescription) {
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('current-step').textContent = stepDescription;
    }
    
    // Store results for a specific step
    storeResult(key, value) {
        this.results[key] = value;
        return value;
    }
    
    // Get stored result
    getResult(key) {
        return this.results[key];
    }
}