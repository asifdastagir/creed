String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', 'false');

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    })
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach(animation => animation.play());
    } else {
      this.animations.forEach(animation => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return;
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

try {
  document.querySelector(":focus-visible");
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.cachedResults = {};
    this.catalogMode = this.dataset.catalogMode;
    this.groupTag = 'select';
    this.groupOptionTag = 'option';
    this.sectionLayout = this.dataset.sectionLayout;
    this.sectionId = this.dataset.sectionId;
    this.section = this.closest('[data-section-render]');
    this.requestPageType = this.dataset.requestPageType;
    this.addEventListener('change', this.onVariantChange);
    this.initVariant = this.getVariantData().find(variant => variant.id === parseInt(this.dataset.initVariant));
    this.currentVariant = this.getVariantData().find(variant => variant.id === parseInt(this.dataset.initVariant));
    if (this.tagName !== 'VARIANT-SELECT') this.disableUnavailable();
    this.updateQuantityStatus(this.currentVariant?.option1)
  }

  onVariantChange() {
    this.renderSection();
    this.syncOptions();
  }

  renderSection() {
    this.updateOptions();
    this.updateMasterId();
    this.disableUnavailable();
    this.updateQuantityStatus(this.currentVariant?.option1);
    // this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    if (!this.currentVariant) {
      // this.toggleAddButton(true, '', true);
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.updateOptionTitles();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  disableUnavailable() {
    if (this.options) {
      if (this.options.length > 3) return;
    }

    if (this.currentVariant) {
      if (this.currentVariant.options.length > 3) return;
    }

    let groupTag = this.groupTag;
    let groupOptionTag = this.groupOptionTag;
    let groupsSelector = `${groupTag}:not(.option-first)`;
    let groups = Array.from(this.querySelectorAll(groupsSelector));
    let groupsAll = Array.from(this.querySelectorAll(groupTag));

    let optionsAll = this.querySelectorAll(`${groupsSelector} ${groupOptionTag}`);
    if (groups.length) {
      if (groupOptionTag === 'input') optionsAll.forEach(el => el.parentElement.classList.add('disabled'));
      else optionsAll.forEach(el => el.disabled = true);

      if (!this.currentVariant) {
        let groupLast = groups[groups.length - 1];
        const optionChecked = groupLast.querySelector(groupOptionTag + ':checked');
        if (groupOptionTag === 'input') optionChecked.checked = false;
        else optionChecked.selected = false;

        groupLast.querySelectorAll(groupOptionTag).forEach(input => {
          if (!this.currentVariant) {
            if (groupOptionTag === 'input') {
              input.checked = true;
              this.setGroupSwatchActive(input);
            } else {
              input.selected = true;
            }
            this.updateOptions();
            this.updateMasterId();
          }
        });

        if (!this.currentVariant) {
          let option1 = this.querySelector(`${groupTag} ${groupOptionTag}:checked`).value;
          this.currentVariant = this.getVariantData().find(variant => variant.option1 === option1);
          if (this.currentVariant) {
            groups.forEach((group, key) => {
              let value = this.currentVariant.options[key + 1];
              const optionChecked = group.querySelector(groupOptionTag + ':checked');
              const optionToCheck = group.querySelector(`[value="${value}"]`);
              if (groupOptionTag === 'input') {
                optionChecked.checked = false;
                optionToCheck.checked = true;
              } else {
                optionChecked.selected = false;
                optionToCheck.selected = true;
              }
            });
          }

          this.updateOptions();
        }
      }

      for (let i = 0; i < groups.length; i++) {
        let variants = this.getVariantData().filter(variant => {
          if (i === 0) return variant.options[i] === this.currentVariant.options[i];
          if (i === 1) return variant.options[i - 1] === this.currentVariant.options[i - 1] && variant.options[i] === this.currentVariant.options[i];
        });

        variants.forEach(variant => {
          let optionsGroup = groups[i].querySelectorAll(`${groupsSelector} ${groupOptionTag}`);
          let item = Array.from(optionsGroup).find(option => {
            return option.value === variant.options[i + 1];
          });
          if (groupOptionTag === 'input') item.parentElement.classList.remove('disabled');
          else item.disabled = false;
        });
      }

      this.drawQuantityStatus(groups.at(-1));
    } else {
      if (groupOptionTag === 'input') {
        this.drawQuantityStatus(groupsAll.at(-1));
      }
    }
  }

  setGroupSwatchActive(el) {
    const group = el.closest(this.groupTag);

    group.querySelectorAll('label').forEach(el => {
      el.classList.remove('swatch-active');
    });

    el.parentElement.classList.add('swatch-active');
  }


  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));

    this.options = fieldsets.map((fieldset) => {
      let isSelectedRow = Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked);
      if (!isSelectedRow) {
        fieldset.querySelectorAll('input')[0].checked = true;
      }
      isSelectedRow = Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked);
      fieldset.querySelectorAll('label').forEach((label) => {
        label.classList.remove('swatch-active');
      });
      if (isSelectedRow) {
        const parentLabel = isSelectedRow.closest('label');
        if (parentLabel) {
          parentLabel.classList.add('swatch-active');
        }
      }
      return isSelectedRow.value;
    });
  }

  drawQuantityStatus(lastOptionsFieldset) {
    const inventoryStatus = this.dataset.inventoryStatus === "true";

    if (!inventoryStatus) return

    if (event instanceof Event && event.type === 'change') {
      return
    }


    if (event && (event.currentTarget || event.target)) {
      const target = event.currentTarget || event.target
      const group = target.closest(this.groupTag)

      if (group) {
        const optionIndex = +(group.dataset.lvl) + 1


        if (optionIndex === this.currentVariant.options.length) {
          return
        }
      }

    }






    lastOptionsFieldset.querySelectorAll('label').forEach((label) => {
      const quantityStatusEl = label.querySelector('.quantity-status');

      const oldStatus = quantityStatusEl ? quantityStatusEl.outerHTML : '';

      // quantityStatusEl.forEach(el => el.remove());

      const inputValue = label.querySelector('input').value;
      const quantityStatus = this.quantityStatus?.find(item => item[inputValue])?.[inputValue];

      if (oldStatus !== quantityStatus) {
        quantityStatusEl?.remove()
        quantityStatus && label.appendChild(createElementFromHTML(quantityStatus));
      }

    })
  }

  onVariantMouseenter(el) {

    if (this.options) {
      if (this.options.length > 2) return
    }

    if (this.currentVariant) {
      if (this.currentVariant.options.length > 2) return;
    }

    let groupTag = this.groupTag;
    let groupOptionTag = this.groupOptionTag;
    let lvls = this.dataset.lvls;
    let lvl = parseInt(el.closest(groupTag).dataset.lvl);
    if (lvl < (lvls - 1)) {
      let optionHover = el.querySelector('input').value;
      const option1 = this.querySelectorAll(groupTag)[0].querySelector(groupOptionTag + ':checked')?.value;
      let groupToRender = Array.from(this.querySelectorAll(groupTag))[lvl + 1];
      let optionsToRender = groupToRender.querySelectorAll(`${groupOptionTag}`);
      optionsToRender.forEach(el => el.parentElement.classList.add('disabled'));
      let variants = this.getVariantData().filter(variant => {
        if (lvl === 0) return variant.options[0] === optionHover;
        if (lvl === 1) return variant.options[0] === option1 && variant.options[1] === optionHover;
      });
      variants.forEach(variant => {
        let item = Array.from(optionsToRender).find(input => input.value === variant.options[lvl + 1]);
        item.parentElement.classList.remove('disabled');
      })

      try {
        this.updateQuantityStatus(optionHover)
        this.drawQuantityStatus(groupToRender)
      } catch (error) {
        console.error('onVariantMouseenter for quantity status', error);
      }
    }
  }

  onVariantMouseout() {
    if (!this.currentVariant) return;

    this.disableUnavailable();

    try {
      this.updateQuantityStatus(this.currentVariant.option1)
      this.disableUnavailable()
    } catch (error) {
      console.error('onVariantMouseout for quantity status', error);
    }
  }

  updateOptionTitles() {
    this.querySelectorAll('[data-option-value]').forEach((el, key) => {
      el.textContent = this.currentVariant.options[key]
    })
  }

  syncOptions() {
    const sectionsToSync = ['product-sticky', 'product'];
    if (sectionsToSync.includes(this.sectionLayout)) {
      const destination = this.sectionLayout === sectionsToSync[0] ? sectionsToSync[1] : sectionsToSync[0];
      const variantRadios = document.querySelector('variant-radios[data-section-layout="' + destination + '"]');
      const variantSelects = document.querySelector('variant-selects[data-section-layout="' + destination + '"]');
      if (variantRadios || variantSelects) {
        const variantPicker = variantRadios ? variantRadios : variantSelects;
        const fieldsets = variantPicker.querySelectorAll(variantRadios ? 'fieldset' : 'select');
        if (fieldsets) {
          fieldsets.forEach((group, index) => {
            group.querySelectorAll(variantRadios ? 'input' : 'option').forEach(el => {
              if (variantRadios) el.checked = false; else el.selected = false;
            });
            group.querySelectorAll(variantRadios ? 'input' : 'option').forEach((el, index2) => {
              if (el.value === this.options[index]) {
                if (variantRadios) {
                  this.setGroupSwatchActive(el);
                  el.checked = true
                } else {
                  el.selected = true
                }

              }
            });
            group.value = this.options[index];
          })
          variantPicker.renderSection();
        }
      }
    }
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateQuantityStatus(option1) {
    if (!this.currentVariant) return;
    if (this.currentVariant.options.length > 2) return;

    const inventoryStatus = this.dataset.inventoryStatus === "true";
    if (!inventoryStatus) return

    const inventoryManyInStockFrom = +this.dataset.inventoryManyInStockFrom;
    const inventoryLowInStockLessThan = +this.dataset.inventoryLowInStockLessThan;


    const quantities = this.getVariantData().filter(
      variant => variant.available && (this.currentVariant.options.length === 1 || variant.option1 === option1))
      .map(
        ({ inventory_management, inventory_quantity, inventory_policy, options }) => {
          // let qs_class = ''
          // let qs_width = 0

          let html = ''
          const { qs_class, qs_width } = getQuantityStatusClass({
            inventoryQuantity: inventory_quantity,
            inventoryManagement: inventory_management,
            inventoryPolicy: inventory_policy,
            inventoryManyInStockFrom,
            inventoryLowInStockLessThan
          });


          // if (inventoryQuantity >= inventoryManyInStockFrom || (inventoryManagement == 'shopify' && inventoryPolicy == 'continue')) {
          //   qs_class = 'start'
          //   qs_width = 100
          // } else {
          //   if (inventoryQuantity < inventoryManyInStockFrom) {
          //     qs_class = 'middle'
          //     qs_width = 60
          //   }

          //   if (inventoryQuantity < inventoryLowInStockLessThan) {
          //     qs_class = 'full'
          //     qs_width = 30
          //   }
          // }



          if (qs_class) {
            html = `<div class="quantity-status qs--${qs_class}" style="--qty-status-persent: ${qs_width}%;"></div>`
          }

          return {
            [options.at(-1)]: html
          }
        }
      )


    if (quantities.length) {
      this.quantityStatus = quantities
    }
  }


  updateMedia() {
    if (!this.currentVariant) return;

    const currentVariantImageSrc = this.currentVariant.featured_media?.preview_image.src;

    if (this.sectionLayout === 'product' || this.sectionLayout === 'quick-view') {
      const productContainer = this.closest('.prd-block');
      const productGalleryElement = productContainer.querySelector('product-gallery');
      const scrollSync = productGalleryElement?.dataset.scrollSync || false;
      const isScrollSync = (scrollSync === 'true');
      const modelVariantsSchemaElement = document.querySelector('[id^="3d-model-variants"]');
      let modelVariantsSchema
        , modelVariantsSchemaVariant
        , modelElement
        , changeModel
        , nodes
        , target
        , galleryMain;

      if (modelVariantsSchemaElement) {
        modelVariantsSchema = JSON.parse(modelVariantsSchemaElement.textContent)
        modelVariantsSchemaVariant = modelVariantsSchema.find(item => item[0] == this.currentVariant.id);

        if (modelVariantsSchemaVariant) {
          modelElement = Array.from(productContainer.querySelectorAll('product-gallery model-viewer')).find(item => item.availableVariants.includes(modelVariantsSchemaVariant[1]));

          if (modelVariantsSchema && modelVariantsSchemaVariant && modelElement) {
            changeModel = true

            galleryMain = modelElement.closest('.js-product-main-carousel');
            nodes = galleryMain.querySelectorAll('[data-media-id]');
            target = modelElement.closest('[data-media-id]');
          }
        }
      }



      if (changeModel) {
        modelElement.variantName = modelVariantsSchemaVariant[1];
      } else {
        if (!this.currentVariant.featured_media) return;

        const newMedia = document.querySelector(
          `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
        );

        if (!newMedia) return;

        galleryMain = productContainer.querySelector('.js-product-main-carousel');
        nodes = galleryMain.querySelectorAll('[data-media-id]');
        target = galleryMain.querySelector(`[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`);
      }

      const hasColorOption = this.dataset.hasColorOption === 'true';
      const colorOptionOrder = parseInt(this.dataset.colorOptionOrder);
      const productGallery = productContainer.querySelector('product-gallery');
      const colorGroups = productGallery.dataset.colorGroups;
      const colorName = colorGroups && this.currentVariant.options[colorOptionOrder].toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
      const selectedColorGroupAvailable = colorGroups && colorGroups.split(',').some(item => item === colorName)

      if (hasColorOption && colorGroups && selectedColorGroupAvailable) {
        productGallery.filter(`color-${colorName}`)
      } else {
        const index = [].indexOf.call(nodes, target);

        productGallery.filter('all', false, index);
      }

      productGalleryElement.updateZoomLink(currentVariantImageSrc)
    } else {
      if (!this.currentVariant.featured_media) return;

      if (this.sectionLayout === 'product-card' || this.sectionLayout === 'product-card-horizontal') {
        this.closest('product-card').updateImage(this.currentVariant.id);

      } else if ('product-card-compact, product-card-wishlist, product-sticky, header-cart-line-item'.includes(this.sectionLayout)) {
        let sizedImageUrl = '';
        const parentElement = this.closest('.minicart-prd') || this.closest('.sticky-add-to-cart');
        sizedImageUrl = theme.Images.getSizedImageUrl(currentVariantImageSrc, 156 * 2);

        sizedImageUrl && parentElement.querySelector('minicart-prd-img').updateImage(sizedImageUrl);
      }
    }
  }

  updateURL() {
    if (this.sectionLayout === 'product') {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    } else {
      this.section.querySelectorAll(`[data-url]`).forEach(el => {
        el.setAttribute('href', `${this.dataset.url}?variant=${this.currentVariant.id}`);
      });
    }
  }

  updateShareUrl() {
    if (this.sectionLayout !== 'product') return;
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    let formElement = this.section.querySelectorAll(`form`);
    formElement = formElement.length ? formElement : this.section.querySelectorAll(`[data-form]`);
    formElement.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      if (input) {
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  updatePickupAvailability() {
    if (this.sectionLayout !== 'product') return;

    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    if (!this.section) return;
    const productForm = this.section.querySelector('[data-form]') || this.closest('product-form');
    if (productForm && productForm.getAttribute('id') !== 'product-form-installment') productForm.handleErrorMessage();
  }

  renderProductInfo() {
    let section = this.sectionId;
    if (this.sectionLayout === 'product') {
      section = this.dataset.sectionId
    }
    /* const url = this.requestPageType === 'search' ? this.dataset.url + '&amp;' : this.dataset.url+'?'; */
    const url = this.dataset.url;
    const queryKey = section + '-' + this.sectionLayout + '-' + this.currentVariant.id;

    if (this.cachedResults[queryKey]) {
      this.productRenderElements(this.cachedResults[queryKey], section);
      return;
    }
    fetch(`${url}?variant=${this.currentVariant.id}&section_id=${section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.cachedResults[queryKey] = html;
        this.productRenderElements(html, section);
      });
  }

  productRenderElements(html) {
    this.section.querySelectorAll('[data-render]').forEach(destination => {
      if (this.closest('products-card-compact') || !destination.closest('products-card-compact')) { //disabling fbt rendering
        const source = html.querySelector(`[data-render=${destination.dataset.render}]`);
        if (source) destination.innerHTML = source.innerHTML;
      }
    });
    const price = this.section.querySelector(`[data-render=price]`);
    if (price) price.classList.remove('hidden');

    // this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
    this.closest('product-form') && 'afterRenderEvents' in this.closest('product-form').dataset && this.closest('product-form')?.afterRenderEvents();
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = this.section.querySelector('[data-form]');
    if (!productForm) return;
    let addButton = productForm.querySelector('[name="add"]');
    let addButtonText = addButton?.querySelector('span');
    let preOrder = productForm.querySelector('[data-form-preorder]');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');

      const preOrderCondition = this.currentVariant.inventoryManagement && this.currentVariant.inventoryQuantity < 1;
      /*const preOrderCondition = this.currentVariant.inventoryManagement && this.currentVariant.inventoryQuantity < 1 || this.currentVariant.available && !this.currentVariant.inventoryQuantity;*/

      preOrder.disabled = !preOrderCondition;

      if (this.currentVariant.requires_selling_plan) {
        addButtonText.textContent = window.variantStrings.addSubscriptionToCart;
      } else {
        addButtonText.textContent = preOrderCondition ? window.variantStrings.preOrder : window.variantStrings.addToCart;
      }
    }

    this.setUnavailable(addButtonText);

    /* if (this.sectionLayout === 'product') {
       let destination = document.getElementById(`js-modal-info-link-${this.dataset.section}`);
       if (disable) {
         destination?.classList.add('hidden');
       } else {
         destination?.classList.remove('hidden');
       }
     }*/

    if (!modifyClass) return;
  }

  setUnavailable(addButtonText) {
    if (!this.currentVariant) {
      addButtonText.textContent = window.variantStrings.unavailable;
      /*const price = this.section.querySelector(`[data-render=price]`);
      if (price) price.classList.add('hidden')*/
    }
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);

    if (this.options && this.options.length < 3) {
      this.variantData = this.variantData.filter(variant => variant.available);
    }

    if (this.inventoryData) {
      this.variantData = mergeInventoryData(this.variantData, this.inventoryData)
    }

    return this.variantData;
  }

}

customElements.define('variant-selects', VariantSelects);

class VariantSelect extends VariantSelects {
  onVariantChange(e) {
    let index;
    const getWishlist = typeof wishlist !== 'undefined' && wishlist && this.dataset.sectionLayout === 'product-card-wishlist';
    getWishlist && (index = wishlist.remove(null, this));
    this.updateMasterId(e);
    if (getWishlist) {
      wishlist.add(null, this, index);
      wishlist.renderComponents('wishlist-items');
    }
    this.updateMedia();
    this.removeErrorMessage();
    this.renderProductInfo();
    this.updateURL();
  }

  updateMasterId(e) {
    this.currentVariant = this.getVariantData().find(variant => variant.id == e.target.value);
    this.dataset.variantId = this.currentVariant.id
  }
}


customElements.define('variant-select', VariantSelect);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
    this.groupTag = 'fieldset';
    this.groupOptionTag = 'input';
    if (!this.classList.contains('show_colors_only')) {
      this.querySelectorAll('label').forEach(item => item.addEventListener('mouseover', this.onVariantMouseenter.bind(this, item)));
      this.querySelectorAll('label').forEach(item => item.addEventListener('mouseout', this.onVariantMouseout.bind(this)));
      this.querySelectorAll('label').forEach(item => item.addEventListener('click', this.onVariantClick.bind(this)));
      this.currentVariant = this.getVariantData().find(variant => variant.id === parseInt(this.dataset.initVariant));
      this.disableUnavailable();
      this.updateQuantityStatus(this.currentVariant?.option1)
    }
  }


  connectedCallback() {
    this.fetchInventoryData();
  }

  async fetchInventoryData() {
    const response = await fetch(`${this.dataset.url}?section_id=async-product-inventory`);
    const html = await response.text();
    this.inventoryData = parseHtmlJsonToArray(html);

    this.updateQuantityStatus(this.currentVariant?.option1)
    this.disableUnavailable();
  }

  onVariantClick(e) {
    const target = e.currentTarget;
    const group = target.closest(this.groupTag);

    group.querySelectorAll('label').forEach(element => {
      element.classList.remove('swatch-active');
    });

    target.classList.add('swatch-active')
  }


  setGroupSwatchActive(el) {
    const group = el.closest(this.groupTag);

    group.querySelectorAll('label').forEach(el => {
      el.classList.remove('swatch-active');
    });

    el.parentElement.classList.add('swatch-active');
  }




  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      let isSelectedRow;
      isSelectedRow = Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked);

      if (!isSelectedRow) {
        fieldset.querySelectorAll('input')[0].checked = true
      }

      isSelectedRow = Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked);

      return isSelectedRow.value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class CartNote extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', debounce((event) => {
      const body = JSON.stringify({ note: event.target.value });
      Array.from(document.querySelectorAll(`[name=${event.target.name}]`)).filter(item => item != event.target).forEach(item => item.value = event.target.value);
      fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
    }, 300))
  }
}
customElements.define('cart-note', CartNote);

