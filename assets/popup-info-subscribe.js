const newsletterPopup = {
	init(selector) {
		this.modalClass = selector;
		this.newsletter = document.querySelector(this.modalClass);
		this.modalEffect = this.newsletter.getAttribute('data-effect') || 'material-out';
		this.errorClass = 'newslettermodal-error';
		this.successClass = 'newslettermodal-off';
		this.errorPopup = '#popupSubscribeError';
		this.successPopup = '#popupSubscribeSuccess';
		this.offCheckbox = document.body.querySelector('#offNewsletterCheckbox');
		this.scrollbarNewsletter;
		this.expiresToSec = parseInt(this.newsletter.getAttribute('data-expires'), 10) * 86400;
		const uri = window.location.toString();
		if (this.newsletter.getAttribute('data-only-index') == 'true' && !document.body.classList.contains('template-index')) {
			return false;
		}
		if (uri.indexOf("?customer_posted=true") > 0) {
			this.setCookie()
		} else this.checkCookie();
		this.checkBoxOff();
	},
	checkBoxOff() {
		this.offCheckbox?.addEventListener('change', () => {
			if (this.offCheckbox.checked) {
				this.setCookie()
			} else {
				docCookies.removeItem('lumiaNewsLetter');
			}
		})
	},
	openError() {
		jq_lumia.fancybox.open({
			src: this.errorPopup,
			type: 'inline',
			afterClose: () => {
				let top = document.querySelector('.page-footer') ? document.querySelector('.page-footer').offsetTop : document.body.scrollHeight;
				top && smoothScrollTo(top, 1000);
				history.replaceState && history.replaceState(
					null, '', location.pathname + location.search.replace(/[\?&][^&]+/, '').replace(/^&/, '?')
				)
			}
		})
	},
	openSuccess() {
		jq_lumia.fancybox.open({
			src: this.successPopup,
			type: 'inline',
			afterClose: () => {
				if (window.location.toString().indexOf("?customer_posted=true") > 0) {
					history.replaceState && history.replaceState(
						null, '', location.pathname + location.search.replace(/[\?&]customer_posted=[^&]+/, '').replace(/^&/, '?')
					);
				}
			}
		})
	},
	setCookie() {
		if (this.expiresToSec != 0) {
			docCookies.setItem('lumiaNewsLetter', '', this.expiresToSec);
		}
	},
	setCookieSuccess(days) {
		if (days) {
			docCookies.setItem('lumiaNewsLetterSuccess', '', parseInt(days, 10) * 86400);
		}
	},
	checkCookie() {
		if (!docCookies.hasItem('lumiaNewsLetter') || document.body.classList.contains('demo') || this.expiresToSec == 0) {
			// Show floating button instead of opening popup automatically
			this.showFloatingButton();
		}
	},
	showFloatingButton() {
		const floatingBtn = document.getElementById('newsletter-floating-btn');
		if (floatingBtn) {
			floatingBtn.style.display = 'flex';
		}
	},
	openNewsletterModalDirectly() {
		if (!this.newsletter) return;
		jq_lumia.fancybox.open([{
			src: this.modalClass,
			type: 'inline',
			animationEffect: this.modalEffect,
			animationDuration: 300,
			keys: {
				close: [27]
			}
		}], {
			beforeShow: () => {
				document.querySelectorAll('main-slider').forEach(slider => slider.stopAutoplay())
				// Hide floating button when modal opens
				const floatingBtn = document.getElementById('newsletter-floating-btn');
				if (floatingBtn) {
					floatingBtn.style.display = 'none';
				}
			},
			afterShow: () => {
				scrollbarNewsletter = Scrollbar.init(this.newsletter.querySelector('.js-dropdn-content-scroll'), {
					alwaysShowTracks: true,
					damping: document.body.dataset.damping
				});
				const searchInput = document.querySelector('search-toggle-mobile');
				if (searchInput && 'blurInput' in searchInput) searchInput.blurInput();
				this.newsletter.classList.add('is-animate');
				bodyScrollLock.disableBodyScroll(this.newsletter);
			},
			beforeClose: () => {
				bodyScrollLock.enableBodyScroll(this.newsletter);
				this.newsletter.classList.remove('is-animate');
			},
			afterClose: () => {
				this.scrollbarNewsletter ? this.scrollbarNewsletter.setPosition(0, 0) : false;
				document.querySelectorAll('main-slider').forEach(slider => slider.startAutoplay());
				// Show floating button when modal closes (reset dismissal state)
				const floatingBtn = document.getElementById('newsletter-floating-btn');
				if (floatingBtn) {
					floatingBtn.removeAttribute('data-dismissed');
					floatingBtn.style.display = 'flex';
				}
			}
		});
	},
	openNewsletterPopup() {
		const pause = this.newsletter.getAttribute('data-pause') > 0 ? this.newsletter.getAttribute('data-pause') : 2000;
		const openPopup = () => {
			this.openNewsletterModalDirectly();
		};
		setTimeout(() => {
			const interval = setInterval(function () {
				if (!document.body.classList.contains('fancybox-active')) {
					clearInterval(interval);
					openPopup();
				}
			}, 500);
		}, pause);
		setTimeout(() => {
			if (document.body.classList.contains('newslettermodal-off')) {
				this.setCookie()
			}
		}, pause * 2);
	}
}
const newsmodalSelector = '.js-newslettermodal';

if (document.querySelector(newsmodalSelector)) {
	newsletterPopup.init(newsmodalSelector)
}

// Floating button functionality
document.addEventListener('DOMContentLoaded', function () {
	const floatingBtn = document.getElementById('newsletter-floating-btn');
	const floatingBtnOpen = document.getElementById('newsletter-floating-btn-open');
	const floatingBtnClose = document.getElementById('newsletter-floating-btn-close');
	const newsmodalSelector = '.js-newslettermodal';

	if (!floatingBtn || !floatingBtnOpen || !floatingBtnClose) {
		return;
	}

	// Open modal when button is clicked
	floatingBtnOpen.addEventListener('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (typeof newsletterPopup !== 'undefined' && newsletterPopup.newsletter) {
			newsletterPopup.openNewsletterModalDirectly();
		}
	});

	// Hide button when close icon is clicked (but it will reappear when modal closes again)
	floatingBtnClose.addEventListener('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		floatingBtn.style.display = 'none';
		// Store dismissal state temporarily (will be reset when modal closes)
		floatingBtn.setAttribute('data-dismissed', 'true');
	});

	// Listen for Fancybox close events to show button when modal closes
	if (typeof jq_lumia !== 'undefined' && jq_lumia.fancybox) {
		jq_lumia(document).on('afterClose.fb', function (e, instance, slide) {
			// Check if the closed modal is the newsletter modal
			if (slide && slide.$content && slide.$content.hasClass('js-newslettermodal')) {
				// Show floating button when modal closes (reset dismissal state)
				if (floatingBtn) {
					floatingBtn.removeAttribute('data-dismissed');
					floatingBtn.style.display = 'flex';
				}
			}
		});

		// Also listen for beforeShow to hide button when modal opens
		jq_lumia(document).on('beforeShow.fb', function (e, instance, slide) {
			// Check if the opening modal is the newsletter modal
			if (slide && slide.$content && slide.$content.hasClass('js-newslettermodal')) {
				// Hide floating button when modal opens
				if (floatingBtn) {
					floatingBtn.style.display = 'none';
				}
			}
		});
	}
});
