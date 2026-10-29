/* ============================================================
   ECOBITE — Animation System
   Apple-Inspired Motion: expo-out easing, staggered reveals,
   3D perspective tilt with specular glare, floating badges,
   radar pulse waves, and tactile micro-interactions.
   ============================================================ */

// ── APPLE EXPO-OUT EASING ──
// cubic-bezier(0.16, 1, 0.3, 1) — fast start, long graceful deceleration
const APPLE_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// ── NAVBAR SCROLL + ENTRANCE ──
const navbar = document.getElementById('navbar');
if (navbar) {
    navbar.style.transform = 'translateY(-100%)';
    navbar.style.opacity = '0';
    setTimeout(() => {
        navbar.style.transition = `transform 0.8s ${APPLE_EASE}, opacity 0.8s ${APPLE_EASE}`;
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
    }, 120);

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
}

// ── HERO ENTRANCE SEQUENCE ──
function initHeroAnimations() {
    const heroSequence = [
        { selector: '.floating-badge--left',                    delay: 140,  y: 12,  scale: 0.9  },
        { selector: '.floating-badge--right',                   delay: 200,  y: 12,  scale: 0.9  },
        { selector: '.hero-badge',                             delay: 180,  y: 18,  scale: 0.95 },
        { selector: '.hero-brand-lockup, .hero-brand-display', delay: 300,  y: 28,  scale: 0.94 },
        { selector: '.hero-title',                             delay: 460,  y: 35,  scale: 0.98 },
        { selector: '.hero-sub',                               delay: 620,  y: 25,  scale: 1    },
        { selector: '.hero-actions',                           delay: 760,  y: 20,  scale: 1    },
        { selector: '#hero-deck',                              delay: 920,  y: 32,  scale: 0.96 },
        { selector: '#hero-bento',                             delay: 1100, y: 30,  scale: 0.96 },
    ];

    heroSequence.forEach(({ selector, delay, y, scale }) => {
        const el = document.querySelector(selector);
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = `translateY(${y}px) scale(${scale})`;
        el.style.transition = 'none';

        setTimeout(() => {
            el.style.transition = `opacity 0.9s ${APPLE_EASE}, transform 1s ${APPLE_EASE}`;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
        }, delay);
    });

    // Stagger hero bento cards individually
    setTimeout(() => {
        document.querySelectorAll('.hb-card').forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(22px) scale(0.95)';
            card.style.transition = 'none';
            setTimeout(() => {
                card.style.transition = `opacity 0.75s ${APPLE_EASE}, transform 0.85s ${APPLE_EASE}`;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, i * 90);
        });
    }, 1140);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroAnimations);
} else {
    initHeroAnimations();
}

