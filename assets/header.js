const mobileBreakpoint = 1024;

document.addEventListener('click', function(e) {
	const target = e.target,
		lastFancybox = [...document.querySelectorAll('.fancybox-container:not(.fancybox-gallery)')].pop();
	if (lastFancybox) {
		if (lastFancybox.querySelector('.fancybox-slide--current')?.contains(target) && !lastFancybox.querySelector('.fancybox-slide--current .fancybox-content')?.contains(target)) jq_lumia(target).closest('.fancybox-container')?.data('FancyBox').close()
	}
})

class Popup extends HTMLElement {
	constructor() {
		super();
		this.popupSelector = this.dataset.selector;
		this.cloneSelector = document.querySelector(this.dataset.clone);
		this.popupElement = document.querySelector(this.popupSelector);
		this.popupLinks = this.querySelector('a') ? this.querySelectorAll('a') : this.querySelectorAll('span');
		this.cachedResults = [];
		this.buttonTemplate = '<button type="button" data-fancybox-close="" class="fancybox-button fancybox-close-small" title="Close"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"></path></svg></button>'
		this.loaderTemplate = '<div data-load="loading"></div>';
		if ('constructorExtend' in this) {
			this.constructorExtend()
		}
		if (this.dataset.event == 'mouseenter') {
			let buttonHoverTimeout;
			this.popupLinks.forEach(
				button => {
					button.addEventListener('mouseenter', (e) => {
						buttonHoverTimeout = setTimeout(() => {
							this.open(e)
						}, 300)
					})
					button.addEventListener('mouseleave', (e) => {
						clearTimeout(buttonHoverTimeout)
					})
				}
			)
		} else {
			this.popupLinks.forEach(
				button => button.addEventListener('click', this.open.bind(this))
			)
		}
		window.addEventListener('resize', debounce(() => {
			this.isOpened() && this.isScroll()
		}, 500))
	}
	open(e) {
		if (this.closeClick) return false;
		e && e.preventDefault();
		const animationEffect = this.dataset.animationEffect ? this.dataset.animationEffect : 'fade',
			baseClass = (this.tagName == 'FILTER-POPUP') ? 'fancybox-container--filter' : '',
			hideScrollbar = (this.tagName == 'FILTER-POPUP' && window.matchMedia('(min-width:1025px)').matches) ? false : true;
		if (!this.isOpened()) {
			const main = () => {
				this.fancybox = jq_lumia.fancybox.open({
					type: 'inline',
					src: this.popupSelector,
					animationEffect: animationEffect,
					animationDuration: 200,
					touch: false,
					//hideScrollbar: hideScrollbar,
					baseClass: baseClass,
					beforeLoad: () => {
						if ('popupBeforeLoadExtend' in this) this.popupBeforeLoadExtend()
					},
					afterLoad: () => {
						new Promise(resolve => {
							if (this.tagName != 'FILTER-POPUP' || window.matchMedia(`(max-width:${mobileBreakpoint}px)`).matches)  {
								bodyScrollLock.disableBodyScroll(this.popupElement, {
									allowTouchMove: el => {
										while (el && el !== document.body) {
											if (el.getAttribute('body-scroll-lock-ignore') !== null) return true;
											el = el.parentElement
										}
									}
								})
							}
							this.popupAfterLoad();
							if ('popupAfterLoadExtend' in this)  this.popupAfterLoadExtend();
							if (this.hasAttribute('data-fullheight')) this.popupElement?.classList.add('fc--fullheight');
							resolve()
						}).then(() => {this.popupElement?.classList.add('is-opened')})
					},
					beforeShow: () => {
						if ('popupBeforeShowExtend' in this) this.popupBeforeShowExtend();
						if (!document.body.classList.contains('has-sticky')) document.body.classList.add('blockSticky');
						document.querySelectorAll('main-slider').forEach(slider => slider.stopAutoplay())
					},
					afterShow: () => {
						if (this.tagName !== 'FILTER-POPUP') this.popupAfterShow();
						if ('popupAfterShowExtend' in this) this.popupAfterShowExtend();
						if (this.popupElement) {
							this.popupElement.querySelectorAll('textarea-autosize').forEach(textarea => textarea.resizeInput());
							setTimeout(() => {
								if (this.popupElement.classList.contains('fancybox-effect-slide-out')) this.popupElement.classList.add('is-animate')
							}, 200)
						}
					},
					beforeClose: () => {
						this.popupBeforeClose();
						if ('popupBeforeCloseExtend' in this) this.popupBeforeCloseExtend();
						if (this.popupElement && this.popupElement.classList.contains('fancybox-effect-slide-out')) this.popupElement.classList.remove('is-animate')
					},
					afterClose: () => {
						if ('popupAfterCloseExtend' in this) this.popupAfterCloseExtend();
						if (this.cloneSelector) this.destroyScroll();
						document.querySelectorAll('main-slider').forEach(slider => slider.startAutoplay());
						document.body.classList.remove('blockSticky');
						document.body.style.overflowY = ''
					}
				})
				if (this.dataset.ajax) {
					const ajaxContainerElement = this.popupElement.querySelector('[data-ajax-container]'),
						container = ajaxContainerElement || this.popupElement,
						urlAjax = this.dataset.ajax,
						filterCacheUrl = (el) => el.url === urlAjax;
					if (!this.popupElement.querySelector('[data-load]')) container.innerHTML = this.loaderTemplate;
					if (!this.cachedResults.some(filterCacheUrl)) {
						fetch(urlAjax).then((response) => response.text())
							.then((data) => {
								this.popupElement.querySelector('[data-load]')?.remove();
								const shopifySection = new DOMParser().parseFromString(data, 'text/html').querySelector('.shopify-section'),
									closeButtonData = new DOMParser().parseFromString(data, 'text/html').querySelector('.fancybox-close-small'),
									closeButton = closeButtonData ? '' : this.buttonTemplate;
								let innerData = shopifySection ? shopifySection.innerHTML : data;
								if (this.dataset.subtitle) {
									const subtitle = new DOMParser().parseFromString(data, 'text/html').querySelector('.h-sub');
									if (subtitle) {
										const subtitleContainer = subtitle.outerHTML;
										innerData = innerData.replace(subtitleContainer,subtitleContainer.replace('><', `>${this.dataset.subtitle}<`));
									}
								}
								container.innerHTML = innerData + closeButton;
								container.classList.add('modal-ajax-loaded');
								this.updateScroll();
								addResponsive(this.popupElement);
								if ('popupAjaxExtend' in this) {
									this.popupAjaxExtend()
								}
								this.cachedResults.push({'url': urlAjax, 'html': innerData + closeButton});
							})
							.catch((error) => {
								console.error('error', error);
								setTimeout(() => {
									this.fancybox.close()
								}, 2000)
							})
					} else {
						container.innerHTML = this.cachedResults.find(filterCacheUrl).html;
						if ('popupAfterCachLoad' in this) this.popupAfterCachLoad();
						this.updateScroll();
					}
				} else if (this.dataset.clone && 'cloneNode' in this) {
					if (!this.cloneSelector) {
						this.classList.add('ajax-awaiting');
						document.querySelector('filter-toggle')?.click()
					} else this.cloneNode()
				}
				if ('clickEventExtend' in this) {
					this.clickEventExtend()
				}
			}
			if ('beforeFancybox' in this) {
				new Promise(resolve => {
					this.beforeFancybox(resolve);
				}).then(() => main())
			} else main()
		}
	}
	close() {
		this.fancybox ? this.fancybox.close() : this.popupElement.closest('.fancybox-container')?.querySelector('[data-fancybox-close]').click()
	}
	destroyScroll() {
		this.popupElement?.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
			if (Scrollbar.get(scroll) && scroll.dataset.scrollbar) {
				Scrollbar.get(scroll).destroy()
			}
		})
	}
	updateScroll() {
		this.popupElement?.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
			if (Scrollbar.get(scroll) && scroll.dataset.scrollbar) {
				Scrollbar.get(scroll).update();
				this.popupElement.classList.remove('hide-scroll');
				this.hideTooltip(scroll);
			} else {
				if (scroll.classList.contains('prd-block-info-scroll') && window.matchMedia('(max-width:991px)').matches) return;
				new Promise(resolve => {
					Scrollbar.init(scroll, {
						alwaysShowTracks: true,
						damping: document.body.dataset.damping
					})
					this.hideTooltip(scroll);
					this.popupElement.classList.remove('hide-scroll')
					resolve()
				}).then(() => {
					setTimeout(() => {this.isScroll()}, 500)
				})
			}
		})
	}
	hideTooltip(scroll) {
		if (scroll && Scrollbar.get(scroll)) {
			Scrollbar.get(scroll).addListener(function () {
				tippy && tippy.hideAll()
			})
		} else tippy && tippy.hideAll()
	}
	isScroll() {
		this.popupElement.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
			scroll.dataset.scrollbar && scroll.querySelector('.scrollbar-track-y').style.display == 'block' ? scroll.classList.add('has-scroll') : scroll.classList.remove('has-scroll')
		})
	}
	isOpened() {
		return Boolean(this.popupElement !== null && this.popupElement.closest('.fancybox-is-open'))
	}
	popupAfterLoad() {
		this.popupElement.classList.add('hide-scroll')
	}
	popupAfterShow() {
		this.updateScroll()
	}
	popupBeforeClose() {
		this.popupElement.classList.remove('is-opened');
		bodyScrollLock.enableBodyScroll(this.popupElement);
		tippy && tippy.hideAll();
		setTimeout(() => {
			this.popupElement.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
				if (Scrollbar.get(scroll) && scroll.dataset.scrollbar) {
					Scrollbar.get(scroll).scrollTo(0,0,0)
				}
			})
		}, 500);
	}
	closeOtherPopup() {
		document.querySelectorAll('.fancybox-container').forEach(popup => {
			if (popup != this.popupElement.closest('.fancybox-container')) {
				jq_lumia(popup).data('FancyBox').close()
			}
		})
	}
	hideScroll() {
		this.popupElement.querySelectorAll('.scrollbar-track').forEach(scroll => {scroll.style.opacity = 0})
	}
	showScroll() {
		this.popupElement.querySelectorAll('.scrollbar-track').forEach(scroll => {scroll.style.opacity = 1})
	}
	reInit() {
		this.cloneSelector = document.querySelector(this.dataset.clone);
		this.popupElement = document.querySelector(this.popupSelector)
	}
	static hideAllTooltip() {
		tippy && tippy.hideAll()
	}
	static clearQuickViewCache() {
		document.querySelectorAll('quickview-popup').forEach(el => {el.cachedResults = []});
	}
	static closeAllPopups(exept) {
		document.querySelectorAll('.fancybox-container').forEach(popup => {
			if (exept) {
				if (!popup.querySelector(exept)) jq_lumia(popup).data('FancyBox').close()
			} else jq_lumia(popup).data('FancyBox').close()
		})
	}
	static closePopupExeptCart() {
		document.querySelectorAll('.fancybox-container').forEach(popup => {
			if (!popup.querySelector('.dropdn-modal-minicart')) {
				jq_lumia(popup).data('FancyBox').close()
			}
		})
	}
	static closeWishlistAndCart() {
		document.querySelectorAll('.fancybox-container').forEach(popup => {
			if (popup.querySelector('.minicart-drop')) {
				jq_lumia(popup).data('FancyBox').close()
			}
		})
	}
}

