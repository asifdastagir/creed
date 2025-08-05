class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.cachedResults = {};
    this.input = this.querySelector('input[type="search"]');
    this.select = this.querySelector('[name="type"]');
    this.unavailable_products = this.querySelector('[name="unavailable_products"]');
    this.form = this.querySelector('form.search');
    this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
    this.loader = this.querySelector('.loading-overlay');
    this.setupEventListeners();

    this.setFocus();
  }

  setFocus() {
    setTimeout(() => {
      this.input.focus()
    }, 1000);
  }

  setupEventListeners() {
    if (this.dataset.submitHandler != "false") {
      this.form.addEventListener('submit', this.onFormSubmit.bind(this));
    }

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));
    this.input.addEventListener('focus', this.onFocus.bind(this));

    this.select?.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));

    this.unavailable_products?.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));

    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));

    this.addQuickTagsEvent();
  }

  addQuickTagsEvent() {
    this.quickSearchTags = this.querySelectorAll('.quick-search li > span');
    this.quickSearchTags.forEach((item) => {
      item.addEventListener('click', function (e) {
        this.quickSearchTagsReset();
        item.classList.add('active');
        this.input.value = e.currentTarget.textContent;
        this.onChange();
        this.input.focus();
      }.bind(this))
    });
  }

  quickSearchTagsReset() {
    this.querySelectorAll('.quick-search li > span').forEach(item => item.classList.remove('active'));
  }

  quickSearchTagsSetActive() {
    if (!this.quickSearchTags) return;
    const searchTerm = this.getQuery();
    this.quickSearchTagsReset();
    const tag = Array.from(this.quickSearchTags).find(item => item.textContent.toLowerCase() === searchTerm.toLowerCase())
    tag && tag.classList.add('active')
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();
    if (!searchTerm.length) {
      this.close(true);
      this.hideInputs();
      return;
    }
    let isMobile = window.matchMedia('(max-width:991px)').matches;
    (this.closest('header') || !isMobile) && this.loader.classList.remove('hidden');
    // (this.closest('header')) && this.loader.classList.remove('hidden');
    this.showInputs();
    this.getSearchResults(searchTerm);
    this.quickSearchTagsSetActive();
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) return;

    if (this.getAttribute('results') === 'true') {

      this.showKeyboardDescription();
    } else {
      /*this.getSearchResults(searchTerm);*/
    }
  }

  onFocusOut() {
    const selectedElement = this.querySelector('[aria-selected="true"]');
    selectedElement?.setAttribute('aria-selected', false);
    this.showKeyboardDescription(false);
  }

  onKeyup(event) {
    if (!this.getQuery().length) this.close(true);
    event.preventDefault();

    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up')
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    if (
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown'
    ) {
      event.preventDefault();
    }
  }

  switchOption(direction) {
    if (!this.getQuery().length) return;
    /*if (!this.getAttribute('open')) return;*/
    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');
    const allElements = this.querySelectorAll('.swiper-slide');
    let activeElement = this.querySelector('.swiper-slide');


    if (moveUp && !selectedElement) return;

    this.statusElement.textContent = '';

    if (!moveUp && selectedElement) {
      activeElement = selectedElement.nextElementSibling || allElements[0];
    } else if (moveUp) {
      activeElement = selectedElement.previousElementSibling || allElements[allElements.length - 1];
    }

    if (activeElement === selectedElement) return;

    activeElement.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);

    this.setLiveRegionText(activeElement.textContent);
    this.input.setAttribute('aria-activedescendant', activeElement.id);

    const slider = activeElement.closest('.swiper-container');
    let index = Array.from(allElements).indexOf(activeElement);
    if (Array.from(allElements).length > index) {
      if (!index || index > 5 || moveUp && index > 0 && index < 6) {
        slider.swiper.slideTo(index);
      }
      if (!index) {
        this.input.focus();
        allElements[0].setAttribute('aria-selected', true);
      }
    }
  }

  selectOption() {
    const selectedProduct = this.querySelector('[aria-selected="true"] a, [aria-selected="true"] button');

    if (selectedProduct) selectedProduct.click();
  }

  getSearchResults(searchTerm) {
    const queryKey = this.unavailable_products?.value + '-' + this.select?.value.replace(",", "-") + '-' + searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    const type = (this.select?.value ?? false) ? `${this.select.value}` : 'product,page,article,query';
    const unavailable_products = (this.unavailable_products?.value ?? false) ? `${this.unavailable_products.value}` : 'last';

    async function getSearchResults() {
      const request = await fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=${type}&${encodeURIComponent('resources[limit]')}=12&${encodeURIComponent('resources[fields]')}=title,product_type,body,product_type,vendor,variants.sku,tag&${encodeURIComponent('resources[unavailable_products]')}=${unavailable_products}&section_id=predictive-search`);
      return await request.text()

    }
    fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=${type}&${encodeURIComponent('resources[limit]')}=12&${encodeURIComponent('resources[fields]')}=title,product_type,body,product_type,vendor,variants.sku,tag&${encodeURIComponent('resources[unavailable_products]')}=${unavailable_products}&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
        this.cachedResults[queryKey] = resultsMarkup;
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  showKeyboardDescription(show = true) {
    let keyboardElement = document.querySelectorAll('.keyboard-control');
    keyboardElement.forEach(item => {
      item.classList.toggle('d-md-block', show);
      item.classList.toggle('d-md-none', !show);
    });

  }

  showInputs() {
    this.unavailable_products?.parentElement.classList.remove('hidden');
    this.select?.parentElement.classList.remove('hidden');
    this.showKeyboardDescription();
  }
  hideInputs() {
    this.unavailable_products?.parentElement.classList.add('hidden');
    this.select?.parentElement.classList.add('hidden');
    this.showKeyboardDescription(false);
  }
  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    const documentParsed = new DOMParser().parseFromString(resultsMarkup, 'text/html');

    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute('results', true);

    let keyboardElements = document.querySelectorAll('.keyboard-control');
    if (keyboardElements) {
      keyboardElements.forEach(item => item.classList.toggle('hidden', documentParsed.querySelector('.category-empty')));
    }

    this.setLiveRegionResults();
    this.open();
    this.loader.classList.add('hidden');
    this.showInputs();
    document.querySelector('[data-close-predictive]')?.addEventListener('click', this.close.bind(this, false));

    this.renderElements(documentParsed);
    this.addQuickTagsEvent();

    if (this.closest('section')) {
      scrollSearchSection(this.closest('section')?.id)
    }
  }

  renderElements(renderedDocument) {
    this.querySelectorAll('[data-render-predictive-search]').forEach(destination => {
      const source = renderedDocument.querySelector(`[data-render-predictive-search=${destination.dataset.renderPredictiveSearch}]`);

      if (source) destination.innerHTML = source.innerHTML;
    });
  }

  renderFacetsElements(renderedDocument) {
    document.querySelectorAll('[data-render-facets]').forEach(destination => {
      const source = renderedDocument.querySelector(`[data-render-facets=${destination.dataset.renderFacets}]`);

      if (source) destination.innerHTML = source.innerHTML;
    });
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent);
  }

  getResultsMaxHeight() {
    this.resultsMaxHeight = window.innerHeight - document.getElementById('shopify-section-header').getBoundingClientRect().bottom;
    return this.resultsMaxHeight;
  }

  open() {
    document.querySelectorAll('search-page, predictive-search').forEach(item => item.close());
    /*this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;*/
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
  }

  close(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }

    // const selected = this.querySelector('[aria-selected="true"]');

    // if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    this.resultsMaxHeight = false
    this.predictiveSearchResults.removeAttribute('style');
  }
}

customElements.define('predictive-search', PredictiveSearch);

class SearchPage extends PredictiveSearch {
  constructor() {
    super();
    this.cachedResults = {};
    this.input = this.querySelector('input[type="search"]');
    this.form = this.querySelector('form');
    this.select = this.querySelector('[name="type"]');
    this.SearchPageResults = document.querySelector('[data-search-page-results]');
    this.loader = this.querySelector('.loading-overlay__spinner');

    this.addQuickTagsEvent();

    this.setPlaceholder();

    window.addEventListener('resize', debounce(() => {
      this.setPlaceholder();
    }, 300))
  }

  addQuickTagsEvent() {
    this.quickSearchTags = this.querySelectorAll('.quick-search li > span');
    this.quickSearchTags.forEach((item) => {
      item.addEventListener('click', function (e) {
        let isMobile = window.matchMedia('(max-width:991px)').matches;

        this.input.value = e.currentTarget.textContent;

        // !isMobile && this.onChange();
        this.onChange();

        this.input.focus();

        isMobile && this.onFormSubmit(e);
      }.bind(this))
    });
  }

  setFocus() {

  }

  setPlaceholder() {
    if (window.matchMedia('(max-width:767px)').matches) {
      this.input.placeholder = window.themeStrings['search_placeholder_short'];
    } else {
      if (!this.input.placeholder) {
        this.input.placeholder = window.themeStrings['search_placeholder'];
      }
    }
    // this.input.placeholder = window.themeStrings[window.matchMedia('(max-width:767px)').matches ? 'search_placeholder_short' : 'search_placeholder']
  }

  onFormSubmit(event) {
    if (this.closest('header')) {
      this.__proto__.__proto__.onFormSubmit.call(this, event);
    } else {
      this.removeAttribute('open');
      const searchTerm = this.getQuery();
      event.preventDefault();
      if (!searchTerm.length) {
        return;
      }
      this.loader.classList.remove('hidden');

      this.getSearchPageResults(searchTerm, true);

    }

  }

  getSearchPageResults(searchTerm, forceFilterReload = false) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    const formData = new FormData(this.form);
    const searchParams = new URLSearchParams(formData).toString();

    if (this.cachedResults[queryKey]) {
      this.renderSearchPageResults(this.cachedResults[queryKey], searchParams, forceFilterReload);
      return;
    }

    const sectionId = 'sectionId' in this.dataset ? `&section_id=${this.dataset.sectionId}` : '';
    fetch(`${routes.search_url}?${searchParams}${sectionId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.text();
      })
      .then((text) => {

        const documentRendered = new DOMParser().parseFromString(text, 'text/html');

        this.cachedResults[queryKey] = documentRendered;
        this.renderSearchPageResults(documentRendered, searchParams, forceFilterReload);

      })
      .catch((error) => {
        throw error;
      });
  }

  renderSearchPageResults(documentRendered, searchParams, forceFilterReload = false) {
    this.SearchPageResults.innerHTML = documentRendered.querySelector('[data-search-page-results]').innerHTML;
    this.SearchPageResults.querySelector('.show-on-scroll').classList.toggle('is-visible');
    this.loader.classList.add('hidden');
    this.removeAttribute('open');

    const element = documentRendered.querySelector('p[role="status"]') || documentRendered.querySelector('span[role="status"]');
    const status = element.innerHTML;

    this.updateURLHash(searchParams, window.themeStrings.search + ': ' + status);

    document.querySelectorAll('[data-close-predictive]').forEach(item => {
      item.addEventListener('click', this.close.bind(this, false));
    });

    // document.querySelector('[data-close-predictive]')?.addEventListener('click', this.close.bind(this, false));

    this.renderElements(documentRendered);
    this.renderRequiredElements(documentRendered);
    this.renderFacetsElements(documentRendered);
    this.addQuickTagsEvent();



    let isMobile = window.matchMedia('(max-width:991px)').matches;

    if (!isMobile && forceFilterReload && document.querySelector('[data-facets-sorting] filter-popup[data-clone]')) {
      document.querySelector('#dropdnFilterPopup [data-slot="mobile-popup-content"]').innerHTML = documentRendered.querySelector('#filterColumn').innerHTML
    }
  }

  renderRequiredElements(html) {
    document.querySelectorAll('[data-async-reload-required]').forEach(destination => {
      const source = html.querySelector(`[data-async-reload-required=${destination.dataset.asyncReloadRequired}]`);

      if (source) destination.innerHTML = source.innerHTML;
    });
  }

  renderAdditionalElements(html) {
    const documentRendered = new DOMParser().parseFromString(html, 'text/html');
    const mobileElementSelectors = ['.hdr-mobile-bottom'];

    mobileElementSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach(item => {
        item.innerHTML = documentRendered.querySelector(selector).innerHTML;
      });
    });
  }

  updateURLHash(searchParams, status) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
    document.title = status;
  }
}

customElements.define('search-page', SearchPage);

document.addEventListener('click', function (e) {
  if (!(e.target.closest('[data-predictive-search]') || e.target.classList.contains('quick-search-tag') || e.target.closest('.quick-search-tag') || e.target.matches('[name=q]'))) {
    document.querySelectorAll('search-page, predictive-search')?.forEach(item => item.close());
  }
});