class LocalizationForm extends HTMLElement {
  constructor() {
    super();

    this.elements = {
      input: this.querySelector('input[name="locale_code"]'),
    };

    this.querySelectorAll('li:not([data-other]) a').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
  }

  onItemClick(event) {
    event.preventDefault();

    const form = this.querySelector('form');

    this.elements.input.value = event.currentTarget.dataset.value;

    if (form) form.submit();
  }
}

customElements.define('localization-form', LocalizationForm);

window.theme = window.theme || {};
theme.Images = (function () {
  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element);
    } else {
      element.src = imageUrl;
    }
  }

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(
      /.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\\.@]/
    );

    if (match !== null) {
      if (match[2] !== undefined) {
        return match[1] + match[2];
      } else {
        return match[1];
      }
    } else {
      return null;
    }
  }

  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    if (src === null) {
      return null;
    }

    return src + '&width=' + size;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

function onSaveAttrListener(e) {
  const target = e.currentTarget;
  if (target.dataset.handler) {
    window[target.dataset.handler].call(target);
  }

  const { saveAttr } = target.dataset;

  if (saveAttr) {
    const body = JSON.stringify({ attributes: JSON.parse(saveAttr) });
    fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
      .catch(e => console.error(e))
      .finally(() => {
        if ('toggle' in target.dataset) {
          target.dataset.saveAttr = `{ "${target.dataset.toggle}": ${!JSON.parse(saveAttr)[target.dataset.toggle]} }`
        }
        FacetFiltersForm.filterData = [];
        // document.querySelectorAll('async-reload')?.forEach(item => item.cachedResults = []);
        AsyncReload.cachedResults = [];
      })
  }
}

