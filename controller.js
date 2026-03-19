'use strict';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNavigation();
    initFormHandling();
    createScrollToTop();
    console.log('%c🛡️ SHADOW OPS PRIVATE SECURITY', 'color:#6b8f5e;font-size:18px;font-weight:bold;');
    console.log('%cAlways In Your Shadow', 'color:#9ab890;font-size:13px;font-style:italic;');
});

// ===== LOADING SCREEN =====
function initLoader() {
    const loader = document.getElementById('siteLoader');
    const bar    = document.getElementById('loaderBar');
    const label  = document.getElementById('loaderLabel');
    if (!loader) return;

    const bgVideo = document.querySelector('.hero-img');

    // Fade in the background video once it can play — independent of loader
    if (bgVideo) {
        bgVideo.play().catch(() => {});
        bgVideo.addEventListener('canplay', () => {
            bgVideo.style.opacity = '1';
        }, { once: true });
        // Fallback: show video after 4s even if canplay never fires
        setTimeout(() => { bgVideo.style.opacity = '1'; }, 4000);
    }

    // Dismiss loader quickly — just wait for fonts + DOM, not video
    function dismiss() {
        label.textContent = 'READY';
        bar.style.width = '100%';
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 750);
        }, 300);
    }

    // Animate bar to 100% then dismiss
    let pct = 0;
    const interval = setInterval(() => {
        pct = Math.min(pct + Math.random() * 18 + 8, 95);
        bar.style.width = pct + '%';
    }, 120);

    document.fonts.ready.then(() => {
        clearInterval(interval);
        dismiss();
    });

    // Hard fallback — never block user for more than 2.5 seconds
    setTimeout(() => { clearInterval(interval); dismiss(); }, 2500);
}

// ===== NAVIGATION =====
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');
    const navLinks  = document.querySelectorAll('.nav-link');
    const navbar    = document.getElementById('navbar');

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        const open = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');

        hamburger.children[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
        hamburger.children[1].style.opacity   = open ? '0' : '1';
        hamburger.children[2].style.transform = open ? 'rotate(-45deg) translate(7px, -6px)' : '';
    });

    function closeMenu() {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.children[0].style.transform = '';
        hamburger.children[1].style.opacity   = '1';
        hamburger.children[2].style.transform = '';
    }

    navLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Navbar scroll state
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.pageYOffset > 80);
        highlightActiveNav(navLinks);
    }, { passive: true });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--em-h')) +
                           parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 20 || 130;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });
}

function highlightActiveNav(navLinks) {
    const scrollY = window.pageYOffset;
    document.querySelectorAll('section[id]').forEach(section => {
        const top = section.offsetTop - 220;
        const bottom = top + section.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`);
            });
        }
    });
}

// ===== FORM HANDLING =====
let isSubmitting = false;

function initFormHandling() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitBtn = form.querySelector('.btn-submit');
    const originalHTML = submitBtn ? submitBtn.innerHTML : '';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        const data = {
            name:    document.getElementById('name')?.value.trim(),
            company: document.getElementById('company')?.value.trim(),
            email:   document.getElementById('email')?.value.trim(),
            phone:   document.getElementById('phone')?.value.trim(),
            service: document.getElementById('service')?.value,
            message: document.getElementById('message')?.value.trim()
        };

        if (!data.name || !data.email || !data.phone || !data.message) {
            showNotification('Please fill in all required fields.', 'error');
            isSubmitting = false;
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            showNotification('Please enter a valid email address.', 'error');
            isSubmitting = false;
            return;
        }
        if (!/^[\d\s+\-()/]+$/.test(data.phone)) {
            showNotification('Please enter a valid phone number.', 'error');
            isSubmitting = false;
            return;
        }

        if (submitBtn) {
            submitBtn.innerHTML = '<span>SENDING…</span>';
            submitBtn.disabled = true;
        }

        // Simulated submission — replace with real API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Contact form submission:', data);

        form.reset();
        if (submitBtn) {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
        showNotification('Thank you! We will contact you within 24 hours.', 'success');
        isSubmitting = false;
    });
}

// ===== NOTIFICATION SYSTEM =====
const notifStyles = document.createElement('style');
notifStyles.textContent = `
    @keyframes slideInRight { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
    @keyframes slideOutRight { from { transform:translateX(0); opacity:1; } to { transform:translateX(120%); opacity:0; } }
`;
document.head.appendChild(notifStyles);

function showNotification(message, type = 'info') {
    document.querySelector('.notif-toast')?.remove();

    const bg = { success: 'linear-gradient(135deg,#4a6741,#2e4228)', error: 'linear-gradient(135deg,#a03333,#7a2020)', info: 'linear-gradient(135deg,#2a4a6b,#1a3050)' };

    const el = document.createElement('div');
    el.className = 'notif-toast';
    el.textContent = message;
    el.style.cssText = `
        position:fixed; top:120px; right:20px; padding:1rem 1.6rem;
        background:${bg[type]}; color:#f2efe8; border-radius:8px;
        box-shadow:0 8px 32px rgba(0,0,0,0.5); z-index:100000;
        font-weight:600; font-size:0.9rem; max-width:380px;
        animation:slideInRight 0.35s ease;
    `;
    document.body.appendChild(el);

    setTimeout(() => {
        el.style.animation = 'slideOutRight 0.35s ease forwards';
        setTimeout(() => el.remove(), 380);
    }, 4000);
}

// ===== SCROLL TO TOP =====
function createScrollToTop() {
    const btn = document.createElement('button');
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Back to top');
    btn.style.cssText = `
        position:fixed; bottom:90px; right:20px; width:44px; height:44px;
        background:rgba(74,103,65,0.85); color:#f2efe8; border:1px solid rgba(154,184,144,0.25);
        border-radius:50%; font-size:1.3rem; cursor:pointer;
        opacity:0; visibility:hidden; transition:opacity 0.3s, visibility 0.3s, transform 0.2s;
        z-index:9990; backdrop-filter:blur(8px);
    `;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        const show = window.pageYOffset > 500;
        btn.style.opacity      = show ? '1' : '0';
        btn.style.visibility   = show ? 'visible' : 'hidden';
    }, { passive: true });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.1)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
}

// Expose for potential external use
window.ShadowOpsApp = { showNotification, version: '3.0.0' };