class MinicartPopup extends Popup {
	constructorExtend() {
		if (this.popupElement) {
			document.querySelector('.js-bought-with-close')?.addEventListener('click', (e) => {
				e.preventDefault();
				this.closeChild();
			})
			this.fixedBottom = this.popupElement.querySelector('[data-slide]'),
				this.toggleBottom = this.popupElement.querySelector('[data-slide-toggle]');
			window.addEventListener('resize', debounce(() => {
				this.bottomFixedSlide();
				setTimeout(() => {
					this.updateScroll()
				}, 200)
			}, 500))
		}
	}
	bottomFixedSlide() {
		if (window.matchMedia('(max-width:767px)').matches) {
			if (this.fixedBottom) {
				setStyle(this.fixedBottom, {'height': 'auto'});
				let startHeight = `${this.fixedBottom.querySelector('[data-slide-visible]').offsetHeight + 40}px`,
					endHeight = this.fixedBottom.clientHeight;
				setStyle(this.fixedBottom, {'height': ''});
				this.fixedBottom.style.setProperty('--drop-height', `${endHeight}px`);
				this.fixedBottom.style.setProperty('--start-height', startHeight);
			}
		}
	}
	popupBeforeCloseExtend() {
		if (this.popupElement) {
			this.popupElement.classList.remove('is-opened')
		}
		this.closeChild();
		if (document.body.classList.contains('shopify-theme')) {
			document.querySelector('shipping-calculator')?.close(true);
			document.querySelector('shipping-calculator-cart')?.submitIfReady()
		}
		document.querySelectorAll('wishlist-popup').forEach(wishlist => {
			wishlist.isOpened() && wishlist.close()
		})
		if (this.fixedBottom && !this.dataset.fixedBottomOpen) {
			this.fixedBottom.classList.remove('is-opened')
		}
	}
	popupAfterCloseExtend() {
		const prdCarousel = this.popupElement.querySelector('swiper-carousel');
		prdCarousel && prdCarousel.start();
		if (document.body.classList.contains('shopify-theme')) {
			document.querySelectorAll('minicart-line-item').forEach(item => {
				item.closeAllWishlistForms();
				item.closeOthers()
			})
		}
	}
	openChild() {
		if (this.isOpened) {
			this.popupElement.classList.add('has-bought-with');
			this.popupElement.querySelector('.bought-with')?.classList.add('is-opened');
			this.updateScroll()
		}
	}
	closeChild() {
		if (this.isOpened) {
			this.popupElement.querySelector('.bought-with')?.classList.remove('is-opened');
			setTimeout(() => {
				this.popupElement.classList.remove('has-bought-with');
			}, 500)
		}
	}
	isChildOpened() {
		return this.popupElement.querySelector('.bought-with')?.classList.contains('is-opened') ? true : false
	}
	popupBeforeLoadExtend() {
		if (document.body.classList.contains('shopify-theme')) document.querySelector('shipping-calculator')?.initForm();
		if (document.body.classList.contains('shopify-theme')) document.querySelector('shipping-calculator-cart')?.initForm()
	}
	popupAfterLoadExtend() {
		if (this.popupElement) {
			this.popupElement.querySelectorAll('textarea-autosize').forEach(textarea => {
				textarea.resizeInput()
			})
		}
		const wishListPopup = document.querySelector('wishlist-popup');
		if (wishListPopup && wishListPopup.popupElement && wishListPopup.popupElement.closest('.fancybox-container')) {
			document.querySelectorAll('wishlist-popup').forEach(wishlist => {
				wishlist.isOpened() && this.popupElement.closest('.fancybox-container').querySelector('.fancybox-bg').classList.add('d-none')
			})
		} else this.closeOtherPopup();
		if (document.body.classList.contains('shopify-theme')) document.querySelector('shipping-calculator-cart')?.submitIfReady();
		if (!this.popupElement.querySelector('.minicart-prd-carousel')) {
			this.popupElement.classList.remove('swiper-visible')
		} else {
			setTimeout(() => {
				this.showCarousel()
			}, 500)
		}
		if (this.fixedBottom && this.fixedBottom.classList.contains('is-opened')) {
			this.dataset.fixedBottomOpen = true
		}
		if (this.toggleBottom && !this.toggleBottom.dataset.dataSlideInit) {
			this.toggleBottom.addEventListener('click', (e) => {
				e.preventDefault();
				this.fixedBottom.classList.toggle('is-opened');
				setTimeout(() => {
					this.updateScroll()
				}, 200)
			})
			this.toggleBottom.dataset.dataSlideInit = true
		}
	}
	popupBeforeShowExtend() {
		agreementCheckbox && agreementCheckbox.checkAgreementAll()
	}
	popupAfterShowExtend() {
		this.bottomFixedSlide()
	}
	clickEventExtend() {
		this.createCarousel()
	}
	createCarousel() {
		const ajaxContainerElement = this.popupElement.querySelector('[data-ajax-container]'),
			url = this.dataset.carousel;
		if (!ajaxContainerElement || ajaxContainerElement.classList.contains('is-loading')) return;
		if (url && ajaxContainerElement && ajaxContainerElement.innerHTML.trim().length == 0) {
			ajaxContainerElement.classList.add('is-loading')
			fetch(url).then(response => {
				if (!response.ok) {
					this.popupElement.querySelector('.minicart-prd-carousel').remove();
				} else {
					return response.text()
				}
			})
				.then((data) => {
					if (ajaxContainerElement) {
						ajaxContainerElement.innerHTML = data;
						this.showCarousel();
						ajaxContainerElement.classList.remove('is-loading')
					} else this.popupElement.innerHTML = data;
				})
				.catch((error) => {
					console.error('error', error)
				})
		}
	}
	removeCarousel() {
		this.popupElement.classList.remove('swiper-visible')
	}
	showCarousel() {
		const prdCarousel = this.popupElement.querySelector('swiper-carousel');
		if (prdCarousel) {
			prdCarousel.destroy();
			prdCarousel.init();
			this.popupElement.classList.add('swiper-visible')
		}
	}
}

