class FilterBlock extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[data-sort]') && this.sortOptions();
		this.blockCollapse();
		this.checkBoxes();
		this.categoriesMenu()
	}
	categoriesMenu() {
		const menu = this.querySelector('.categories-menu');

		if (menu) {
			menu.querySelectorAll('li ul').forEach(el => {
				el.style.display = 'none'
			})
			//const titleHeight = menu.closest('filter-block').querySelector('.sidebar-block_title').offsetHeight;
			//menu.closest('.sidebar-block_content-scroll')?.style.setProperty('--max-height', window.innerHeight - getCoords(document.querySelector('.js-filter-desktop-wrap')).top - titleHeight - 40 + 'px');
			this.setLabelWidth(menu);
			menu.querySelectorAll('.icon-arrow-next').forEach(el => {
				el.addEventListener('click', (e) => {
					e.preventDefault();
					const parent =  el.closest('li'),
						  dropdown = parent.querySelector('ul');
					if (parent) {
						if (!parent.classList.contains('open')) {
							parent.classList.add('open');
							jq_lumia(dropdown).slideDown(200);
						} else {
							parent.classList.remove('open');
							jq_lumia(dropdown).slideUp(200, () => {
								setTimeout(() => {
									parent.querySelectorAll('li.open ul').forEach(dropdown => dropdown.style.display = 'none');
									parent.querySelectorAll('li.open').forEach(li => li.classList.remove('open'));
								}, 300)
							});
						}
					}
					this.setLabelWidth(el.closest('li'));
				})
			})
		}
	}
	setLabelWidth(el) {
		if (el) {
			el.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'));
		}
	}
	sortOptions() {
		const defaultSort = ["xs", "s", "m", "l", "xl", "36", "38", "40", "42"],
			sortData = this.querySelector('[data-sort]').getAttribute('data-sort') ? this.querySelector('[data-sort]').getAttribute('data-sort') : defaultSort,
			sortDataArray = sortData.split(','),
			unsortedArray = [];
		this.input = this.querySelectorAll('.input-wrap');
		this.list = this.querySelector('[data-sort]');
		function intersect(a, b) {
			let t = void 0;
			if (b.length > a.length) t = b, b = a, a = t;
			return a.filter(function (e) {
				return b.indexOf(e) > -1;
			});
		}
		function sortList(fieldset){
			let new_fieldset  = fieldset.cloneNode(false),
				list = [];
			for(let i = fieldset.childNodes.length; i--;){
				if(fieldset.childNodes[i].nodeType == 1)
					list.push(fieldset.childNodes[i]);
			}
			list.sort(function(a, b){
				return b.getAttribute('data-position') < a.getAttribute('data-position') ? 1 : -1;
			});
			for(let i in list)
				new_fieldset.appendChild(list[i]);
			fieldset.parentNode.replaceChild(new_fieldset, fieldset);
		}
		this.input.forEach((element) => {
			unsortedArray.push(element.querySelector('input').getAttribute('value'));
		});
		let sortedArray = intersect(sortDataArray, unsortedArray);
		this.input.forEach((element) => {
			element.setAttribute('data-position', sortedArray.indexOf(element.querySelector('input').getAttribute('value')));
		});
		sortList(this.list);
	}
	blockCollapse() {
		this.scroll = this.querySelector('.sidebar-block_content-scroll');
		this.content = this.querySelector('.sidebar-block_content');
		if (this.scroll) {
			if (this.closest('.fancybox-container')) {
				this.querySelectorAll('.scrollbar-track').forEach(el => {
					el.remove()
				})
				this.querySelectorAll('.scroll-content').forEach(el => {
					let parent = el.parentNode;
					while (el.firstChild) parent.insertBefore(el.firstChild, el);
					parent.removeChild(el);
					parent.removeAttribute('data-scrollbar');
				})
			}
			setTimeout(() => {
				if (!this.scroll.getAttribute('data-scrollbar')) {
					Scrollbar.init(this.scroll, {
						alwaysShowTracks: true,
						damping: document.body.dataset.damping
					})
					Scrollbar.get(this.scroll).addListener(function () {
						tippy && tippy.hideAll()
					})
				}
			}, 100)
		}
		let isMobile = window.matchMedia('(max-width:991px)').matches;
		let slidespeedOpen = isMobile ? 300 : 250,
			slidespeedClose = isMobile ? 200 : 150;
		if (!this.classList.contains('sidebar-block--static')) {
			if (this.classList.contains('open')) {
				jq_lumia(this.content).slideDown(0);
			} else {
				this.classList.remove('open');
				this.content.style.display = 'none'
			}
		} else {
			if (this.classList.contains('open')) {
				jq_lumia(this.content).slideDown(0)
			} else {
				this.content.style.display = 'none'
			}
		}
		let updatePopupScroll = () => {
			const scrollbarElement = this.closest('[data-scrollbar]');
			if(scrollbarElement) Scrollbar.get(scrollbarElement).update();
		}
		let hideScroll = () => {
			this.querySelector('.scrollbar-track')?.style.setProperty('opacity', '0')
		}
		let showScroll = () => {
			if (!!this.querySelector('.scrollbar-track')) {
				if (this.querySelector('.scrollbar-track-y').scrollHeight > 165) {
					this.querySelector('.scrollbar-track').style.setProperty('opacity', '0');
					this.querySelector('.scrollbar-track-y.show').style.display = ''
				}
			}
		}
		let updateScroll = () => {
			if(this.scroll && this.scroll.dataset.scrollbar) Scrollbar.get(this.scroll).update();
			showScroll();
		}
		this.querySelector('.sidebar-block_title')?.addEventListener('click', (e) => {
			e.preventDefault();
			let target = e.target;
			let isMobile = window.matchMedia('(max-width:991px)').matches;
			if (target.classList.contains('filter-item')) return;
			hideScroll(this.content);
			if (this.classList.contains('open')) {
				this.classList.remove('open');
				this.querySelector('.scrollbar-track')?.classList.add('invisible');
				jq_lumia(this.content).slideUp(slidespeedClose, () => {
					if (!isMobile) {
						setTimeout(() => {
							updateScroll(this.content);
							this.syncContent()
						}, 100)
					} else {
						setTimeout(() => {
							updatePopupScroll();
							this.syncContent()
						}, 200)
					}
				});
			} else {
				this.classList.add('open');
				this.querySelector('.scrollbar-track')?.classList.remove('invisible');
				jq_lumia(this.content).slideDown(slidespeedOpen, () => {
					if (!isMobile) {
						setTimeout(() => {
							updateScroll(this.content);
							this.syncContent()
						}, 100)
					} else {
						setTimeout(() => {
							updatePopupScroll();
							this.syncContent()
						}, 200)
					}
				})
			}
		})
	}
	syncContent() {
		const mobileFilter = this.closest('.fancybox-container')?.querySelector('.js-filter-desktop-wrap'),
			desktopFilter = document.querySelector('[data-filter] .js-filter-desktop-wrap');
		if(mobileFilter && desktopFilter){
			desktopFilter.innerHTML = mobileFilter.innerHTML;
		}
	}
	checkBoxes() {
		this.querySelectorAll('.category-list .input-wrap:not(.is-disable), .category-list a:not(.is-disable), .color-list a:not(.is-disable), .color-list .input-wrap:not(.is-disable), .tags-list a:not(.is-disable), .tags-list .input-wrap:not(.is-disable)').forEach((element) => {
			element.addEventListener('click', function() {
				let li = !!element.closest('li') ? element.closest('li') : element.closest('.input-wrap');
				if (li.classList.contains('active')) {
					li.classList.add('is-unclicked');
					setTimeout(function () {
						li.classList.remove('active');
					}, 200);
					setTimeout(function () {
						li.classList.remove('is-unclicked');
						li.blur();
					}, 500)
				} else {
					li.classList.add('is-clicked');
					setTimeout(function () {
						li.classList.add('active');
					}, 250);
					setTimeout(function () {
						li.classList.remove('is-clicked');
					}, 500)
				}
			})
		})
	}
}

