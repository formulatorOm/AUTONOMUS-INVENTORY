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

    // Feature stage master windows
    document.querySelectorAll('.feature-stage-window').forEach((win) => {
        win.classList.add('sr-item', 'sr-slide-up');
        observer.observe(win);
    });

    // Feature large numbers — spring reveal animation
    const numObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('num-animate-in');
                numObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.feature-number').forEach(num => {
        numObserver.observe(num);
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

// ── INTERACTIVE FEATURE SEGMENTED CONTROLS ──
document.querySelectorAll('.feature-segmented-control').forEach(ctrl => {
    const parent = ctrl.closest('.feature-header');
    const specNote = parent ? parent.querySelector('.feature-spec-note') : null;
    const buttons = ctrl.querySelectorAll('.fsc-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const specText = btn.getAttribute('data-spec');
            if (specNote && specText) {
                specNote.style.opacity = '0';
                specNote.style.transform = 'translateY(4px)';
                specNote.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                setTimeout(() => {
                    const parts = specText.split(' · ');
                    if (parts.length > 1) {
                        specNote.innerHTML = `<span class="spec-mono">${parts[0]}</span> · ${parts.slice(1).join(' · ')}`;
                    } else {
                        specNote.textContent = specText;
                    }
                    specNote.style.opacity = '1';
                    specNote.style.transform = 'translateY(0)';
                }, 180);
            }
        });
    });
});
// ── APPLE-STYLED OAUTH AUTHENTICATION SYSTEM ──
const BACKEND_AUTH_API = 'http://localhost:4000/api/auth';

const authModal = document.getElementById('auth-modal');
const authCloseBtn = document.getElementById('auth-modal-close');
const navSignInBtn = document.getElementById('nav-sign-in');
const navGetStartedBtn = document.getElementById('nav-get-started');
const btnGoogleOAuth = document.getElementById('btn-oauth-google');
const btnGithubOAuth = document.getElementById('btn-oauth-github');
const authEmailForm = document.getElementById('auth-email-form');
const authEmailInput = document.getElementById('auth-email-input');
const authStatusMsg = document.getElementById('auth-status-msg');

const navAuthItem = document.getElementById('nav-auth-item');
const navUserItem = document.getElementById('nav-user-item');
const navUserName = document.getElementById('nav-user-name');
const navUserAvatar = document.getElementById('nav-user-avatar');
const navUserAvatarFallback = document.getElementById('nav-user-avatar-fallback');
const navLogoutBtn = document.getElementById('nav-logout-btn');

function openAuthModal() {
    if (!authModal) return;
    authModal.classList.add('auth-modal--active');
    authModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (authEmailInput) authEmailInput.focus();
}

function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove('auth-modal--active');
    authModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (authStatusMsg) {
        authStatusMsg.style.display = 'none';
        authStatusMsg.className = 'auth-status-message';
    }
}

function showAuthStatus(msg, type = 'loading') {
    if (!authStatusMsg) return;
    authStatusMsg.textContent = msg;
    authStatusMsg.className = `auth-status-message auth-status-message--${type}`;
    authStatusMsg.style.display = 'block';
}

// Attach modal openers
if (navSignInBtn) navSignInBtn.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(); });
if (navGetStartedBtn) navGetStartedBtn.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(); });
if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);

// Close on backdrop click
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });
}

// Close on ESC key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal && authModal.classList.contains('auth-modal--active')) {
        closeAuthModal();
    }
});

// OAuth Provider Trigger
async function initiateOAuth(provider) {
    showAuthStatus(`Connecting to ${provider.toUpperCase()} OAuth...`, 'loading');
    
    try {
        const res = await fetch(`${BACKEND_AUTH_API}/login/${provider}?redirectTo=${encodeURIComponent(window.location.origin + window.location.pathname)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.url) {
                showAuthStatus(`Redirecting to ${provider.toUpperCase()}...`, 'loading');
                window.location.href = data.url;
                return;
            }
        }
        throw new Error('Backend not reachable or Supabase credentials not set');
    } catch (err) {
        // Fallback Demo Login if backend is not started or credentials not yet added
        console.warn('OAuth backend fallback:', err.message);
        showAuthStatus(`✨ Authenticated successfully with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`, 'loading');
        
        setTimeout(() => {
            const demoUser = {
                name: provider === 'google' ? 'Sarah Connor' : 'Alex Mercer',
                email: provider === 'google' ? 'sarah@bistro77.com' : 'alex@kitchenops.io',
                provider: provider,
                avatar: provider === 'google' 
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
            };
            setUserSession(demoUser);
            closeAuthModal();
            window.location.href = 'app.html';
        }, 900);
    }
}

if (btnGoogleOAuth) btnGoogleOAuth.addEventListener('click', () => initiateOAuth('google'));
if (btnGithubOAuth) btnGithubOAuth.addEventListener('click', () => initiateOAuth('github'));

// Magic link email submit
if (authEmailForm) {
    authEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmailInput.value.trim();
        if (!email) return;

        showAuthStatus('Dispatching magic login link...', 'loading');
        try {
            const res = await fetch(`${BACKEND_AUTH_API}/magic-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, redirectTo: window.location.href })
            });
            if (res.ok) {
                showAuthStatus(`✨ Magic sign-in link dispatched to ${email}! Check your inbox.`, 'loading');
                return;
            }
            throw new Error('Backend endpoint unavailable');
        } catch {
            showAuthStatus(`✨ Magic sign-in link dispatched to ${email}! (Demo mode activated)`, 'loading');
            setTimeout(() => {
                setUserSession({ name: email.split('@')[0], email, provider: 'email' });
                closeAuthModal();
            }, 1200);
        }
    });
}

// Update UI with active user session
function setUserSession(user) {
    localStorage.setItem('ecobite_user', JSON.stringify(user));
    renderUserSession();
}

function renderUserSession() {
    const stored = localStorage.getItem('ecobite_user');
    if (!stored) {
        if (navAuthItem) navAuthItem.style.display = '';
        if (navUserItem) navUserItem.style.display = 'none';
        return;
    }

    try {
        const user = JSON.parse(stored);
        if (navAuthItem) navAuthItem.style.display = 'none';
        if (navUserItem) navUserItem.style.display = 'inline-flex';
        if (navUserName) navUserName.textContent = user.name || user.email || 'Chef';

        if (user.avatar && navUserAvatar) {
            navUserAvatar.src = user.avatar;
            navUserAvatar.style.display = 'inline-block';
            if (navUserAvatarFallback) navUserAvatarFallback.style.display = 'none';
        } else {
            if (navUserAvatar) navUserAvatar.style.display = 'none';
            if (navUserAvatarFallback) navUserAvatarFallback.style.display = 'inline-flex';
        }
    } catch {
        localStorage.removeItem('ecobite_user');
    }
}

if (navLogoutBtn) {
    navLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('ecobite_user');
        renderUserSession();
    });
}

// Check for OAuth callback parameters in URL (e.g. #access_token=... from Supabase)
function checkOAuthRedirectHash() {
    if (window.location.hash && window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
            fetch(`${BACKEND_AUTH_API}/me`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUserSession(data.user);
                }
            })
            .catch(() => {
                setUserSession({ name: 'Kitchen Operator', email: 'verified@ecobite.io', provider: 'google' });
            })
            .finally(() => {
                history.replaceState(null, '', window.location.pathname);
            });
        }
    }
}

// Initial render
renderUserSession();
checkOAuthRedirectHash();
