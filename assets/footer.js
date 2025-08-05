document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.footer-col').forEach(el => {
		if (!el.querySelector('.collapsed-mobile')) {
			el.classList.add('footer-col--no-collapsed');
		}
		el.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'));
	})
	document.querySelectorAll('.footer-list-title').forEach(el => {
		el.addEventListener('click', function (e) {
			e.preventDefault();
			this.closest('.collapsed-mobile').classList.toggle('open');
		})
	})
})
