const supportPageOffset = window.pageXOffset !== undefined,
	isCSS1Compat = ((document.compatMode || "") === "CSS1Compat"),
	scrollToTopBtn = document.querySelector('.js-back-to-top'),
	mobileBottom = document.querySelector('.hdr-mobile-bottom'),
	scrollSpeed = 500;

function scrollToTopHandler(e) {
	e && e.preventDefault();
	this.blur();
	document.body.dataset.scrolling = true;
	document.body.classList.add('blockSticky');
	smoothScrollTo(0, scrollSpeed);
	if (document.body.classList.contains('has-hdr_sticky') && customElements.get('header-sticky')) document.body.querySelector('header-sticky')?.destroySticky();
	setTimeout(function () {
		delete document.body.dataset.scrolling;
		document.body.classList.remove('blockSticky');
		if (window.matchMedia(`(max-width:1024px)`).matches && mobileBottom) {
			document.body.classList.add('has-mobile-bottom');
			mobileBottom.classList.remove('scroll-down');
		}
	}, scrollSpeed)
}

const appElementList = ["#smile-ui-container", "#shopify-chat-dummy", "#shopify-chat", "#dummy-chat-button-iframe"];
const appElementHigherList = [];

document.addEventListener('DOMContentLoaded', () => {
	scrollToTopBtn?.addEventListener('click', scrollToTopHandler.bind(this));
})

if (scrollToTopBtn) {
	const svgProgress = scrollToTopBtn.querySelector('.svg-progress');
	window.addEventListener('scroll', function () {
		if (svgProgress) {
			document.body.style.setProperty("--scroll-progress", `${Math.round((document.documentElement.scrollTop * 100) / (document.documentElement.scrollHeight - document.documentElement.clientHeight))}%`);
		}
		const cookieBanner = document.querySelector('#pandectes-banner'),
			cookieBannerVisible = cookieBanner && !cookieBanner.style.display == 'none' && !cookieBanner.classList.contains('cc-invisible'),
			wHeight = window.innerHeight;
		if (!window.matchMedia(`(max-width:1024px)`).matches || !cookieBannerVisible) {
			let scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
			if (scrollTop > wHeight) {
				if (window.matchMedia(`(max-width:360px)`).matches) {
					if ((document.body.clientHeight - document.querySelector('.page-footer').clientHeight) >= scrollTop && scrollTop < (document.body.scrollHeight - wHeight - 10)) {
						scrollToTopBtn.classList.add('is-visible')
					} else {
						scrollToTopBtn.classList.remove('is-visible')
					}
				} else {
					scrollToTopBtn.classList.add('is-visible')
				}
				if (appElementList.filter(selector => document.querySelector(selector)).length > 0) document.body.classList.add('has-shopify-chat');
				if (appElementHigherList.filter(selector => document.querySelector(selector)).length > 0) document.body.classList.add('has-chat-higher');
			} else {
				scrollToTopBtn.classList.remove('is-visible')
			}
		} else {
			scrollToTopBtn.classList.remove('is-visible')
		}
	})
}
