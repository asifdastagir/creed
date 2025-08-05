class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();

      this.closest('cart-items').updateQuantity(this.dataset.index, 0);
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class MinicartLineItem extends HTMLElement {
  constructor() {
    super();

    this.querySelectorAll('[data-action]').forEach((item) => {
      item.addEventListener('click', this.onActionCLick.bind(this))
    });

    this.elementAdd = this.querySelector('[data-action="add"]');
    this.elementForm = this.closest('product-form');
    this.scrollElement = this.elementForm.closest('.js-dropdn-content-scroll');
  }

  onActionCLick(e) {
    this.target = e.currentTarget;
    const {action} = this.target.dataset;

    this[action](this.target);

    if (action !== 'add') {
      e.preventDefault();
    }
  }

  close(hard = false) {
    this.toggleCurrentForm('edit', hard);
    this.querySelector('[data-action="remove"]')?.classList.remove('hidden');
    this.querySelector('[data-action="edit"]')?.classList.remove('hidden');
    !this.elementAdd?.classList.contains('hidden') && this.elementAdd?.classList.add('hidden','temporary-hidden');

    this.elementForm.querySelector('[data-line-item-preview]')?.classList.remove('hidden');
    this.elementForm.querySelector('[data-line-item-preview-edit]')?.classList.add('hidden');

    const isMobile = window.matchMedia('(max-width:991px)').matches;

    if (isMobile) {
      this.elementForm.querySelectorAll('.minicart-prd-info-bottom').forEach(item => item.classList.remove('hidden'));
    }

    Scrollbar.get(this.scrollElement).update();
    this.closeAllWishlistForms();
  }

  edit() {
    this.closeOthers();
    this.closeAllWishlistForms();
    this.hideStatus();
    this.toggleCurrentForm('close');
    this.querySelector('[data-action="remove"]')?.classList.add('hidden');
    this.elementAdd.classList.toggle('hidden', !(this.elementAdd.classList.contains('temporary-hidden') && this.elementAdd.classList.contains('hidden')));

    this.elementForm.querySelector('[data-line-item-preview]')?.classList.add('hidden');
    this.elementForm.querySelector('[data-line-item-preview-edit]')?.classList.remove('hidden');

    Scrollbar.get(this.scrollElement).update();
    Scrollbar.get(this.scrollElement).scrollIntoView(this.elementForm.closest('.minicart-prd'), {alignToTop: true, offsetTop: 15});
  }

  add() {
    // document.getElementById(this.target.dataset.form).dispatchEvent(new Event('submit'));
  }

  remove() {
    this.closeOthers({minicartLineItem: false});

    if (document.querySelector('body').classList.contains('wishlist-on') && 'removeInterrupt' in this.target.dataset && typeof wishlist !== 'undefined' && !(wishlist.has(null, this.target) > -1)) {
      this.closeAllWishlistForms();
      this.querySelector('[data-action="close"]')?.classList.remove('hidden');
      this.querySelector('[data-action="edit"]')?.classList.add('hidden');
      this.querySelector('[data-action="remove"]')?.classList.add('hidden');
      this.elementForm.querySelector('[data-remove-interrupt="form"]').classList.remove('hidden');
      this.elementForm.querySelector('[data-remove-interrupt="form-closure"]').classList.add('hidden');
      this.hideStatus();

      const isMobile = window.matchMedia('(max-width:991px)').matches;

      if (isMobile) {
        this.elementForm.querySelectorAll('.minicart-prd-info-bottom').forEach(item => item.classList.add('hidden'));
      }

    } else this.removeProcess();
  }

  closeAllWishlistForms() {
    const wrapper = this.closest('cart-items');

    wrapper.querySelectorAll('[data-remove-interrupt="form"]').forEach(item => item.classList.add('hidden'));
    wrapper.querySelectorAll('[data-remove-interrupt="form-closure"]').forEach(item => item.classList.remove('hidden'));

    wrapper.querySelectorAll('minicart-line-item').forEach(item => {
      item.querySelector('[data-action="close"]')?.classList.add('hidden');
      item.querySelector('[data-action="edit"]')?.classList.remove('hidden');
      item.querySelector('[data-action="remove"]')?.classList.remove('hidden');
      !item.elementAdd?.classList.contains('hidden') && item.elementAdd?.classList.add('hidden','temporary-hidden');
    });
  }

  removeProcess() {
    this.target.querySelector('.loading-overlay__spinner').classList.remove('hidden');
    this.target.classList.remove('btn--animated-shakeY');
    this.closest('cart-items').updateQuantity(this.target.dataset.index, 0);

    setTimeout(() => {
      tippy && tippy.hideAll();
    }, 500)
  }

  addToWishlistAndRemove() {
    wishlist.add(null, this.target);
    wishlist.renderComponents();
    this.removeProcess()
  }

  hideStatus() {
    this.elementForm.querySelector('.cart-item__success').classList.add('hidden');
    this.elementForm.querySelector('.cart-item__error').classList.add('hidden');
  }

  toggleCurrentForm(action, hard = false) {
    if (hard) {
      this.querySelector('[data-action="close"]')?.classList.add('hidden');
      this.querySelector('[data-action="edit"]')?.classList.remove('hidden');
      this.elementForm.querySelector('form').classList.add('hidden');
      this.elementForm.querySelector('.header-cart-line-item-body').classList.remove('hidden');
      return;
    }

    this.target.classList.toggle('hidden');
    this.querySelector('[data-action="'+action+'"]').classList.toggle('hidden');
    this.elementForm.querySelector('form').classList.toggle('hidden');
    this.elementForm.querySelector('.header-cart-line-item-body').classList.toggle('hidden');
  }

  onFormChangeHandler() {
    this.querySelector('[data-action="add"]').classList.remove('hidden');
  }

  closeOthers(dismiss = null) {
    const wrapperElement = this.elementForm.closest('.js-contents-cart-items');

    wrapperElement.querySelectorAll('form').forEach(item => {
      item.classList.add('hidden');
    });

    wrapperElement.querySelectorAll('.header-cart-line-item-body').forEach(item => {
      item.classList.remove('hidden');
    });

    wrapperElement.querySelectorAll('minicart-line-item').forEach(item => {
      if (dismiss && dismiss.minicartLineItem === false) return;
      item.querySelector('[data-action="close"]')?.classList.add('hidden');
      item.querySelector('[data-action="edit"]')?.classList.remove('hidden');
      item.querySelector('[data-action="remove"]')?.classList.remove('hidden');
      !item.elementAdd?.classList.contains('hidden') && item.elementAdd?.classList.add('hidden','temporary-hidden');
    });
  }
}

