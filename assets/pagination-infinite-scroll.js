class PaginationInfinite extends HTMLElement {
  constructor() {
    super();
    this.pageSelector = this.dataset.container;
    this.loader = document.querySelector("loading-bar");
    this.itemSelector = this.dataset.item;
    const handleIntersection = (entries, observer) => {
      const urlNextElement = this.querySelector('.page-link-next');
      if (!urlNextElement) return;
      if (!entries[0].isIntersecting) return;
      document.querySelector("loading-bar").start();
      this.toggleLoading();
      const url = urlNextElement.href.split('#')[0];
      fetch(url)
        .then(response => {
          return response.text();
        })
        .then(html => {
          this.renderCurrentPage(html, url);
        })
        .catch(e => {
          console.error(e);
        }).finally(() => {
          this.disableLoading();
        });
    };
    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: this.dataset.margin, threshold: 0}).observe(this);
  }

  toggleLoading(){
    const loadingTextElement = document.querySelector('[data-loading-text]');
    const elementNextLink = document.querySelector('.page-link-next');
    if (elementNextLink && loadingTextElement) {
      loadingTextElement.querySelectorAll('span').forEach(item => item.classList.toggle('hidden'));
    }
  }

  disableLoading(){
    const loadingTextElement = document.querySelector('[data-loading-text]');
    if (loadingTextElement && !loadingTextElement.querySelector('.loading-text').classList.contains('hidden')) {
      this.toggleLoading();
    }
  }

  renderCurrentPage(html, url) {
    const renderedDocument = new DOMParser().parseFromString(html, 'text/html');

    if (!renderedDocument.querySelector(this.pageSelector)) return;

    document.querySelector(this.pageSelector).appendChildren(...renderedDocument.querySelector(this.pageSelector).querySelectorAll(this.itemSelector));
    const element = document.querySelector('pagination-infinite');
    const elementSource = renderedDocument.querySelector('pagination-infinite');
    elementSource && elementSource.querySelectorAll('a.pager').forEach((item) => {
      let url = new URL(item.href);
      url.searchParams.delete('view');
      url.searchParams.delete('section_id');
      item.href = url.href
    });
    element.innerHTML = elementSource ? elementSource.innerHTML : null;
    'updateUrl' in this.dataset && this.updateURLHash(url);
    setTimeout(() => {
      document.querySelector("loading-bar").hide();
    }, 500);
  }

  updateURLHash(link) {
    let url = new URL(link);
    url.searchParams.delete('view');
    url.searchParams.delete('section_id');
    url = url.href;
    history.pushState({ url }, '', `${url}`);
  }
}
customElements.define('pagination-infinite', PaginationInfinite);
