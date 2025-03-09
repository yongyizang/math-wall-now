class CombinePrompt extends PromptManager {
    constructor(apiClient) {
        super(apiClient);
        this.template = `You are a mathematics researcher preparing abstracts for top-tier machine learning conferences.
Based on these potential formalizations:

{{formalizations}}

Create THREE cohesive, distinct conference abstracts that each combines multiple approaches from above.
Each abstract should reflect the standards and expectations of venues like NeurIPS, ICML, or ICLR.

IMPORTANT: Format your response exactly as follows to ensure proper parsing:

<ABSTRACT_1>
<TITLE>Your compelling title here</TITLE>
<CONTENT>
Your 150-200 word abstract content here that follows this structure:
- Problem statement and significance (1-2 sentences)
- Limitations in current approaches (1-2 sentences)
- Description of novel approach and technical contribution (3-4 sentences)
- Summary of theoretical guarantees or empirical results (2-3 sentences)
- Brief statement on broader implications (1 sentence)
</CONTENT>
<KEYWORDS>keyword1, keyword2, keyword3, keyword4, keyword5</KEYWORDS>
</ABSTRACT_1>

<ABSTRACT_2>
<TITLE>Your compelling title here</TITLE>
<CONTENT>
Your 150-200 word abstract content here following the same structure as above.
</CONTENT>
<KEYWORDS>keyword1, keyword2, keyword3, keyword4, keyword5</KEYWORDS>
</ABSTRACT_2>

<ABSTRACT_3>
<TITLE>Your compelling title here</TITLE>
<CONTENT>
Your 150-200 word abstract content here following the same structure as above.
</CONTENT>
<KEYWORDS>keyword1, keyword2, keyword3, keyword4, keyword5</KEYWORDS>
</ABSTRACT_3>

For mathematical sophistication:
- Use precise mathematical notation for formulations
- Reference established frameworks (e.g., PAC learning, VC theory, information theory)
- Clearly state assumptions and scope of theoretical results
- Indicate connections to fundamental ML concepts

Make each abstract distinct by focusing on different aspects:
- Abstract 1: Focus on theoretical advances and mathematical foundations
- Abstract 2: Focus on algorithmic innovations and computational efficiency
- Abstract 3: Focus on practical applications or empirical results

Use concise, formal academic language with precise terminology. Avoid vague claims and ensure each contribution is framed as addressing a significant gap in the literature.`;
    }
    
    async execute(formalizations) {
        this.updateProgress(20, "Step 2/6: Combining approaches and creating abstracts...", 2);
        this.addStepLog("Starting to combine formalization approaches into coherent abstracts...");
        
        try {
            const result = await this.executePrompt(this.template, { formalizations });
            this.addStepLog("Successfully created three conference abstracts.");
            this.updateProgress(30, "Abstracts created successfully.", 2);
            const parsedAbstracts = this.extractAbstracts(result);
            return this.storeResult('abstracts', parsedAbstracts);
        } catch (error) {
            this.addStepLog(`Error during abstract creation: ${error.message}`);
            throw error;
        }
    }
    
    // Improved method to extract individual abstracts from the combined result
    extractAbstracts(combinedText) {
        const abstracts = [];
        
        // Define regex patterns for each component with proper multiline support
        const abstractPattern = /<ABSTRACT_(\d+)>([\s\S]*?)<\/ABSTRACT_\1>/g;
        const titlePattern = /<TITLE>([\s\S]*?)<\/TITLE>/;
        const contentPattern = /<CONTENT>([\s\S]*?)<\/CONTENT>/;
        const keywordsPattern = /<KEYWORDS>([\s\S]*?)<\/KEYWORDS>/;
        
        // Extract each abstract block
        let abstractMatch;
        while ((abstractMatch = abstractPattern.exec(combinedText)) !== null) {
            const abstractNumber = abstractMatch[1];
            const abstractBlock = abstractMatch[2];
            
            // Extract components from each abstract block
            const titleMatch = abstractBlock.match(titlePattern);
            const contentMatch = abstractBlock.match(contentPattern);
            const keywordsMatch = abstractBlock.match(keywordsPattern);
            
            if (titleMatch && contentMatch) {
                const title = titleMatch[1].trim();
                const content = contentMatch[1].trim();
                const keywords = keywordsMatch ? keywordsMatch[1].trim().split(',').map(k => k.trim()) : [];
                
                abstracts.push({
                    number: parseInt(abstractNumber),
                    title: title,
                    content: content,
                    keywords: keywords
                });
            } else {
                this.addStepLog(`Warning: Abstract ${abstractNumber} has incomplete information`);
            }
        }
        
        // Sort abstracts by number to ensure correct order
        abstracts.sort((a, b) => a.number - b.number);
        
        // Fallback parsing if structured format fails
        if (abstracts.length === 0) {
            this.addStepLog("Warning: Structured parsing failed, attempting fallback parsing");
            return this.fallbackParsing(combinedText);
        }
        
        return abstracts;
    }
    
    // Fallback parsing method for less structured outputs
    fallbackParsing(text) {
        const abstracts = [];
        
        // Try to find abstract sections based on numbering or titles
        const sections = text.split(/(?:Abstract\s*\d+:|"\s*[\w\s]+\s*")/gi).filter(Boolean);
        
        if (sections.length >= 3) {
            for (let i = 0; i < Math.min(sections.length, 3); i++) {
                const section = sections[i].trim();
                
                // Try to extract title if possible
                let title = "";
                let content = section;
                
                const titleMatch = content.match(/["'](.*?)["']/);
                if (titleMatch) {
                    title = titleMatch[1].trim();
                    content = content.replace(/["'].*?["']/, '').trim();
                }
                
                abstracts.push({
                    number: i + 1,
                    title: title,
                    content: content,
                    keywords: []
                });
            }
        }
        
        return abstracts;
    }
    
    // Additional method to edit the template
    setTemplate(newTemplate) {
        this.template = newTemplate;
    }
    
    // Method to get the current template
    getTemplate() {
        return this.template;
    }
}