customElements.define('minicart-line-item', MinicartLineItem);

document.querySelector('.dropdn-modal-minicart')?.addEventListener('click', (function (e) {
 if ((!(/*e.target.closest('.minicart-drop-content') ||*/
     'action' in e.target.dataset ||
     e.target.closest('product-form[data-form]') ||
     e.target.parentNode.tagName === 'MINICART-LINE-ITEM'
   ) || e.target.classList.contains('minicart-prd-action')) &&
   !e.target.closest('.minicart-drop-fixed') &&
   !e.target.closest('.js-contents-free-shipping')
 ) document.querySelectorAll('minicart-line-item').forEach(item => item.close(true));
}));


class CartClearButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.querySelector('.loading-overlay').classList.remove('hidden');
      this.closest('cart-items').clearCart();
    });
  }
}

customElements.define('cart-clear-button', CartClearButton);


class CartItems extends HTMLElement {
  constructor() {
    super();
    /*this.cartJs = this.getInitCartJs();*/
    this.cartClearButton = this.querySelector('cart-clear-button');
    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');
    this.currentLineCount = Array.from(this.querySelectorAll('[name="updates[]"]')).length;
    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
    this.onCartPage = this.id === 'main-cart-items';

    this.scrollElement = this.querySelector('.cart-form-element .js-dropdn-content-scroll');


    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
    if (!(this.id === 'header-cart' && this.dataset.onCartPage === 'true')) {
      window.addEventListener('storage', this.onStorageChange.bind(this));
    }
  }