function saveAttrListener(context) {
  context.querySelectorAll('[data-save-attr]').forEach((item) => {
    item.addEventListener('click', onSaveAttrListener)
  });
}

saveAttrListener(document);

customElements.define('save-attr', class SaveAttr extends HTMLElement {
  constructor() {
    super();
    saveAttrListener(this);
  }
});

class AsyncReload extends HTMLElement {
  constructor() {
    super();
    // AsyncReload.cachedResults = [];
    this.urlUpdate = 'urlUpdate' in this.dataset ? true : false
    this.reloadMode = 'reload' in this.dataset ? this.dataset.reload : 'fullpage'
    this.pageSelector = '#pageContent';
    this.loader = document.querySelector("loading-bar");
    this.addEventListener('click', this.onClickHandler.bind(this));
  }

	onClickHandler(e) {
	  const target = e.target.tagName === 'A' ? e.target : e.target.closest('a');

	  if (target) {
		const url = target.href;

		if (url.indexOf("#") === -1 && url.indexOf("/collections/") !== -1) {
		  e.preventDefault();
		  target.closest('.swiper-wrapper')?.childNodes.forEach(item => item.querySelector('a').classList.remove('active'));
		  target.closest('a').classList.add('active');
		  this.loader.start();
		  this.getPageHtml(url);
		} else {
		  window.location.href = url;
		}
	  }
	}