class WishlistPopup extends Popup{
	popupAfterLoadExtend() {
		document.querySelector('wishlist-items')?.render();
	}
}

class AccountPopup extends Popup {
	constructorExtend() {
		if (this.popupElement) {
			this.popupElement.addEventListener('click', (e) => {
				let link = e.target.closest('.js-toggle-forms');
				if (!link) return;
				this.popupElement.querySelectorAll('.login-form-wrap').forEach(el => el.classList.add('d-none'));
				this.popupElement.querySelector(`.${link.dataset.form}`)?.classList.remove('d-none');
				this.popupAfterShow();
				e.preventDefault();
			})
		}
	}
}

class SearchPopup extends Popup {
	constructorExtend() {
		window.addEventListener('resize', debounce(() => {
			if (this.isOpened() && window.matchMedia('(max-width:1024px)').matches) {
				this.close()
			}
		}, 500))
	}
	popupAfterCloseExtend() {
		if (this.popupElement) {
			this.popupElement.querySelector('swiper-carousel')?.start()
		}
	}
	popupAfterShowExtend() {
		setTimeout(() => {
			const searchCarousel = this.popupElement.querySelector('swiper-carousel');
			if (searchCarousel) {
				searchCarousel.destroy();
				searchCarousel.init();
				this.popupElement.classList.add('swiper-visible')
			}
		}, 500)
	}
}

class CollectionQuickViewPopup extends Popup {
	constructorExtend() {
		this.addEventListener('mouseenter', this.onLinkEnter.bind(this));
		this.addEventListener('mouseleave', this.onLinkLeave.bind(this));
	}
	onLinkEnter() {
		this.closest('a')?.classList.add('hover-disable');
	}
	onLinkLeave() {
		this.closest('a')?.classList.remove('hover-disable');
	}
	popupAfterCloseExtend() {
		if (this.popupElement) {
			this.popupElement.querySelector('swiper-carousel')?.start()
		}
	}
}

class QuickViewPopup extends Popup {
	constructorExtend() {
		this.icon = this.querySelector('svg');
		window.addEventListener('resize', debounce(() => {
			this.updateScroll();
			this.setModalHeight()
		}, 500))
	}
	clickEventExtend() {
		if (this.closest('lookbook-prd')) {
			this.querySelector('a').classList.add('active')
		} else if (this.icon) {
			this.icon.classList.add('like-animation-focus')
		}
		this.dataset.gallery == 'off' ? this.popupElement.classList.add('off-gallery') : this.popupElement.classList.remove('off-gallery');
	}
	popupBeforeShowExtend() {
		const popup = this.closest('.fancybox-container');
		if (this.getAttribute('data-slot') == 'pickup-availability-drawer' && popup) jq_lumia(popup).data('FancyBox').close();
		this.showCarousel();
		this.setModalHeight();
	}
	popupAfterShowExtend() {
		QuickViewPopup.popupAfterShowExtendPublic(this.popupElement)
	}
	static popupAfterShowExtendPublic(ctx) {
		ctx.querySelectorAll('.js-set-height').forEach(el => {
			el.style.setProperty('--tab-height', el.scrollHeight + 'px')
		})
	}
	popupAjaxExtend() {
		this.showCarousel();
		this.setModalHeight();
		this.popupAfterShowExtend()
	}
	popupAfterCloseExtend() {
		if (this.icon) this.icon.classList.remove('like-animation-focus');
		if (this.dataset.ajax) this.popupElement.innerHTML = '<div data-load="loading"></div>';
		if (this.popupElement) {
			this.popupElement.style.minHeight = ''
		}
	}
	popupAfterLoadExtend() {
		document.querySelector('[data-handler="recentlyViewed"]')?.dispatchEvent(new CustomEvent('quick-view-popup-after-load-extend', {bubbles: false, detail: {handle: this.dataset.handle}}))
	}
	showCarousel() {
		setTimeout(() => {
			const gallery = this.popupElement.querySelector('product-gallery');
			if (gallery) {
				gallery.updateCarousel();
				gallery.style.opacity = 1;
			}
		}, 100)
	}
	setModalHeight() {
		if (!this.popupElement) return;
		const gallery = this.popupElement.querySelector('product-gallery');
		if (gallery && this.dataset.gallery !== 'off') {
			const productBlockHeight = gallery.closest('.prd-block').scrollHeight,
				fancyboxContainer = gallery.closest('.fancybox-container'),
				modal = gallery.closest('.fancybox-content'),
				modalHeight = modal.scrollHeight,
				galleryHeight = gallery.scrollHeight;
			modal.style.minHeight = window.matchMedia('(max-width:1024px)').matches ? productBlockHeight + 'px' : galleryHeight + (modalHeight - productBlockHeight) + 'px'
			fancyboxContainer.classList.add('fancybox--scroll')
		}
	}
	clearAllCache() {
		document.querySelectorAll('quickview-popup').forEach(el => {el.cachedResults = []});
	}
}

class MenuPopup extends Popup {
	constructorExtend() {
		let titleTabs = document.querySelectorAll('.js-dropdn-modal-slide-title');
		titleTabs.forEach(button => {
			button.addEventListener('click', () => {
				this.hideScroll();
				titleTabs.forEach(tab => {tab.classList.remove('is-current')});
				document.querySelectorAll('.dropdn-tab-content').forEach(button => {button.classList.remove('is-current')});
				button.classList.add('is-current');
				document.querySelector('#' + button.dataset.tab).classList.add('is-current');
				const slideMenuElement = document.querySelector('slide-menu');
				if (slideMenuElement) {
					setTimeout(() => {
						this.showScroll();
						slideMenuElement.updateScroll()
					}, 250);
				}
			})
		})
	}

	popupAfterShowExtend() {
		const slideMenuElement = document.querySelector('slide-menu');
		if (slideMenuElement) {
			setTimeout(function () {
				slideMenuElement.updateScroll()
			}, 250);
		}
	}
	popupAfterCloseExtend() {
		const slideMenuElement = document.querySelector('slide-menu');
		if (slideMenuElement) {
			slideMenuElement.reset();
			slideMenuElement.click()
		}
		document.querySelector('.js-dropdn-modal-slide-title')?.click()
	}
	popupAfterLoadExtend() {
		const slideMenuElement = document.querySelector('slide-menu');
		slideMenuElement && slideMenuElement.hideScroll()
	}
}

