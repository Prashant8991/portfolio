// Portfolio JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initDarkMode();
    initIntroAnimation();
    initSmoothScrolling();
    initTypingEffect();
    initProjectCardAnimations();
    initSkillsAnimations();
    initMobileMenu();
});

// Intro Animation Sequence
function initIntroAnimation() {
    const introContainer = document.getElementById('intro-animation');
    const aboutContent = document.getElementById('about-content');
    
    if (!introContainer || !aboutContent) return;
    
    // Show intro animation briefly, then show content
    introContainer.style.display = 'flex';
    
    // Reduced timing for faster display
    setTimeout(() => {
        introContainer.classList.add('fade-out');
        setTimeout(() => {
            introContainer.style.display = 'none';
            aboutContent.classList.add('show');
        }, 300);
    }, 1500); // Reduced from 3.5 seconds to 1.5 seconds
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

// Set dark mode permanently
function initDarkMode() {
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-gray-900', 'text-white');
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

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (!mobileMenuButton || !mobileMenu) {
        console.log('Mobile menu elements not found');
        return;
    }
    
    console.log('Mobile menu initialized');
    
    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Mobile menu button clicked');
        
        // Toggle menu visibility
        if (mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('hidden');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            console.log('Menu opened');
        } else {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            console.log('Menu closed');
        }
    });
    
    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a[href^="#"]');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            console.log('Menu closed after link click');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        }
    });
    
    // Mobile theme toggle removed - using permanent dark mode
}

console.log('Prashant Portfolio JavaScript loaded successfully! 🚀');