class FilterToggle extends HTMLElement {
	constructor() {
		super();
		this.popupElement = document.querySelector(this.dataset.selector);
		this.loaderTemplate = '<div data-load="loading"></div>';
		this.categoryWrap = document.querySelector('.js-category-page-block');
		this.addEventListener('click', this.toggleClick.bind(this));
		this.statusText = this.querySelector('span');
		this.setStatus();
	}
	setStatus(){
		const text = this.querySelector('span');
		if (this.categoryWrap.classList.contains('has-filter-closed')) {
			text.innerHTML = this.dataset.open
		} else {
			text.innerHTML = this.dataset.close
		}
	}
	toggleClick() {
		if(!this.categoryWrap.classList.contains('has-filter-closed')) {
			this.close()
		} else this.open()
	}
	close() {
		this.statusText.innerHTML = this.dataset.open;
		this.classList.remove('is-opened');
		this.categoryWrap.classList.add('has-filter-closed');
		this.update()
	}
	open() {
		if (this.dataset.ajax && this.popupElement && (!this.popupElement.classList.contains('ajax-loaded') && !this.popupElement.classList.contains('ajax-loading') || this.getAttribute('data-filter-load-force') === 'true')) {
			const urlAjax = this.dataset.ajax,
				mobileFilter = document.querySelector('filter-popup'),
				mobileFilterAwaitStatus = mobileFilter && mobileFilter.classList.contains('ajax-awaiting');
			if (!this.popupElement.querySelector('[data-load]')) this.popupElement.innerHTML = this.loaderTemplate;
			if (mobileFilterAwaitStatus && !mobileFilter.cloneContent.querySelector('[data-load]')) mobileFilter.cloneContent.innerHTML = this.loaderTemplate;
			this.popupElement.classList.add('ajax-loading');
			this.openStatus();
			fetch(urlAjax).then((response) => response.text())
				.then((data) => {
					this.removeAttribute('data-filter-load-force');
					this.popupElement.querySelector('[data-load]')?.remove();
					this.popupElement.innerHTML = data;
					this.popupElement.classList.remove('ajax-loading');
					this.popupElement.classList.add('ajax-loaded');
					if (mobileFilterAwaitStatus) {
						mobileFilter.cloneContent.querySelector('[data-load]')?.remove();
						mobileFilter.cloneNode();
						mobileFilter.classList.remove('ajax-awaiting')
					}
				})
				.catch((error) => {
					console.error('error', error);
					this.close();
					this.popupElement.classList.remove('ajax-loading');
					mobileFilter.classList.remove('ajax-awaiting')
				})
		} else this.openStatus()
	}
	openStatus() {
		this.statusText.innerHTML = this.dataset.close;
		this.classList.add('is-opened');
		this.categoryWrap.classList.remove('has-filter-closed');
		this.update()
	}
	update() {
		document.querySelectorAll('.category-page-block swiper-carousel').forEach(carousel => {carousel.destroy(); carousel.init()})
		document.getElementById('product-grid')?.querySelectorAll('product-card').forEach(element => element.productWidth());
	}
	isFilterOpened(){
		return !this.categoryWrap.classList.contains('has-filter-closed')
	}
}

