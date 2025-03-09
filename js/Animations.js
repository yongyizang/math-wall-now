// Add this file as js/Animations.js and import it in your HTML

class AnimationManager {
    constructor() {
        // Event listeners for animation triggers
        this.setupAnimations();
    }
    
    setupAnimations() {
        // Add intersection observer for scroll animations
        this.setupScrollAnimations();
        
        // Add hover animations
        this.setupHoverAnimations();
    }
    
    setupScrollAnimations() {
        // Use IntersectionObserver to trigger animations when elements scroll into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, { threshold: 0.1 });
        
        // Observe all step-result elements
        document.querySelectorAll('.step-result').forEach(el => {
            observer.observe(el);
            el.classList.add('animate-ready');
        });
    }
    
    setupHoverAnimations() {
        // Add hover effects for interactive elements
        document.querySelectorAll('.step-title').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const icon = el.querySelector('svg');
                if (icon) {
                    icon.classList.add('icon-pulse');
                }
            });
            
            el.addEventListener('mouseleave', () => {
                const icon = el.querySelector('svg');
                if (icon) {
                    icon.classList.remove('icon-pulse');
                }
            });
        });
    }
    
    // Animate progress steps sequentially
    animateProgressSteps() {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            setTimeout(() => {
                step.classList.add('step-appear');
            }, index * 100);
        });
    }
    
    // Show celebration animation on completion
    showCompletionCelebration() {
        const container = document.createElement('div');
        container.className = 'celebration-container';
        
        // Create confetti or other celebration effects
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 3}s`;
            confetti.style.backgroundColor = this.getRandomColor();
            container.appendChild(confetti);
        }
        
        document.body.appendChild(container);
        
        // Remove after animation completes
        setTimeout(() => {
            document.body.removeChild(container);
        }, 5000);
    }
    
    getRandomColor() {
        const colors = [
            '#4361ee', // primary
            '#7209b7', // secondary
            '#4cc9f0', // accent
            '#06d6a0', // success
            '#ffd166'  // warning
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Animate tab transitions
    animateTabTransition(fromTabId, toTabId) {
        const fromTab = document.getElementById(fromTabId);
        const toTab = document.getElementById(toTabId);
        
        if (!fromTab || !toTab) return;
        
        // Fade out current tab
        fromTab.classList.add('tab-fade-out');
        
        setTimeout(() => {
            fromTab.classList.remove('active', 'tab-fade-out');
            
            // Fade in new tab
            toTab.classList.add('active', 'tab-fade-in');
            
            setTimeout(() => {
                toTab.classList.remove('tab-fade-in');
            }, 300);
        }, 300);
    }
}

// Add necessary CSS
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Scroll animations */
        .animate-ready {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Icon animations */
        .icon-pulse {
            animation: iconPulse 0.6s infinite alternate ease-in-out;
        }
        
        @keyframes iconPulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.2); }
        }
        
        /* Progress step animations */
        .progress-step {
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
        }
        
        .step-appear {
            opacity: 1;
            transform: scale(1);
        }
        
        /* Tab transitions */
        .tab-fade-out {
            opacity: 0;
            transform: translateX(-10px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .tab-fade-in {
            opacity: 0;
            transform: translateX(10px);
            animation: fadeIn 0.3s ease forwards;
        }
        
        /* Celebration animations */
        .celebration-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        }
        
        .confetti {
            position: absolute;
            top: -10px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            animation: fall 5s linear forwards;
        }
        
        @keyframes fall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            80% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Initialize animation manager
    window.animationManager = new AnimationManager();
});