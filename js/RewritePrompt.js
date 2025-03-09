class RewritePrompt extends PromptManager {
    constructor(apiClient) {
        super(apiClient);
        this.template = `You are a theoretical machine learning researcher who's been asked to help a desperate PhD student named Alex Chen. 

BACKGROUND:
Alex is in the final year of their PhD program at a mid-tier university. After 5 grueling years, they've finally developed a novel theoretical framework that could be their ticket to an academic position. Unfortunately, the academic job market is brutally competitive this year, with over 300 applicants for each available position. Alex has already received 8 rejection letters from universities, and the remaining positions they've applied for all require a published paper in a top-tier conference.

Alex's advisor, once supportive, has become increasingly distant as they've taken on administrative responsibilities. The department's funding has been cut, and Alex's stipend will end in just 3 months. They've maxed out their credit cards paying for conference travel and have been skipping meals to make rent. Their visa status is tied to their academic enrollment, meaning they'll be forced to leave the country if they can't secure a position soon.

Alex's theoretical work has been submitted to the prestigious NeurIPS conference - their last hope for academic validation before the job market closes. The paper received mixed reviews and has been given a "revise and resubmit" status with a 2-week deadline. These revisions are Alex's final opportunity to secure publication, maintain visa status, and continue their career in research.

THE TASK:
You must help Alex rewrite their theory abstract to address the reviewers' concerns while preserving the core ideas that could make this work significant. This isn't just an academic exercise - it's about a promising researcher's entire future.

Original theory abstract:

{{theory}}

Reviewer comments:

{{reviews}}

Rewrite the theory abstract to address the reviewers' concerns while maintaining the core ideas. Your revised version should:

1. Address the mathematical rigor issues raised by the grumpy professor (Reviewer 1), who is known for rejecting papers with even minor notational inconsistencies
2. Include more connections to practical applications as requested by the ML practitioner (Reviewer 2), who evaluates papers based on their potential industry impact
3. Clarify and strengthen the mathematical formulations per the non-ML researcher's feedback (Reviewer 3), making the work accessible to the broader scientific community
4. Maintain appropriate mathematical notation and theoretical depth without compromising the original insights
5. Strengthen claims where evidence exists and appropriately qualify speculative statements
6. Keep the same general structure but improve the content to be more compelling and clear
7. Ensure the abstract flows logically and builds a coherent narrative about the work's significance

Remember: This revised abstract must be compelling enough to convince all three reviewers that the paper deserves acceptance. Alex's entire career trajectory depends on this revision. The abstract should be technically sound enough for the academic reviewer, practical enough for the industry reviewer, and clear enough for the interdisciplinary reviewer.

Your response should be a cohesive, improved version of the original theory abstract that transforms a borderline rejection into a clear acceptance.`;
    }
    
    async execute(theories, reviews) {
        this.updateProgress(65, "Step 5/6: Rewriting abstracts based on reviews...", 5);
        
        // Assuming theories and reviews are arrays of 3 items each
        const rewrittenResults = [];
        
        for (let i = 0; i < theories.length; i++) {
            this.addStepLog(`Rewriting theory abstract ${i+1} based on reviewer feedback...`);
            
            try {
                const result = await this.executePrompt(this.template, { 
                    theory: theories[i],
                    reviews: reviews[i]
                });
                rewrittenResults.push(result);
                this.addStepLog(`Theory ${i+1} rewritten successfully.`);
                this.updateProgress(65 + (i+1) * 5, `Rewrite ${i+1}/3 complete.`, 5);
            } catch (error) {
                this.addStepLog(`Error rewriting theory ${i+1}: ${error.message}`);
                throw error;
            }
        }
        
        return this.storeResult('rewritten', rewrittenResults);
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