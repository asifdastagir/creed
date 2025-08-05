document.addEventListener('DOMContentLoaded', () => {
	let counter = 0;
	function highlightText(what, node) {
		const nodeList = node.childNodes;
		for (var x = 0; x < nodeList.length; x++) {
			if (nodeList[x].nodeType == 3) {
				if (nodeList[x].textContent.toLowerCase().indexOf(what.toLowerCase()) >= 0) {
					let replacement = '<mark>'+what+'</mark>',
						ID = "result" + counter,
						textBlock = nodeList[x].textContent,
						searchIndex = nodeList[x].textContent.toLowerCase().indexOf(what.toLowerCase());
					while(searchIndex >= 0){
						++counter;
						ID = "result" + counter;
						cut = textBlock.substring(searchIndex, searchIndex + what.length);
						replacement = '<mark>'+cut+'</mark>';
						textBlock = textBlock.substring(0, searchIndex) + replacement + textBlock.substring(searchIndex + what.length, textBlock.length);
						searchIndex = textBlock.toLowerCase().indexOf(what.toLowerCase(), (searchIndex + replacement.length));
					}
					let replacementNode = document.createElement("span");
					replacementNode.innerHTML = textBlock;
					let parentN = nodeList[x].parentNode;
					parentN.replaceChild(replacementNode, parentN.childNodes[x]);
				}
			} else {
				highlightText(what, nodeList[x]);
			}
		}
	}
	setTimeout(()=>{
		if (!customElements.get('faq-section')) {
			customElements.define('faq-section', class FaqSection extends HTMLElement {
				constructor() {
					super();
					this.searchInput = this.querySelector('.js-faq-input');
					if(this.searchInput) {
						this.searchInput.addEventListener('change', () => {
							this.searchIt();
						})
						this.searchInput.addEventListener('input', () => {
							this.searchIt();
						})
					}
					this.querySelector('.js-faq-search-form')?.addEventListener('submit', (e) => {
						e.preventDefault()
						this.searchIt();
					})
					this.querySelectorAll('.js-tab-faq a').forEach(
						(link) => link.addEventListener('click', (e) => {
							let li = link.closest('li'),
								parent = li.closest('.js-tab-faq'),
								tab_id = link.dataset.tab;
							if(this.searchInput) {
								this.searchInput.value = '';
								this.resetSearch();
							}
							this.querySelectorAll('.faq-tab-content').forEach(
								(tab) => tab.classList.remove('opened')
							)
							this.querySelector(`#${tab_id}`).classList.add('opened');
							parent.querySelectorAll('li').forEach(
								(li) => li.classList.remove('is-current')
							)
							li.classList.add('is-current');
							e.preventDefault();
						})
					)
				}
				resetSearch() {
					let s = this.querySelector('.form-message--success'),
						e = this.querySelector('.form-message--error'),
						r = this.querySelector('.search-result'),
						c = this.querySelector('.tabs-content');
					e?.classList.add('d-none');
					s?.classList.add('d-none');
					r?.classList.add('d-none');
					c?.classList.remove('d-none');
					this.querySelector('.js-tab-faq li.is-current')?.classList.remove('is-current--off');
				}
				searchIt() {
					const input = this.querySelector('.js-faq-input'),
						infoSuccess = this.querySelector('.form-message--success'),
						infoError = this.querySelector('.form-message--error'),
						searchResult = this.querySelector('.search-result'),
						tabsContent = this.querySelector('.tabs-content'),
						tabs = this.querySelectorAll('.faq-tab-content'),
						item = tabsContent.querySelectorAll('.faq-item');
					searchResult.innerHTML = '';
					let v = input.value;
					if(v.length < 2) {
						this.resetSearch(this)
						return false;
					}
					let text = tabsContent.innerText,
						letterCount = this.countInstances(text.toLowerCase(), v.toLowerCase());
					if(letterCount > 0){
						searchResult.classList.remove('d-none');
						tabsContent.classList.add('d-none');
						infoSuccess.querySelector('b').innerHTML = letterCount;
						infoSuccess.classList.remove('d-none');
						infoError.classList.add('d-none');
						if(letterCount > 1){
							infoSuccess.classList.add('has-plural');
							infoSuccess.classList.remove('has-single');
						} else {
							infoSuccess.classList.add('has-single');
							infoSuccess.classList.remove('has-plural');
						}
						item.forEach((item) => {
							let text = item.innerText.toLowerCase();
							if(text.includes(v.toLowerCase())){
								searchResult.innerHTML += item.outerHTML;
							}
						});
						this.querySelector('.js-tab-faq li.is-current')?.classList.add('is-current--off');
						highlightText(v, searchResult);
					} else {
						this.resetSearch();
						infoError.classList.remove('d-none');
					}
				}
				countInstances(string, word) {
					return string.split(word).length - 1;
				}
				});
			}
		},400 )
})
