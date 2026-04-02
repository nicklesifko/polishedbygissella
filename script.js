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