class ViewMode extends HTMLElement {
	constructor() {
		super();
		this.grid = document.querySelector('[data-product-grid]');
		this.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', this.onButtonClick.bind(this)))
	}
	onButtonClick(e){
		e.preventDefault();
		let target = e.currentTarget;
		if (!target.classList.contains('active')) {
			this.setPerRow(target)
		}
	}
	setSizes(){
		const sizes = [
			0,
			0,
			'(min-width: 1400px) 559px, (min-width: 1200px) 540px, (min-width: 992px) 450px, calc((100vw - 30px - 20px) / 2)',
			'(min-width: 1400px) 362px, (min-width: 1200px) 350px, (min-width: 992px) 289px, (min-width: 768px) 210px, calc((100vw - 30px - 20px) / 2)',
			'(min-width: 1400px) 264px, (min-width: 1200px) 255px, (min-width: 992px) 210px, (min-width: 768px) 150px, calc((100vw - 30px - 20px) / 2)',
			'(min-width: 1400px) 205px, (min-width: 1200px) 198px, (min-width: 992px) 162px, (min-width: 768px) 210px, calc((100vw - 30px - 20px) / 2)'
		]
		const currentView = this.getCurrentBreakpointActive();
		document.querySelector('[data-product-grid]').querySelectorAll('product-card .prd-image img').forEach(item => item.sizes = sizes[parseInt(currentView.dataset.view.split('_')[currentView.dataset.view.split('_').length-1])]);
	}
	setPerRow(el){
		if (el.closest('.view-mode--xxl')) {
			this.querySelectorAll('.view-mode--xxl [data-view]').forEach(el => el.classList.remove('active'))
			removeClassBySuffix(this.grid,'_xxl')
		} else if (el.closest('.view-mode--xl')) {
			this.querySelectorAll('.view-mode--xl [data-view]').forEach(el => el.classList.remove('active'))
			removeClassBySuffix(this.grid,'_xl')
		} else if (el.closest('.view-mode--md')) {
			this.querySelectorAll('.view-mode--md [data-view]').forEach(el => el.classList.remove('active'))
			removeClassBySuffix(this.grid,'_md')
		} else {
			this.querySelectorAll('.view-mode--sm [data-view]').forEach(el => el.classList.remove('active'))
			removeClassBySuffix(this.grid,'_sm')
		}
		el.classList.add('active');
		this.grid.classList.add(el.dataset.view);
		this.grid.querySelectorAll('product-card').forEach(element => {
			element.productWidth();
			if (el.dataset.view.includes('list')) element.loadAjax()
		});
		this.setSizes();
	}
	setGridPerRow(count, mode){
		let activeClass = `grid_${count}_${mode}`,
			activeEl = this.querySelector(`[data-view="${activeClass}"]`);
		removeClassBySuffix(this.grid,`_${mode}`);
		this.grid.classList.add(activeClass);
		if (activeEl) {
			this.querySelectorAll(`.view-mode--${mode} [data-view]`).forEach(el => el.classList.remove('active'));
			activeEl.classList.add('active')
		}
		this.grid.querySelectorAll('product-card').forEach(element => {
			element.productWidth();
			if (count == 'list') element.loadAjax()
		});
		this.setSizes()
	}
	getCurrentBreakpoint(){
		let current;
		this.querySelectorAll('.view-mode').forEach(el => {
			let display = el.currentStyle ? el.currentStyle.display : getComputedStyle(el, null).display;
			(display == 'flex' || display == 'block') && el.querySelectorAll('.active').length > 0 && (current = el)
		})
		return current
	}
	getCurrentBreakpointActive(){
		return this.getCurrentBreakpoint() ? this.getCurrentBreakpoint().querySelector('.active') : false;
	}
	getCurrentBreakpointActiveCount(){
		return this.getCurrentBreakpointActive().dataset.view.split('_')[1]
	}
	getCurrentBreakpointMode(){
		let modeClass = this.getCurrentBreakpoint().classList,
			mode;
		for (let el of modeClass) {
			if(el.includes('view-mode--')) {
				mode = el.split('--')[1]
			}
		}
		return mode;
	}
	setGridAligment(position){
		if(position == 'center'){
			this.grid.classList.add('justify-content-center')
		} else this.grid.classList.remove('justify-content-center')
	}
}

