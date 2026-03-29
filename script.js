/**
 * KARTHIKA — Lusion-Inspired Interactive JS
 * Smooth cursor, animated wavy curves, menu, scroll reveals, preloader
 */

'use strict';

// ─── UTIL ───────────────────────────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;

// ─── PRELOADER ───────────────────────────────────────────────────────────────
(function initPreloader() {
    const preloader = qs('#preloader');
    const bar       = qs('.preloader-bar');
    const pctEl     = qs('#preloader-pct');

    if (!preloader || !bar || !pctEl) {
        if (typeof revealHero === 'function') revealHero();
        return;
    }

    let pct = 0;
    const interval = setInterval(() => {
        const step = Math.random() * 12 + 3;
        pct = Math.min(pct + step, 100);

        bar.style.width   = pct + '%';
        pctEl.textContent = Math.floor(pct) + '%';

        if (pct >= 100) {
            clearInterval(interval);
            setTimeout(hidePreloader, 300);
        }
    }, 80);

    function hidePreloader() {
        preloader.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        preloader.style.opacity  = '0';
        preloader.style.transform = 'translateY(-30px)';
        setTimeout(() => {
            preloader.style.display = 'none';
            revealHero();
        }, 800);
    }
})();

// ─── CUSTOM CURSOR ───────────────────────────────────────────────────────────
(function initCursor() {
    const dot  = qs('#cursor-dot');
    const ring = qs('#cursor-ring');

    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    window.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    (function loopRing() {
        rx = lerp(rx, mx, 0.12);
        ry = lerp(ry, my, 0.12);
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(loopRing);
    })();

    // Hover detection
    const hoverables = 'a, button, .work-card, .skill-tag, #back-to-top';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverables)) {
            document.body.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverables)) {
            document.body.classList.remove('cursor-hover');
        }
    });

    // hide when leaves window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
    });
})();

// ─── WAVY CANVAS ─────────────────────────────────────────────────────────────
function createWavyCanvas(canvasId, color1 = '#4263eb', color2 = '#00d4cc', dark = false) {
    const canvas = qs('#' + canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, t = 0;
    let mouseX = 0.5, mouseY = 0.5;

    function resize() {
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width  = W;
        canvas.height = H;
    }

    resize();
    window.addEventListener('resize', resize);

    canvas.closest('section').addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top)  / rect.height;
    });

    function drawWave(offsetY, amplitude, freq, speed, color, lineWidth = 3) {
        ctx.beginPath();
        ctx.moveTo(0, offsetY);
        for (let x = 0; x <= W; x += 2) {
            const y = offsetY
                + Math.sin(x * freq + t * speed) * amplitude
                + Math.sin(x * freq * 0.5 + t * speed * 0.7 + mouseX * 2) * (amplitude * 0.6)
                + Math.cos(x * freq * 0.3 + t * speed * 1.2 + mouseY * 1.5) * (amplitude * 0.4);
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth   = lineWidth;
        ctx.lineCap     = 'round';
        ctx.stroke();
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        t += 0.008;

        if (!dark) {
            drawWave(H * 0.55, H * 0.12, 0.006, 1.0, color1 + 'cc', 4);
            drawWave(H * 0.50, H * 0.09, 0.007, 0.8, color2 + '99', 3);
            drawWave(H * 0.60, H * 0.07, 0.009, 1.2, color1 + '55', 2);
        } else {
            drawWave(H * 0.50, H * 0.18, 0.005, 0.9, color1 + 'aa', 5);
            drawWave(H * 0.55, H * 0.12, 0.007, 1.1, color2 + '88', 3);
        }

        requestAnimationFrame(draw);
    }
    draw();
}

// init canvases after DOM
window.addEventListener('DOMContentLoaded', () => {
    createWavyCanvas('hero-canvas',    '#4263eb', '#00d4cc', false);
    createWavyCanvas('vision-canvas',  '#4263eb', '#00d4cc', false);
    createWavyCanvas('contact-canvas', '#4263eb', '#00d4cc', true);
});

// ─── HERO REVEAL ────────────────────────────────────────────────────────────
function revealHero() {
    // Hero text is always visible, preloader slides away to reveal it
    document.body.classList.add('hero-ready');
}