!document.querySelector('body').classList.contains('catalog-mode') && customElements.define('mini-cart-popup', MinicartPopup);
customElements.define('account-popup', AccountPopup);
customElements.define('wishlist-popup', WishlistPopup);
customElements.define('search-popup', SearchPopup);
customElements.define('quickview-popup', QuickViewPopup);
customElements.define('menu-popup', MenuPopup);
customElements.define('info-popup', class InfoPopup extends Popup{});
customElements.define('collection-quickview-popup', CollectionQuickViewPopup);


class MobileMenuSlide extends HTMLElement {
	constructor() {
		super();
		this.curLevel = 0;
		this.wrapper = this.closest('.dropdn-modal-slide');
		this.curItem = 0;
		this.menu = this.querySelector('.nav-wrapper');
		this.init();
	}
	init() {
		this.menu.dataset.init = true;
		this.updateMenuTitle();
		this.menu.style.height = this.menu.querySelector('ul.nav').offsetHeight + 'px';
		this.menu.querySelectorAll('a').forEach(link => link.addEventListener('click', this.onLinkClick.bind(this)));
		this.menu.querySelectorAll('.js-nav-toggle').forEach(link => link.addEventListener('click', this.onToggleClick.bind(this)));
		this.menu.querySelector('.js-nav-viewall').addEventListener('click', this.onViewAllClick.bind(this));
		this.labelWidth();
	}
	labelWidth() {
		this.menu.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'))
	}
	reset() {
		this.curLevel = 0;
		this.curItem = 0;
		this.querySelector('.mmenu-submenu-open')?.classList.remove('mmenu-submenu-open','mmenu-submenu-active');
		this.menu.querySelectorAll('ul').forEach(ul => ul.style.transform = '');
		this.updateMenuTitle();
		this.menu.style.height = '';
	}
	onLinkClick(e) {
		let target = e.currentTarget;
		if (target.closest('li') && target.closest('li').querySelector('ul')) {
			e.preventDefault();
			this.hideScroll();
			this.curItem = target.parentNode;
			this.updateActiveMenu();
		}
	}
	onToggleClick(e) {
		e.preventDefault();
		this.hideScroll();
		this.updateActiveMenu('back');
	}
	onViewAllClick(e) {
		e.preventDefault();
		e.stopPropagation();
		location.href = e.currentTarget.href;
	}
	setHeight() {
		this.menu.style.height = this.querySelector(`mmenu-submenu-active .nav-level-${(this.curLevel + 1)}`).offsetHeight
	}
	updateActiveMenu(direction) {
		this.slideMenu(direction);
		if (direction === 'back') {
			let curItem = this.curItem;
			setTimeout(function () {
				curItem.classList.remove('mmenu-submenu-open', 'mmenu-submenu-active');
			}, 300);
			this.curItem = this.curItem.parentNode.closest('li');
		}
		this.curItem?.classList.add('mmenu-submenu-open', 'mmenu-submenu-active');
		this.updateMenuTitle();
		this.labelWidth();
	}
	updateMenuTitle() {
		let link,
			navToggle = this.menu.querySelector('.nav-toggle'),
			viewAll = this.querySelector('.js-nav-viewall');
		if (this.curLevel > 0) {
			this.title = this.curItem.querySelector('a').innerHTML;
			link = this.curItem.querySelector('a').getAttribute('href');
			navToggle.classList.add('back-visible')
		} else {
			navToggle.classList.remove('back-visible')
		}
		this.querySelector('.nav-title').innerHTML = this.title;
		if (link) {
			viewAll.href = link;
			if (link.indexOf('/collections/')!==-1 && link.indexOf('/products/')==-1) {
				viewAll.classList.remove('hidden')
			} else viewAll.classList.add('hidden')
		}
	}
	updateHeight() {
		if (this.curLevel > 0) {
			if (!this.menu.closest('.js-tab-mobile-content')) {
				this.curItem.querySelector('ul').style.paddingTop = this.menu.querySelector('.nav-toggle').offsetHeight
			}
			this.menu.style.height = this.curItem.querySelector('ul').offsetHeight + 'px'
		} else {
			this.menu.style.height = this.menu.querySelector('.nav-level-1').offsetHeight + 'px'
		}
		setTimeout(() => {
			this.updateScroll();
		}, 250);
	}
	hideScroll() {
		this.wrapper.querySelector('.scrollbar-track').style.opacity = '0'
	}
	showScroll() {
		this.wrapper.querySelector('.scrollbar-track').style.opacity = '1'
	}
	updateScroll() {
		const scrollbarElement = this.closest('[data-scrollbar]');
		if (scrollbarElement) Scrollbar.get(scrollbarElement).update();
		this.showScroll();
	}
	slideMenu(direction) {
		if (direction === 'back') {
			this.curLevel = this.curLevel > 0 ? this.curLevel - 1 : 0;
			setTimeout(() => {
				this.updateHeight();
			}, 300);
		} else {
			this.curLevel += 1;
			setTimeout(() => {
				this.updateHeight();
			}, 100);
		}
		this.menu.classList.add('hide-arrows');
		let submenu = this.menu.querySelector('ul');
		if (document.body.classList.contains('rtl-mode')) {
			submenu.style.transform = `translateX(${this.curLevel*100}%)`
		} else {
			submenu.style.transform = `translateX(-${this.curLevel*100}%)`
		}
		setTimeout(() => {
			this.menu.classList.remove('hide-arrows');
		}, 200);
	}
}
customElements.define('slide-menu', MobileMenuSlide);