class FilterPopup extends Popup {
	constructorExtend() {
		if (document.body.classList.contains('filter-layout-outer-open')) this.setOpenedStatus();
		this.cloneContent = this.popupElement.querySelector('[data-slot="mobile-popup-content"]');
		this.setCloneSelector();
		this.popupLinks.forEach(button => {
			button.addEventListener('click', (e) => {
				if (this.querySelector('.filter-toggle').classList.contains('is-opened')) {
					this.closeClick = true;
					e.preventDefault();
					e.stopPropagation();
					document.querySelectorAll('filter-popup').forEach(el => {
						el.close()
					})
					setTimeout(() => {this.closeClick = false}, 100)
				}
			})
		})
	}

	close() {
		this.fancybox ? this.fancybox.close() : document.querySelector('.filter-mobile-content [data-fancybox-close]')?.click()
	}

	onApplyClick() {
		const scrollTarget = document.body.querySelector('.filter-row-selected');
		if (scrollTarget) {smoothScrollTo(getCoords(scrollTarget).top - 5, 0)}
		setTimeout(() => {this.close()}, 200)
	}

	setCloneSelector() {
		this.cloneSelector = false;
		document.querySelectorAll(this.dataset.clone).forEach(el => {
			if (el !== this.popupElement) this.cloneSelector = el;
		})
	}