// ─── MENU ────────────────────────────────────────────────────────────────────
(function initMenu() {
    const overlay  = qs('#menu-overlay');
    const toggle   = qs('#menu-toggle');
    const close    = qs('#menu-close');
    const links    = qsa('.menu-link');

    function openMenu() {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', openMenu);
    close.addEventListener('click', closeMenu);

    links.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
    });
})();

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────────────────────────────
(function initSmoothScroll() {
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = qs(id);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
})();

// ─── BACK TO TOP ─────────────────────────────────────────────────────────────
const backTop = qs('#back-to-top');
if (backTop) {
    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ─── LOGO CLICK ──────────────────────────────────────────────────────────────
const logo = qs('#logo-home');
if (logo) {
    logo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ─── SOUND TOGGLE — MP3 Player ───────────────────────────────────────────────
(function initSound() {
    const btn   = qs('#sound-toggle');
    const audio = qs('#bg-music');
    if (!btn || !audio) return;

    let playing = false;
    let fadeInterval = null;

    // Set initial volume to 0 (we'll fade in)
    audio.volume = 0;

    function fadeIn() {
        clearInterval(fadeInterval);
        audio.volume = 0;
        audio.play().catch(() => {}); // handle autoplay policy silently
        fadeInterval = setInterval(() => {
            if (audio.volume < 0.75) {
                audio.volume = Math.min(0.75, audio.volume + 0.03);
            } else {
                clearInterval(fadeInterval);
            }
        }, 60);
    }

    function fadeOut() {
        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
            if (audio.volume > 0.03) {
                audio.volume = Math.max(0, audio.volume - 0.03);
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeInterval);
            }
        }, 60);
    }

    btn.addEventListener('click', () => {
        playing = !playing;
        btn.classList.toggle('muted', !playing);
        if (playing) {
            fadeIn();
        } else {
            fadeOut();
        }
    });
})();

// ─── SCROLL REVEALS ──────────────────────────────────────────────────────────
(function initReveal() {
    // Elements to animate on scroll — set initial CSS state via data attribute
    const revealEls = qsa([
        '.about-headline',
        '.about-desc',
        '.stat-card',
        '.skill-tag',
        '.work-card',
        '.process-step',
        '.vision-headline',
        '.vision-sub',
        '.contact-headline',
        '.contact-sub',
        '.reveal',
        '.category-header',
    ].join(','));

    revealEls.forEach((el, idx) => {
        // Apply initial state inline so GSAP is not needed
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(32px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';

        // stagger siblings
        const siblings = [...el.parentElement.children].filter(c => c.tagName === el.tagName && c.className === el.className);
        const sibIdx   = siblings.indexOf(el);
        el._transDelay = sibIdx * 80;
    });

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                setTimeout(() => {
                    el.style.opacity   = '1';
                    el.style.transform = 'translateY(0)';
                }, el._transDelay || 0);
                io.unobserve(el);
            }
        });
    }, { threshold: 0.12 });

    revealEls.forEach(el => io.observe(el));
})();

// ─── HEADER SCROLL STATE ─────────────────────────────────────────────────────
(function initHeaderScroll() {
    const header   = qs('#site-header');
    const label    = qs('#header-scroll-label');

    // Glass-ify header on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            header.style.background = 'rgba(232, 234, 240, 0.85)';
            header.style.backdropFilter = 'blur(12px)';
            header.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
            if (label) label.classList.add('hidden');
        } else {
            header.style.background = '';
            header.style.backdropFilter = '';
            header.style.borderBottom = '';
            if (label) label.classList.remove('hidden');
        }
    }, { passive: true });
})();

// ─── CONTACT FORM — EmailJS Integration ──────────────────────────────────────
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  SETUP: To make the form send real emails to digiconsultpro@gmail.com: │
// │  1. Go to  https://www.emailjs.com  →  Create a FREE account           │
// │  2. Add a Gmail service → connect digiconsultpro@gmail.com             │
// │  3. Create an Email Template (use variable names below)                │
// │  4. Copy your Public Key, Service ID, and Template ID below            │
// └─────────────────────────────────────────────────────────────────────────┘
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'abc123XYZ'
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_xxxxxx'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xxxxxx'

