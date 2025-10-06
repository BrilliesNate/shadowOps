// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initHeroAnimations();
    initScrollAnimations();
    initCounters();
    initFormHandling();
    initParallax();
    console.log('🛡️ Shadow Ops Security - Website Loaded');
});

// ===== NAVIGATION =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.getElementById('navbar');

function initNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Animate hamburger
        if (navMenu.classList.contains('active')) {
            hamburger.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            hamburger.children[1].style.opacity = '0';
            hamburger.children[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            hamburger.children[0].style.transform = 'none';
            hamburger.children[1].style.opacity = '1';
            hamburger.children[2].style.transform = 'none';
        }
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.children[0].style.transform = 'none';
            hamburger.children[1].style.opacity = '1';
            hamburger.children[2].style.transform = 'none';
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offset = 140; // Account for fixed header
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    window.addEventListener('scroll', highlightActiveNav);
}

function highlightActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 200;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== HERO ANIMATIONS =====
function initHeroAnimations() {
    // Animate hero elements on load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 1s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    // Animate stats sequentially
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((stat, index) => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            stat.style.transition = 'all 0.6s ease';
            stat.style.opacity = '1';
            stat.style.transform = 'translateY(0)';
        }, 800 + (index * 100));
    });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Special handling for service cards
                if (entry.target.classList.contains('service-card')) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                }
                
                // Trigger counter animation if it's a stat
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe service cards
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe tech features
    document.querySelectorAll('.tech-feature').forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        feature.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(feature);
    });

    // Observe testimonial cards
    document.querySelectorAll('.testimonial-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });

    // Observe certification items
    document.querySelectorAll('.cert-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });

    // Observe visual cards
    document.querySelectorAll('.visual-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });
}

// ===== COUNTER ANIMATIONS =====
function initCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
            
            // Add + or % suffix based on context
            const label = element.nextElementSibling?.textContent;
            if (label && label.includes('Success')) {
                element.textContent = target + '%';
            } else {
                element.textContent = target + '+';
            }
        }
    };

    updateCounter();
}

// ===== PARALLAX EFFECTS =====
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // Hero parallax - only apply on larger screens
        if (window.innerWidth > 1024) {
            const hero = document.querySelector('.hero');
            if (hero && scrolled < window.innerHeight) {
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                    heroContent.style.opacity = 1 - (scrolled / 600);
                }
            }
        }
    });
}

// ===== FORM HANDLING =====
let isSubmitting = false;

function initFormHandling() {
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('.submit-btn-premium');
    const originalButtonText = submitButton.innerHTML;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        isSubmitting = true;

        // Get form values
        const formData = {
            name: document.getElementById('name').value.trim(),
            company: document.getElementById('company').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            service: document.getElementById('service').value,
            message: document.getElementById('message').value.trim()
        };

        // Validation
        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            showNotification('Please fill in all required fields', 'error');
            isSubmitting = false;
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Please enter a valid email address', 'error');
            isSubmitting = false;
            return;
        }

        // Phone validation (basic)
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(formData.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            isSubmitting = false;
            return;
        }

        // Update button state
        submitButton.innerHTML = '<span>SENDING...</span>';
        submitButton.style.opacity = '0.7';
        submitButton.style.cursor = 'not-allowed';

        // Simulate API call (replace with actual backend integration)
        await simulateSubmission(formData);

        // Reset form
        form.reset();
        submitButton.innerHTML = originalButtonText;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';

        showNotification('Thank you! We will contact you within 24 hours.', 'success');
        
        setTimeout(() => {
            isSubmitting = false;
        }, 2000);
    });
}

async function simulateSubmission(data) {
    return new Promise((resolve) => {
        console.log('Form Data Submitted:', data);
        // Here you would typically send data to your backend
        // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
        setTimeout(resolve, 1500);
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Styles
    const colors = {
        success: 'linear-gradient(135deg, #6B7B5A, #4A5842)',
        error: 'linear-gradient(135deg, #c44444, #a03333)',
        info: 'linear-gradient(135deg, #4a90e2, #357abd)'
    };

    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        padding: 1.2rem 2rem;
        background: ${colors[type]};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 100000;
        font-weight: 600;
        max-width: 400px;
        animation: slideInRight 0.4s ease, fadeOut 0.4s ease 3.6s;
    `;

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}

// Add notification animations to stylesheet
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0.8; }
    }
`;
document.head.appendChild(notificationStyles);

// ===== SERVICE CARD INTERACTIONS =====
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== TRUST BADGE ANIMATIONS =====
document.querySelectorAll('.trust-badge').forEach((badge, index) => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        badge.style.transition = 'all 0.5s ease';
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0)';
    }, 1500 + (index * 100));
});

// ===== PARTNER LOGOS ANIMATION =====
document.querySelectorAll('.partner-logo').forEach((logo, index) => {
    logo.style.opacity = '0';
    logo.style.transform = 'scale(0.8)';
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    logo.style.transition = 'all 0.4s ease';
                    logo.style.opacity = '1';
                    logo.style.transform = 'scale(1)';
                }, index * 100);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(logo);
});

// ===== EMERGENCY CONTACT PULSE =====
const emergencyNumber = document.querySelector('.emergency-number');
if (emergencyNumber) {
    setInterval(() => {
        emergencyNumber.style.animation = 'pulse 1s ease';
        setTimeout(() => {
            emergencyNumber.style.animation = '';
        }, 1000);
    }, 5000);
}

const pulseAnimation = document.createElement('style');
pulseAnimation.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(pulseAnimation);

// ===== SCROLL TO TOP BUTTON (Optional Enhancement) =====
function createScrollToTop() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
        z-index: 9998;
        box-shadow: 0 5px 20px rgba(107, 123, 90, 0.4);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 8px 30px rgba(107, 123, 90, 0.6)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 5px 20px rgba(107, 123, 90, 0.4)';
    });
}

// Initialize scroll to top button
createScrollToTop();

// ===== PRELOADER (Optional) =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
});

// ===== CONSOLE BRANDING =====
console.log('%c🛡️ SHADOW OPS PRIVATE SECURITY', 'color: #6B7B5A; font-size: 20px; font-weight: bold;');
console.log('%cAlways In Your Shadow', 'color: #8B9A7A; font-size: 14px; font-style: italic;');
console.log('%cWebsite Version 2.0 | Premium Security Solutions', 'color: #b0b0b0; font-size: 12px;');

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
    });
}

// ===== EXPORT FOR POTENTIAL MODULE USAGE =====
window.ShadowOpsApp = {
    showNotification,
    animateCounter,
    version: '2.0.0'
};