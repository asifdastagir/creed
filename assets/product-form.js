if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.productCard = this.closest('product-card');
      this.cartItems = document.querySelector('cart-items');
      this.form = this.querySelector('form') || this.querySelector('[data-form]') || this;
      this.multiple = 'multiple' in this.dataset;
      this.multipleForms = 'multipleForms' in this.dataset;
      this.edit = 'edit' in this.dataset;
      this.scrollElement = this.form?.closest('.js-dropdn-content-scroll');

      if (this.multipleForms) {
        this.querySelector('[data-submit-multiple-forms]').addEventListener('click', this.onSubmitHandler.bind(this))
      } else {
        this.form?.addEventListener('submit', this.onSubmitHandler.bind(this));
      }

      this.querySelector('[data-errorclose]')?.addEventListener('click', this.onClosePopupError.bind(this));

      this.setCheckboxEvents();

      if (this.edit) {
        this.form.addEventListener('change', this.onFormChangeHandler.bind(this));
        this.form.addEventListener('input', this.onFormChangeHandler.bind(this));
      }

      !this.multipleForms && (this.backupFormData = new FormData(this.form));

      if (this.closest('cart-form-element') || this.closest('wishlist-items') && this.closest('.minicart-prd')) {
        moveQuantityNode(this);

        window.addEventListener('resize', debounce(() => {
          moveQuantityNode(this)
        }, 300))
      }
    }

    setCheckboxEvents() {
      if (this.multiple) {
        this.querySelectorAll('[type=checkbox]').forEach(item => item.addEventListener('change', this.onCheckboxCheck.bind(this)));
      }
    }

    afterRenderEvents(e) {
      this.setCheckboxEvents();
      this.onCheckboxCheck(e);
    }

    onFormChangeHandler() {
      this.querySelector('minicart-line-item[data-has-edit-action]').onFormChangeHandler();
    }

    onCheckboxCheck(e) {
      const toggleName = 'toggle_select';
      const toggleSelector = `[name=${toggleName}]`;
      const toggleElement = this.querySelector(toggleSelector);
      const checkboxElements = this.querySelectorAll('[type=checkbox]');
      const updateButton = () => {
        const checkedSize = Array.from(checkboxElements).filter(item => item.name !== toggleName && item.checked).length;
        const checkboxesSize = Array.from(checkboxElements).filter(item => item.name !== toggleName).length;
        const buttonElement = this.querySelector('[type=submit]');
        const buttonTextElement = buttonElement.querySelector('span');
        buttonTextElement.innerHTML = checkedSize ? `${window.variantStrings.addSelectedToCart}`.replace('[count]', String(checkedSize)).replace('[products]', checkedSize === 1 ? window.themeStrings.productCountOne : window.themeStrings.productCountOther) : checkboxesSize === 1 ? window.variantStrings.addToCart : window.variantStrings.addSelectAll;
        buttonElement.dataset.selectAll = String(!checkedSize);
      };
      const toggleCheck = () => {
        if (e && e.target.name === toggleName) {
          checkboxElements.forEach(item => item.checked = e.target.checked);
        } else {
          if (e && e.target.checked === false) {
            toggleElement.checked = false
          } else {
            if (Array.from(checkboxElements).every(item => {
              if (item.name !== toggleName) {
                return item.checked === true
              }
              return true
            })) {
              toggleElement.checked = true;
            }
          }
        }
      };
      const toggleSelectAllElement = () => {
        toggleElement.labels.forEach(item => item.textContent = item.dataset.textWhenChecked);
      };

      toggleCheck();
      updateButton();
    }

    selectAll() {
      const checkboxElements = this.querySelectorAll('[type=checkbox]');
      checkboxElements.forEach(item => item.checked = true);
    }

    onClosePopupError() {
      this.querySelector('.product-form__error-message-wrapper').hidden = true;
    }

    onSubmitHandler(evt) {
      evt && evt.preventDefault();
      let submitButton;

      if (this.multipleForms) {
        submitButton = this.querySelector('[data-submit-multiple-forms]');
      } else {
        submitButton = this.querySelector('[type="submit"]') || this.querySelector('[data-action="add"]');
      }
      if (submitButton.classList.contains('loading-process')) return;

      if (this.multiple && 'selectAll' in submitButton.dataset && submitButton.dataset.selectAll === 'true') {
        this.selectAll();
      }

      this.productCard?.disableHover();

      this.handleErrorMessage();

      submitButton.setAttribute('aria-disabled', true);
      submitButton.classList.add('loading-process');
      this.form.classList.add('loading-process');
      submitButton.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      if ('onlyAnimation' in this.dataset) this.form.submit();

      let config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
      let formData;

      if (!this.multipleForms) {
        formData = new FormData(this.form);

        // if (!isMobile && form.getAll('quantity').length === 2) {
        //   delete второй
        // }
      }



      const sections = Array.from(new Set(this.cartItems.getSectionsToRender().filter(item => Boolean(document.querySelector('#' + item.id))).map(section => section.section))).filter(element => element !== undefined).slice(0, 5);
      const sections_url = window.location.pathname;

      let cartItemsCountOld = document.querySelector('cart-items').querySelectorAll('.minicart-prd').length;

      const getConnected = async () => {
        if (this.edit) {
          let actions = {
            add: {
              url: routes.cart_add_url,
              config: function () {
                formData.append('sections', sections);
                formData.append('sections_url', sections_url);
                config.body = formData;
                return config;
              }
            },
            remove: {
              url: routes.cart_change_url,
              config:
                function () {
                  const formDataRemove = new FormData(this.form);
                  let configRemove = Object.assign({}, config);
                  configRemove.body = formDataRemove;
                  configRemove.body.delete('selling_plan', this.dataset.line);
                  configRemove.body.delete('id', this.dataset.line);
                  configRemove.body.append('line', this.dataset.line);
                  configRemove.body.set('quantity', "0");
                  return configRemove;
                }
            }
          };

          return fetch(actions.remove.url, (actions.remove.config.bind(this))())
            .then(response => response.json())
            .then(response => {
              if (response.status) {
                return;
              }
              return fetch(actions.add.url, (actions.add.config.bind(this))())
                .then(response => response.json())
            })
        } else {
          if (this.multiple) {
            let body = JSON.stringify({ 'items': getItemsFromFormData(), ...{ sections }, ...{ sections_url } });
            config = { ...fetchConfig('javascript'), ...{ body } };

          } else if (this.multipleForms) {
            let items = [], item, formData;

            this.querySelectorAll('form[data-available="true"]').forEach(item => {
              formData = new FormData(item);
              item = { id: formData.get('id'), quantity: formData.get('quantity') };
              formData.get('selling_plan') && (item.selling_plan = formData.get('selling_plan'));
              items.push(item)
            });

            let body = JSON.stringify({ items, ...{ sections }, ...{ sections_url } });
            config = { ...fetchConfig('javascript'), ...{ body } };

          } else {
            formData.append('sections', sections);
            formData.append('sections_url', sections_url);
            config.body = formData;
          }
          const response = await fetch(routes.cart_add_url, config);
          return await response.json();
        }
      };

      getConnected()
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            if (this.edit) {
              this.backupFormData.append('sections', sections);
              this.backupFormData.append('sections_url', sections_url);
              config.body = this.backupFormData;
              fetch(routes.cart_add_url, config);
            }
            return;
          }


            this.cartItems.renderContents(response);
            this.cartItems.toggleEmptyClass(response);


          this.setParsedState(response);
          this.cartItems.setCartJs();

          const shippingCalculator = document.querySelector('shipping-calculator') || document.querySelector('shipping-calculator-cart');
          shippingCalculator?.setUpdateStatus('true');


          if (document.body.classList.contains('template-cart')) {
            jq_lumia.fancybox.close();
            scrollToTopHandler();
          } else {
            if (document.querySelector('body').classList.contains('header-cart-dropdown')) {
              new Promise(resolve => {
                statusDrawer.call(this, response, this.edit);
                setTimeout(() => {
                  return resolve(true)
                }, isCartOpened() ? 0 : 1000);
              }).then(() => {
                const getSection = {
                  section: 'frequently-bought-together-view-cart',
                  selector_to: '[data-render="fbt_cart"]',
                  selector_from: '.shopify-section',
                  getUrl() {
                    let url = window.Shopify.routes.root + `products/${response.handle ? response.handle : response.items[0].handle}?section_id=${this.section}`

                    if (document.body.classList.contains('fbt-app')) {
                      url = window.routes.product_recommendations_url + `?section_id=${this.section}` + `&product_id=${response.product_id ? response.product_id : response.items[0].id }&limit=${document.body.dataset.fbtLimit}&intent=complementary`
                    }

                    return url
                  },
                  load() {
                    return fetch(this.getUrl())
                      .then(response => response.text())
                      .then(response => {
                        const html = new DOMParser().parseFromString(response, 'text/html');
                        const element = html.querySelector('.minicart-prd');
                        if (element) {
                          document.querySelector(this.selector_to).innerHTML = html.querySelector(this.selector_from).innerHTML;
                          document.querySelector('mini-cart-popup')?.openChild();
                        } else {
                          document.querySelector('mini-cart-popup')?.closeChild();
                        }
                      }).catch(e => console.error(e));
                  }
                };
                getSection.load()
              });
            }
          }

          if (this.productCard) {
            this.productCard.enableHover();

            if (!this.productCard.matches(':hover')) {
              this.productCard.onProductUnHover()
            }
          }
        }).catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading-process');
          this.form.classList.remove('loading-process');
          submitButton.removeAttribute('aria-disabled');
          submitButton.querySelector('.loading-overlay__spinner').classList.add('hidden');

          if (!document.querySelector('body').classList.contains('header-cart-dropdown')) {
            const textDefault = submitButton.querySelector('span').textContent;
            const hoverElement = submitButton.querySelector('span.btn-hover-txt');
            const svgDefault = hoverElement?.innerHTML;
            const textElement = submitButton.querySelector('span');

            textElement.textContent = window.variantStrings.added_to_cart
            hoverElement && (hoverElement.textContent = window.variantStrings.added_to_cart)

            setTimeout(()=>{
              textElement.textContent = textDefault
              hoverElement && (hoverElement.innerHTML = svgDefault)
            }, 1000);
          }
        });

      function isCartOpened() {
        return document.querySelector('.dropdn-modal-minicart').classList.contains('is-opened');
      }

      function statusDrawer(response, edit = false) {
        let cartItemsCountNew = document.querySelector('cart-items').querySelectorAll('.minicart-prd').length;
        if (edit) {
          this.cartItems.setStatus('edit', null, 1, !isCartOpened());
        } else {
          if ((cartItemsCountNew > cartItemsCountOld)) {
            const args = response.items ? ['new', null, response.items.length, !isCartOpened()] : '';
            this.cartItems.setStatus(...args);
          } else {
            const variant = response;
            fetch(window.Shopify.routes.root + `cart.js`)
              .then((response) => response.json())
              .then((response) => {
                if (response.items) {
                  let cartLine;
                  function checkPlans(variant, item) {
                    if ('selling_plan_allocation' in variant && 'selling_plan_allocation' in item) {
                      return Object.entries(variant.selling_plan_allocation).toString() === Object.entries(item.selling_plan_allocation).toString();
                    } else if (!('selling_plan_allocation' in variant || 'selling_plan_allocation' in item)) {
                      return true
                    }
                    return false;
                  }

                  cartLine = response.items.findIndex(item => {
                    return item.id === variant.variant_id &&
                      Object.entries(variant.properties).toString() === Object.entries(item.properties).toString() &&
                      checkPlans(variant, item)
                  }
                  ) + 1;
                  this.cartItems.setStatus('updated', cartLine);
                }
              }).catch((e) => {
                console.error(e);
              });
          }
        }
        return true;
      }

      function getItemsFromFormData() {
        const formDataArray = Array.from(formData);
        let items = [];
        let i = 1;
        for (let pair of formData.entries()) {
          pair[0] === 'id' && formDataArray.some(item => item[0] === pair[1]) && (
            formDataArray[i][0] === 'selling_plan' && items.push({
              "id": parseInt(pair[1]),
              "selling_plan": parseInt(formDataArray[i][1]),
              "quantity": parseInt(formDataArray[i + 1][1])
            }) || items.push({
              "id": parseInt(pair[1]),
              "quantity": parseInt(formDataArray[i][1])
            })
          );
          i++;
        }
        return items;
      }
    }

    setParsedState(response) {
      localStorage.setItem('parsedState', JSON.stringify(response));
    }

    handleErrorMessage(errorMessage = false) {
      if (this.multipleForms) {
        this.errorMessageWrapper = this.querySelector('[data-product-form-error-message-wrapper]');
      } else {
        this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper') || this.closest('[data-section-render]').querySelector('.product-form__error-message-wrapper');
      }
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');
      this.multipleForms && this.querySelectorAll('.product-form__error-message-wrapper').forEach(item => item.toggleAttribute('hidden', true));
      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);
      if (errorMessage) {
        if (this.productCard) {
          new Promise(resolve => {
            if (!this.productCard.matches(':hover')) {
              this.productCard.onProductHover();
            }
            resolve();
          }).then(() => {
            this.errorMessage.textContent = errorMessage;
            this.productCard.enableHover();
          })
        } else {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  });
}
