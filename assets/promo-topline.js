function copyToClipboard(element) {
	const textToCopy = element.dataset.copyText;
	let tempElement = document.createElement('input');
	tempElement.type = 'text';
	tempElement.value = textToCopy;
	document.body.appendChild(tempElement);
	tempElement.select();
	document.execCommand('Copy');
	document.body.removeChild(tempElement);
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.js-promoline-copy').forEach((text) => {
		text.addEventListener('click', function (e) {
			e.preventDefault();
			copyToClipboard(this);
			setTimeout(function () {
				tippy.hideAll()
			}, 1200)
		})
	})

	let promoSwiper = document.querySelector('.js-promoline-text-carousel .swiper-container')?.swiper;
	const promoSwiperWrap = document.querySelector('.js-promoline-text-carousel');
	promoSwiperWrap?.addEventListener('mouseenter', function () {
		promoSwiper.autoplay.stop()
	});
	promoSwiperWrap?.addEventListener('mouseleave', function () {
		promoSwiper.autoplay.start()
	})
})