class SettingsDropdown extends HTMLElement {
	constructor() {
		super();
		this.cachedResults = [];
		const linkElement = this.querySelector('.js-dropdn-link');
		if (linkElement) {
			linkElement.addEventListener('mouseenter', this.onLinkEnter.bind(this));
			linkElement.addEventListener('click', (e) => e.preventDefault());
			window.addEventListener('load', () => {
				linkElement.removeEventListener('click', (e) => e.preventDefault());
				linkElement.addEventListener('click', this.onLinkClick.bind(this));
			});
		}
		this.popupElement = this.querySelector('.dropdn-content');
		document.addEventListener('click', this.onDocumentClick.bind(this));
		this.querySelectorAll('.dropdn-link').forEach(link => this.style.setProperty('--link-width', link.offsetWidth + 'px'));
	}
	onLinkClick(e) {
		e.preventDefault();
		if (this.querySelector('[data-load]')) {
			this.onLinkEnter(e)
		}
		document.querySelectorAll('settings-dropdown, search-toggle-mobile').forEach(el => {
			if (el != this) el.close()
		})
		this.querySelector('.dropdn').classList.toggle('is-hovered');
		this.querySelector('.dropdn-content').classList.toggle('is-opened');
	}
	onLinkEnter(e) {
		e.preventDefault();
		if (this.querySelector('.dropdn-content').classList.contains('is-opened') || !this.querySelector('[data-load]')) return false;
		if (this.dataset.ajax) {
			const urlAjax = this.dataset.ajax,
				filterCacheUrl = (el) => el.url === urlAjax;
			if (!this.cachedResults.some(filterCacheUrl)) {
				fetch(urlAjax).then((response) => response.text())
					.then((data) => {
						this.querySelector('[data-load]')?.remove();
						const shopifySection = new DOMParser().parseFromString(data, 'text/html').querySelector('.shopify-section'),
							innerData = shopifySection ? shopifySection.innerHTML : data;
						this.updateAllPopup(urlAjax,innerData)
					})
					.catch((error) => {
						console.error('error', error);
					})
			} else {
				this.updateAllPopup(urlAjax,this.cachedResults.find(filterCacheUrl).html)
			}
		}
	}
	close() {
		if (this.querySelector('.dropdn-content').classList.contains('is-opened')) {
			this.querySelector('.dropdn').classList.remove('is-hovered');
			this.querySelector('.dropdn-content').classList.remove('is-opened')
		}
	}
	updateAllPopup(url,content) {
		document.querySelectorAll('settings-dropdown').forEach(popup => {
			const ajaxContainer = popup.querySelector('[data-ajax-container]');
			if (ajaxContainer) {
				ajaxContainer.innerHTML = content;
				ajaxContainer.querySelectorAll('input[name="return_to"]').forEach(input => {
					input.value = window.location.pathname + window.location.search;
				});
			}
			popup.cachedResults.push({'url': url, 'html': content});
			setTimeout(() => { this.updateScroll() }, 500)
		})
	}
	onDocumentClick(e) {
		if (!this.contains(e.target)) {
			this.querySelector('.dropdn').classList.remove('is-hovered');
			this.querySelector('.dropdn-content').classList.remove('is-opened');
			this.destroyScroll()
		}
	}
	destroyScroll() {
		this.popupElement?.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
			if (Scrollbar.get(scroll) && scroll.dataset.scrollbar) {
				Scrollbar.get(scroll).destroy()
			}
		})
	}
	updateScroll() {
		this.popupElement?.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
			if (Scrollbar.get(scroll) && scroll.dataset.scrollbar) {
				Scrollbar.get(scroll).update();
				this.popupElement.classList.remove('hide-scroll');
				this.hideTooltip(scroll);
			} else {
				new Promise(resolve => {
					Scrollbar.init(scroll, {
						alwaysShowTracks: true,
						damping: document.body.dataset.damping
					})
					this.hideTooltip(scroll);
					this.popupElement.classList.remove('hide-scroll')
					resolve()
				}).then(() => {
					setTimeout(() => {this.isScroll()}, 500)
				})
			}
		})
	}
	hideTooltip(scroll) {
		if (Scrollbar.get(scroll)) {
			Scrollbar.get(scroll).addListener(function () {
				tippy && tippy.hideAll()
			})
		}
	}
	isScroll() {
		this.popupElement.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
			scroll.dataset.scrollbar && scroll.querySelector('.scrollbar-track-y')?.style.display == 'block' ? scroll.classList.add('has-scroll') : scroll.classList.remove('has-scroll')
		})
	}
}
customElements.define('settings-dropdown', SettingsDropdown);

class SettingsCollapse extends HTMLElement {
	constructor() {
		super();
		this.dropdown = this.closest('settings-dropdown') || document.querySelector('menu-popup');
		this.style.height = this.scrollHeight + 'px';
		this.querySelector('[data-other] > a')?.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.querySelector('[data-other]').remove();
			this.style.height = this.scrollHeight + 'px';
			setTimeout(() => {
				this.dropdown?.updateScroll()
			}, 500)
		})
	}
	reInit(){
		this.style.height = this.scrollHeight + 'px'
	}
}
customElements.define('settings-collapse', SettingsCollapse);

class MegaMenu extends HTMLElement {
	constructor() {
		super();
		this.menu = this.querySelector('.mmenu-js');
		this.cachedResults = [];
		this.timer = false;
		if (this.dataset.ajax) {
			this.matches(':hover') ? this.ajaxLoad() : document.body.addEventListener('mousemove', () => {this.ajaxLoad()}, {once: true})
		} else this.initEvent();
	}
	initEvent() {
		this.submenu = this.querySelectorAll('.mmenu-submenu li');
		this.simpleLink = this.querySelectorAll('.mmenu-item--simple:not(.menu-item-btn)');
		this.allLink = this.querySelectorAll('.mmenu-item--mega, .mmenu-item--simple:not(.menu-item-btn)');
		this.buttonLink = this.querySelectorAll('.menu-item-btn');
		this.megaLink = this.querySelectorAll('.mmenu-item--mega');
		this.linkWrapper = this.querySelectorAll('.menu-item-wrap');
		this.submenu.forEach(link => link.addEventListener('mouseenter', this.onSubmenuMouseEnter.bind(this)));
		this.submenu.forEach(link => link.addEventListener('mouseleave', this.onSubmenuMouseLeave.bind(this)));
		this.simpleLink.forEach(link => link.addEventListener('mouseenter', this.onLinkMouseEnter.bind(this)));
		this.megaLink.forEach(link => link.addEventListener('mouseenter', this.onLinkMouseEnter.bind(this)));
		this.simpleLink.forEach(link => link.addEventListener('mouseleave', this.onLinkMouseLeave.bind(this)));
		this.megaLink.forEach(link => link.addEventListener('mouseleave', this.onLinkMouseLeave.bind(this)));
		this.linkWrapper.forEach(link => link.addEventListener('click', this.onLinkMouseClick.bind(this)));
		if (this.menu && this.menu.querySelector('.menu-label')) this.menu.classList.add('mmenu--withlabels');
		this.buttonLink.forEach(link => link.addEventListener('click', (e) => {
			if (!e.target.closest('.mmenu-submenu')) {
				e.preventDefault();
				if (e.target.closest('.hovered')) {this.onLinkMouseLeave(e)} else {this.onLinkMouseEnter(e)}
			}
		}));
		this.buttonLink.forEach(link => link.addEventListener('mouseleave', this.onLinkMouseLeave.bind(this)))
	}
	ajaxLoad() {
		if (this.dataset.loaded) return;
		if (this.dataset.ajax) {
			const urlAjax = this.dataset.ajax,
				filterCacheUrl = (el) => el.url === urlAjax;
			if (!this.cachedResults.some(filterCacheUrl)) {
				fetch(urlAjax).then((response) => response.text())
					.then((data) => {
						this.querySelector('[data-load]')?.remove();
						const shopifySection = new DOMParser().parseFromString(data, 'text/html').querySelector('.shopify-section');
						this.parseMenu(shopifySection ? shopifySection.innerHTML : data);
						this.dataset.loaded = true;
						this.closest('header')?.removeEventListener('mouseenter', this.ajaxLoad());
					})
					.catch((error) => {
						console.error('error', error)
					})
			} else {
				this.updateAllPopup(urlAjax,this.cachedResults.find(filterCacheUrl).html)
			}
		}
	}
	parseMenu(data) {
		const menuData =  new DOMParser().parseFromString(data, 'text/html');
		let ajaxMenu = this.querySelectorAll('.mmenu > li');
		menuData.body.querySelectorAll('.mmenu > li').forEach((submenu, i) => {
			const content = submenu.querySelector('.mmenu-submenu'),
				popup = submenu.querySelector('category-popup');
			if (popup) {
				ajaxMenu[i].innerHTML = '';
				ajaxMenu[i].appendChild(popup)
			} else if (content) {
				ajaxMenu[i].appendChild(content);
				if (content.querySelector('.mmenu-submenu-inside')) {
					ajaxMenu[i].classList.add('mmenu-item--mega');
					ajaxMenu[i].classList.remove('mmenu-item--simple');
				} else {
					ajaxMenu[i].classList.remove('mmenu-item--mega');
					ajaxMenu[i].classList.add('mmenu-item--simple');
				}
			}
		})
		this.initEvent();
		setTimeout(() => {
			this.allLink?.forEach(link => {
				if (link.matches(':hover')) { this.onLinkMouseEnter(false,link) }
			})
			this.querySelectorAll('flow-type').forEach(flowtype => {
				if ('reinit' in flowtype) flowtype.reinit()}
			)
			this.querySelectorAll('swiper-carousel').forEach(carousel => {
				if ('destroy' in carousel) {
					carousel.destroy();
					carousel.init()
				}
			})
			this.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'))
		}, 250)
	}
	onLinkMouseClick(e) {
		let link = e.target.querySelector('.top-level-link');
		if (link) link.click();
	}
	onLinkMouseEnter(e, link) {
		let target = link || e.target.closest('li') || e.target;
		if (target.closest('li').querySelector('.mmenu-submenu')) document.querySelectorAll('settings-dropdown').forEach(dropdown => dropdown.close());
		this.timer = setTimeout(() => {
			this.clearHovered();
			target.classList.add('hovered');
			this.setMaxHeight(target.querySelector('.mmenu-submenu'));
		}, 200);
	}
	onLinkMouseLeave(e) {
		let target = e.target.closest('li') || e.target;
		clearTimeout(this.timer);
		this.clearMaxHeight();
		target.classList.remove('hovered');
		document.body.classList.remove('compensate-scrollbar', 'overflow-hidden');
	}
	onSubmenuMouseEnter(e) {
		let target = e.currentTarget;
		target.classList.add('hovered');
		target.style.setProperty('--li-height', target.offsetHeight + 'px');
		if (target.querySelector('.submenu-list-wrap')) {
			let elm = target.querySelector('.mmenu-submenu') || target.querySelector('.submenu-list-wrap');
			if (!elm) return;
			let elmLeft = elm.getBoundingClientRect().left + pageXOffset,
				targetLeft = target.getBoundingClientRect().left + pageXOffset;
			if (target.closest('.submenu-list')) {
				if (target.closest('.mmenu-item--mega')) {
					if (document.body.classList.contains('rtl-mode')) {
						elm.style.left = targetLeft - target.offsetWidth + 'px'
					} else {
						elm.style.left = targetLeft + target.offsetWidth + 'px'
					}
				} else {
					elm.style.top = -target.offsetTop + 'px';
					elm.style.minHeight =  target.closest('.mmenu-submenu').offsetHeight + 'px'
				}
			}
			let isXvisible = document.body.classList.contains('rtl-mode') ? elmLeft >= 0 : (elmLeft + elm.offsetWidth) <= window.innerWidth;
			if (!isXvisible) {
				target.classList.add('to-right');
			} else {
				target.classList.remove('to-right');
			}
		}
	}
	onSubmenuMouseLeave(e) {
		let target = e.currentTarget,
			elm = target.querySelector('.mmenu-submenu') || target.querySelector('.submenu-list-wrap');
		target.classList.remove('hovered','to-right');
		target.style.removeProperty('--li-height');
		if (!elm) return;
		elm.style.top = '';
	}
	clearHovered() {
		document.body.classList.remove('overflow-hidden');
		this.megaLink.forEach(link => link.classList.remove('hovered'));
		this.simpleLink.forEach(link => {
			!link.classList.contains('menu-item-btn') && link.classList.remove('hovered')
		})
	}
	clearMaxHeight() {
		this.querySelectorAll('.max-height').forEach(el => {el.style.maxHeight = ''; el.classList.remove('max-height')})
	}
	setMaxHeight(submenu) {
		let wHeight = window.innerHeight;
		if (submenu && submenu.closest('.mmenu-item--mega') && !submenu.classList.contains('mmenu-submenu--boxed')) {
			let prev = submenu.previousElementSibling,
				maxH = document.body.classList.contains('has-sticky') ? wHeight - document.querySelector('.hdr-content-sticky').offsetHeight : wHeight - getCoords(prev).top - prev.offsetHeight - 15,
				submenuChildElement = submenu.querySelector('div');
			if (submenu.offsetHeight >= maxH) {
				submenuChildElement.style.maxHeight = maxH + 'px';
				submenuChildElement.classList.add('max-height');
				document.body.classList.add('compensate-scrollbar', 'overflow-hidden');
			}
		}
	}
}
customElements.define('mega-menu', MegaMenu);