  getPageHtml(url) {
    const filterDataUrl = element => element.url === url;

    if (AsyncReload.cachedResults.some(filterDataUrl)) {
      const html = AsyncReload.cachedResults.find(filterDataUrl).html;

      this.renderCurrentPage(html, url);

      if (this.reloadMode !== 'css') return;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.text();
      })
      .then(html => {
        if (AsyncReload.cachedResults.some(filterDataUrl) && this.reloadMode === 'css') return;

        this.renderCurrentPage(html, url);

        AsyncReload.cachedResults = [...AsyncReload.cachedResults, { html, url }];
      })
      .catch((error) => {
        console.error(error)
      });
  }

  renderElements(html) {
    document.querySelectorAll('[data-async-reload]').forEach(destination => {
      const source = html.querySelector(`[data-async-reload=${destination.dataset.asyncReload}]`);
      if (source) destination.innerHTML = source.innerHTML;
    });
  }

  renderCss(html) {
    document.querySelectorAll('[data-async-reload-css]').forEach(destination => {
      const source = html.querySelector(`[data-async-reload-css=${destination.dataset.asyncReloadCss}]`);
      if (source) destination.innerHTML = source.innerHTML;
    });
  }

  renderRequiredElements(html) {
    document.querySelectorAll('[data-async-reload-required]').forEach(destination => {
      const source = html.querySelector(`[data-async-reload-required=${destination.dataset.asyncReloadRequired}]`);
      if (source) destination.innerHTML = source.innerHTML;
    });

    document.querySelector('demo-panel')?.init()
  }

  renderCurrentPage(html, url) {
    let renderedDocument = new DOMParser().parseFromString(html, 'text/html');

    if (this.reloadMode === 'fullpage') {
      document.querySelector(this.pageSelector).innerHTML = renderedDocument.querySelector(this.pageSelector).innerHTML;
    } else if (this.reloadMode === 'css') {
      this.renderCss(renderedDocument);
    } else {
      this.renderElements(renderedDocument);
    }

    this.renderRequiredElements(renderedDocument);

    document.querySelectorAll('filter-popup[data-outer]').forEach(item => item.hasOwnProperty('render') && item.render())

    setTimeout(() => {
      document.querySelector(this.pageSelector).querySelector('.show-on-scroll')?.classList.toggle('is-visible');
    }, 0);

    const documentTitle = renderedDocument.querySelector('title')?.innerHTML;
    this.updateURLHash(url, documentTitle);
    this.renderOtherSection(url);
    this.loader.hide();
  }

  renderOtherSection(url) {
    const querySign = url.includes('?') ? '&' : '?';
    const sectionsFiltered = this.getSectionsToRender().filter(item => document.querySelector('body').classList.contains(`template-${item.template}`));

    if (sectionsFiltered) {
      const sectionsFetches = sectionsFiltered.map(item => fetch(`${url}${querySign}section_id=${item.section}`));

      sectionsFetches && Promise.all(sectionsFetches)
        .then(responses => Promise.all(responses.map(response => response.text())))
        .then(responses => {
          this.renderOtherSectionsResults(sectionsFiltered, responses);
        })
    }
  }

  renderOtherSectionsResults(sectionsFiltered, responses) {
    sectionsFiltered.forEach((section, index) => {
      document.querySelectorAll(section.selector).forEach(destination => {
        if (this.isSectionInnerHTML(responses[index], section.selector)) {
          destination.innerHTML = this.getSectionInnerHTML(responses[index], section.selector);
        }
      })
    });
  }

  isSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector) ?? false;
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        template: 'collection',
        section: 'header-navigation-mobile-bottom',
        selector: '.hdr-mobile-bottom',
      }
    ];
  }

  updateURLHash(url, documentTitle) {
    if (this.urlUpdate) {
      history.pushState({ url }, '', `${url}`);
      if (documentTitle) document.title = documentTitle;
    }
  }
}

