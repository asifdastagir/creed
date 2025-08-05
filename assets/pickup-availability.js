if (!customElements.get('pickup-availability')) {
  customElements.define('pickup-availability', class PickupAvailability extends HTMLElement {
    constructor() {
      super();
      if (!this.hasAttribute('available')) return;

      this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
      this.onClickRefreshList = this.onClickRefreshList.bind(this);
      // this.fetchAvailability(this.dataset.variantId);
      this.bindButtonEvent();
    }

    fetchAvailability(variantId, callback) {
      let rootUrl = this.dataset.rootUrl;
      if (!rootUrl.endsWith("/")) {
        rootUrl = rootUrl + "/";
      }
      const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

      fetch(variantSectionUrl)
        .then(response => response.text())
        .then(text => {
          const sectionInnerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('.shopify-section');
          this.renderPreview(sectionInnerHTML);
          callback();
        })
        .catch(e => {
          const button = this.querySelector('button');
          if (button) button.removeEventListener('click', this.onClickRefreshList);
          this.renderError();
        });
    }

    onClickRefreshList(evt) {
      this.fetchAvailability(this.dataset.variantId);
    }

    renderError() {
      // this.innerHTML = '';
      // this.errorHtml && this.appendChild(this.errorHtml);

      this.querySelector('button')?.addEventListener('click', this.onClickRefreshList);
    }

    renderDrawer(sectionInnerHTML) {
      const drawer = document.querySelector('pickup-availability-drawer');
      if (drawer) drawer.remove();

      this.setAttribute('available', '');

      document.body.appendChild(sectionInnerHTML.querySelector('pickup-availability-drawer'));

      this.bindButtonEvent();
    }

    renderPreview(sectionInnerHTML) {
      const drawer = document.querySelector('pickup-availability-drawer');
      if (drawer) drawer.remove();
      if (!sectionInnerHTML.querySelector('pickup-availability-preview')) {
        this.innerHTML = "";
        this.removeAttribute('available');
        return;
      }

      this.innerHTML = sectionInnerHTML.querySelector('pickup-availability-preview').outerHTML;
      this.setAttribute('available', '');

      document.body.appendChild(sectionInnerHTML.querySelector('pickup-availability-drawer'));

      // this.bindButtonEvent();
    }

    bindButtonEvent() {
      const button = this.querySelector('button');
      if (button) button.addEventListener('click', (evt) => {

        this.fetchAvailability(this.dataset.variantId, () => {
          Popup.closeWishlistAndCart();
          document.querySelector('pickup-availability-drawer').show(evt.target);
          this.enableBackToQuickViewButton();
          this.bindButtonEvent();
        });

      });
    }

    enableBackToQuickViewButton() {
      const quickViewAttributesSelector = this.closest('[data-section="quick-view"]') || this.closest('[data-section="quick-options"]');
      if (quickViewAttributesSelector) {
        Popup.closeAllPopups('#dropdnPickupPopup');
        const quickViewButton = document.querySelector('quickview-popup[data-slot="pickup-availability-drawer"]');
        quickViewButton.classList.remove('hidden');
        quickViewAttributesSelector.dataset.handle && (quickViewButton.dataset.handle = quickViewAttributesSelector.dataset.handle);
        quickViewAttributesSelector.dataset.ajax && (quickViewButton.dataset.ajax = quickViewAttributesSelector.dataset.ajax);
        (quickViewAttributesSelector.dataset.gallery || this.closest('[data-section="quick-options"]')) && (quickViewButton.dataset.gallery = 'off');
        quickViewAttributesSelector.dataset.buttonText && (quickViewButton.querySelector('a').textContent = quickViewAttributesSelector.dataset.buttonText)
        // quickViewButton.dataset = quickViewAttributesSelector.dataset;
      }
    }
  });
}

if (!customElements.get('pickup-availability-drawer')) {
  customElements.define('pickup-availability-drawer', class PickupAvailabilityDrawer extends HTMLElement {
    constructor() {
      super();

      this.onBodyClick = this.handleBodyClick.bind(this);

      /*this.querySelector('button').addEventListener('click', () => {
        this.hide();
      });*/

      this.addEventListener('keyup', (event) => {
        if (event.code.toUpperCase() === 'ESCAPE') this.hide();
      });
    }

    handleBodyClick(evt) {
      const target = evt.target;
      if (target != this && !target.closest('pickup-availability-drawer') && target.id != 'ShowPickupAvailabilityDrawer') {
        this.hide();
      }
    }

    hide() {
      /*this.removeAttribute('open');*/
      document.body.removeEventListener('click', this.onBodyClick);
      document.body.classList.remove('overflow-hidden');
      removeTrapFocus(this.focusElement);
    }

    show(focusElement) {
      this.focusElement = focusElement;

      /*this.setAttribute('open', '');*/

      var scrollbarPickup;
      jq_lumia.fancybox.open({
        animationEffect: 'fade',
        animationDuration: 200,
        touch: false,
        parentEl: '.page-content',
        src: '#dropdnPickupPopup',
        type: 'inline',
        afterLoad: function (instance, current) {
          setTimeout(function () {
            jq_lumia('.fancybox-container .dropdn-modal-pickup').addClass('is-opened');
          }, 0);
          bodyScrollLock.disableBodyScroll(document.querySelector('#dropdnPickupPopup'));
        },
        afterShow: function (instance, current) {
          if (typeof scrollbarPickup !== 'undefined') {
            scrollbarPickup.update()
          } else {
            setTimeout(function () {
              scrollbarPickup = Scrollbar.init(document.querySelector('#dropdnPickupPopup').querySelector('.js-dropdn-content-scroll'), {
                alwaysShowTracks: true,
                damping: jq_lumia('body').data('damping')
              })
            }, 0)
          }
        },
        beforeClose: function (instance, current) {
          jq_lumia('.fancybox-container .dropdn-modal-pickup').removeClass('is-opened');
          bodyScrollLock.enableBodyScroll(document.querySelector('#dropdnPickupPopup'));
        }
      });
      document.body.addEventListener('click', this.onBodyClick);
      // document.body.classList.add('overflow-hidden');
      trapFocus(this);
    }
  });
}