class HeaderSticky extends HTMLElement {
	constructor() {
		super();
		this.init();
	}
	init() {
		this.header = document.querySelector('.hdr');
		this.headerNav = document.querySelector('.nav-holder');
		this.headerSticky = document.querySelector('.hdr-content-sticky');
		this.headerStickyNav = document.querySelector('.nav-holder-s');
		this.stickyCollision = document.querySelectorAll('.js-sticky-collision');
		this.lastScrollTop = 0;
		this.headerWrap = document.querySelector('.hdr-wrap');
		this.botomMobileHeader = document.querySelector('.hdr-mobile-bottom');
		this.alwaysVisible = document.body.classList.contains('has-hdr_sticky_not_hiding') ? true : false;
		this.offset = window.innerHeight;
		this.startHeight = this.header.querySelector('[data-search-open]') ? this.header.offsetHeight + 1 : this.header.offsetHeight - 2;
		if (this.header.querySelector('[data-search-open]')) {
			document.querySelectorAll('.hdr').forEach(el => {el.classList.add('hdr--search-open')})
		}
		if (this.headerStickyNav && this.headerStickyNav.innerHTML.trim().length == 0) {
			this.headerStickyNav.insertAdjacentHTML('afterbegin', document.querySelector('.nav-holder').innerHTML);
			document.querySelectorAll('.nav-holder-s flow-type').forEach(el => {el.reinit()})
		}
		if (this.headerSticky) {
			new Promise(function (resolve) {
				setTimeout(() => {
					document.body.classList.add('has-hdr_sticky');
					resolve();
				},500)
			}).then(() => {
				setTimeout(() => {
					this.headerWrap.classList.remove('off-transition');
				}, 1000)
			})
		}
		this.setScroll();
		this.removeStickyClass();
		if (this.botomMobileHeader && !this.botomMobileHeader.classList.contains('scroll-down')) {
			document.body.classList.add('has-mobile-bottom');
		}
		this.initBreikpoint(true);
		window.addEventListener('resize', debounce(() => {
			this.initBreikpoint(false)
		}, 500))
	}
	initBreikpoint(startInit) {
		this.windowHeight = window.innerHeight;
		this.offset = document.querySelector('.page-content') ? document.querySelector('.page-content').offsetTop + 200 : 400;
		if (window.matchMedia(`(max-width:${mobileBreakpoint}px)`).matches) {
			if (this.header.classList.contains('hdr-transparent')) {
				this.header.classList.remove('hdr-transparent');
				this.header.classList.add('hdr-transparent-off');
				document.body.classList.remove('has-transparent-hdr')
			}
			startInit && this.headerWrap.classList.add('off-transition');
		} else {
			if (this.header.classList.contains('hdr-transparent-off')) {
				this.header.classList.add('hdr-transparent');
				document.body.classList.add('has-transparent-hdr')
			}
			this.headerWrap.classList.remove('off-transition');
			this.setHeight();
			this.multirow();
			this.multirowS();
			this.stickyHeight();
		}
	}
	setScroll() {
		let didScroll = true,
			delta = 2;
		setInterval(()=>{
			if (didScroll) {
				this.scrollEvents(delta);
				didScroll = false;
			}
		}, 100);
		window.addEventListener('scroll',() => {
			if (document.body.classList.contains('blockSticky')) return;
			didScroll = true;
			this.stickyCollision.forEach(el => {
				if (el.getBoundingClientRect().top < this.hSticky) {
					el.classList.add('is-collision')
				} else {
					el.classList.remove('is-collision')
				}
			})
		})
		this.scrollEvents(delta);
	}
	scrollEvents(delta) {
		if (document.body.classList.contains('blockSticky')) return;
		const st = window.scrollY,
			offset = this.offset,
			bodyElement = document.body;
		if (Math.abs(this.lastScrollTop - st) <= delta) return;
		if (!bodyElement.classList.contains('blockSticky')) {
			if (bodyElement.classList.contains('has-transparent-hdr')) {
				if (st < this.windowHeight) {
					this.headerWrap.classList.add('no-transition')
					this.removeStickyClass();
					bodyElement.classList.remove('scroll-up', 'scroll-down');
				} else if (st >= (document.body.offsetHeight - this.windowHeight - this.startHeight) || (st > this.lastScrollTop && !bodyElement.classList.contains('scroll-down'))) {
					this.removeStickyClass();
					this.removeSticky();
					this.headerWrap.classList.remove('no-transition')
				} else if (st < this.lastScrollTop && bodyElement.classList.contains('scroll-down')) {
					this.setStickyClass();
					this.setSticky();
					this.headerWrap.classList.remove('no-transition');
				}
			} else {
				if (st < offset) {
					this.removeStickyClass();
					bodyElement.classList.remove('scroll-up', 'scroll-down');
				} else if (st >= (document.body.offsetHeight - this.windowHeight - this.startHeight) || (st > this.lastScrollTop && !bodyElement.classList.contains('scroll-down'))) {
					this.removeStickyClass();
					this.removeSticky();
				} else if (st <= this.lastScrollTop && bodyElement.classList.contains('scroll-down')) {
					this.setStickyClass();
					this.setSticky();
				}
			}
			this.lastScrollTop = st;
		}
	}
	setStickyClass() {
		document.body.classList.add('has-sticky');
	}
	removeStickyClass() {
		document.body.classList.remove('has-sticky');
	}
	setSticky() {
		const bodyElement = document.body;
		bodyElement.classList.add('scroll-up');
		bodyElement.classList.remove('scroll-down');
		if (this.botomMobileHeader) {
			this.botomMobileHeader.classList.add('scroll-up');
			this.botomMobileHeader.classList.remove('scroll-down');
			!this.alwaysVisible && bodyElement.classList.add('has-mobile-bottom')
		}
	}
	removeSticky() {
		const bodyElement = document.body;
		bodyElement.classList.add('scroll-down');
		bodyElement.classList.remove('scroll-up');
		if (this.botomMobileHeader) {
			this.botomMobileHeader.classList.add('scroll-down');
			this.botomMobileHeader.classList.remove('scroll-up');
			!this.alwaysVisible && bodyElement.classList.remove('has-mobile-bottom')
		}
	}
	multirow() {
		if (this.headerNav.offsetHeight > 84) {
			this.header.classList.add('mmenu-multirow')
		} else this.header.classList.remove('mmenu-multirow')
	}
	multirowS() {
		if (this.headerStickyNav.offsetHeight > 84) {
			this.headerSticky.classList.add('mmenu-multirow-s')
		} else this.headerSticky.classList.remove('mmenu-multirow-s')
	}
	destroySticky() {
		this.removeStickyClass();
		if (window.matchMedia(`(min-width:1025px)`).matches) {
			document.body.style.marginTop = ''
		} else {
			document.body.classList.remove('scroll-up','scroll-down')
		}
		this.stickyCollision.forEach(el => {
			el.classList.remove('is-collision');
			setStyle(el.querySelector('div'), {'-webkit-transform': '','-ms-transform': '','transform': 'translate3d(0,0,0)','padding-bottom': ''});
		})
	}
	stickyHeight() {
		this.hSticky = this.headerSticky.offsetHeight;
		document.getElementsByTagName('html')[0].style.setProperty('--sticky-height', this.hSticky + 'px');
	}
	setHeight() {
		this.header.style.height = '';
		this.headerNav.style.height = '';
		if (!document.body.classList.contains('has-sticky')) {
			this.headerNav.style.height = this.headerNav.offsetHeight
		} else {
			document.body.classList.remove('has-sticky')
		}
	}
}
customElements.define('header-sticky', HeaderSticky);