  onStorageChange() {
    if(event.key === 'cartJs') {
      const parsedState = JSON.parse(localStorage.getItem('parsedState'));
      const section = this.dataset.id;
      const renderContentsOnStorageChange = (parsedState) => {
        this.renderContents(parsedState);
        this.toggleEmptyClass(parsedState);
        document.querySelector('shipping-calculator')?.close(true);
        const shippingCalculator = document.querySelector('shipping-calculator') || document.querySelector('shipping-calculator-cart');
        shippingCalculator?.setUpdateStatus('true');
      };

      let sectionsToRender = this.getSectionsToRender().filter(item => Boolean(document.querySelector('#'+item.id))).filter((item, index, self) => self.findIndex((s) => item.id === s.id) === index && item.id !== 'main-cart-items' && item.id !== 'cart-live-region-text').map(item => item.section).slice(0,5);
      if (this.onCartPage) {
        sectionsToRender = [...sectionsToRender, section];
      }
      fetch(`${this.onCartPage ? window.routes.cart_url : window.shopUrl}?sections=${sectionsToRender.join(',')}`).then(response => response.json()).then(response => {
        parsedState.sections = response;
        renderContentsOnStorageChange(parsedState);
      }).catch(e => console.error(e));
    }
  }

  renderContentsAndDependencies(response, line) {
    this.renderContents(response);
    this.toggleEmptyClass(response);
    // this.updateLiveRegions(line, response.item_count);
    localStorage.setItem('parsedState', JSON.stringify(response));

    this.setCartJs();

    const productForm = document.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();

    const shippingCalculator = document.querySelector('shipping-calculator') || document.querySelector('shipping-calculator-cart');
    shippingCalculator?.setUpdateStatus('true');

    document.querySelector('#dropdnMinicartPopup').querySelectorAll('[data-scrollbar]').forEach(scroll => {
      Scrollbar.get(scroll)?.update()
    });
  }

  setCartJs() {
    fetch(window.Shopify.routes.root+`cart.js`)
      .then((response) => response.json())
      .then((response) => {
        localStorage.setItem('cartJs', JSON.stringify(response));
        this.cartJs = response;
      }).catch((e) => {
      console.error(e);
    });
  };

  getInitCartJs() {
    this.cartJs = this.cartJs || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.cartJs;
  }

