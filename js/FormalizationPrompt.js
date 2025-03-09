class FormalizationPrompt extends PromptManager {
    constructor(apiClient) {
        super(apiClient);
        this.template = `You are a mathematics expert specializing in machine learning theory at a top research institution.

# TASK
Based on the following idea: "{{userInput}}"

Identify FIVE potential mathematical formalizations or approaches to model this idea.

# OUTPUT FORMAT
For each approach, use XML-like tags to clearly separate them as shown below:

<abstract1>
Title: A concise, descriptive title
Mathematical Foundation: The underlying mathematical field (e.g., probability theory, information theory)
Formalization: How this approach would rigorously formalize the concept
Key Techniques: 3-5 relevant mathematical tools or techniques that would be used
Potential Applications: How this formalization could be applied in machine learning
</abstract1>

<abstract2>
Title: [Second approach title]
Mathematical Foundation: [Second approach foundation]
Formalization: [Second approach formalization]
Key Techniques: [Second approach techniques]
Potential Applications: [Second approach applications]
</abstract2>

And so on for <abstract3>, <abstract4>, and <abstract5>.

# EXAMPLES OF GOOD FORMALIZATIONS

## Example of Proper Formatting:
<abstract1>
Title: Robust Statistical Estimation Framework
Mathematical Foundation: Statistical learning theory and robust statistics
Formalization: Model the problem as parameter estimation θ̂ = argmin_θ L(x + ε, θ) where ε represents noise drawn from distribution D with unknown parameters
Key Techniques: M-estimators, influence functions, breakdown point analysis, concentration inequalities, empirical risk minimization
Potential Applications: Outlier-resistant regression, learning with label noise, adversarially robust classification
</abstract1>

<abstract2>
Title: Bayesian Uncertainty Quantification
Mathematical Foundation: Bayesian probability theory and information theory
Formalization: Define epistemic uncertainty through posterior predictive distribution p(y|x,D) = ∫p(y|x,θ)p(θ|D)dθ where D is observed data
Key Techniques: Bayesian neural networks, variational inference, Monte Carlo dropout, credible intervals, Kullback-Leibler divergence
Potential Applications: Active learning, out-of-distribution detection, decision-making under uncertainty
</abstract2>

# MACHINE LEARNING CONCEPTS
Here are established machine learning concepts to draw from when appropriate:

1. Generalization bounds
2. Probably approximately correct (PAC) learning
3. Vapnik-Chervonenkis dimension
4. Reproducing kernel Hilbert spaces
5. Statistical learning theory
6. Information bottleneck principle
7. Minimum description length
8. Concentration inequalities
9. Manifold hypothesis
10. Variational inference
11. Optimal transport theory
12. Stochastic gradient descent convergence
13. Expectation-maximization algorithm
14. Graphical models and conditional independence
15. Exponential family distributions
16. Regularization theory
17. Empirical risk minimization
18. No free lunch theorems
19. Bias-variance tradeoff
20. Bregman divergences
21. Contrastive learning objectives
22. Uniform convergence theory
23. Wasserstein distance
24. Rademacher complexity
25. Johnson-Lindenstrauss lemma
26. Mirror descent
27. Gaussian processes
28. Maximum entropy principle
29. Information geometry
30. Functional gradients and boosting

Be precise and use standard mathematical notation where appropriate. Focus on approaches that would be suitable for publication at NeurIPS, ICML, ICLR, or AISTATS.

IMPORTANT: Make sure to properly enclose each approach in XML tags (<abstract1>...</abstract1>, <abstract2>...</abstract2>, etc.) to ensure correct parsing. Each approach MUST be wrapped in the appropriate tags.`;
    }
    
    async execute(userInput) {
        this.updateProgress(10, "Step 1/6: Formalizing the concept...", 1);
        this.addStepLog("Starting formalization of the user input...");
        
        try {
            const result = await this.executePrompt(this.template, { userInput });
            this.addStepLog("Formalization completed successfully.");
            
            // Validate that XML tags are present
            const xmlTagPattern = /<abstract\d+>[\s\S]*?<\/abstract\d+>/i;
            const hasXmlTags = xmlTagPattern.test(result);
            
            if (!hasXmlTags) {
                this.addStepLog("Warning: XML tags not found in output. Attempting to fix the format...");
                
                // Try to fix the output by adding XML tags if possible
                const fixedResult = this.attemptToFixOutput(result);
                this.addStepLog("Modified output to include XML tags. Continuing with processing...");
                
                this.updateProgress(15, "Formalization complete (with format correction).", 1);
                return this.storeResult('formalization', fixedResult);
            } else {
                this.addStepLog("XML tags successfully detected in formalization output.");
                this.updateProgress(15, "Formalization complete.", 1);
                return this.storeResult('formalization', result);
            }
        } catch (error) {
            this.addStepLog(`Error during formalization: ${error.message}`);
            throw error;
        }
    }
    
    // Helper method to attempt fixing output without XML tags
    attemptToFixOutput(result) {
        // Split the content by approach or look for clear section boundaries
        const approaches = [];
        
        // Try to identify approaches by "Approach X:" pattern
        const approachPattern = /(?:^|\n)(?:##\s*)?(?:Approach\s*(\d+)|([^:\n]+))(?::|)\s*\n([\s\S]*?)(?=(?:\n(?:##\s*)?(?:Approach|$)))/gi;
        const matches = [...result.matchAll(approachPattern)];
        
        if (matches.length > 0) {
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const number = i + 1;
                const content = match[3] || '';
                
                approaches.push(`<abstract${number}>\n${content.trim()}\n</abstract${number}>`);
            }
        } else {
            // Try splitting by double newlines and look for sections
            const sections = result.split(/\n{2,}/).filter(s => s.trim().length > 0);
            let currentApproach = [];
            let approachCount = 0;
            
            for (const section of sections) {
                // If section starts with a title-like pattern or contains "Title:"
                if (section.match(/^(?:##\s*)?[A-Z]|Title:/) || currentApproach.length === 0) {
                    // If we already have content, store the previous approach
                    if (currentApproach.length > 0) {
                        approachCount++;
                        approaches.push(`<abstract${approachCount}>\n${currentApproach.join('\n\n')}\n</abstract${approachCount}>`);
                        currentApproach = [];
                    }
                }
                
                // Add this section to the current approach
                currentApproach.push(section);
            }
            
            // Add the last approach if there's content
            if (currentApproach.length > 0) {
                approachCount++;
                approaches.push(`<abstract${approachCount}>\n${currentApproach.join('\n\n')}\n</abstract${approachCount}>`);
            }
            
            // If we still don't have any approaches, just split the content into 5 equal parts
            if (approaches.length === 0) {
                const paragraphs = result.split('\n').filter(p => p.trim().length > 0);
                const approachSize = Math.ceil(paragraphs.length / 5);
                
                for (let i = 0; i < 5; i++) {
                    const start = i * approachSize;
                    const end = Math.min(start + approachSize, paragraphs.length);
                    const content = paragraphs.slice(start, end).join('\n');
                    
                    if (content.trim().length > 0) {
                        approaches.push(`<abstract${i+1}>\n${content}\n</abstract${i+1}>`);
                    }
                }
            }
        }
        
        // Ensure we have at least 3 abstracts
        while (approaches.length < 3) {
            const number = approaches.length + 1;
            approaches.push(`<abstract${number}>\nTitle: Approach ${number}\nMathematical Foundation: Not specified\nFormalization: Not specified\nKey Techniques: Not specified\nPotential Applications: Not specified\n</abstract${number}>`);
        }
        
        // Combine all approaches into a single string
        return approaches.join('\n\n');
    }
    
    // Method to edit the template
    setTemplate(newTemplate) {
        this.template = newTemplate;
    }
    
    // Method to get the current template
    getTemplate() {
        return this.template;
    }
}

class CombinePrompt extends PromptManager {
    constructor(apiClient) {
        super(apiClient);
        this.template = `You are a mathematics expert specializing in machine learning theory at a top research institution.

# TASK
Based on the formalized approaches below, create THREE refined mathematical abstracts that capture the most promising directions for this research.

# INPUT
{{formalization}}

# OUTPUT FORMAT
For each abstract, use XML-like tags to clearly separate them as shown below:

<abstract1>
[First abstract with title and full content]
</abstract1>

<abstract2>
[Second abstract with title and full content]
</abstract2>

<abstract3>
[Third abstract with title and full content]
</abstract3>

Each abstract should be self-contained with:
1. A concise, descriptive title
2. A coherent explanation of the approach
3. The mathematical formalization
4. Key techniques
5. Potential applications

# INSTRUCTIONS
1. Select the THREE most promising and mathematically rigorous approaches
2. Expand and refine each approach, maintaining mathematical precision
3. Ensure each abstract is well-structured and self-contained
4. Use proper mathematical notation and terminology
5. Arrange in order of mathematical promise and significance
6. Make sure to wrap each abstract in the appropriate XML tags

Be precise, thorough, and maintain the rigor expected in top-tier machine learning publications.

IMPORTANT: Make sure to properly enclose each abstract in XML tags (<abstract1>...</abstract1>, <abstract2>...</abstract2>, etc.) to ensure correct parsing.`;
    }
    
    async execute(formalization) {
        this.updateProgress(20, "Step 2/6: Combining and ranking approaches...", 2);
        this.addStepLog("Starting to combine and rank the formalized approaches...");
        
        try {
            const result = await this.executePrompt(this.template, { formalization });
            this.addStepLog("Combining and ranking completed successfully.");
            
            // Validate that XML tags are present
            const xmlTagPattern = /<abstract\d+>[\s\S]*?<\/abstract\d+>/i;
            const hasXmlTags = xmlTagPattern.test(result);
            
            if (!hasXmlTags) {
                this.addStepLog("Warning: XML tags not found in combiner output. Attempting to fix the format...");
                
                // Try to fix the output by adding XML tags if possible
                const fixedResult = this.attemptToFixOutput(result);
                this.addStepLog("Modified output to include XML tags. Continuing with processing...");
                
                this.updateProgress(30, "Combining complete (with format correction).", 2);
                return this.storeResult('combining', fixedResult);
            } else {
                this.addStepLog("XML tags successfully detected in combiner output.");
                this.updateProgress(30, "Combining complete.", 2);
                return this.storeResult('combining', result);
            }
        } catch (error) {
            this.addStepLog(`Error during combining: ${error.message}`);
            throw error;
        }
    }
    
    // Helper method to attempt fixing output without XML tags
    attemptToFixOutput(result) {
        // Split content into abstracts based on patterns
        const abstracts = [];
        
        // Try to identify abstracts by titles or sections
        const titlePattern = /(?:^|\n)(?:##\s*)?(?:Abstract\s*(\d+)|([^:\n]+))(?::|)\s*\n([\s\S]*?)(?=(?:\n(?:##\s*)?(?:Abstract|$)))/gi;
        const matches = [...result.matchAll(titlePattern)];
        
        if (matches.length > 0) {
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const number = i + 1;
                let content = match[3] || '';
                
                // If there's a title in group 2, add it back to the content
                if (match[2]) {
                    content = match[2] + ':\n' + content;
                }
                
                abstracts.push(`<abstract${number}>\n${content.trim()}\n</abstract${number}>`);
            }
        } else {
            // Try splitting by double newlines
            const sections = result.split(/\n{3,}/).filter(s => s.trim().length > 0);
            for (let i = 0; i < Math.min(sections.length, 3); i++) {
                abstracts.push(`<abstract${i+1}>\n${sections[i].trim()}\n</abstract${i+1}>`);
            }
        }
        
        // Ensure we have exactly 3 abstracts
        while (abstracts.length < 3) {
            const number = abstracts.length + 1;
            abstracts.push(`<abstract${number}>\nAbstract ${number}\n\nNo content available.\n</abstract${number}>`);
        }
        
        // Combine all abstracts into a single string
        return abstracts.slice(0, 3).join('\n\n');
    }
}