// ── 3D PERSPECTIVE TILT + SPECULAR GLARE ON MOCKUPS ──
document.querySelectorAll('.tilt-container').forEach(container => {
    const wrapper = container.querySelector('.mockup-wrapper');
    const glare = container.querySelector('.glare-overlay');
    if (!wrapper) return;

    let bounds;
    let isHovered = false;

    container.addEventListener('mouseenter', () => {
        isHovered = true;
        bounds = container.getBoundingClientRect();
        wrapper.style.transition = 'transform 0.12s ease-out';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        if (!bounds) bounds = container.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        // Normalized from -1 to 1
        const xPct = (mouseX / bounds.width - 0.5) * 2;
        const yPct = (mouseY / bounds.height - 0.5) * 2;

        const rotateX = -yPct * 6.5; // max 6.5 deg tilt
        const rotateY = xPct * 6.5;

        wrapper.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`;

        if (glare) {
            glare.style.setProperty('--glare-x', `${(mouseX / bounds.width * 100).toFixed(1)}%`);
            glare.style.setProperty('--glare-y', `${(mouseY / bounds.height * 100).toFixed(1)}%`);
        }
    });

    container.addEventListener('mouseleave', () => {
        isHovered = false;
        wrapper.style.transition = `transform 0.8s ${APPLE_EASE}`;
        wrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
});

// ── SCROLL REVEAL WITH SCALE + BLUR ──
function createScrollReveal() {
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('sr-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Feature headers
    document.querySelectorAll('.feature-header').forEach((el) => {
        el.classList.add('sr-item', 'sr-slide-up');
        observer.observe(el);
    });

    // Bento cards — staggered cascade
    document.querySelectorAll('.feature-bento').forEach(bento => {
        bento.querySelectorAll('.fb-card').forEach((card, i) => {
            card.classList.add('sr-item', 'sr-scale-up');
            card.style.transitionDelay = `${i * 75}ms`;
            observer.observe(card);
        });
    });

    // Section intro
    document.querySelectorAll('.feature-intro').forEach(el => {
        el.classList.add('sr-item', 'sr-slide-up');
        observer.observe(el);
    });

    // CTA section
    document.querySelectorAll('.cta-inner > *').forEach((el, i) => {
        el.classList.add('sr-item', 'sr-slide-up');
        el.style.transitionDelay = `${i * 90}ms`;
        observer.observe(el);
    });
}

createScrollReveal();

// ── CARD HOVER MICROINTERACTIONS ──
document.querySelectorAll('.fb-card:not(.fb-card--image)').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transition = `transform 0.4s ${APPLE_EASE}, box-shadow 0.4s ${APPLE_EASE}`;
        card.style.transform = 'translateY(-5px) scale(1.012)';
        card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = `transform 0.5s ${APPLE_EASE}, box-shadow 0.5s ${APPLE_EASE}`;
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '';
    });
    card.addEventListener('mousedown', () => {
        card.style.transform = 'translateY(-2px) scale(0.99)';
    });
    card.addEventListener('mouseup', () => {
        card.style.transform = 'translateY(-5px) scale(1.012)';
    });
});

// ── BUTTON PRESS MICROANIMATION ──
document.querySelectorAll('.btn-primary-lg, .cta-submit, .btn-primary').forEach(btn => {
    btn.addEventListener('mousedown', () => {
        btn.style.transition = 'transform 0.1s ease';
        btn.style.transform = 'scale(0.96)';
    });
    btn.addEventListener('mouseup', () => {
        btn.style.transition = `transform 0.4s ${APPLE_EASE}`;
        btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });
});

// ── HERO BENTO STAT COUNTER ──
function animateValue(container, start, end, duration, suffix = '') {
    const spanEl = container.querySelector('span');
    const spanHTML = spanEl ? spanEl.outerHTML : '';

    let startTime = null;
    const step = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        // Expo-out easing
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const value = Math.floor(eased * (end - start) + start);
        container.innerHTML = value.toLocaleString() + suffix + ' ' + spanHTML;
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

const statCards = document.querySelectorAll('.hb-card-stat');
let statsAnimated = false;
const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsAnimated) {
        statsAnimated = true;
        const stats = [
            { el: statCards[0], end: 2850, suffix: '' },
            { el: statCards[1], end: 54,   suffix: '' },
            { el: statCards[2], end: 92,   suffix: '%' },
            { el: statCards[3], end: 6,    suffix: '' },
        ];
        stats.forEach(({ el, end, suffix }) => {
            if (el) animateValue(el, 0, end, 1600, suffix);
        });
    }
}, { threshold: 0.4 });

const heroBento = document.getElementById('hero-bento');
if (heroBento) statsObserver.observe(heroBento);

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ── CTA SUBMIT WITH TACTILE SUCCESS ──
const submitBtn = document.getElementById('cta-submit-btn');
const emailInput = document.getElementById('cta-email');
if (submitBtn && emailInput) {
    submitBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (!email || !email.includes('@')) {
            emailInput.style.transition = 'border-color 0.2s, box-shadow 0.2s, transform 0.1s';
            emailInput.style.borderColor = '#ff3b30';
            emailInput.style.boxShadow = '0 0 0 4px rgba(255,59,48,0.12)';
            emailInput.style.transform = 'translateX(6px)';
            setTimeout(() => { emailInput.style.transform = 'translateX(-4px)'; }, 80);
            setTimeout(() => { emailInput.style.transform = 'translateX(0)'; }, 160);
            setTimeout(() => {
                emailInput.style.borderColor = '';
                emailInput.style.boxShadow = '';
            }, 2500);
            return;
        }
        submitBtn.style.transition = `background 0.5s ${APPLE_EASE}, transform 0.3s ${APPLE_EASE}`;
        submitBtn.style.background = '#34c759';
        submitBtn.style.transform = 'scale(1.04)';
        setTimeout(() => { submitBtn.style.transform = 'scale(1)'; }, 300);
        submitBtn.textContent = "✓ You're on the list!";
        submitBtn.disabled = true;
        emailInput.value = '';
        emailInput.placeholder = "Thanks! We'll be in touch.";
        emailInput.disabled = true;
    });
}

// ── PARALLAX ON HERO BADGE ──
window.addEventListener('scroll', () => {
    const badge = document.querySelector('.hero-badge');
    if (badge) {
        const scrollY = window.scrollY;
        badge.style.transform = `translateY(${scrollY * 0.08}px)`;
        badge.style.opacity = `${1 - scrollY * 0.003}`;
    }
}, { passive: true });
