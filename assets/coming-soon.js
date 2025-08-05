class MainPassword extends HTMLElement {
	constructor() {
		super();
		this.init()
	}
	init(){
		document.fonts.ready.then(function () {
			document.querySelector('.coming-soon-content-inside').style.opacity = 1;
		});
		if(document.querySelector('.error')) {
			document.querySelector(`a[href="#${document.querySelector('.error').closest('.coming-soon-tab').id}"]`).click()
		}
		const secondHand = document.querySelector('.second-hand');
		function setDate() {
			const now = new Date();
			const seconds = now.getSeconds();
			const secondsDegree = ((seconds / 60) * 360) + 90;
			secondHand.style.transform = 'rotate(' + secondsDegree + 'deg)';
			secondHand.classList.add('flashing');
			if (seconds === 0) {
				secondHand.style.transition = 'none';
			} else {
				secondHand.style.transition = 'all .3s ease';
			}
			setTimeout(removeFlashing, 600)
		}
		function removeFlashing() {
			secondHand.classList.remove('flashing');
		}
		setInterval(setDate, 1000);
		setTimeout(function(){
			secondHand.classList.remove('d-none')
		}, 1000);
	}
}
customElements.define('main-password', MainPassword);
const state = window.location.href.indexOf('#login') != -1 ? 'is-login-state' : 'is-subscribe-state';
document.body.classList.add(state);
document.addEventListener('click', function(e) {
	let target = e.target.closest('a') || e.target;
	if (!target.hasAttribute('data-toggle-form')) return;
	e.preventDefault();
	document.body.classList.remove('is-login-state', 'is-subscribe-state');
	document.body.classList.add(target.href.indexOf('#login') != -1 ? 'is-login-state' : 'is-subscribe-state');
})
document.addEventListener('DOMContentLoaded', () => {
	tippy('[data-tippy-content]', {
		duration: [300, 0],
		touch: false
	})
})