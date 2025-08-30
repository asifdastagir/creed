// Init Lenis
const lenis = new Lenis({
    duration: 1.2,
    smooth: true
});

// Hook Lenis with requestAnimationFrame
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// Gsap

// GSAP setup
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);

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


gsap.fromTo("#textAndParallaxComponent .col-span-4:last-child img", { yPercent: 0, force3D: true }, {
    yPercent: -200,
    ease: "none",
    force3D: true,
    scrollTrigger: {
        trigger: "#textAndParallaxComponent",
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
}
);

gsap.fromTo("#textAndParallaxComponent .col-span-4:nth-child(2) img", { yPercent: 0, force3D: true }, {
    yPercent: -100,
    ease: "none",
    force3D: true,
    scrollTrigger: {
        trigger: "#textAndParallaxComponent",
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
}
);

gsap.fromTo(
    "#textPromoComponent h2 > span:nth-child(1)",
    { y: 30 }, // start at +400px
    {
        y: -600, // end at -400.5px
        ease: "none",
        scrollTrigger: {
            trigger: "#textPromoComponent",
            start: "top bottom",   // when section top hits bottom of viewport
            end: "bottom top",     // when section bottom hits top of viewport
            scrub: true,

        }
    }
);


gsap.fromTo(
    "#textPromoComponent h2 > span:last-child",
    { yPercent: 0 },
    {
        yPercent: 500,
        ease: "none",
        scrollTrigger: {
            trigger: "#textPromoComponent",
            start: "top bottom",   // when section top hits bottom of viewport
            end: "bottom top",     // when section bottom hits top of viewport
            scrub: true,

        }
    }
);

gsap.fromTo("footer.sticky",
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
            markers: true
        }
    }
);