	setOpenedStatus() {
		document.querySelectorAll('filter-popup').forEach(el => {
			if (el.dataset.close) el.querySelector('span').innerHTML = el.dataset.close;
			el.querySelector('.filter-toggle')?.classList.add('is-opened');
		})
	}

	popupBeforeShowExtend() {
		this.setOpenedStatus()
		this.destroyScroll()
	}

	popupAfterShowExtend() {
		document.querySelector('.has-sticky')?.classList.add('scroll-down');
		document.querySelector('.has-sticky')?.classList.remove('scroll-up');
		document.body.classList.add('blockSticky');
		if (!document.body.classList.contains('rtl-mode')) {
			this.popupElement.addEventListener('mouseenter', () => {
				document.body.classList.add('compensate-for-scrollbar')
			})
			this.popupElement.addEventListener('mouseleave', () => {
				document.body.classList.remove('compensate-for-scrollbar')
			})
			if (this.popupElement.matches(':hover')) {
				document.body.classList.add('compensate-for-scrollbar')
			} else {
				document.body.classList.remove('compensate-for-scrollbar')
			}
		}
		document.body.classList.add('filter-layout-outer-open');
		this.updateScroll()
	}

	popupBeforeCloseExtend() {
		document.querySelectorAll('filter-popup').forEach(el => {
			if (el.dataset.open) el.querySelector('span').innerHTML = el.dataset.open;
			el.querySelector('.filter-toggle')?.classList.remove('is-opened')
		})
		document.body.classList.remove('filter-layout-outer-open')
	}

	popupAfterCloseExtend() {
		this.closeClick = false;
		if (this.cloneSelector) {
			this.cloneSelector.querySelectorAll('.scrollbar-track').forEach(el => {
				el.remove()
			})
			this.cloneSelector.querySelectorAll('.scroll-content').forEach(el => {
				let parent = el.parentNode;
				while (el.firstChild) parent.insertBefore(el.firstChild, el);
				parent.removeChild(el);
				parent.removeAttribute('data-scrollbar');
			})
		}
		setTimeout(() => {
			if (this.cloneSelector) {
				this.cloneSelector.querySelectorAll('.sidebar-block_content-scroll').forEach(el => {
					if (!el.getAttribute('data-scrollbar')) {
						Scrollbar.init(el, {
							alwaysShowTracks: true,
							damping: document.body.dataset.damping
						})
					}
				})
			}
			document.body.classList.remove('blockSticky')
		}, 500)
	}

	cloneNode() {

		this.setCloneSelector();
		this.destroyScroll();

		if ('outer' in this.dataset) {
			this.renderOuterFilter();
		} else {

			if (this.cloneSelector.querySelector('facet-remove > li')) {
				this.popupElement.classList.add('actions-on')
			} else this.popupElement.classList.remove('actions-on');

			this.cloneContent.innerHTML = this.cloneSelector.innerHTML;
		}

		this.updateScroll();
	}


	renderOuterFilter() {
		this.cloneSelector = document.querySelector(this.dataset.clone);
		document.querySelectorAll('[data-slot="mobile-popup-content"]').forEach(item => item.innerHTML = this.cloneSelector.innerHTML);

		if (document.querySelector('[data-filter]').querySelector('facet-remove > li')) {
			document.querySelectorAll('#dropdnFilterPopup').forEach(item => item.classList.add('actions-on'));
		} else document.querySelectorAll('#dropdnFilterPopup').forEach(item => item.classList.remove('actions-on'));

	}

	render() {
		this.cloneNode()
	}

}

document.addEventListener('DOMContentLoaded', () => {
	customElements.define('filter-popup', FilterPopup);
	customElements.define('filter-toggle', FilterToggle);
	customElements.define('filter-block', FilterBlock);
	customElements.define('view-mode', ViewMode);
})

document.addEventListener('click', function(e) {
	const target = e.target;
	if (!target.hasAttribute('data-button-apply') && !target.closest('[data-button-apply]')) return;
	document.querySelector('filter-popup')?.onApplyClick();
})
