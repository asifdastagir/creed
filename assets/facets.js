class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    // this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
    this.querySelectorAll('form input[type="number"]').forEach(el => el.addEventListener('focusout', this.debouncedOnSubmit.bind(this)));
    this.querySelectorAll('form input[type="number"]').forEach(el => el.addEventListener('keypress', this.debouncedOnSubmit.bind(this)));
    document.querySelector('[name=sort_by]')?.addEventListener('change', this.onSubmitHandler);

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');

    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static getLoader() {
    return document.querySelector("loading-bar");
  }

  static disableSidebar() {
    document.querySelector('.facets-container').classList.add('disable-filters')
  }

  static enableSidebar() {
    document.querySelectorAll('.facets-container').forEach(item => item.classList.remove('disable-filters'));
  }

  static facetsLoaded() {
    return document.querySelector('#filterColumn .filter-col-content')
  }

  static async asyncLoadSidebar(url, callback) {
    fetch(url)
    .then((response) => response.text())
    .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');

        document.querySelector('#filterColumn').innerHTML = html.querySelector('.shopify-section').innerHTML
        FacetFiltersForm.renderElements(html, false);
        // document.querySelector('#filterColumn').querySelectorAll('input[checked]').forEach(item => item.checked = true)

        callback && callback();
      });
  }



  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static disableAllFacets() {
    document.querySelectorAll('facet-filters-form .input-wrap').forEach((element) => {
      element.classList.add('is-disable');
      element.querySelectorAll('[data-facet-count]').forEach(item => item.textContent = '(0)');
    });
  }

  static enableLoading() {
    document.getElementById('ProductGridContainer').classList.add('loading');
  }

  static enableLoading() {
    document.getElementById('ProductGridContainer').classList.remove('loading');
  }

  static renderPage(searchParams, event, updateURLHash = true, postAjaxCallback) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.querySelector('.ProductCountDesktop');
    // FacetFiltersForm.enableLoading();
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    document.querySelector('[data-facets-sorting]').classList.add('loading');
    /*if (countContainer){
      countContainer.classList.add('loading');
    }*/
    if (countContainerDesktop){
      countContainerDesktop.classList.add('loading');
      FacetFiltersForm.getLoader().start()
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ?
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event, postAjaxCallback) :
        FacetFiltersForm.renderSectionFromFetch(url, event, postAjaxCallback);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event, postAjaxCallback) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        if (responseText) {
          const html = responseText;
          FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
          FacetFiltersForm.renderFilters(html, event);
          FacetFiltersForm.renderProductGridContainer(html);
          FacetFiltersForm.renderVendorsFilterOnSearchPage(html);
          FacetFiltersForm.renderElements(html);
          FacetFiltersForm.renderProductCount(html);
          FacetFiltersForm.enableSidebar();
          FacetFiltersForm.getLoader().hide();
          postAjaxCallback && postAjaxCallback();
        } else {
          document.querySelectorAll('.loading-overlay').forEach(item => item.classList.add('hidden'));
          document.querySelectorAll('.loading').forEach(item => item.classList.remove('loading'));
          document.querySelector('.facets-container').classList.remove('disable-filters')
          FacetFiltersForm.getLoader().hide();
        }
      });
  }

  static renderSectionFromCache(filterDataUrl, event, postAjaxCallback) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderVendorsFilterOnSearchPage(html);
    FacetFiltersForm.renderElements(html);
    FacetFiltersForm.renderProductCount(html);
    FacetFiltersForm.getLoader().hide();
    postAjaxCallback && postAjaxCallback();
  }

  static renderVendorsFilterOnSearchPage(html) {
    const renderedDocument = new DOMParser().parseFromString(html, 'text/html');
    const vendorsFilter = document.querySelector('body.template-search .category-page-description');

    if (vendorsFilter) {
      const source = renderedDocument.querySelector('.category-page-description');

      source && (vendorsFilter.innerHTML = source.innerHTML);
    }
  }

  static renderElements(html, parse = true) {
    let renderedDocument = new DOMParser().parseFromString(html, 'text/html');

    if (!parse) {
      renderedDocument = html
    }
    document.querySelectorAll('[data-render-facets]').forEach(destination => {
      const source = renderedDocument.querySelector(`[data-render-facets=${destination.dataset.renderFacets}]`);
      if (source) destination.innerHTML = source.innerHTML;
    });

    FacetFiltersForm.enableSidebar();
  }

  static renderProductGridContainer(html) {
    const renderedDocument = new DOMParser().parseFromString(html, 'text/html');

    document.getElementById('ProductGridContainer').innerHTML = renderedDocument.getElementById('ProductGridContainer').innerHTML;
    const filterToggleEl = document.querySelector('save-attr[data-filter-toggle]');
    const filterToggleElOld = renderedDocument.querySelector('save-attr[data-filter-toggle]');

    filterToggleEl && filterToggleEl.parentNode.replaceChild(filterToggleElOld, filterToggleEl);


    // const filterPopupEl = document.querySelector('filter-popup');
    // const filterPopupElOld = renderedDocument.querySelector('filter-popup');
    // filterPopupEl && filterPopupElOld && filterPopupEl.parentNode.replaceChild(filterPopupElOld, filterPopupEl);

    /*const element = document.querySelector('.category-page-description');
    const elementRenderedDocumentDescription = renderedDocument.querySelector('.category-page-description');
    if (element && elementRenderedDocumentDescription) {
      console.log('element.getBoundingClientRect().height', element.getBoundingClientRect().height);
      element.style.height = element.getBoundingClientRect().height + 'px';
      element.innerHTML = elementRenderedDocumentDescription.innerHTML
    }*/
    document.querySelector('[name=sort_by]')?.addEventListener('change', function(event){
      event.preventDefault();
        const formData = new FormData(event.target.form ? event.target.form : event.target.closest('form'));
        const searchParams = new URLSearchParams(formData).toString();
        FacetFiltersForm.disableSidebar();
        FacetFiltersForm.renderPage(searchParams, event);
        event.stopImmediatePropagation();
    });
  }

  static renderProductCount(html) {
    let countElement = new DOMParser().parseFromString(html, 'text/html').querySelector('.ProductCountDesktop');
    const fasetsSorting = document.querySelector('[data-facets-sorting]');
    if (countElement) {
      const count = countElement.innerHTML;
      const countText = countElement.innerText;
      const containerDesktop = document.querySelectorAll('.ProductCountDesktop');
      if (containerDesktop) {
        containerDesktop.forEach((value, key)=>{
          value.innerHTML = count;
          value.classList.remove('loading');
        })
      }
      const regExpMatchArrayElement = countText.match(/\d+/) && countText.match(/\d+/)[0];
      if (isNaN(parseInt(regExpMatchArrayElement)) || !parseInt(regExpMatchArrayElement)) {
        fasetsSorting.classList.add('hidden');
      } else {
        fasetsSorting.classList.remove('hidden');
      }
    } else {
      fasetsSorting.classList.add('hidden');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements = parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

   /* facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });*/


    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);
    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));

    if (parsedHTML.querySelector('.category-empty')) {
      FacetFiltersForm.disableAllFacets()
    }

    const filterPopupElement = document.querySelector('filter-popup');
    filterPopupElement && filterPopupElement.render();

    document.querySelector('.active-facets-desktop')?.dispatchEvent(new Event('filter:updated'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      /*document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;*/
      document.querySelectorAll(selector).forEach(item => item.innerHTML = activeFacetsElement.innerHTML);
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    let isMobile = window.matchMedia('(max-width:991px)').matches;

    if (!isMobile) {
      let scrollOffset;
      const scrollCollectionElement = document.querySelector('#ProductGridContainer');
      const delta = document.querySelector('body').classList.contains('template-search') ? 70 : 50;

      const vendorsFilter = document.querySelector('body.template-search .category-page-description');

      if (vendorsFilter) {
        scrollOffset = getCoords(vendorsFilter);
      } else {
        scrollOffset = getCoords(scrollCollectionElement);
      }

      scrollCollectionElement && smoothScrollTo(scrollOffset.top-20, 700);
    }
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }


  onSubmitHandler(event) {
    if (event.target.classList.contains('search')) return;
    let value = parseInt(event.target.dataset.value);
    if (event.target.type === 'number' && event.type === 'keypress' && event.key === 'Enter') {
      event.target.addEventListener('focusout', function(event) {
        event.stopPropagation()
      }, true);
    }

    if (event.target.type === 'number' && event.type === 'focusout'
      || event.target.type !== 'number' && (event.type === 'input' || event.type === 'change')
      || event.target.type === 'number' && event.type === 'keypress' && event.key === 'Enter') {

      event.preventDefault();
      if(value !== parseInt(event.target.value)) {
        const formData = new FormData(event.target.form ? event.target.form : event.target.closest('form'));
        const searchParams = new URLSearchParams(formData).toString();
        FacetFiltersForm.disableSidebar();
        FacetFiltersForm.renderPage(searchParams, event);
        event.stopImmediatePropagation();
      }
    }
  }

}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();

    const ajax = this.dataset.ajax;

    this.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentTarget = event.currentTarget

        if (currentTarget) {
          if (!FacetFiltersForm.facetsLoaded() || ('filterLoadForce' in this.dataset && this.dataset.filterLoadForce === 'true')) {
            FacetFiltersForm.asyncLoadSidebar(ajax, () => {
              this.onActiveFilterClick(e, currentTarget);
            })
          } else {
            FacetFiltersForm.disableSidebar();
            this.onActiveFilterClick(e, currentTarget);
          }
        }

      })
    });
  }

  onActiveFilterClick(e, target) {
    e.preventDefault();
    FacetFiltersForm.toggleActiveFacets();

    if (target) {
      const url = target.href.indexOf('?') == -1 ? '' : target.href.slice(target.href.indexOf('?') + 1);
      FacetFiltersForm.renderPage(url);
    }
  }
}

