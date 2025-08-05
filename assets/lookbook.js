document.addEventListener('click', function(e) {
	let target = e.target;
	if (target.closest('.lookbook-grid') && !target.closest('lookbook-button')) tippy.hideAll();
})