AsyncReload.cachedResults = [];


customElements.define('async-reload', AsyncReload);

if (Node.prototype.appendChildren === undefined) {
  Node.prototype.appendChildren = function () {
    let children = [...arguments];
    if (
      children.length === 1 &&
      Object.prototype.toString.call(children[0]) === "[object Array]"
    ) {
      children = children[0];
    }
    const documentFragment = document.createDocumentFragment();
    children.forEach(c => documentFragment.appendChild(c));
    this.appendChild(documentFragment);
  };
}

function scrollTouchUpdate(scrollEl) {
  if (scrollEl) {
    Scrollbar.get(scrollEl).destroy();
    Scrollbar.init(scrollEl, {
      alwaysShowTracks: true,
      damping: document.body.dataset.damping
    });
  }
}

function moveQuantityNode(ctx) {
  const mobileContainer = ctx.querySelector('[data-node-mobile]');
  const desktopContainer = ctx.querySelector('[data-node-desktop]');
  if (window.matchMedia('(max-width:767px)').matches) {
    if (mobileContainer && !mobileContainer.innerHTML.trim().length) {
      mobileContainer.insertAdjacentHTML('afterbegin', desktopContainer.innerHTML);
      desktopContainer.innerHTML = ''
    }
  } else {
    if (desktopContainer && !desktopContainer.innerHTML.trim().length) {
      desktopContainer.insertAdjacentHTML('afterbegin', mobileContainer.innerHTML);
      mobileContainer.innerHTML = ''
    }
  }
}