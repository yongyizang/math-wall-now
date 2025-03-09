class LatexPrompt extends PromptManager {
    constructor(apiClient) {
        super(apiClient);
        this.template = `You are an expert in writing rigorous theoretical sections for machine learning papers in LaTeX format.

Based on the following revised theory abstract:

{{rewritten}}

Generate ONLY a comprehensive "Theory" or "Methods" section in LaTeX format. Do not create a full paper - focus exclusively on creating a detailed, mathematically rigorous theory section that would impress reviewers at top ML conferences like NeurIPS, ICML, and ICLR.

# Theory/Methods Section Structure
Create a section titled "Theory" or "Methods" (choose the most appropriate) with these components:
- Clear problem formulation with precise mathematical notation
- Formal definitions of all concepts introduced
- Theorem statements with complete proofs
- Lemmas that build toward the main results
- Clearly stated assumptions and their justifications
- Analysis of computational complexity
- Mathematical formulations of algorithms (if applicable)
- Error bounds and convergence guarantees

# For Context/In-Context Learning
If the theory involves context or in-context learning, include:
- Formal definition of the context window and how information is processed within it
- Theoretical analysis of how the model adapts to new contexts without traditional parameter updates
- Information-theoretic bounds on what can be learned in-context
- Mathematical formulation of prompting strategies and their theoretical effects

# What ML Conference Reviewers Look For in Theory Sections
- Theoretical Novelty: Demonstrate clear advancement beyond existing work
- Mathematical Rigor: Provide complete proofs with appropriate level of detail
- Notation Clarity: Define all terms before using them, avoid ambiguity
- Significance: Show why the theoretical results matter in practice
- Limitations: Honestly address constraints and edge cases of your approach
- Connections: Link theoretical results to empirical phenomena when possible
- Theorem Presentation: State theorems clearly before presenting proofs
- Notation Consistency: Use the same notation throughout the section

Your response should be just the LaTeX code for this single section, beginning with \section{Theory} or \section{Methods}. Format all mathematical notation correctly using appropriate environments (theorem, lemma, definition, proof) and equation structures. Use \mathcal, \mathbf, etc. appropriately for different types of mathematical objects.`;
    }
    
    async execute(rewrittenTheories) {
        this.updateProgress(80, "Step 6/6: Generating Theory section in LaTeX...", 6);
        
        // Generate just one theory section
        let latexResult = null;
        
        try {
            this.addStepLog("Generating comprehensive Theory section...");
            const result = await this.executePrompt(this.template, { 
                rewritten: rewrittenTheories[0] // Use just the first theory
            });
            latexResult = result;
            this.addStepLog("Theory section generated successfully.");
            this.updateProgress(100, "Theory section generation complete.", 6);
        } catch (error) {
            this.addStepLog(`Error generating Theory section: ${error.message}`);
            throw error;
        }
        
        if (latexResult) {
            this.updateProgress(100, "All steps completed successfully!", 6);
            
            // Add celebration animation
            document.querySelectorAll('.progress-step').forEach(step => {
                step.classList.add('completed');
            });
            
            // Trigger completion celebration if animation manager is available
            if (window.animationManager) {
                setTimeout(() => {
                    window.animationManager.showCompletionCelebration();
                }, 500);
            }
        }
        
        return this.storeResult('latex', [latexResult]);
    }
    
    // Method to render LaTeX
    renderLatex(latexContent, elementId) {
        // This is a simplified implementation.
        // In a real application, you would use a LaTeX rendering library like KaTeX or MathJax
        
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Since we're rendering just a section, we don't need to extract from document environment
        element.innerHTML = latexContent
            .replace(/\\section{([^}]+)}/g, '<h2>$1</h2>')
            .replace(/\\subsection{([^}]+)}/g, '<h3>$1</h3>')
            .replace(/\\begin{([^}]+)}([\s\S]*?)\\end{\1}/g, '<div class="$1">$2</div>')
            .replace(/\\cite{([^}]+)}/g, '[Citation: $1]');
        
        // Render equations with KaTeX if available
        if (window.renderMathInElement) {
            window.renderMathInElement(element, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "\\[", right: "\\]", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false}
                ]
            });
        }
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