customElements.define('facet-remove', FacetRemove);

class FacetSortBy extends HTMLElement {
  constructor() {
    super();

    this.querySelector('select').addEventListener('change', this.onChange.bind(this));
  }

  onChange(e) {
    const ajax = this.dataset.ajax;
    const currentTarget = e.currentTarget

    if (!FacetFiltersForm.facetsLoaded()) {
      FacetFiltersForm.asyncLoadSidebar(ajax, () => {
        currentTarget && currentTarget.dispatchEvent(new Event('change', { 'bubbles': false }));
      });
    }
  }
}

customElements.define('facet-sort-by', FacetSortBy);

class FacetFilter extends HTMLElement {
  constructor() {
    super();
    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();

      const currentTarget = event.currentTarget
      const resetUrl = currentTarget.dataset.resetUrl;
      const ajax = this.dataset.ajax;
      const filterUrlToRemove = resetUrl.indexOf('?') == -1 ? '' : resetUrl.slice(resetUrl.indexOf('?') + 1) + '&filter.p.vendor='+ currentTarget.dataset.value;

      tippy !== undefined && tippy.hideAll({exclude: this.querySelector('a')._tippy});

      this.querySelector('.loading-overlay').classList.toggle('hidden');

      if (!FacetFiltersForm.facetsLoaded()) {
        FacetFiltersForm.asyncLoadSidebar(ajax, () => {
          this.render(filterUrlToRemove, event, currentTarget);
        })
      } else {
        FacetFiltersForm.disableSidebar();
        this.render(filterUrlToRemove, event, currentTarget);
      }
    });

    this.addEventListener('mouseenter', () => {
      if(!this.querySelector('a').classList.contains('active')){
        tippy !== undefined && tippy.hideAll({exclude: this.querySelector('a')._tippy})
      }
    });
  }

  render(filterUrlToRemove, event, currentTarget) {
    if (filterUrlToRemove){
      FacetFiltersForm.renderPage(filterUrlToRemove, event, true, () => {
        this.querySelector('.loading-overlay').classList.add('hidden');

        const filterToggleElement = document.querySelector('filter-toggle');
        const filterPopupElement = document.querySelector('filter-popup');

        if (filterToggleElement && !filterToggleElement.isFilterOpened()) {
          filterToggleElement.dataset.filterLoadForce = true
        } else if(filterPopupElement) {
          filterPopupElement.dataset.filterLoadForce = true
        }
      });
    } else {
      document.querySelector('#'+currentTarget.dataset.control).click();
    }
  }
}

customElements.define('facet-filter', FacetFilter);
