/* =============================================
   CUSTOM CURSOR & GOLD TRAIL
   ============================================= */
(() => {
    // Don't run on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hide the default cursor
    document.documentElement.style.cursor = 'none';

    // --- Main dot ---
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let mouseX = -100, mouseY = -100;
    let rafPending = false; // dirty flag — only schedule a new frame when position changed

    // Track mouse position — passive: true lets the browser scroll freely without waiting for this handler
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Spawn a trail particle on every move
        if (!reduceMotion) spawnTrail(e.clientX, e.clientY);

        // Schedule a single repaint if one isn't already queued
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(animateDot);
        }
    }, { passive: true });

    // Shrink dot on clickable elements
    document.addEventListener('mouseover', e => {
        if (e.target.closest('a, button, .accordion-header, .faq-header, .service-card')) {
            dot.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest('a, button, .accordion-header, .faq-header, .service-card')) {
            dot.classList.remove('cursor-hover');
        }
    });

    // Animate the dot — only called when mouse actually moved
    function animateDot() {
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        rafPending = false; // allow next mousemove to schedule another frame
    }

    // --- Trail particles ---
    let lastTrailX = 0, lastTrailY = 0;

    function spawnTrail(x, y) {
        // Only spawn if moved enough (avoids flooding on tiny jitters)
        const dx = x - lastTrailX, dy = y - lastTrailY;
        if (Math.sqrt(dx*dx + dy*dy) < 10) return;
        lastTrailX = x; lastTrailY = y;

        const p = document.createElement('div');
        p.className = 'cursor-trail';

        // Slight random offset so particles fan out
        const ox = (Math.random() - 0.5) * 10;
        const oy = (Math.random() - 0.5) * 10;
        const size = 6 + Math.random() * 8;

        p.style.cssText = `
            left: ${x}px;
            top:  ${y}px;
            width:  ${size}px;
            height: ${size}px;
            margin-left: ${ox}px;
            margin-top:  ${oy}px;
        `;

        document.body.appendChild(p);

        // Trigger fade-out then remove
        requestAnimationFrame(() => p.classList.add('cursor-trail--fade'));
        setTimeout(() => p.remove(), 700);
    }
})();


/* =============================================
   SMOOTH PAGE TRANSITIONS
   ============================================= */
(() => {
    const overlay = document.getElementById('pageTransition');
    if (!overlay) return;

    // Fade in on arrival — remove the overlay
    window.addEventListener('load', () => {
        overlay.classList.remove('active');
    });

    // Intercept same-origin link clicks that go to a different page
    document.addEventListener('click', e => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip: hash-only, external, new-tab, or non-html links
        const isExternal  = link.hostname !== window.location.hostname;
        const isHash      = href.startsWith('#');
        const isNewTab    = link.target === '_blank';
        const isNonPage   = /\.(pdf|jpg|jpeg|png|zip)$/i.test(href);
        // Same-page anchor written as a path (e.g. "index.html#booking" while on index) — let it scroll
        const isSamePage  = link.pathname === window.location.pathname && link.hash;
        if (isExternal || isHash || isNewTab || isNonPage || isSamePage) return;

        e.preventDefault();
        overlay.classList.add('active');

        setTimeout(() => {
            window.location.href = href;
        }, 480);
    });

    // On back/forward — ensure overlay is cleared
    window.addEventListener('pageshow', e => {
        if (e.persisted) overlay.classList.remove('active');
    });
})();


document.addEventListener('DOMContentLoaded', () => {

    /* =============================================
       STICKY NAV — adds .scrolled class on scroll
       ============================================= */
    const navbar = document.getElementById('navbar');

    // passive: true tells the browser this handler won't block scrolling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });


    /* =============================================
       HAMBURGER MENU
       ============================================= */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    function setMenu(open) {
        hamburger.classList.toggle('open', open);
        navLinks.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));

    // Close mobile menu when any nav link is clicked, or on Escape
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) setMenu(false);
    });


    /* =============================================
       ACCORDIONS — services cards & FAQ cards
       ============================================= */
    function setupAccordion(cardSel, headerSel, contentSel, extra) {
        const cards = document.querySelectorAll(cardSel);
        if (!cards.length) return;

        const close = card => {
            card.classList.remove('active');
            card.querySelector(headerSel).setAttribute('aria-expanded', 'false');
            card.querySelector(contentSel).style.maxHeight = null;
        };

        cards.forEach(card => {
            const header  = card.querySelector(headerSel);
            const content = card.querySelector(contentSel);

            // Headers are divs — give them button semantics so keyboard & screen reader users can open them
            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            header.setAttribute('aria-expanded', 'false');

            const toggle = () => {
                // Close any other open card
                cards.forEach(other => {
                    if (other !== card && other.classList.contains('active')) close(other);
                });

                if (card.classList.contains('active')) {
                    close(card);
                } else {
                    card.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = content.scrollHeight + extra + 'px';
                }
            };

            header.addEventListener('click', toggle);
            header.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            });
        });

        // Text reflows on rotate/resize — re-measure the open card so nothing gets clipped
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                cards.forEach(card => {
                    if (!card.classList.contains('active')) return;
                    const content = card.querySelector(contentSel);
                    content.style.maxHeight = content.scrollHeight + extra + 'px';
                });
            }, 150);
        }, { passive: true });
    }

    setupAccordion('.service-card', '.accordion-header', '.accordion-content', 40);
    setupAccordion('.faq-card', '.faq-header', '.faq-body', 32);


    /* =============================================
       LAZY THIRD-PARTY WIDGETS — Instagram gallery & Calendly
       Neither loads until its section is close to the screen,
       so the first paint isn't waiting on heavy external scripts.
       ============================================= */
    function loadScript(src, isModule) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            if (isModule) s.type = 'module';
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function whenNear(el, callback) {
        if (!el) return;
        if (!('IntersectionObserver' in window)) return callback();
        const io = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                io.disconnect();
                callback();
            }
        }, { rootMargin: '800px 0px' });
        io.observe(el);
    }

    whenNear(document.querySelector('behold-widget'), () => {
        loadScript('https://w.behold.so/widget.js', true).catch(() => {});
    });

    const calendly = document.getElementById('calendlyEmbed');
    whenNear(calendly, () => {
        loadScript('https://assets.calendly.com/assets/external/widget.js')
            .then(() => {
                window.Calendly.initInlineWidget({
                    url: calendly.dataset.url,
                    parentElement: calendly
                });
            })
            .catch(() => {
                // Blocked or offline — give visitors a direct link instead of an empty box
                calendly.style.height = 'auto';
                calendly.innerHTML = '<p class="calendly-fallback">The booking calendar couldn\'t load. ' +
                    '<a href="https://calendly.com/polishedbygissella" target="_blank" rel="noopener noreferrer">Open it in a new tab</a> ' +
                    'or DM me on Instagram.</p>';
            });
    });


    /* =============================================
       SCROLL FADE-IN — IntersectionObserver
       ============================================= */
    const fadeSections = document.querySelectorAll('.fade-in-section');

    // Old browsers: just show everything rather than leaving sections invisible
    if (!('IntersectionObserver' in window)) {
        fadeSections.forEach(section => section.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    fadeSections.forEach(section => observer.observe(section));

});
