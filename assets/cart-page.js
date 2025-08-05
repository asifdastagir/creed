const pageNoteCheckbox = document.querySelector('.js-cart-page-note-checkbox');

function replaceTitle(tab) {
	if (!tab) return;
	let wrap = tab.parentNode;
	if (!tab.checked) {
		let text = wrap.querySelector('textarea').value,
			limit = Math.round(tab.nextElementSibling.offsetWidth / 12),
			title = tab.nextElementSibling;
		if (typeof text !== 'undefined' && text != '') {
			text = text.trim();
			title.innerHTML = `<span class="cutted-default-text">${title.dataset.text}</span><span class="cutted-text">${text.slice(0, limit)}</span><span class="cutted-text-dots">${text.length > limit ? '...' : ''}</span><span></span>`
		} else {
			tab.nextElementSibling.innerHTML = title.dataset.text + '<span></span>'
		}
	}
}
function moveQtyNode() {
	document.querySelectorAll('.cart-table .cart-table-prd').forEach(el => {
		const mobileContainer = el.querySelector('[data-node-mobile]'),
			desktopContainer = el.querySelector('[data-node-desktop]');
		if (window.matchMedia('(max-width:575px)').matches) {
			if(mobileContainer && !mobileContainer.innerHTML.trim().length) {
				mobileContainer.insertAdjacentHTML('afterbegin', desktopContainer.innerHTML);
				desktopContainer.innerHTML = ''
			}
		} else {
			if(desktopContainer && !desktopContainer.innerHTML.trim().length){
				desktopContainer.insertAdjacentHTML('afterbegin', mobileContainer.innerHTML);
				mobileContainer.innerHTML = ''
			}
		}
	})
}
document.querySelectorAll('[data-click="radio"] input[type="checkbox"]').forEach((el) => {
	el.addEventListener('change', function () {
		let siblings = getSiblings(this.closest('.tab-accordion-item'));
		siblings.map(el => el.querySelector('input[type="checkbox"]'));
		siblings.map(function (el) {
			let tab = el.querySelector('input[type="checkbox"]');
			tab.checked = false;
			tab.classList.contains('js-cart-page-note-checkbox') ? replaceTitle(tab) : false
		})
	})
})
document.addEventListener('DOMContentLoaded', () => {
	if (pageNoteCheckbox) {
		replaceTitle(pageNoteCheckbox);
		pageNoteCheckbox.addEventListener('click', function () {replaceTitle(this)})
	}
	moveQtyNode()
})
window.addEventListener('resize', function(){
	if (pageNoteCheckbox) replaceTitle(document.querySelector('.js-cart-page-note-checkbox'));
	moveQtyNode()
})