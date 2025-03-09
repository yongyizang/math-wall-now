// ApiClient.js - Handles API communication with ChatGPT and Claude models

class ApiClient {
    constructor(platform, apiKey) {
        this.platform = platform;
        this.apiKey = apiKey;
        this.endpoints = {
            anthropic: 'https://api.anthropic.com/v1/messages'
        };
        this.models = {
            anthropic: 'claude-3-7-sonnet-20250219'
        };
    }

    async callLLM(prompt, temperature = 0.7) {
        try {
            const headers = this._getHeaders();
            const body = this._formatRequestBody(prompt, temperature);
            
            // Get the appropriate endpoint
            let endpoint = this.endpoints[this.platform];
            
            // Make the API request
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || response.statusText;
                const error = new Error(`API Error (${response.status}): ${errorMessage}`);
                error.status = response.status;
                error.endpoint = endpoint;
                error.responseData = errorData;
                throw error;
            }
            
            const data = await response.json();
            return this._parseResponse(data);
        } catch (error) {
            // Enhance error with API context
            if (!error.endpoint) {
                error.endpoint = this.endpoints[this.platform];
                error.platform = this.platform;
                error.model = this.models[this.platform];
                
                // Don't include API key in error details
                error.promptLength = prompt ? prompt.length : 0;
            }
            
            console.error('API call failed:', error);
            throw error;
        }
    }
    
    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        };
        
        switch (this.platform) {
            case 'anthropic':
                headers['x-api-key'] = this.apiKey;
                headers['anthropic-dangerous-direct-browser-access'] = true;
                headers['anthropic-version'] = '2023-06-01';
                break;
        }
        
        return headers;
    }
    
    _formatRequestBody(prompt, temperature) {
        switch (this.platform) {
            case 'anthropic':
                return {
                    model: this.models.anthropic,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: temperature,
                    max_tokens: 8192
                };
            default:
                throw new Error(`Unsupported platform: ${this.platform}`);
        }
    }
    
    _parseResponse(data) {
        switch (this.platform) {
            case 'anthropic':
                return data.content[0].text;
            default:
                throw new Error(`Unsupported platform: ${this.platform}`);
        }
    }
}

// Export the class if using module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ApiClient;
}