(function initForm() {
    const form = qs('#contact-form');
    if (!form) return;

    // Initialise EmailJS with your public key
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const submitBtn  = qs('#form-submit');
        const origText   = submitBtn.innerHTML;

        // Button: loading state
        submitBtn.innerHTML  = 'SENDING… <span class="btn-dot"></span>';
        submitBtn.disabled   = true;
        submitBtn.style.opacity = '0.7';

        // Build template params matching EmailJS template variables
        const params = {
            from_name:    form.querySelector('#f-name').value,
            from_email:   form.querySelector('#f-email').value,
            phone:        form.querySelector('#f-phone').value || 'Not provided',
            service:      form.querySelector('#f-service').value || 'Not specified',
            message:      form.querySelector('#f-message').value,
            to_email:     'digiconsultpro@gmail.com',
            reply_to:     form.querySelector('#f-email').value,
        };

        try {
            if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
                // ── Real send via EmailJS ──
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
                submitBtn.innerHTML  = 'SENT ✓ <span class="btn-dot"></span>';
                submitBtn.style.background = '#22c55e';
                submitBtn.style.opacity    = '1';
                form.reset();
                setTimeout(() => {
                    submitBtn.innerHTML  = origText;
                    submitBtn.style.background = '';
                    submitBtn.disabled   = false;
                }, 4000);
            } else {
                // ── Fallback: open mail client if EmailJS not configured ──
                const subject  = encodeURIComponent(`New enquiry from ${params.from_name}`);
                const body     = encodeURIComponent(
                    `Name: ${params.from_name}\nEmail: ${params.from_email}\nPhone: ${params.phone}\nService: ${params.service}\n\nMessage:\n${params.message}`
                );
                window.location.href = `mailto:digiconsultpro@gmail.com?subject=${subject}&body=${body}`;
                submitBtn.innerHTML  = 'OPENING MAIL… <span class="btn-dot"></span>';
                submitBtn.style.background = '#4263eb';
                submitBtn.style.opacity    = '1';
                setTimeout(() => {
                    submitBtn.innerHTML  = origText;
                    submitBtn.style.background = '';
                    submitBtn.disabled   = false;
                }, 3000);
            }
        } catch (err) {
            console.error('EmailJS error:', err);
            submitBtn.innerHTML  = 'ERROR — TRY AGAIN <span class="btn-dot"></span>';
            submitBtn.style.background = '#ef4444';
            submitBtn.style.opacity    = '1';
            setTimeout(() => {
                submitBtn.innerHTML  = origText;
                submitBtn.style.background = '';
                submitBtn.disabled   = false;
                submitBtn.style.opacity = '1';
            }, 3500);
        }
    });
})();

// ─── PARALLAX HEADER ELEMENTS ─────────────────────────────────────────────────
(function initParallax() {
    const heroCanvas = qs('#hero-canvas');

    window.addEventListener('mousemove', e => {
        const xPct = (e.clientX / window.innerWidth  - 0.5) * 2;
        const yPct = (e.clientY / window.innerHeight - 0.5) * 2;

        if (heroCanvas) {
            heroCanvas.style.transform = `translate(${xPct * 8}px, ${yPct * 8}px) scale(1.05)`;
        }
    }, { passive: true });
})();

// ─── GSAP OPTIONAL ENHANCEMENTS ─────────────────────────────────────────────
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    // No fromTo/from calls here to avoid overriding the IntersectionObserver reveals
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
(function initCounters() {
    const counters = qsa('.results-num[data-target]');
    if (!counters.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = +el.dataset.target;
            const duration = 1800;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(ease * target);
                if (progress < 1) requestAnimationFrame(update);
            }

            requestAnimationFrame(update);
            io.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
})();

// ─── WHY CARDS REVEAL ────────────────────────────────────────────────────────
(function initWhyCards() {
    const cards = qsa('.why-card, .testi-card');
    cards.forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const siblings = [...el.parentElement.children];
                const idx = siblings.indexOf(el);
                setTimeout(() => {
                    el.style.opacity   = '1';
                    el.style.transform = 'translateY(0)';
                }, idx * 100);
                io.unobserve(el);
            }
        });
    }, { threshold: 0.12 });

    cards.forEach(el => io.observe(el));
})();

// ─── TOUCH FLIP FOR WORK CARDS (MOBILE RES) ──────────────────────────────────
(function initTouchFlip() {
    const workCards = qsa('.work-card');
    workCards.forEach(card => {
        card.addEventListener('click', () => {
            // Optional: Untoggle sibling cards if you only want 1 flipped at a time
            // workCards.forEach(c => { if(c !== card) c.classList.remove('flipped'); });
            
            card.classList.toggle('flipped');
        });
    });
})();
