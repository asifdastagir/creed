// Hero Video Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const heroSections = document.querySelectorAll('.hero-video-section');

    heroSections.forEach(function(section) {
        const videos = section.querySelectorAll('video');
        const overlay = section.querySelector('.after\\:bg-black\\/30');

        // Handle video loading
        videos.forEach(function(video) {
            // Add loaded class when video can play
            video.addEventListener('canplay', function() {
                this.classList.add('loaded');
            });

            // Handle video errors
            video.addEventListener('error', function() {
                console.warn('Video failed to load:', this.src);
                // Fallback to poster image if available
                if (this.poster) {
                    this.style.display = 'none';
                    // Create fallback image
                    const fallbackImg = document.createElement('img');
                    fallbackImg.src = this.poster;
                    fallbackImg.alt = 'Hero image';
                    fallbackImg.className = 'w-full h-full object-cover';
                    this.parentNode.appendChild(fallbackImg);
                }
            });

            // Pause video when not in viewport for performance
            const videoObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        if (video.paused) {
                            video.play().catch(function(error) {
                                console.log('Video autoplay failed:', error);
                            });
                        }
                    } else {
                        if (!video.paused) {
                            video.pause();
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            videoObserver.observe(video);
        });

        // Add scroll-based opacity effect
        let ticking = false;

        function updateHeroOpacity() {
            const rect = section.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const sectionTop = rect.top + scrollTop;
            const sectionHeight = rect.height;
            const scrollProgress = (scrollTop - sectionTop) / sectionHeight;

            // Calculate opacity based on scroll position
            let opacity = 1;
            if (scrollProgress > 0 && scrollProgress < 1) {
                opacity = 1 - (scrollProgress * 0.3); // Reduce opacity by 30% max
            }

            section.style.setProperty('--hero-opacity', Math.max(0.7, opacity));
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateHeroOpacity);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });

        // Add parallax effect to plus icons
        const plusIcons = section.querySelectorAll('svg');

        function updateParallax() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionHeight = rect.height;
            const scrollProgress = (scrollTop - sectionTop) / sectionHeight;

            plusIcons.forEach(function(icon, index) {
                const speed = 0.1 + (index * 0.05); // Different speed for each icon
                const translateY = scrollProgress * speed * 100;
                icon.style.transform = `translateX(-50%) translateY(${translateY}px)`;
            });
        }

        let parallaxTicking = false;

        function requestParallaxTick() {
            if (!parallaxTicking) {
                requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        }

        window.addEventListener('scroll', requestParallaxTick, { passive: true });

        // Add hover effects to plus icons
        plusIcons.forEach(function(icon) {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(-50%) scale(1.2)';
            });

            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(-50%) scale(1)';
            });
        });

        // Optimize video performance
        function optimizeVideoPerformance() {
            videos.forEach(function(video) {
                // Reduce video quality on mobile for better performance
                if (window.innerWidth <= 768) {
                    video.setAttribute('playsinline', '');
                    video.setAttribute('muted', '');
                    video.setAttribute('preload', 'metadata');
                }

                // Add loading="lazy" for better performance
                video.setAttribute('loading', 'lazy');
            });
        }

        // Call optimization function
        optimizeVideoPerformance();

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                optimizeVideoPerformance();
            }, 250);
        });
    });

    // Add smooth scroll for any anchor links in the hero
    const heroLinks = document.querySelectorAll('.hero-video-section a[href^="#"]');
    heroLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            const heroSection = document.querySelector('.hero-video-section');
            if (heroSection && heroSection.getBoundingClientRect().top === 0) {
                e.preventDefault();
                const nextSection = heroSection.nextElementSibling;
                if (nextSection) {
                    nextSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }
    });

    // Performance optimization: Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--hero-opacity', '1');
        const plusIcons = document.querySelectorAll('.hero-video-section svg');
        plusIcons.forEach(function(icon) {
            icon.style.transition = 'none';
            icon.style.animation = 'none';
        });
    }

    // Add loading indicator
    function addLoadingIndicator(section) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'video-loading absolute inset-0 flex items-center justify-center bg-black text-white z-20';
        loadingDiv.innerHTML = `
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p class="text-sm">Loading video...</p>
      </div>
    `;

        section.appendChild(loadingDiv);

        // Remove loading indicator when video loads
        const videos = section.querySelectorAll('video');
        let loadedVideos = 0;

        videos.forEach(function(video) {
            video.addEventListener('loadeddata', function() {
                loadedVideos++;
                if (loadedVideos === videos.length) {
                    loadingDiv.style.opacity = '0';
                    setTimeout(function() {
                        loadingDiv.remove();
                    }, 500);
                }
            });
        });
    }

    // Add loading indicators to all hero sections
    heroSections.forEach(addLoadingIndicator);
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}