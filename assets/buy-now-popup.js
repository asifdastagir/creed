class PromoPopup extends HTMLElement {
	constructor() {
		super();
		const tpl = document.querySelector('#promo-popup');
		if (tpl) {
			const  clone = document.importNode(tpl.content, true);
			this.appendChild(clone);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'title':
				const pnName = this.querySelector('.js-pn-name');
				pnName.innerText = (pnName.dataset.truncate &&  newValue.length > pnName.dataset.truncate) ? newValue.substring(0, pnName.dataset.truncate) + '...' : newValue;
				this.querySelector('.js-pn-link')?.setAttribute('title', newValue);
				this.querySelector('.js-pn-image')?.setAttribute('alt', newValue);
				break;
			case 'image':
				const quickVew = this.querySelector('quickview-popup');
				if (newValue != false) {
					if (document.querySelector('.js-pn')) document.querySelector('.js-pn')?.classList.remove('payment-notification--image-off');
					const img = this.querySelector('.js-pn-image');
					if (img) {
						img.removeAttribute('src');
						img.setAttribute('data-src', newValue);
						img.classList.remove('lazyload');
						img.classList.remove('lazyloaded');
					}
					if (quickVew && this.closest('.payment-notification-wrap').getAttribute('data-gallery') == 'true') {
						quickVew.setAttribute('data-gallery', 'on')
					} else if (quickVew) quickVew.setAttribute('data-gallery', 'off');
				} else {
					document.querySelector('.js-pn')?.classList.add('payment-notification--image-off');
					if (quickVew) quickVew.setAttribute('data-gallery', 'off');
				}
				this.querySelectorAll('.image-container > img').length > 1 && this.querySelector('.image-container > img:nth-child(2)').remove();
				break;
			case 'image_hover':
				if (newValue != false) {
					const img = new Image();
					img.setAttribute('data-src', newValue);
					img.setAttribute('alt', this.querySelector('.js-pn-image').getAttribute('alt'));
					this.querySelector('.image-container')?.appendChild(img);
					this.querySelector('.image-container')?.classList.remove('image-hover-scale')
				} else {
					this.querySelector('.image-container')?.classList.add('image-hover-scale')
				}
				break;
			case 'url':
				this.querySelectorAll('.js-pn-link').forEach(
					(link) => link.setAttribute('href', newValue)
				);
				let quickViewSuffix = newValue.includes('_pos') ? '&' : '?';
				this.querySelector('quickview-popup')?.setAttribute('data-ajax', newValue + quickViewSuffix + 'section_id=quick-view');
				break;
			case 'handle':
				this.querySelector('quickview-popup')?.setAttribute('data-handle', newValue);
				break;
			case 'time':
				this.querySelector('.js-pn-time').innerText = newValue;
				break;
			case 'from':
				this.querySelector('.js-pn-from').innerText = newValue;
				break;
			case 'label_new':
				if (newValue != false) {
					this.querySelector('.payment-label--new').classList.remove('d-none');
					this.querySelector('.payment-label--new').innerText = newValue;
				} else {
					this.querySelector('.payment-label--new').classList.add('d-none');
				}
				break;
			case 'label_sale':
				if (newValue != false) {
					this.querySelector('.payment-label--sale').classList.remove('d-none')
				} else {
					this.querySelector('.payment-label--sale').classList.add('d-none')
				}
				break;
		}
	}

	static get observedAttributes() {
		return ['title', 'image', 'image_hover', 'url', 'handle', 'time', 'from', 'label_new', 'label_sale'];
	}
}
customElements.define('promo-popup', PromoPopup);

const random = function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getSizedImageUrl(src, size) {
	if (size === null || !document.body.classList.contains('shopify-theme')) {
		return src;
	} else if (src === null) {
		return null;
	} else return src + '&width=' + size;
}

const popup = new PromoPopup();
const popupWrap = document.querySelector('.payment-notification-wrap');

