jq_lumia('.gallery-fancybox-link').fancybox({
	loop: false,
	animationEffect: 'zoom',
	touch: false,
	thumbs: false,
	arrows: true,
	buttons : ['close'],
	btnTpl: {
		arrowLeft:'<button data-fancybox-prev class="fancybox-arrow-prev" title="{{PREV}}"></button>',
		arrowRight:'<button data-fancybox-next class="fancybox-arrow-next" title="{{NEXT}}"></button>',
	},
	beforeShow: function beforeShow() {
		jq_lumia('.fancybox-container').last().addClass('fancybox--light');
	}
})
