/* =============================================
   CUSTOM CURSOR & GOLD TRAIL
   ============================================= */
(() => {
    // Don't run on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Hide the default cursor
    document.documentElement.style.cursor = 'none';

    // --- Main dot ---
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let mouseX = -100, mouseY = -100;

    // Track mouse position
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Spawn a trail particle on every move
        spawnTrail(e.clientX, e.clientY);
    });

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

    // Animate the dot
    function animateDot() {
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateDot);
    }
    animateDot();

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
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip: hash-only, external, new-tab, or non-html links
        const isExternal  = link.hostname !== window.location.hostname;
        const isHash      = href.startsWith('#');
        const isNewTab    = link.target === '_blank';
        const isNonPage   = /\.(pdf|jpg|jpeg|png|zip)$/i.test(href);
        if (isExternal || isHash || isNewTab || isNonPage) return;

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

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    /* =============================================
       HAMBURGER MENU
       ============================================= */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu when any nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });


    /* =============================================
       ACCORDION — services section
       ============================================= */
    const cards = document.querySelectorAll('.service-card');

    cards.forEach(card => {
        const header  = card.querySelector('.accordion-header');
        const content = card.querySelector('.accordion-content');

        header.addEventListener('click', () => {
            // Close any other open card
            cards.forEach(other => {
                if (other !== card && other.classList.contains('active')) {
                    other.classList.remove('active');
                    other.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            card.classList.toggle('active');

            if (card.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 40 + 'px';
            } else {
                content.style.maxHeight = null;
            }
        });
    });


    /* =============================================
       SCROLL FADE-IN — IntersectionObserver
       ============================================= */
    const fadeSections = document.querySelectorAll('.fade-in-section');

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