if (popupWrap) {
	popupWrap.querySelector('.js-pn').append(popup);
	const productJson = JSON.parse(popupWrap.querySelector('[type="application/json"]').textContent);
	const paymentNotification = {
		init() {
			this.destroyed = false;
			this.paymentNotification = document.querySelector('.js-pn');
			this.fromArray = this.paymentNotification.dataset.from.split(",");
			this.maxAgoMin = this.paymentNotification.dataset.max ? this.paymentNotification.dataset.max : 59;
			this.minAgoMin = this.paymentNotification.dataset.min ? this.paymentNotification.dataset.visibleTime : 5;
			this.paymentNotificationVisible = this.paymentNotification.dataset.visibleTime ? parseInt(this.paymentNotification.dataset.visibleTime,10) : 5000; /* min 2000 */
			this.paymentNotificationDelay = this.paymentNotification.dataset.delay ? parseInt(this.paymentNotification.dataset.delay,10) : 12000;
			this.paymentNotificationPeriod = this.paymentNotification.dataset.hiddenTime ? parseInt(this.paymentNotification.dataset.hiddenTime,10) : 10000;
			this.classOpen = 'payment-notification--open';
			this.btnClose = document.querySelector('.js-payment-notification-close');
			let random = Math.floor(Math.random() * productJson.title.length);
			this._setData(random);
			setTimeout(() => {
				this.showPopup();
				this.timeout = setInterval(() => {
					this.showPopup()
				}, this.paymentNotificationVisible + this.paymentNotificationPeriod);
			}, this.paymentNotificationDelay)
			this.btnClose.addEventListener('click', (e) => {
				e.preventDefault();
				this._hidePaymentNotification();
				if (this.paymentNotification.getAttribute('data-close')) {
					this.destroy();
				}
			})
		},
		showPopup() {
			const cookieBanner = document.querySelector('#pandectes-banner');
			if (!window.matchMedia(`(max-width:1024px)`).matches || !cookieBanner || cookieBanner.style.display == 'none') {
				const random = Math.floor(Math.random() * productJson.title.length);
				this.paymentNotification.classList.add(this.classOpen);
				this.paymentNotification.querySelectorAll('img').forEach(img => {
					img.classList.add('lazyload')
				});
				delay(this.paymentNotificationVisible).then(() => {
					if (this.destroyed) return;
					this._hidePaymentNotification();
					setTimeout(() => {
						this._setData(random)
					}, this.paymentNotificationPeriod / 2)
				})
			}
		},
		destroy() {
			this.hideTippy();
			this.paymentNotification.remove();
			if (this.timeout) clearInterval(this.timeout);
			this.destroyed = true;
			document.querySelector('#promo-popup')?.remove();
		},
		_hidePaymentNotification() {
			this.hideTippy();
			this.paymentNotification.classList.remove(this.classOpen)
		},
		hideTippy(){
			const tippyNode = this.paymentNotification.querySelector('quickview-popup');
			if (tippyNode && tippyNode._tippy) tippyNode._tippy.hide();
		},
		setCities(list) {
			this.defaults.fromArray = list
		},
		_setData(i) {
			const nameString = window.themeStrings.new || 'new',
				labelNew = productJson.tags[i].includes(nameString) || productJson.tags[i].includes(window.themeStrings.new.toLowerCase()) ? nameString : 0;
			let opt = {
				'title': productJson.title[i],
				'image': productJson.image[i] == null ? 0 : getSizedImageUrl(productJson.image[i].preview_image.src, 106 * 2),
				'image_hover': productJson.images[i][1] ? getSizedImageUrl(productJson.images[i][1], 106 * 2) : 0,
				'url': productJson.url[i],
				'handle': productJson.handle[i],
				'from': this.fromArray[random(0, this.fromArray.length)],
				'time': random(this.minAgoMin, this.maxAgoMin),
				'label_new': labelNew,
				'label_sale': productJson.price_old[i] == null ? 0 : 1,
			};
			Object.keys(opt).forEach(function (key) {
				popup.setAttribute(key, opt[key])
			});
		},
		_showPaymentNotification() {
			this.paymentNotification.classList.add(this.classOpen)
		}
	}
	paymentNotification.init()
}
