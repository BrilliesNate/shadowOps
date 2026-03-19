'use strict';

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

// ===== ANIMATED COUNTERS =====
function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => {
    counterObserver.observe(el);
});

// ===== CANVAS VIDEO-IN-TEXT =====
(function initTitleCanvas() {
    const canvas = document.getElementById('titleCanvas');
    const video  = document.getElementById('titleVideo');
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');

    function getFontSize() {
        return Math.min(window.innerWidth * 0.10, 144);
    }

    function setupCanvas() {
        const fs   = getFontSize();
        const padX = fs * 0.12;
        const padY = fs * 0.10;
        const lsStr = `${(fs * 0.06).toFixed(1)}px`;

        ctx.font = `900 ${fs}px 'TT Hoves', sans-serif`;
        try { ctx.letterSpacing = lsStr; } catch(e) {}

        const tw = ctx.measureText('SHADOW OPS').width;
        canvas.width  = Math.ceil(tw + padX * 2);
        canvas.height = Math.ceil(fs * 1.15 + padY * 2);
        canvas._fs   = fs;
        canvas._padX = padX;
        canvas._padY = padY;
    }

    function draw() {
        const fs   = canvas._fs   || getFontSize();
        const padX = canvas._padX || fs * 0.12;
        const padY = canvas._padY || fs * 0.10;
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // 1. Draw video frame
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(video, 0, 0, W, H);

        // 2. Crop everything to text shape — areas outside letters become transparent
        ctx.globalCompositeOperation = 'destination-in';
        ctx.font = `900 ${fs}px 'TT Hoves', sans-serif`;
        try { ctx.letterSpacing = `${(fs * 0.06).toFixed(1)}px`; } catch(e) {}
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = '#fff';
        ctx.fillText('SHADOW OPS', W / 2, H / 2);


    }

    document.fonts.ready.then(() => {
        setupCanvas();
        window.addEventListener('resize', () => { setupCanvas(); }, { passive: true });
        video.play().catch(() => {});
        function startLoop() {
            setInterval(draw, 33); // ~30fps, works even in background tabs
        }
        if (video.readyState >= 2) { startLoop(); }
        else { video.addEventListener('canplay', startLoop, { once: true }); }
    });
})();

// ===== HERO PARALLAX =====
const heroImg = document.querySelector('.hero-img');
if (heroImg && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        if (scrollY < window.innerHeight * 1.2) {
            heroImg.style.transform = `translateY(${scrollY * 0.25}px)`;
        }
    }, { passive: true });
}
