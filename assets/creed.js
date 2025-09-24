// Check if device is mobile/tablet for performance optimization
const isMobile = window.matchMedia('(max-width: 1024px)').matches;
const isTouch = 'ontouchstart' in window;

// Init Lenis with optimized settings
const lenis = new Lenis({
    duration: isMobile ? 0.8 : 1.2, // Shorter duration on mobile
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
    smooth: true,
    smoothTouch: !isTouch, // Disable on touch devices for better performance
    touchMultiplier: 2,
    infinite: false,
    syncTouch: false, // Better mobile experience
    syncTouchLerp: 0.1,
    __iosNoInertiaTouchstart: true // Better iOS experience
});

// Hook Lenis with requestAnimationFrame
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// GSAP setup
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);

// Stop Lenis during resize to prevent issues
let resizeTimer;
window.addEventListener('resize', () => {
    lenis.stop();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        lenis.start();
    }, 200);
});

// Handle anchor links with Lenis (only for links not handled by existing system)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link && !link.classList.contains('js-scroll-to') && !link.classList.contains('js-scroll-to-bottom')) {
        const href = link.getAttribute('href');
        const target = document.querySelector(href);

        if (target && href !== '#') {
            e.preventDefault();

            // Calculate offset for sticky header
            const headerWrap = document.querySelector('.hdr-wrap');
            const headerSticky = document.querySelector('.hdr-content-sticky');
            let offset = 0;

            if (headerWrap) {
                offset = window.matchMedia(`(max-width:1024px)`).matches
                    ? headerWrap.offsetHeight
                    : (headerSticky ? headerSticky.offsetHeight : 0);
            }

            // Use Lenis scrollTo for smooth animation
            lenis.scrollTo(target, {
                offset: -offset,
                duration: isMobile ? 0.8 : 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    }
});

// Expose lenis globally for integration with existing code
window.lenis = lenis;

// Add method to scroll to top smoothly
window.scrollToTop = () => {
    lenis.scrollTo(0, {
        duration: isMobile ? 0.6 : 1.0
    });
};

// Loop through each section and animate independently
gsap.utils.toArray(".component-animation").forEach(section => {
    const img = section.querySelector("img");
    const id = section.id; // unique section id

    gsap.fromTo(
        img,
        { yPercent: -20, force3D: true },
        {
            yPercent: 20,
            ease: "none",
            force3D: true,
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                id: id // helps debugging
            },
        }
    );
});


gsap.fromTo(".textAndParallaxComponent .col-span-4:last-child img",
    { yPercent: 0, force3D: true },
    {
        yPercent: -250,
        ease: "none",
        force3D: true,
        scrollTrigger: {
            trigger: ".textAndParallaxComponent",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    }
);

gsap.fromTo(".textAndParallaxComponent .col-span-4:nth-child(2) img",
    { yPercent: 0, force3D: true },
    {
        yPercent: -150,
        ease: "none",
        force3D: true,
        scrollTrigger: {
            trigger: ".textAndParallaxComponent",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    }
);







ScrollTrigger.matchMedia({

    // Desktop & Tablet ≥768px
    "(min-width: 768px)": function () {

        gsap.fromTo(
            ".textPromoComponent h2 > span:nth-child(1)",
            { y: -450 },
            {
                y: 350,
                ease: "none",
                scrollTrigger: {
                    trigger: ".textPromoComponent",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    id: "promo-span-1"
                }
            }
        );

        gsap.fromTo(
            ".textPromoComponent h2 > span:last-child",
            { yPercent: 350 },
            {
                yPercent: -350,
                ease: "none",
                scrollTrigger: {
                    trigger: ".textPromoComponent",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    id: "promo-span-2"
                }
            }
        );

        gsap.fromTo(".text-parallax-copy",
            { yPercent: 0, force3D: true },
            {
                yPercent: 200,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                    trigger: ".textAndParallaxComponent",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );

    },

    // Mobile <768px
    "(max-width: 767px)": function () {
        // Kill only the textPromoComponent animations
        ScrollTrigger.getAll().forEach(st => {
            if (st.vars?.id === "promo-span-1" || st.vars?.id === "promo-span-2") {
                st.kill();
            }
        });

        // Reset transforms (important so text isn't stuck offset)
        gsap.set(".textPromoComponent h2 > span:nth-child(1)", { clearProps: "all" });
        gsap.set(".textPromoComponent h2 > span:last-child", { clearProps: "all" });
    }

});

gsap.fromTo("#Footer-footer",
    { opacity: 0, yPercent: 12 },
    {
        opacity: 1,
        yPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "main",          // section above footer
            start: "bottom bottom",   // when main ends & viewport bottom meet
            end: "bottom center",     // animate while scrolling a bit further
            scrub: true,
            // markers: true
        }
    }
);

gsap.fromTo(
    ".hero-video-section .clip-container",
    { "--hero-opacity": 1 },   // starting value
    {
        "--hero-opacity": 0,     // ending value
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-video-section",
            start: "top top",     // start when hero enters
            end: "bottom top",    // end when hero leaves top
            scrub: true,
            // markers: true
        }
    }
);


document.addEventListener('DOMContentLoaded', function () {


    var swiper = new Swiper('.product-swiper', {
        slidesPerView: 1,
        spaceBetween: 16,
        breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    const swiperStory = new Swiper('.story-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 24,
        freeMode: true,
        navigation: {
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 0,
            },
            768: {
                slidesPerView: 2.5,
                spaceBetween: 0,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 0,
            },
            1280: {
                slidesPerView: 3.5,
                spaceBetween: 0,
            }
        }
    });
});



