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
			this.openNewsletterPopup();
		}
	},
	openNewsletterPopup() {
		const pause = this.newsletter.getAttribute('data-pause') > 0 ? this.newsletter.getAttribute('data-pause') : 2000;
		const openPopup = () => {
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
				}
			})
		};
		setTimeout(() => {
			const interval = setInterval(function() {
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