class MobileBottomSticky extends HTMLElement {
	constructor() {
		super();
		if (document.querySelector('header-sticky')) return;
		this.init();
	}
	init() {
		this.stickyCollision = document.querySelectorAll('.js-sticky-collision');
		this.lastScrollTop = 0;
		this.botomMobileHeader = document.querySelector('.hdr-mobile-bottom');
		this.initBreikpoint();
		this.alwaysVisible = document.body.classList.contains('has-hdr_sticky_not_hiding') ? true : false;
		if (this.botomMobileHeader && !this.botomMobileHeader.classList.contains('scroll-down')) {
			document.body.classList.add('has-mobile-bottom');
		}
		window.addEventListener('resize', debounce(() => {
			this.initBreikpoint()
		}, 500))
	}
	initBreikpoint() {
		this.offset = window.innerHeight;
		if (!window.matchMedia(`(max-width:${mobileBreakpoint}px)`).matches) {
			clearInterval(this.scrollInteral);
			delete this.dataset.initialized
		} else if (!this.dataset.initialized) {
			this.setScroll();
			this.dataset.initialized = true
		}
	}
	setScroll() {
		let didScroll = true,
			delta = 2;
		this.scrollInteral = setInterval(()=>{
			if (didScroll) {
				this.scrollEvents(delta);
				didScroll = false;
			}
		}, 100);
		window.addEventListener('scroll',() => {
			didScroll = true;
		})
		this.scrollEvents(delta);
	}
	scrollEvents(delta) {
		const st = window.scrollY,
			offset = this.offset,
			bodyElement = document.body;
		if (Math.abs(this.lastScrollTop - st) <= delta) return;
		if (st < offset) {
			bodyElement.classList.remove('scroll-up', 'scroll-down');
		} else if (st >= (document.body.offsetHeight - this.windowHeight - 62) || (st > this.lastScrollTop && !bodyElement.classList.contains('scroll-down'))) {
			this.removeSticky();
		} else if (st <= this.lastScrollTop && bodyElement.classList.contains('scroll-down')) {
			this.setSticky();
		}
		this.lastScrollTop = st;
	}
	setSticky() {
		const bodyElement = document.body;
		bodyElement.classList.add('scroll-up');
		bodyElement.classList.remove('scroll-down');
		if (this.botomMobileHeader) {
			this.botomMobileHeader.classList.add('scroll-up');
			this.botomMobileHeader.classList.remove('scroll-down');
			!this.alwaysVisible && bodyElement.classList.add('has-mobile-bottom')
		}
	}
	removeSticky() {
		const bodyElement = document.body;
		bodyElement.classList.add('scroll-down');
		bodyElement.classList.remove('scroll-up');
		if (this.botomMobileHeader) {
			this.botomMobileHeader.classList.add('scroll-down');
			this.botomMobileHeader.classList.remove('scroll-up');
			!this.alwaysVisible && bodyElement.classList.remove('has-mobile-bottom')
		}
	}
}
customElements.define('mobile-bottom-sticky', MobileBottomSticky);

class MinicartProductImage extends HTMLElement {
	constructor() {
		super();
		const imageWrap = this.querySelector('.image-hover-scale');
		if (imageWrap) imageWrap.innerHTML = `<div class="image-wrap">${imageWrap.innerHTML}</div>`;
	}
	updateImage(url) {
		const currentURL = this.querySelector(`img:nth-child(${this.querySelectorAll('img').length})`).src;
		if (url.split("&width=")[0] == currentURL.split("&width=")[0]) return;
		if (url) {
			if (this.querySelectorAll('.image-container img').length > 1) {
				this.querySelector('.image-container img').remove()
			}
			const currentImg = this.querySelector('.image-container img');
			this.querySelector('[data-load]')?.setAttribute('data-load', 'loading');
			loadImage(url)
				.then(newImg => {
					newImg.classList.add('js-prd-img');
					return newImg;
				})
				.then(newImg => {
					if (!this.processing) {
						currentImg.parentNode?.insertBefore(newImg, currentImg.nextSibling);
						this.animateImage(currentImg, newImg, true);
					}
					this.querySelector('[data-load]')?.setAttribute('data-load', 'loaded');
				})
				.catch(err => console.error(err));
		}
	}
	animateImage(firstImage,lastImage,remove) {
		firstImage.animate([{ transform: 'translate3D(0, 0, 0)', opacity: 1 },{ transform: 'translate3D(0, -50%, 0)', opacity: 0 }], {duration: 350,iterations: 1,fill: 'both'});
		lastImage.animate([{ transform: 'translate3D(0, 50%,0)', opacity: 0 },{ transform: 'translate3D(0, 0, 0)', opacity: 1 }], {duration: 200,iterations: 1,fill: 'both'});
		if (remove) {
			setTimeout(() => {
				firstImage.remove();
			}, 300)
		}
	}
}
customElements.define('minicart-prd-img', MinicartProductImage);

