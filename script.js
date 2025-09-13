// Portfolio JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initIntroAnimation();
    initSmoothScrolling();
    initTypingEffect();
    initProjectCardAnimations();
    initThemeToggle();
    initSkillsAnimations();
});

// Intro Animation Sequence
function initIntroAnimation() {
    const introContainer = document.getElementById('intro-animation');
    const aboutContent = document.getElementById('about-content');
    
    if (!introContainer || !aboutContent) return;
    
    // Show intro animation immediately
    introContainer.style.display = 'flex';
    
    // After 3.5 seconds, start the transition
    setTimeout(() => {
        // Fade out intro animation
        introContainer.classList.add('fade-out');
        
        // After fade out completes, show about content
        setTimeout(() => {
            introContainer.style.display = 'none';
            aboutContent.classList.add('show');
        }, 800); // Match the CSS transition duration
        
    }, 3500); // Total intro duration: 3.5 seconds
}

// Smooth scrolling for navbar links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const floatingContactBtn = document.querySelector('.floating-contact');
    
    // Add smooth scrolling to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = 80; // Account for fixed header
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add smooth scrolling to floating contact button
    if (floatingContactBtn) {
        floatingContactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const headerHeight = 80;
                const targetPosition = contactSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Typing effect in Home section
// Typing effect for full intro
function initTypingEffect() { const typedElement = document.getElementById('typed-text'); if (typedElement && typeof Typed !== 'undefined') { new Typed('#typed-text', { strings: [ 'Prashant Singh, a 2nd-year CSE student specializing in Cybersecurity at VIT Chennai.', 'someone who loves building web apps, solving DSA problems, and creating projects that actually make life easier.', 'welcome to my corner of the web!' ], typeSpeed: 50, backSpeed: 30, backDelay: 2000, startDelay: 500, loop: true, showCursor: true, cursorChar: '|' }); } }


// Enhanced hover animations for project cards
function initProjectCardAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Mouse enter event
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-10px)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
            this.style.transition = 'all 0.3s ease';
            
            // Add subtle rotation effect
            this.style.transformOrigin = 'center center';
        });
        
        // Mouse leave event
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            this.style.transition = 'all 0.3s ease';
        });
        
        // Add click animation
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05) translateY(-10px)';
            }, 150);
        });
    });
}

// Dark/Light mode toggle functionality
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    if (!themeToggleBtn) return;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply initial theme
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        themeToggleLightIcon.classList.remove('hidden');
        themeToggleDarkIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
    }
    
    // Theme toggle event listener
    themeToggleBtn.addEventListener('click', function() {
        // Toggle dark mode
        if (document.documentElement.classList.contains('dark')) {
            // Switch to light mode
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        } else {
            // Switch to dark mode
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        }
        
        // Add a subtle animation to the button
        themeToggleBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            themeToggleBtn.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

// Additional utility functions

// Scroll indicator for navbar
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const scrolled = window.scrollY > 50;
    
    if (scrolled) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Press 'T' to toggle theme
    if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.click();
            }
        }
    }
});

// Skills Section Animations
function initSkillsAnimations() {
    const skillCards = document.querySelectorAll('.skill-card');
    const specializationCards = document.querySelectorAll('.specialization-card');
    
    // Create intersection observer for skill bars
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target.querySelector('.skill-bar');
                if (skillBar) {
                    const level = skillBar.getAttribute('data-level');
                    skillBar.style.setProperty('--level', level + '%');
                    skillBar.style.width = level + '%';
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    });
    
    // Observe all skill cards
    skillCards.forEach(card => {
        skillObserver.observe(card);
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-8px)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add hover effects for specialization cards
    specializationCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-8px)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add click animation for skill cards
    skillCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05) translateY(-8px)';
            }, 150);
        });
    });
}

console.log('Prashant Portfolio JavaScript loaded successfully! 🚀');