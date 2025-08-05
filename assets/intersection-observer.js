class ObserverIntersection extends HTMLElement {
  constructor() {
    super();

    this.dataset.name === 'rvi' && this.addEventListener('quick-view-popup-after-load-extend', function (e) {
      if (e.detail) {
        window[this.dataset.instance].add(e.detail.handle);
        const handler = this.dataset.handler;
        handler && document.querySelectorAll(`[data-handler=${handler}]`).forEach(item => item.dataset.updated = 'true');
      }
    })
  }

  static get observedAttributes() {
    return ['data-updated'];
  }

  disableLoading(){
    setTimeout(() => {
      document.querySelector("loading-bar").hide();
    }, 500);
  }

  renderSection(html) {
    const renderedDocument = new DOMParser().parseFromString(html, 'text/html');
    const destinationEl  = this.querySelector(this.dataset.ajaxContainer);
    const sourceEl = renderedDocument.querySelector('.shopify-section ');

    if (destinationEl && sourceEl) {
      destinationEl.innerHTML = sourceEl.innerHTML
    }

    this.disableLoading();
  }

  fetchSectionHandler(entries) {
    if ('once' in this.dataset && this.dataset.once === 'rendered') return;

    if (!entries[0].isIntersecting) return;

    this.dataset.once = 'rendered'

    fetch(this.dataset.url)
      .then(response => {
        return response.text();
      })
      .then(html => {
        this.renderSection(html);
      })
      .catch(e => {
        console.error(e);
      }).finally(() => {
        this.disableLoading();
      });
  }

  connectedCallback() {
    let handler;

    if (this.dataset.url) {
      handler = this.fetchSectionHandler.bind(this)
    } else {
      handler = window[this.dataset.handler].bind(this)
    }

    new IntersectionObserver(handler, {
      rootMargin: this.dataset.margin,
      threshold: parseFloat(this.dataset.threshold)
    }).observe(this);

  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-updated') {
      window[this.dataset.handler + 'RenderView'].call(this);
    }
  }
}
customElements.define('intersection-observer', ObserverIntersection);