document.addEventListener('click', function(e) {
	const target = e.target;
	if (target.closest('.modal-toggle-images')) {
		e.preventDefault();
		const modalWrap = target.closest('.modal-wrap');
		modalWrap.classList.toggle('images-off');
		modalWrap.querySelectorAll('.submenu-img').forEach(image => {
			const parent = image.parentNode;
			parent.classList.toggle('d-none');
		})
		setTimeout(() => {
			const scroll = Scrollbar.get(modalWrap.querySelector('.js-dropdn-content-scroll'));
			scroll && scroll.update()
		}, 0)
	}
})

class CategoryPopup extends Popup {
	constructorExtend() {
		if (this.dataset.ajax) {
			const categoryPopupAll = document.querySelectorAll('category-popup'),
				i = categoryPopupAll.length - 1,
				modalHtml = this.closest('.hdr-mobile-bottom') ? `<div class="modal-wrap mmenu dropdn-modal-slide" style="display: none;" id="menuPopupMobile${i}"><div data-load="loading"></div><div data-ajax-container></div></div>` : `<div class="modal-wrap mmenu dropdn-modal-slide" style="display: none;" id="menuPopup${i}"><div data-load="loading"></div><div data-ajax-container></div></div>`,
				modalDiv = document.createElement('div');
			modalDiv.innerHTML = modalHtml;
			document.querySelector('header').appendChild(modalDiv);
			this.popupSelector = this.closest('.hdr-mobile-bottom') ? `#menuPopupMobile${i}` : `#menuPopup${i}`;
			this.popupElement = document.querySelector(this.popupSelector)
		}
	}
	popupAfterCachLoad() {
		const offImages = this.popupElement.classList.contains('images-off');
		this.popupElement.querySelectorAll('.submenu-img').forEach(image => {
			const parent = image.parentNode;
			offImages ? parent.classList.add('d-none') : parent.classList.remove('d-none');
		})
		this.popupElement.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'));
	}
	popupAjaxExtend() {
		setTimeout(() => {
			const arrowDown = this.popupElement.querySelector('.mmenu-scroll-down'),
				scroll = Scrollbar.get(this.popupElement.querySelector('.js-dropdn-content-scroll')),
				size = scroll.size;
			this.popupElement.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'));
			if (size && size.content.height > size.container.height) {
				arrowDown.style.display = '';
				scroll.addListener(function (status) {
					if (status.offset.y == status.limit.y) {
						arrowDown.style.display = 'none';
					}
				})
			}
		}, 250)
	}
}
customElements.define('category-popup', CategoryPopup);

class SearchToggleMobile extends HTMLElement {
	constructor() {
		super()
		this.addEventListener('click', this.onButtonClick.bind(this));
		this.searchNode = this.closest('.hdr').querySelector('.hdr-open-search');
		this.dropSearch = this.querySelector('.dropdn-link');
		this.searchInput =  this.searchNode.querySelector('.form-control')
	}
	onButtonClick(event) {
		event.preventDefault();
		document.body.classList.add('blockSticky');
		this.searchNode.classList.toggle('is-open');
		this.dropSearch.classList.toggle('is-open');
		document.querySelectorAll('settings-dropdown').forEach(el => {
			el.close()
		})
		if (this.dropSearch.classList.contains('is-open')) {
			this.searchInput.focus()
		} else {
			this.blurInput()
		}
		setTimeout(() => {
			document.body.classList.remove('blockSticky');
		}, 1000)
	}
	close() {
		this.searchNode.classList.remove('is-open');
		this.dropSearch.classList.remove('is-open');
		this.blurInput()
	}
	blurInput() {
		this.searchInput.blur()
	}
}
customElements.define('search-toggle-mobile', SearchToggleMobile);

class SubmenuList extends HTMLElement {
	constructor() {
		super();
		this.menu = this.closest('.mmenu-item--mega');
		this.modal = this.closest('.modal-wrap-inside');
		this.ul = this.menu.querySelectorAll('submenu-list > ul');
		this.visible = parseInt(this.menu.dataset.visible);
		this.viewLess();
		this.querySelector('.js-submenu-view-more')?.addEventListener('click', (e) => {
			e.preventDefault();
			if (this.menu.classList.contains('is-opened')) {this.viewLess()} else this.viewMore();
			this.modal.querySelector('[data-scrollbar]') && Scrollbar.get(this.modal.querySelector('[data-scrollbar]')).update();
		});
		for ( let i = 0; i < this.ul.length; i++ ) {
			if (this.ul[i].children.length <= this.visible) this.ul[i].nextElementSibling?.remove()
		}
	}
	viewLess() {
		this.menu.classList.remove('is-opened');
		for ( let i = 0; i < this.ul.length; i++ ) {
			let li = this.ul[i].querySelectorAll('& > li');
			for ( let i = this.visible; i < li.length; i++ ) {
				li[i].classList.add('is-hidden')
			}
		}
	}
	viewMore() {
		this.menu.classList.add('is-opened');
		for ( let i = 0; i < this.ul.length; i++ ) {
			let li = this.ul[i].querySelectorAll('& > li');
			for ( let i = this.visible; i < li.length; i++ ) {
				li[i].classList.remove('is-hidden')
			}
		}
	}
}
customElements.define('submenu-list', SubmenuList);

class ScrollList extends HTMLElement {
	constructor() {
		super();
		this.toggles = this.querySelectorAll('.scroll-list_button');
		this.list = this.querySelector('.scroll-list_list');
		this.scrollValue = 0;
		this.list.addEventListener('touchend',() => {this.stopScroll()});
		this.stopScroll();
		this.toggles.forEach(toggle => {
			['mousedown', 'touchstart'].forEach((event) => {
				toggle.addEventListener(event,(e) => {this.onButtonClick(e.target)});
			});
			['mouseup', 'touchend'].forEach((event) => {
				toggle.addEventListener(event,() => {this.stopScroll()});
			})
		})
		if (window.matchMedia(`(max-width:${this.dataset.breikpoint})`).matches) {
			this.checkScroll();
			if (this.hasAttribute('data-scroll-end')) {
				setTimeout(() => {
					this.list.scrollLeft = this.list.scrollWidth + 1;
					this.stopScroll()
				}, 10)
			} else this.stopScroll()
		}
		window.addEventListener('resize', debounce(() => {
			this.checkScroll()
		}, 500))
	}
	checkScroll() {
		if (window.matchMedia(`(max-width:${this.dataset.breikpoint})`).matches) {
			if (this.list.scrollWidth > this.list.offsetWidth) {
				this.classList.add('has-arrows')
			} else this.classList.remove('has-arrows')
		}
	}
	onButtonClick(target) {
		if (target.getAttribute('data-button-right') !== null) {
			this.interval = setInterval(() => {
				this.list.scrollLeft += 3;
			}, 1);
		} else {
			this.interval = setInterval(() => {
				this.list.ScrollLeft = this.scrollValue;
				this.list.scrollLeft -= 3;
			}, 1);
		}
	}
	stopScroll() {
		if (this.list.scrollLeft == 0) {
			this.querySelector('[data-button-left]').classList.add('disabled');
		} else {
			this.querySelector('[data-button-left]').classList.remove('disabled');
		}
		if (this.list.scrollWidth - this.list.scrollLeft <= this.list.offsetWidth) {
			this.querySelector('[data-button-right]').classList.add('disabled');
		} else {
			this.querySelector('[data-button-right]').classList.remove('disabled');
		}
		if (this.list.scrollLeft > 0) {
			this.scrollValue = this.list.scrollLeft;
		}
		clearInterval(this.interval);
	}
}
customElements.define('scroll-list', ScrollList);