  onChange(event) {
    if (event.target.name !== 'updates[]') return;
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  setStatus(status = 'new', id = null, size = 1, cartToggle = true) {
    let element, elements;
    if (status === 'new') {
      elements = document.querySelector('cart-items').querySelectorAll('.cart-item__success');
      element = elements[0];
      elements && elements.forEach((item, i) => {
        if (i < size) {
          const successTextElement = item.querySelector('.cart-item__success-text');
          if (successTextElement) {
            successTextElement.innerHTML = window.cartStrings.successfully_added;
            item.classList.remove('hidden');
          }
        }
      });
    } else if (status === 'edit') {
      element = document.querySelector('cart-items').querySelector('.cart-item__success');
      if (element) {
        const successTextElement = element.querySelector('.cart-item__success-text');
        if (successTextElement) {
          successTextElement.innerHTML = window.cartStrings.successfully_line_item_updated;
          element.classList.remove('hidden');
        }
      }
    } else {
      element = document.getElementById(`Variant-item-success-${id}`);
      if(element) {
        element.querySelector('.cart-item__success-text')
          .innerHTML = window.cartStrings.successfully_updated;
        element.classList.remove('hidden');
      }
    }
    cartToggle && this.cartToggle();

    document.querySelector('shipping-calculator')?.close(true);

    if(element) {
      new Promise(resolve => {
        setTimeout(() => {
          Scrollbar.get(document.querySelector('#dropdnMinicartPopup').querySelector('.cart-form-element .js-dropdn-content-scroll'))?.scrollTo(0, element.closest('.minicart-prd').offsetTop, 600);
          resolve(true);
        }, 600)
      }).then(response => {
        setTimeout(() => {
          element && element.querySelector('button-animated')?.onesAnimate();
          elements && elements.forEach(item => item.querySelector('button-animated')?.onesAnimate());
        }, 600);
      })
    }
  }

  cartToggle() {
    document.querySelector('mini-cart-popup')?.open();
  }

  setParsedState(response) {
    localStorage.setItem('parsedState', JSON.stringify(response));
  }

  async getSectionsRendered() {
    const sections = Array.from(new Set(this.getSectionsToRender().filter(item => Boolean(document.querySelector('#' + item.id))).map(section => section.section))).filter(element => element !== undefined).slice(0, 5);

    if (!sections) return;

    return Promise
      .all(sections.map(section => fetch(window.Shopify.routes.root + `?section_id=${section}`)))
      .then(responses => Promise.all(responses.map(response => response.text())))
      .then(responses => {
        return responses.map((response, index) => {
            const section = {}

            section[sections[index]] = response

            return section;
        })
      })
      .then(response => {
        const data = {}

        data.sections = Object.assign({}, ...response );

        const headerCartHtml = new DOMParser().parseFromString(data.sections['header-cart'], 'text/html');

        data.item_count = headerCartHtml.querySelectorAll('.minicart-prd').length;

        return data
      })
      .catch((e) => {
        console.error(e);
      })
  }

  renderAndOpenMiniCartPopup() {
    this.getSectionsRendered()
        .then((response) => {
          this.renderContents(response);
          this.toggleEmptyClass(response);

          this.setParsedState(response);
          this.setCartJs();

          const shippingCalculator = document.querySelector('shipping-calculator') || document.querySelector('shipping-calculator-cart');
          shippingCalculator?.setUpdateStatus('true');

          document.querySelector('mini-cart-popup')?.open()

        }).catch((e) => {
          console.error(e);
        })
  }

  renderContents(parsedState) {
    if (!parsedState.sections) location.reload(true);

    let destination;

    if (document.querySelector('body').classList.contains('header-cart-dropdown') || document.body.classList.contains('template-cart')) {
      Popup.clearQuickViewCache();
      Popup.closePopupExeptCart();
    }

    document.querySelectorAll('mini-cart-popup').forEach(el => el.removeCarousel());


    this.getSectionsToRender().forEach((section => {
      if (!(section.render_on_cart_page_only && !this.onCartPage) || section.not_render_on_cart_page_only && !this.onCartPage) {
        if (section.bubble) {
          document.querySelectorAll(section.selector)?.forEach(destination => {
            destination.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          });
          if(section.free_shipping) {
            try {
              const freeShippingSelector = '[data-free-shipping-status]';
              const freeShippingElement = document.querySelector(freeShippingSelector);
              const freeShippingElements = document.querySelectorAll(freeShippingSelector);
              if (freeShippingElement) {
                const freeShippingStatus = freeShippingElement.dataset.freeShippingStatus;
                if (freeShippingStatus === 'true' && (!localStorage.getItem('lumiaFreeShipingStatus')
                  || localStorage.getItem('lumiaFreeShipingStatus') === 'false')) {
                  freeShippingElements.forEach(item => {
                    const element = item.querySelector('[data-animated-element]');
                    element.classList.remove('text-animated-static');
                    element.classList.add('text-animated');
                  });
                }
                localStorage.setItem('lumiaFreeShipingStatus', freeShippingStatus);
              }
            } catch (e) {
              console.error(e)
            }
          }
        } else {
          destination = document.getElementById(section.id);
          if (destination !== null) {
            if(section.selector) {
              if (destination.querySelector(section.selector) !== null) {
                destination = destination.querySelector(section.selector);
              }
            } else {
              section.selector = '#' + section.id;
            }
            if (this.isSectionInnerHTML(parsedState.sections[section.section], section.selector)) {
              destination.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
              if (section.show_hidden && destination.querySelector('.hidden[data-render-only]')) {
                destination.querySelector('.hidden[data-render-only]').classList.toggle('hidden');
              }
              const elementWithShowOnScroll = destination.querySelector('.show-on-scroll');
              elementWithShowOnScroll && elementWithShowOnScroll.classList.toggle('is-visible');
            }
          }
        }
      }
    }));
    this.currentLineCount = document.querySelector('cart-items').querySelectorAll('[name="updates[]"]').length;
    document.querySelector('cart-items').classList.toggle('is-empty', this.currentLineCount === 0);

    document.querySelectorAll('.cart-table-prd').forEach(item=>{
      moveQuantityNode(item)
    });

    agreementCheckbox && agreementCheckbox.checkAgreementAll();

    setTimeout(() => {
      this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
        .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
      if (this.currentItemCount === 0) {
        this.createDrawerCarousel()
      }
    });
  }

  getSectionsToRender() {
    return [
      {
        id: 'header-cart',
        section: 'header-cart',
        selector: '.js-contents-subtotal',
      },
      {
        id: 'header-cart',
        section: 'header-cart',
        selector: '.js-contents-cart-items'
      },
      {
        id: 'header-cart',
        section: 'header-cart',
        selector: '.js-contents-buttons'
      },
      {
        id: 'dropdnMinicartPopup',
        section: 'header-cart',
        selector: false,
        render_on_cart_page_only: true
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.header-cart-count',
        not_render_on_cart_page_only: true,
        bubble: true
      },
      {
        id: 'async-product-in-cart',
        section: 'async-product-in-cart',
        selector: '.async-product-in-cart',
        bubble: true
      },
      {
        id: 'header-minicart-sticky',
        section: 'header-minicart-sticky',
        selector: '.js-minicart-link',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items')?.dataset.id,
        selector: '.js-contents-cart-items-empty',
      },
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items')?.dataset.id,
        selector: '.js-contents-cart-items',
      },
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items')?.dataset.id,
        selector: '.js-contents-subtotal',
      },
      {
        id: 'header-cart',
        section: 'header-cart',
        selector: '.js-contents-free-shipping',
        free_shipping: true,
        bubble: true
      },
      {
        id: 'fbt_inner-list',
        section: 'frequently-bought-together-view-inner-list',
        selector: '[data-render-after-cart-update]',
        show_hidden: true
      },
      {
        id: 'fbt_inner-grid',
        section: 'frequently-bought-together-view-inner-grid',
        selector: '[data-render-after-cart-update]',
        show_hidden: true
      },
      {
        id: 'fbt_outer-grid',
        section: 'frequently-bought-together-view-outer-grid',
        selector: '[data-render-after-cart-update]',
        show_hidden: true
      },
      {
        id: 'fbt_outer-grid-2',
        section: 'frequently-bought-together-view-outer-grid-2',
        selector: '[data-render-after-cart-update]',
        show_hidden: true
      }
    ];
  }

  clearCart(line, quantity, name) {
    const body = JSON.stringify({
      sections: Array.from(new Set(this.getSectionsToRender().filter(item => Boolean(document.querySelector('#'+item.id))).map((section) => section.section))).filter(element => element !== undefined).slice(0,5),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_clear_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => response.json())
      .then((response) => {
        this.renderContentsAndDependencies(response, line);
        this.cartClearButton.querySelector('.loading-overlay').classList.add('hidden');
      }).catch((e) => {
      console.error(e);
      document.getElementById('cart-errors').textContent = window.cartStrings.error;
    });
  }

  createDrawerCarousel() {
    setTimeout(() => {
      document.querySelectorAll('mini-cart-popup').forEach(el => el.createCarousel());
    }, 0);
  }

  toggleEmptyClass(response) {
    document.querySelectorAll('cart-items').forEach(item => item.classList.toggle('is-empty', response.item_count === 0));
    response.item_count === 0 && document.querySelector('mini-cart-popup')?.closeChild();
  }


  updateQuantity(line, quantity, name) {
    quantity && this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: Array.from(new Set(this.getSectionsToRender().filter(item => Boolean(document.querySelector('#'+item.id))).map((section) => section.section))).filter(element => element !== undefined).slice(0,5),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => response.json())
      .then((response) => {
        if (response.errors) {

          const elementSuccess = document.getElementById(`Variant-item-success-${line}`);

          if (elementSuccess) {
            elementSuccess.classList.toggle('hidden', true);
          }

          document.querySelectorAll('.cart-item__error').forEach(el => el.classList.toggle('hidden', true));

          const element = document.getElementById(`Line-item-error-${line}`);

          if (element !== null) {
            element.classList.toggle('hidden', false);
            element.querySelector('.cart-item__error-text')
              .innerHTML = response.errors;
          }
        } else {
          this.renderContentsAndDependencies(response, line);
        }

        const lineItem =  document.getElementById(`CartItem-${line}`);

        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus();

        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        this.disableLoading();
      })
      .catch((e) => {
        console.error(e);
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));

        const cartErrorElement = document.getElementById('cart-errors');
        cartErrorElement && (cartErrorElement.textContent = window.cartStrings.error);
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const element = document.getElementById(`Line-item-error-${line}`);
      if (element !== null) {
        element.classList.toggle('hidden', false);
        element.querySelector('.cart-item__error-text')
          .innerHTML = window.cartStrings.quantityError.replace(
            '[quantity]',
            document.getElementById(`Quantity-${line}`).value
          );
      }
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  isSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector) ?? false;
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    document.getElementById('main-cart-items')?.classList.add('cart__items--disabled');
    document.getElementById('header-cart')?.classList.add('cart__items--disabled');
    this.querySelectorAll(`#CartItem-${line} .loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'));
    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    document.getElementById('main-cart-items')?.classList.remove('cart__items--disabled');
    document.getElementById('header-cart')?.classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items', CartItems);

class ToggleMinicartActions extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.onButtonClick.bind(this));
  }
  onButtonClick(event) {
    event.preventDefault();

    document.querySelectorAll('.minicart-drop-content .minicart-prd').forEach(item => {
      if (this.closest('.minicart-prd') !== item.closest('.minicart-prd')) {
        item.classList.remove('is-opened');
      }
    });
    this.closest('.minicart-prd').classList.toggle('is-opened');
  }
}
customElements.define('toggle-minicart-actions', ToggleMinicartActions);

document.querySelectorAll('.minicart-drop').forEach(item => item.addEventListener('click', function(e) {
  const isMobile = window.matchMedia('(max-width:991px)').matches;

  if (isMobile) {
    if (!(e.target.closest('minicart-line-item') || e.target.closest('toggle-minicart-actions') || e.target.closest('.minicart-prd-action')) ||
      e.target.closest('[data-action="edit"]') ||
      e.target.closest('[data-action="remove"]') && 'removeInterrupt' in e.target.closest('[data-action="remove"]').dataset && typeof wishlist !== 'undefined' && !(wishlist.has(null, e.target.closest('[data-action="remove"]')) > -1) ||
      e.target.closest('[data-action="close"]')
    ) {
      document.querySelector('.minicart-drop-content .minicart-prd.is-opened')?.classList.remove('is-opened');
    }
  }
}));
