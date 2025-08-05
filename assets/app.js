const jq_lumia = $.noConflict();

document.addEventListener('change', function (e) {
    const input = e.target;
    if (input.closest('.custom-form') && input.closest('label')) {
        if (input.type == 'radio') {
            input.closest('.form-group')?.querySelectorAll(`[name="${input.name}"]`).forEach(radio => {
                radio.checked == true ? radio.closest('label').classList.add('swatch-active') : radio.closest('label').classList.remove('swatch-active')
            })
        } else if (input.type == 'checkbox') {
            input.checked == true ? input.closest('label').classList.add('swatch-active') : input.closest('label').classList.remove('swatch-active');
        }
    }
})

document.addEventListener('click', (e) => {
    let target = e.target;
    if (!target.classList.contains('js-close-modal')) return;
    e.preventDefault();
    target.closest('.fancybox-container')?.querySelector('[data-fancybox-close]').click();
})

document.addEventListener('click', function (e) {
    let target = e.target.closest('a') || e.target;
    if (target.classList.contains('js-scroll-to') || target.classList.contains('js-scroll-to-bottom')) {
        target.blur();
        const targetId = target.getAttribute('href').replace('link', '');
        if (targetId.indexOf('#') !== -1 && document.querySelector(targetId)) {
            e.preventDefault();
            const bottomSticky = document.querySelector('.hdr-mobile-bottom'),
              bottomStickyH = (bottomSticky && bottomSticky.classList.contains('scroll-up')) ? 140 : 75,
              headerWrap = document.querySelector('.hdr-wrap'),
              headerSticky = document.querySelector('.hdr-content-sticky');
            let headerH = 0;
            if (headerWrap) {
                headerH = window.matchMedia(`(max-width:1024px)`).matches ? headerWrap.offsetHeight : (headerSticky ? headerSticky.offsetHeight : 0)
            }
            const targetIdTop = getCoords(document.querySelector(targetId)).top;
            let scrollPosition = target.classList.contains('js-scroll-to') ? targetIdTop - (targetIdTop > target.offsetTop ? 0 : headerH) : targetIdTop - window.innerHeight + headerH + 32 + bottomStickyH;
            if (target.dataset.scrollOffset > 0) scrollPosition += +target.dataset.scrollOffset;
            scrollPosition && smoothScrollTo(scrollPosition, 500);
        }
    }
})

document.addEventListener('click', function (e) {
    const target = e.target;
    if (target.nodeName == 'LABEL' && target.closest('.custom-form')) {
        let styleClass = 'inputClick';
        target.classList.add(styleClass);
        setTimeout(() => {
            target.classList.remove(styleClass)
        }, 250);
    } else if (target.dataset.clickTarget) {
        e.preventDefault();
        document.querySelector(target.dataset.clickTarget).click()
    } else if (target.closest('[data-disable-click]')) {
        e.preventDefault()
    }
})

const getSiblings = function (e) {
    let siblings = [];
    if (!e.parentNode) {
        return siblings;
    }
    let sibling = e.parentNode.firstChild;
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== e) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

const preloadImage = src => new Promise(function (resolve, reject) {
    const img = new Image();
    img.onload = function () {
        resolve(img);
    }
    img.onerror = reject;
    img.src = src;
})

const docCookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) return;
        let sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) return;
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
}

const checkDevice = function () {
    let isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    const body = document.body,
      html = document.querySelector('html');
    body.classList.remove('android', 'win', 'mac', 'ie', 'safari', 'safari_version_below_14', 'touch');
    html.classList.remove('touch');
    body.dataset.damping = '0.1';
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Windows') > 0) {
        body.classList.add('win');
        isTouchDevice = false;
    }
    if (isTouchDevice && window.matchMedia(`(max-width:1024px)`).matches) {
        body.classList.add('touch');
        html.classList.add('touch');
    }
    if (userAgent.indexOf('Mac') > 0) {
        body.classList.add('mac');
        let version = userAgent.indexOf("Version") + 8;
        if (userAgent.substring(version, version + 2) < 14) {
            body.classList.add('safari_version_below_14');
        }
        if (window.matchMedia(`(min-width:1025px)`).matches) {
            body.dataset.damping = '0.5'
        }
    }
    if (/\b(iPad|iPhone|iPod)\b/.test(userAgent) && /WebKit/.test(userAgent) && !/Edge/.test(userAgent) && !window.MSStream) {
        body.classList.add('safari');
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) viewportMeta.content = "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    }
    if (userAgent.match(/Android/)) {
        body.classList.add('android');
    }
    if (userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1) {
        body.classList.add('ie');
    }
    if (userAgent.indexOf('Firefox') > -1) {
        body.classList.add('firefox');
    }
}

function addResponsive(el = document) {
    el.querySelectorAll('table').forEach(el => {
        if (!el.closest('.table-responsive')) {
            el.classList.add('table');
            let wrap = document.createElement('div');
            wrap.classList.add('table-responsive');
            wrapHTML(el, wrap)
        }
    })

    el.querySelectorAll('iframe').forEach(el => {
        if (!el.closest('.bnslider') && !el.closest('embed-responsive') && (el.src.indexOf('youtube') != -1 || el.src.indexOf('vimeo') != -1)) {
            let wrap = document.createElement('div');
            wrap.classList.add('embed-responsive', 'embed-responsive-16by9');
            wrapHTML(el, wrap)
        }
    })
}

function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    })
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function fadeIn(element, duration, callback = '') {
    element.style.opacity = 0;
    let last = +new Date();
    let tick = function () {
        element.style.opacity = +element.style.opacity + (new Date() - last) / duration;
        last = +new Date();
        if (+element.style.opacity < 1)
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        else if (callback !== '')
            callback();
    };
    tick();
}

function fadeOut(element, duration, callback = '') {
    element.style.opacity = 1;
    let last = +new Date();
    let tick = function () {
        element.style.opacity = +element.style.opacity - (new Date() - last) / duration;
        last = +new Date();
        if (+element.style.opacity > 0)
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        else if (callback !== '')
            callback();
    };
    tick();
}

function smoothScrollTo(to, duration) {
    const el = document.scrollingElement || document.documentElement,
      start = el.scrollTop,
      change = to - start,
      startTs = performance.now(),
      easeInOutQuad = function (t, b, c, d) {
          t /= d / 2;
          if (t < 1) return c / 2 * t * t + b;
          t--;
          return -c / 2 * (t * (t - 2) - 1) + b;
      },
      animateScroll = function (ts) {
          let currentTime = ts - startTs;
          el.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration));
          if (currentTime < duration) {
              requestAnimationFrame(animateScroll);
          } else {
              el.scrollTop = to;
          }
      };
    if (document.body.classList.contains('has-hdr_sticky') && customElements.get('header-sticky')) document.body.querySelector('header-sticky')?.destroySticky();
    document.body.classList.add('blockSticky');
    setTimeout(() => {
        document.body.classList.remove('blockSticky')
    }, duration * 1.5);
    requestAnimationFrame(animateScroll);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        const context = this,
          args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    }
}

function removeClassByPrefix(node, className) {
    [...node.classList].forEach(v => {
        if (v.startsWith(className)) {
            node.classList.remove(v)
        }
    })
}

function removeClassBySuffix(node, className) {
    [...node.classList].forEach(v => {
        if (v.endsWith(className)) {
            node.classList.remove(v)
        }
    })
}

function setStyle(node, propertyObject) {
    if (!node) return false;
    for (let property in propertyObject) node.style[property] = propertyObject[property]
}

function calcScrollWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    outer.parentNode.removeChild(outer);
    document.body.dataset.scrollbarWidth = scrollbarWidth;
    return scrollbarWidth;
}

function setVHStart(resize) {
    if (!document.getElementById('control-height')) return;
    const actualHeight = window.innerHeight,
      controlH = document.getElementById('control-height').offsetHeight,
      html = document.getElementsByTagName('html')[0],
      vhStart = actualHeight * 0.01;
    if (!resize) {
        const bodyElement = document.body;
        html.style.setProperty('--bar-start-height', (controlH - actualHeight) + 'px');
        html.style.setProperty('--start-height', controlH + 'px');
        if (document.querySelector('.hdr-transparent')) {
            bodyElement.classList.add('has-transparent-hdr')
        } else bodyElement.classList.remove('has-transparent-hdr')
    }
    html.style.setProperty('--vhStart', vhStart + 'px');
}

function setVH() {
    const html = document.getElementsByTagName('html')[0],
      header = document.querySelector('.hdr-transparent') ? document.querySelector('.hdr .hdr-content') : document.querySelector('.hdr'),
      headerBottom = document.querySelector('.hdr-mobile-bottom'),
      underSlider = document.querySelector('[data-slider-under]'),
      actualHeight = window.innerHeight,
      vh = actualHeight * 0.01,
      barHeight = document.getElementById('control-height') ? document.getElementById('control-height').offsetHeight - actualHeight : 0,
      hPromoH = document.querySelector('.hdr-promoline') ? document.querySelector('.hdr-promoline').offsetHeight : 0,
      hToplineH = document.querySelector('.hdr-topline') ? document.querySelector('.hdr-topline').offsetHeight : 0,
      hSliderUnder = underSlider ? underSlider.offsetHeight + parseInt(window.getComputedStyle(underSlider).getPropertyValue('margin-top'), 10) : 0;
    let hHeight = header ? (header.offsetHeight + hPromoH) : 0,
      mobilePanelH = 0;
    if (window.matchMedia(`(max-width:1024px)`).matches) {
        hHeight = header ? (header.offsetHeight + hToplineH) : 0;
        mobilePanelH = headerBottom ? headerBottom.offsetHeight : 0;
    }
    html.style.setProperty('--vh', vh + 'px');
    html.style.setProperty('--bar-height', barHeight + 'px');
    html.style.setProperty('--scroll-width', calcScrollWidth() + 'px');
    html.style.setProperty('--header-height', hHeight + 'px');
    html.style.setProperty('--header-promo-height', hPromoH + 'px');
    html.style.setProperty('--slider-under-height', hSliderUnder + 'px');
    html.style.setProperty('--mobile-panel-height', mobilePanelH + 'px');
    document.querySelectorAll('.js-set-height').forEach(el => {
        if (el.querySelector('[data-block-handle="reviews"]')) {
            el.style.setProperty('--tab-height', 'auto')
        } else el.style.setProperty('--tab-height', el.scrollHeight + 'px');
        const textarea = el.querySelector('textarea-autosize');
        if (textarea) el.dataset.tabh = el.scrollHeight - textarea.querySelector('.form-control').scrollHeight
    });
    document.body.dataset.setRoot = true;
    document.body.dataset.innerHeight = window.innerHeight;
    document.body.dataset.barHeight = barHeight;
    document.body.dataset.innerWidth = window.innerWidth
}

function inViewportTop(el) {
    if (!el) return false;
    if (1 !== el.nodeType) return false;
    let rect = el.getBoundingClientRect();
    return !!rect && rect.bottom >= 0;
}

function inViewportBottom(el) {
    if (!el) return false;
    if (1 !== el.nodeType) return false;
    let html = document.documentElement,
      rect = el.getBoundingClientRect();
    return !!rect && rect.top <= html.clientHeight;
}

function getCoords(el) {
    const box = el.getBoundingClientRect(),
      body = document.body,
      docEl = document.documentElement,
      scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop,
      scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft,
      clientTop = docEl.clientTop || body.clientTop || 0,
      clientLeft = docEl.clientLeft || body.clientLeft || 0;
    return {
        top: Math.round(box.top + scrollTop - clientTop),
        left: Math.round(box.left + scrollLeft - clientLeft)
    };
}

function scrollSearchSection(id){
    const html = document.documentElement,
      sectionElement = document.getElementById(id);
    if (sectionElement) {
        const popupElement = sectionElement.querySelector('.predictive-search_'),
          searchInput = sectionElement.querySelector('.search-input-group'),
          topPos = searchInput.getBoundingClientRect().top,
          popupHeight = popupElement.clientHeight + searchInput.clientHeight + 10,
          windowHeight = html.clientHeight,
          delta = (topPos + popupHeight) - windowHeight + 15;
        if (delta > 0 && topPos > 20) {
            smoothScrollTo(window.scrollY + Math.min(delta,topPos), 500)
        }
    }
}

function wrapHTML(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

function highlightText(what, node) {
    const nodeList = node.childNodes;
    for (var x = 0; x < nodeList.length; x++) {
        if (nodeList[x].nodeType == 3) {
            if (nodeList[x].textContent.toLowerCase().indexOf(what.toLowerCase()) >= 0) {
                let replacement = '<mark>' + what + '</mark>',
                  textBlock = nodeList[x].textContent,
                  searchIndex = nodeList[x].textContent.toLowerCase().indexOf(what.toLowerCase());
                while (searchIndex >= 0) {
                    cut = textBlock.substring(searchIndex, searchIndex + what.length);
                    replacement = '<mark>' + cut + '</mark>';
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

class ImageCompare {
    constructor(el, settings = {}) {
        const defaults = {
            controlColor: "#FFFFFF",
            controlShadow: true,
            addCircle: false,
            addCircleBlur: true,
            showLabels: false,
            labelOptions: {
                before: "Before",
                after: "After",
                onHover: false,
            },
            smoothing: true,
            smoothingAmount: 100,
            hoverStart: false,
            verticalMode: false,
            startingPoint: 50,
            fluidMode: false,
        };

        this.settings = Object.assign(defaults, settings);
        this.animationFrameId = null;

        this.safariAgent =
          navigator.userAgent.indexOf("Safari") != -1 &&
          navigator.userAgent.indexOf("Chrome") == -1;

        this.el = el;
        this.images = {};
        this.wrapper = null;
        this.control = null;
        this.arrowContainer = null;
        this.arrowAnimator = [];
        this.active = false;
        this.slideWidth = 50;
        this.lineWidth = 2;
        this.arrowCoordinates = {
            circle: [5, 3],
            standard: [8, 0],
        };
    }

    mount() {
        // Temporarily disable Safari smoothing
        if (this.safariAgent) {
            this.settings.smoothing = false;
        }

        this._shapeContainer();
        this._getImages();
        this._buildControl();
        this._events();
    }

    _events() {
        let bodyStyles = ``;

        this.el.addEventListener("mousedown", (ev) => {
            this._activate(true);
            document.body.classList.add("icv__body");
            bodyScrollLock.disableBodyScroll(this.el, {reserveScrollBarGap: true});
            this._slideCompare(ev);
        });
        this.el.addEventListener(
          "mousemove",
          (ev) => this.active && this._slideCompare(ev)
        );

        this.el.addEventListener("mouseup", () => this._activate(false));
        document.body.addEventListener("mouseup", () => {
            document.body.classList.remove("icv__body");
            bodyScrollLock.enableBodyScroll(this.el);
            this._activate(false);
        });

        this.control.addEventListener("touchstart", (e) => {
            this._activate(true);
            document.body.classList.add("icv__body");
            bodyScrollLock.disableBodyScroll(this.el, {reserveScrollBarGap: true});
        });

        this.el.addEventListener("touchmove", (ev) => {
            this.active && this._slideCompare(ev);
        });
        this.el.addEventListener("touchend", () => {
            this._activate(false);
            document.body.classList.remove("icv__body");
            bodyScrollLock.enableBodyScroll(this.el);
        });

        this.el.addEventListener("mouseenter", () => {
            this.settings.hoverStart && this._activate(true);
            let coord = this.settings.addCircle
              ? this.arrowCoordinates.circle
              : this.arrowCoordinates.standard;

            this.arrowAnimator.forEach((anim, i) => {
                anim.style.cssText = `
        ${
                  this.settings.verticalMode
                    ? `transform: translateY(${coord[1] * (i === 0 ? 1 : -1)}px);`
                    : `transform: translateX(${coord[1] * (i === 0 ? 1 : -1)}px);`
                }
        `;
            });
        });

        this.el.addEventListener("mouseleave", () => {
            let coord = this.settings.addCircle
              ? this.arrowCoordinates.circle
              : this.arrowCoordinates.standard;

            this.arrowAnimator.forEach((anim, i) => {
                anim.style.cssText = `
        ${
                  this.settings.verticalMode
                    ? `transform: translateY(${
                      i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
                    });`
                    : `transform: translateX(${
                      i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
                    });`
                }
        `;
            });
        });
    }

    _slideCompare (ev) {
        if (this.animationFrameId === null) {
            this.animationFrameId = requestAnimationFrame(() => {
                const bounds = this.el.getBoundingClientRect();
                const x = ev.touches !== undefined ? ev.touches[0].clientX - bounds.left : ev.clientX - bounds.left;
                const y = ev.touches !== undefined ? ev.touches[0].clientY - bounds.top : ev.clientY - bounds.top;
                const position = this.settings.verticalMode ? (y / bounds.height) * 100 : (x / bounds.width) * 100;

                if (position >= 0 && position <= 100) {
                    this.settings.verticalMode
                      ? (this.control.style.top = `calc(${position}% - ${this.slideWidth / 2}px)`)
                      : (this.control.style.left = `calc(${position}% - ${this.slideWidth / 2}px)`);

                    if (this.settings.fluidMode) {
                        this.settings.verticalMode
                          ? (this.wrapper.style.clipPath = `inset(0 0 ${100 - position}% 0)`)
                          : (this.wrapper.style.clipPath = `inset(0 0 0 ${position}%)`);
                    } else {
                        this.settings.verticalMode
                          ? (this.wrapper.style.height = `calc(${position}%)`)
                          : (this.wrapper.style.width = `calc(${100 - position}%)`);
                    }
                }

                this.animationFrameId = null;
            });
        }
    }

    _activate(state) {
        this.active = state;
    }

    _shapeContainer() {
        let imposter = document.createElement("div");
        let label_l = document.createElement("span");
        let label_r = document.createElement("span");

        label_l.classList.add("icv__label", "icv__label-before", "keep");
        label_r.classList.add("icv__label", "icv__label-after", "keep");

        if (this.settings.labelOptions.onHover) {
            label_l.classList.add("on-hover");
            label_r.classList.add("on-hover");
        }

        if (this.settings.verticalMode) {
            label_l.classList.add("vertical");
            label_r.classList.add("vertical");
        }

        label_l.innerHTML = this.settings.labelOptions.before || "Before";
        label_r.innerHTML = this.settings.labelOptions.after || "After";

        if (this.settings.showLabels) {
            this.el.appendChild(label_l);
            this.el.appendChild(label_r);
        }

        this.el.classList.add(
          `icv`,
          this.settings.verticalMode
            ? `icv__icv--vertical`
            : `icv__icv--horizontal`,
          this.settings.fluidMode ? `icv__is--fluid` : `standard`
        );

        imposter.classList.add("icv__imposter");

        this.el.appendChild(imposter);
    }

    _buildControl() {
        let control = document.createElement("div");
        let uiLine = document.createElement("div");
        let arrows = document.createElement("div");
        let circle = document.createElement("div");

        const arrowSize = "20";

        arrows.classList.add("icv__theme-wrapper");

        for (var idx = 0; idx <= 1; idx++) {
            let animator = document.createElement(`div`);

            let arrow = `<svg
      height="15"
      width="15"
       style="
       transform: 
       scale(${this.settings.addCircle ? 0.7 : 1.5})  
       rotateZ(${
              idx === 0
                ? this.settings.verticalMode
                  ? `-90deg`
                  : `180deg`
                : this.settings.verticalMode
                  ? `90deg`
                  : `0deg`
            }); height: ${arrowSize}px; width: ${arrowSize}px;
       
       ${
              this.settings.controlShadow
                ? `
       -webkit-filter: drop-shadow( 0px 3px 5px rgba(0, 0, 0, .33));
       filter: drop-shadow( 0px ${
                  idx === 0 ? "-3px" : "3px"
                } 5px rgba(0, 0, 0, .33));
       `
                : ``
            }
       "
       xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 15 15">
       <path ${
              this.settings.addCircle
                ? `fill="transparent"`
                : `fill="${this.settings.controlColor}"`
            }
       stroke="${this.settings.controlColor}"
       stroke-linecap="round"
       stroke-width="${this.settings.addCircle ? 3 : 0}"
       d="M4.5 1.9L10 7.65l-5.5 5.4"
       />
     </svg>`;

            animator.innerHTML += arrow;
            this.arrowAnimator.push(animator);
            arrows.appendChild(animator);
        }

        let coord = this.settings.addCircle
          ? this.arrowCoordinates.circle
          : this.arrowCoordinates.standard;

        this.arrowAnimator.forEach((anim, i) => {
            anim.classList.add("icv__arrow-wrapper");

            anim.style.cssText = `
      ${
              this.settings.verticalMode
                ? `transform: translateY(${
                  i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
                });`
                : `transform: translateX(${
                  i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
                });`
            }
      `;
        });

        control.classList.add("icv__control");

        control.style.cssText = `
    ${this.settings.verticalMode ? `height` : `width `}: ${this.slideWidth}px;
    ${this.settings.verticalMode ? `top` : `left `}: calc(${
          this.settings.startingPoint
        }% - ${this.slideWidth / 2}px);
    ${
          "ontouchstart" in document.documentElement
            ? ``
            : this.settings.smoothing
              ? `transition: ${this.settings.smoothingAmount}ms ease-out;`
              : ``
        }
    `;

        uiLine.classList.add("icv__control-line");

        uiLine.style.cssText = `
      ${this.settings.verticalMode ? `height` : `width `}: ${this.lineWidth}px;
      background: ${this.settings.controlColor};
        ${
          this.settings.controlShadow
            ? `box-shadow: 0px 0px 15px rgba(0,0,0,0.33);`
            : ``
        }
    `;

        let uiLine2 = uiLine.cloneNode(true);

        circle.classList.add("icv__circle");
        circle.style.cssText = `

      ${
          this.settings.addCircleBlur &&
          `-webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px)`
        };
      
      border: ${this.lineWidth}px solid ${this.settings.controlColor};
      ${
          this.settings.controlShadow &&
          `box-shadow: 0px 0px 15px rgba(0,0,0,0.33)`
        };
    `;

        control.appendChild(uiLine);
        this.settings.addCircle && control.appendChild(circle);
        control.appendChild(arrows);
        control.appendChild(uiLine2);

        this.arrowContainer = arrows;

        this.control = control;
        this.el.appendChild(control);
    }

    _getImages() {
        let children = this.el.querySelectorAll("img, video, .keep");
        this.el.innerHTML = "";
        children.forEach((img) => {
            this.el.appendChild(img);
        });

        let childrenImages = [...children].filter(
          (element) => ["img", "video"].includes(element.nodeName.toLowerCase())
        );

        //  this.settings.verticalMode && [...children].reverse();
        this.settings.verticalMode && childrenImages.reverse();

        for (let idx = 0; idx <= 1; idx++) {
            let child = childrenImages[idx];

            child.classList.add("icv__img");
            child.classList.add(idx === 0 ? `icv__img-a` : `icv__img-b`);

            if (idx === 1) {
                let wrapper = document.createElement("div");
                let afterUrl = childrenImages[1].src;
                wrapper.classList.add("icv__wrapper");
                wrapper.style.cssText = `
            width: ${100 - this.settings.startingPoint}%; 
            height: ${this.settings.startingPoint}%;

            ${
                  "ontouchstart" in document.documentElement
                    ? ``
                    : this.settings.smoothing
                      ? `transition: ${this.settings.smoothingAmount}ms ease-out;`
                      : ``
                }
            ${
                  this.settings.fluidMode &&
                  `background-image: url(${afterUrl}); clip-path: inset(${
                    this.settings.verticalMode
                      ? ` 0 0 ${100 - this.settings.startingPoint}% 0`
                      : `0 0 0 ${this.settings.startingPoint}%`
                  })`
                }
        `;

                wrapper.appendChild(child);
                this.wrapper = wrapper;
                this.el.appendChild(this.wrapper);
            }
        }
        if (this.settings.fluidMode) {
            let url = childrenImages[0].src;
            let fluidWrapper = document.createElement("div");
            fluidWrapper.classList.add("icv__fluidwrapper");
            fluidWrapper.style.cssText = `
 
        background-image: url(${url});
        
      `;
            this.el.appendChild(fluidWrapper);
        }
    }
}

class MasonryGrid extends HTMLElement {
    constructor() {
        super();
        this.classList.add('lazyload');
        this._sizes = [];
        this._columns = [];
        this._container = null;
        this._count = null;
        this._width = 0;
        this._removeListener = null;
        this._rtl = document.body.classList.contains('rtl-mode') ? true : false;
        this._resizeTimeout = null,
          this.initialized = false,
          this.conf = {
              baseWidth: +this.dataset.masonrySize || 300,
              gutterX: +this.dataset.masonryGutter || 30,
              gutterY: +this.dataset.masonryGutter || 30,
              container: '.masonry-grid-container',
              minify: true,
              ultimateGutter: 15,
              surroundingGutter: false,
              direction: 'ltr',
              wedge: false
          };
        this.init(0);
        window.addEventListener('resize', debounce(() => {
            this.init(100)
        }, 15));
        this.addEventListener('lazyloaded', () => {
            this.layout()
        }, {once: true});
        const lazyImages = this.querySelectorAll('.lazyload');
        if (lazyImages.length) {
            lazyImages[lazyImages.length - 1].addEventListener('lazyloaded', () => {
                this.layout()
            })
        }
    }

    init(delay) {
        this._container = typeof this.conf.container == 'object' && this.conf.container.nodeName ? this.conf.container : this.querySelector(this.conf.container);
        if (!this._container) return;
        if (this.dataset.masonryColumn) {
            this.conf.baseWidth = (this.offsetWidth - this.conf.gutterX * (+this.dataset.masonryColumn - 1)) / +this.dataset.masonryColumn
        }
        if (this.dataset.masonryColumnResponsive) {
            const breikpoints = JSON.parse(this.dataset.masonryColumnResponsive);
            for (let key in breikpoints) {
                if (window.matchMedia(`(max-width: ${key}px)`).matches) {
                    this.conf.baseWidth = (this.offsetWidth - this.conf.gutterX * (+breikpoints[key] - 1)) / +breikpoints[key];
                    break;
                }
            }
        }
        if (this.dataset.masonryDestroyBreikpoint) {
            if (!window.matchMedia(`(max-width: ${+this.dataset.masonryDestroyBreikpoint}px)`).matches) {
                if (!this.initialized) {
                    this.initialized = true;
                    setTimeout(() => {
                        this.layout()
                    }, delay);
                } else if (this._container.clientWidth != this._width) {
                    this.layout()
                }
            } else {
                this.initialized && this.destroy();
                this.initialized = false
            }
        } else {
            if (!this.initialized) {
                this.initialized = true;
                setTimeout(() => {
                    this.layout()
                }, delay);
            } else if (this._container.clientWidth != this._width) {
                this.layout()
            }
        }
    }

    reInit() {
        if (this.dataset.masonryDestroyBreikpoint && window.matchMedia(`(max-width: ${+this.dataset.masonryDestroyBreikpoint}px)`).matches) return;
        setTimeout(() => {
            this.layout()
        }, 200)
    }

    reset() {
        this._sizes = [];
        this._columns = [];
        this._count = null;
        this._width = this._container.clientWidth;
        this._gutterX = this.conf.gutterX;
        let minWidth = this.conf.baseWidth;
        if (this._width < minWidth) {
            this._width = minWidth;
            this._container.style.minWidth = minWidth + 'px';
        }
        if (this.getCount() == 1) {
            this._gutterX = this.conf.ultimateGutter;
            this._count = 1;
        }
        if (this._width < (this.conf.baseWidth + (2 * this.conf.gutterX))) this._gutterX = 0;
    }

    getCount() {
        if (this.conf.surroundingGutter) return Math.floor((this._width - this._gutterX) / (this.conf.baseWidth + this._gutterX));
        return Math.floor((this._width + this._gutterX) / (this.conf.baseWidth + this._gutterX))
    }

    computeWidth() {
        let width = this.conf.surroundingGutter ? ((this._width - this._gutterX) / this._count) - this._gutterX : ((this._width + this._gutterX) / this._count) - this._gutterX;
        return Number.parseFloat((width).toFixed(2))
    }

    layout() {
        if (!this._container) return;
        this.reset();
        if (this._count == null) this._count = this.getCount();
        let colWidth = this.computeWidth();
        for (let i = 0; i < this._count; i++) {
            this._columns[i] = 0;
        }
        let children = this._container.children;
        for (let k = 0; k < children.length; k++) {
            children[k].style.width = colWidth + 'px';
            this._sizes[k] = children[k].clientHeight;
        }
        let startX = this.conf.direction == 'ltr' ? (this.conf.surroundingGutter ? this._gutterX : 0) : (this._width - (this.conf.surroundingGutter ? this._gutterX : 0));
        if (this._count > this._sizes.length) {
            let occupiedSpace = (this._sizes.length * (colWidth + this._gutterX)) - this._gutterX;
            if (this.conf.wedge === false) {
                if (this.conf.direction == 'ltr') {
                    startX = ((this._width - occupiedSpace) / 2);
                } else {
                    startX = this._width - ((this._width - occupiedSpace) / 2);
                }
            } else if (!this.conf.direction == 'ltr') {
                startX = this._width - this._gutterX
            }
        }
        for (let index = 0; index < children.length; index++) {
            const nextColumn = this.conf.minify ? this.getShortest() : this.getNextColumn(index),
              childrenGutter = (this.conf.surroundingGutter || nextColumn != this._columns.length) ? this._gutterX : 0,
              x = this.conf.direction == 'ltr' ? startX + ((colWidth + childrenGutter) * (nextColumn)) : startX - ((colWidth + childrenGutter) * (nextColumn)) - colWidth,
              y = this._columns[nextColumn];
            children[index].style.transform = 'translate3d(' + (this._rtl ? -Math.round(x) : Math.round(x)) + 'px,' + Math.round(y) + 'px,0)';
            this._columns[nextColumn] += this._sizes[index] + (this._count > 1 ? this.conf.gutterY : this.conf.ultimateGutter)
        }
        this._container.style.height = (this._columns[this.getLongest()] - this.conf.gutterY) + 'px';
        this._container.classList.add('masonry-initialized')
    }

    getNextColumn(index) {
        return index % this._columns.length;
    }

    getShortest() {
        let shortest = 0;
        for (let i = 0; i < this._count; i++) {
            if (this._columns[i] < this._columns[shortest]) {
                shortest = i;
            }
        }
        return shortest;
    }

    getLongest() {
        var longest = 0;
        for (let i = 0; i < this._count; i++) {
            if (this._columns[i] > this._columns[longest]) {
                longest = i;
            }
        }
        return longest;
    }

    destroy() {
        if (typeof this._removeListener == "function") {
            this._removeListener();
        }
        let children = this._container.children;
        for (let k = 0; k < children.length; k++) {
            children[k].style.removeProperty('width');
            children[k].style.removeProperty('transform');
        }
        this._container.style.removeProperty('height');
        this._container.style.removeProperty('min-width');
        this._container.classList.remove('masonry-initialized')
    }

}

customElements.define('masonry-grid', MasonryGrid)

class RotateAside extends HTMLElement {
    constructor() {
        super();

        this.elements = this.querySelectorAll('.rotate-aside-item');
        this.screensNumber = document.body.offsetHeight/window.innerHeight;
        this.startSide = Math.round(Math.random());

        const defaultSettings = {
            scrollStyle: true,
            itemWidthRandom: true,
            itemWidth: 120,
            edgeSpace: 1,
            itemsPerScreen: 4
        };

        this.settings = defaultSettings;

        if (this.dataset.settings) {
            const dataSettings = JSON.parse(this.dataset.settings);
            this.settings = {...defaultSettings, ...dataSettings}
        }

        this.itemWidth = this.settings.itemWidth;

        this.elements.forEach((elem, i) => {
            elem.style.width = this.settings.itemWidthRandom ? this.getRandomNumber(this.itemWidth,.3) +'px' : this.itemWidth +'px';
            this.setPosition(elem,i);
            elem.dataset.speed = Math.random() * 10 + 30;
            elem.style.opacity = '1'
        })

        window.addEventListener('scroll', () => {
            const rotateSpeed = window.scrollY * 0.25;
            const speedY = window.scrollY / window.innerHeight;

            this.elements.forEach(elem => {
                if (this.settings.scrollStyle) elem.style.transform = `rotate(${rotateSpeed}deg)`;
                elem.style.top = `${elem.dataset.top - elem.dataset.speed * speedY}%`
            })
        })

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newHeight = entry.contentRect.height;
                this.screensNumber = newHeight/window.innerHeight;
                this.dublicateItems();
            }
        })
        observer.observe(document.body)
    }

    setPosition(elem, i) {
        let percentageTop = i * 100 / this.settings.itemsPerScreen + 15 +  Math.random() * 5;
        const persentageSide = Math.random() * 3;
        elem.style.top = `${percentageTop}%`;
        elem.dataset.top = percentageTop;
        if (this.settings.edgeSpace == 3) {
            (i + this.startSide) % 2 === 1 ? elem.style.left = '0' : elem.style.right = '0'
        } else if (this.settings.edgeSpace == 2) {
            (i + this.startSide) % 2 === 1 ? elem.style.left = `-${parseFloat(elem.style.width) * 0.5}px` : elem.style.right = `-${parseFloat(elem.style.width) * 0.5}px`
        } else (i + this.startSide) % 2 === 1 ? elem.style.left = `${persentageSide}%` : elem.style.right = `${persentageSide}%`
    }

    dublicateItems() {
        const lastIndex = this.elements.length;
        this.elements = this.querySelectorAll('.rotate-aside-item');

        if (this.screensNumber * this.settings.itemsPerScreen > this.elements.length * 3) {
            this.elements.forEach(elem => {
                const clone = elem.cloneNode(true);
                this.appendChild(clone);
                this.elements = this.querySelectorAll('.rotate-aside-item')
            })

            for (let i = lastIndex; i < this.elements.length; i++) {
                const elem = this.elements[i];
                elem.style.left = '';
                elem.style.right = '';
                this.setPosition(elem,i)
            }
        }
    }

    getRandomNumber(num, bounds) {
        const lowerBound = num - (num * bounds);
        const upperBound = num + (num * bounds);
        return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound
    }

}

customElements.define('rotate-aside', RotateAside);

class FaqSection extends HTMLElement {
    constructor() {
        super();
        this.searchInput = this.querySelector('.js-faq-input');
        if (this.searchInput) {
            // this.searchInput.addEventListener('change', () => {
            //     this.searchIt();
            // })
            this.searchInput.addEventListener('input', () => {
                this.searchIt();
            })
            this.querySelector('.search-result-accordion')?.addEventListener('mouseenter', (e) => {
                this.searchInput.blur()
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
              if (this.searchInput) {
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
        this.querySelector('.form-message--error')?.classList.add('d-none');
        this.querySelector('.form-message--success')?.classList.add('d-none');
        this.querySelector('.search-result')?.classList.add('d-none');
        this.querySelector('.search-result-accordion form')?.closest('.search-result-accordion').classList.add('d-none');
        this.querySelector('.tabs-content')?.classList.remove('d-none');
        this.querySelector('.js-tab-faq li.is-current')?.classList.remove('is-current--off');
    }

    searchIt() {
        const input = this.querySelector('.js-faq-input'),
          infoSuccess = this.querySelector('.form-message--success'),
          infoError = this.querySelector('.form-message--error'),
          searchResult = this.querySelector('.search-result'),
          searchResultAccordion = this.querySelector('.search-result-accordion form'),
          tabsContent = this.querySelector('.tabs-content'),
          tabs = this.querySelectorAll('.faq-tab-content'),
          item = tabsContent.querySelectorAll('.faq-item');
        if (searchResult) searchResult.innerHTML = '';
        if (searchResultAccordion) searchResultAccordion.innerHTML = '';
        let v = input.value;
        if (v.length < 2) {
            this.resetSearch(this)
            return false;
        }
        let text = tabsContent.innerText,
          letterCount = this.countInstances(text.toLowerCase(), v.toLowerCase());
        if (letterCount > 0) {
            if (searchResult) searchResult.classList.remove('d-none');
            if (searchResultAccordion) searchResultAccordion.closest('.search-result-accordion')?.classList.remove('d-none');
            tabsContent.classList.add('d-none');
            infoSuccess.querySelector('b').innerHTML = letterCount;
            infoSuccess.classList.remove('d-none');
            infoError.classList.add('d-none');
            if (letterCount > 1) {
                infoSuccess.classList.add('has-plural');
                infoSuccess.classList.remove('has-single');
            } else {
                infoSuccess.classList.add('has-single');
                infoSuccess.classList.remove('has-plural');
            }
            item.forEach((item) => {
                let text = item.innerText.toLowerCase();
                if (text.includes(v.toLowerCase())) {
                    if (searchResult) searchResult.innerHTML += item.outerHTML;
                    if (searchResultAccordion) {
                        let itemText = item.outerHTML;
                        const pattern = /(id|for)="([^"]+)"/g;
                        itemText = itemText.replace(pattern, function(match, p1, p2) {
                            return p1 + '="' + p2 + '_search"'
                        });
                        searchResultAccordion.innerHTML += itemText;
                        searchResultAccordion.querySelectorAll('.js-set-height').forEach(el => {
                            el.style.setProperty('--tab-height', el.scrollHeight + 'px')
                        })
                        searchResultAccordion.querySelectorAll('input[type="checkbox"]').forEach((el, index) => {
                            el.checked = index === 0
                        })
                    }
                }
            });
            this.querySelector('.js-tab-faq li.is-current')?.classList.add('is-current--off');
            if (searchResult) highlightText(v, searchResult);
            if (searchResultAccordion) highlightText(v, searchResultAccordion);
        } else {
            this.resetSearch();
            infoError.classList.remove('d-none');
        }
    }

    countInstances(string, word) {
        return string.split(word).length - 1;
    }
}

customElements.define('faq-section', FaqSection)

class CatalogSection extends HTMLElement {
    constructor() {
        super();
        this.searchInput = this.querySelector('.js-catalog-input');
        if(this.searchInput) {
            this.searchInput.addEventListener('change', () => {
                this.searchIt();
            })
            this.searchInput.addEventListener('input', () => {
                this.searchIt();
            })
        }
        this.querySelector('.js-catalog-search-form')?.addEventListener('submit', (e) => {
            e.preventDefault()
            this.searchIt();
        })
        this.submenu = this.querySelectorAll('.mmenu-submenu li');
        this.buttonNext = this.querySelectorAll('.icon-arrow-next');
        this.initSubmenu(this.submenu);
        this.buttonNext.forEach(link => link.addEventListener('click', this.onButtonNextClick.bind(this)));
    }
    initSubmenu(submenu) {
        submenu.forEach(link => link.addEventListener('mouseenter', this.onSubmenuMouseEnter.bind(this)));
        submenu.forEach(link => link.addEventListener('mouseleave', this.onSubmenuMouseLeave.bind(this)));
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
        this.classList.remove('is-filtered');
        this.querySelector('.js-tab-faq li.is-current')?.classList.remove('is-current--off');
    }
    searchIt() {
        const input = this.querySelector('.js-catalog-input'),
          infoSuccess = this.querySelector('.form-message--success'),
          infoError = this.querySelector('.form-message--error'),
          searchResult = this.querySelector('.search-result'),
          tabsContent = this.querySelector('.tabs-content'),
          item = tabsContent.querySelectorAll('.col');
        searchResult.innerHTML = '';
        let v = input.value;
        if(v.length < 2) {
            this.resetSearch(this)
            return false;
        }
        let text = tabsContent.innerText,
          letterCount = this.countInstances(text.toLowerCase(), v.toLowerCase());
        if (letterCount > 0){
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
                if (text.includes(v.toLowerCase())){
                    searchResult.innerHTML += item.outerHTML;
                }
            });
            this.querySelector('.js-tab-faq li.is-current')?.classList.add('is-current--off');
            highlightText(v, searchResult);
            const submenuSearch = searchResult.querySelectorAll('.mmenu-submenu li');
            this.initSubmenu(submenuSearch);
            this.classList.add('is-filtered')
        } else {
            this.resetSearch();
            infoError.classList.remove('d-none');
        }
    }
    countInstances(string, word) {
        return string.split(word).length - 1;
    }
    onSubmenuMouseEnter(e) {
        if (window.matchMedia(`(min-width:1025px)`).matches) {
            let target = e.currentTarget;
            target.classList.add('hovered');
            if (target.querySelector('.submenu-list-wrap')) {
                let elm = target.querySelector('.mmenu-submenu') || target.querySelector('.submenu-list-wrap');
                if (!elm) return;
                if(target.closest('.modal-wrap')) {
                    let wrapper = target.closest('.mmenu-submenu');
                    let offset = wrapper.clientHeight - target.offsetTop - elm.clientHeight;
                    if (offset < 0) {
                        if(wrapper.clientHeight*.6 < elm.clientHeight) {
                            target.classList.add('two-columns');
                            offset = wrapper.clientHeight - target.offsetTop - elm.clientHeight;
                            if (offset < 0) elm.style.marginTop = offset + 'px';
                        } else elm.style.marginTop = offset + 'px';
                    }
                }
                let elmLeft = elm.getBoundingClientRect().left + pageXOffset,
                  popupWidth = this.closest('.modal-wrap').offsetWidth,
                  popupLeft = this.closest('.modal-wrap').getBoundingClientRect().left;
                let isXvisible = document.body.classList.contains('rtl-mode') ? elmLeft >= popupLeft : (elmLeft + elm.offsetWidth) <= (popupWidth + popupLeft);
                if (!isXvisible) {
                    target.classList.add('to-right');
                } else {
                    target.classList.remove('to-right');
                }
            }
        }
    }
    onSubmenuMouseLeave(e) {
        if (window.matchMedia(`(min-width:1025px)`).matches) {
            let target = e.currentTarget;
            target.classList.remove('hovered','to-right','two-columns');
            let elm = target.querySelector('.mmenu-submenu') || target.querySelector('.submenu-list-wrap');
            if (!elm) return;
            elm.style.marginTop = '';
        }
    }
    onButtonNextClick(e) {
        if (window.matchMedia(`(max-width:1024px)`).matches) {
            e.preventDefault();
            let target = e.currentTarget,
              parent = target.closest('li');
            if (parent) {
                let submenu = parent.querySelector('.submenu-list-wrap');
                if (submenu) submenu.style.setProperty('--maxheight', submenu.scrollHeight + 'px');
                parent.classList.toggle('is-opened');
            }
        }
    }
}
customElements.define('catalog-section', CatalogSection)

class InstagramFeed extends HTMLElement {
    connectedCallback() {
        this.container = this.querySelector('.js-instagram-feed');
        this.widthXXL = this.container.hasAttribute('data-xxl');
        if (!this.container.querySelector('.instagram-item')) {
            this.token = this.container.dataset.token;
            this.limit = parseInt(this.container.dataset.limit, 10);
            this.tag = this.container.dataset.tag;
            this.carousel = this.querySelector('.swiper-container');
            if (this.carousel) {
                if (this.container.hasAttribute('data-static')) {
                    this.startCarousel();
                } else {
                    this.init();
                    const doStuff = (timer) => {
                        if (this.container.querySelector('img')) {
                            clearInterval(timer);
                            this.startCarousel();
                        }
                    }
                    let timer = setInterval(function () {
                        doStuff(timer);
                    }, 100)
                }
            } else this.init();
        } else if (this.querySelector('.instagram-grid-complex')) {
            this.groupItems()
        }
    }

    init() {

        let count = 0;
        let userFeed = new Instafeed({
            get: 'user',
            target: this.container,
            accessToken: this.token,
            resolution: 'low_resolution',
            template: this.querySelector('template').innerHTML,
            links: false,
            templateBoundaries: ["{#", "#}"],
            limit: 500,
            after: () => {
                if (this.querySelector('smart-row')) this.querySelector('smart-row').init();
                if (this.querySelector('.instagram-grid-complex')) this.groupItems()
            },
            filter: (image) => {
                const hasTag = (this.tag == '') || (image.tags.indexOf(this.tag) >= 0);
                if (hasTag) count++;
                return hasTag && count <= this.limit
            }
        })

        userFeed.run()
    }

    startCarousel() {
        new Swiper(this.carousel, {
            navigation: {
                nextEl: this.querySelector('.swiper-button-next'),
                prevEl: this.querySelector('.swiper-button-prev')
            },
            loop: false,
            touchRatio: 3,
            watchOverflow: true,
            slidesPerView: 3,
            spaceBetween: 10,
            centerInsufficientSlides: true,
            breakpoints: {
                375: {
                    slidesPerView: 4,
                    spaceBetween: 10,
                },
                768: {
                    slidesPerView: 5,
                    spaceBetween: 10,
                },
                992: {
                    slidesPerView: 6,
                    spaceBetween: 10,
                },
                1200: {
                    slidesPerView: 8,
                    spaceBetween: 10,
                },
                1465: {
                    slidesPerView: this.widthXXL ? 10 : 8,
                    spaceBetween: 10,
                },
                1700: {
                    slidesPerView: this.widthXXL ? 12 : 8,
                    spaceBetween: 10,
                }
            },
            on: {
                init: function () {
                    if (typeof Waypoint !== 'undefined') {
                        Waypoint.refreshAll();
                    }
                }
            }
        })
    }

    groupItems() {
        const items = this.querySelectorAll('.instagram-item');
        let newGrid = document.createElement('div'),
          wrapper = null;

        for (let i = 0; i < items.length; i++) {
            if (i % 3 === 0) {
                newGrid.appendChild(items[i]);
            } else {
                if ((i - 1) % 3 === 0) {
                    if (!wrapper) {
                        wrapper = document.createElement('div');
                        wrapper.className = 'instagram-item';
                    }
                    wrapper.appendChild(items[i]);
                } else {
                    wrapper.appendChild(items[i]);
                    newGrid.appendChild(wrapper);
                    wrapper = null;
                }
            }
        }
        this.container.innerHTML = newGrid.innerHTML;
        newGrid = null;
        this.querySelectorAll('img.lazyloading').forEach(image => {
            image.classList.add('lazyload')
        })
    }
}

customElements.define('instagram-feed', InstagramFeed)


class MenuCategories extends HTMLElement {
    constructor() {
        super();
        const parent = this.closest('.shopify-section');
        if (parent) {
            this.addEventListener('mouseenter', () => {
                parent.classList.add('to-upper')
            });
            this.addEventListener('mouseleave', () => {
                parent.classList.remove('to-upper')
            })
        }
        this.submenu = this.querySelectorAll('.submenu-list li');
        this.submenu.forEach(link => link.addEventListener('mouseenter', this.onSubmenuMouseEnter.bind(this)));
    }

    onSubmenuMouseEnter(e) {
        const target = e.currentTarget;
        const link = target.querySelector('a'),
          previewImage = link.dataset.preview;
        if (target.querySelector('.submenu-list-wrap--image') && previewImage && !link.dataset.loaded) {
            preloadImage(previewImage)
              .then(img => {
                  target.querySelector('.submenu-list-wrap--image .image-container')?.append(img);
                  target.querySelector('[data-load]')?.setAttribute('data-load', 'loaded');
                  link.dataset.loaded = true
              })
              .catch(error => console.error('error', error));
        }
    }
}

customElements.define('menu-categories', MenuCategories);

class TabSlider extends HTMLElement {
    constructor() {
        super();
        this.tabs = this.querySelector('.tabs-wrap');
        this.tab = this.querySelectorAll('.tabs-item');
        this.track = this.querySelector('.tabs-wrap-track');
        this.trackAfter = this.tabs.querySelector('.tabs-wrap-track-after');
        this.tabContents = this.querySelectorAll('.tab-content');
        this.tabContentsWrap = this.querySelector('.tab-content-wrap');
        this.tabContentsWrap.classList.add('transparent');
        this.initStart();
    }

    init() {
        this.trackAfter && this.trackAfter.classList.add('hidden');
        if (this.tab.length > 0) this.onTabClick(this.tabs.querySelector('.active'));
        setTimeout(() => {
            this.shiftSelector();
            this.trackAfter && this.trackAfter.classList.remove('hidden');
        }, 500)
    }

    initStart() {
        this.setScrollbar();
        this.tab.forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.onTabClick(el)
            });
            el.addEventListener('mouseenter', function () {
                if (this.classList.contains('active')) return;
                this.closest('.tabs-wrap').classList.add('hovered')
            });
            el.addEventListener('mouseleave', function () {
                this.closest('.tabs-wrap').classList.remove('hovered')
            });
            const observer = new MutationObserver(() => {
                this.shiftSelector()
            });
            observer.observe(el, {
                characterData: true,
                childList: true
            })
        });
        this.tabContents.forEach(el => {
            if (!el.classList.contains('ajax-loaded')) {
                const tpl = el.hasAttribute('data-empty') ? this.querySelector('.tabSlideTemplateEmpty') : this.querySelector('.tabSlideTemplate');
                if (tpl) el.appendChild(document.importNode(tpl.content, true));
            }
        });
        window.addEventListener('resize', debounce(() => {
            this.setScrollbar();
            this.setTabWrapHeight(true);
            this.shiftSelector()
        }, 500));
        if (this.tab.length > 0 && this.tabs.querySelector('.active')) this.onTabClick(this.tabs.querySelector('.active'));
        setTimeout(() => {
            this.tabContentsWrap.classList.remove('transparent')
        }, 500)
    }

    setScrollbar() {
        if (this.track) {
            if (this.track.offsetWidth > this.tabs.offsetWidth) {
                const options = {
                    loop: false,
                    watchOverflow: true,
                    touchRatio: 1,
                    watchSlidesVisibility: true,
                    slidesPerView: 'auto',
                    edgeSwipeThreshold: 40,
                    setWrapperSize: true,
                    slideToClickedSlide: true,
                    updateOnWindowResize: true,
                    slideClass: 'tabs-item',
                    wrapperClass: 'tabs-wrap-track',
                    scrollbar: {
                        el: this.querySelector('.swiper-scrollbar'),
                        draggable: true,
                        dragSize: 150,
                        snapOnRelease: true
                    },
                    spaceBetween: 0,
                    direction: 'horizontal'
                };
                this.navigationTabsCarousel = new Swiper(this.tabs, options)
            } else {
                if (this.navigationTabsCarousel) {
                    this.navigationTabsCarousel.destroy();
                    setTimeout(() => {
                        this.setTabWrapHeight(true);
                        this.shiftSelector();
                    }, 100)
                }
            }
        }
    }

    setTabWrapHeight(auto, tab) {
        if (auto) {
            this.tabContentsWrap.style.height = 'auto'
        } else if (tab) {
            this.tabContentsWrap.style.height = tab.offsetHeight + 'px';
        }
    }

    onTabClick(target) {
        let currentTab = document.querySelector('#tabContent' + target.dataset.order);
        this.setTabWrapHeight(false, this.tabContentsWrap);
        this.tab.forEach(el => {
            el.classList.remove('active')
        });
        this.tabContents.forEach(el => {
            el.classList.remove('active')
        });
        target.classList.add('active');
        if (currentTab) currentTab.classList.add('active');
        this.shiftSelector();
        if (!target.classList.contains('ajax-loaded') && !target.hasAttribute('data-empty')) {
            let urlAjax = target.getAttribute('href');
            fetch(urlAjax).then((response) => response.text())
              .then((data) => {
                  const shopifySection = new DOMParser().parseFromString(data, 'text/html').querySelector('.shopify-section'),
                    innerData = shopifySection ? shopifySection.innerHTML : data;
                  if (currentTab) currentTab.querySelector('.swiper-wrapper').innerHTML = innerData;
                  target.classList.add('ajax-loaded');
                  setTimeout(() => {
                      const prdCarousel = currentTab.querySelector('swiper-carousel');
                      if (prdCarousel) {
                          prdCarousel.destroy();
                          prdCarousel.init();
                      }
                      currentTab.querySelector('[data-load]').setAttribute('data-load', 'loaded');
                      this.setTabWrapHeight(true);
                  }, 1000)
              })
              .catch((error) => {
                  console.error('error', error);
                  setTimeout(() => {
                      this.fancybox?.close()
                  }, 2000)
              })
        } else if (currentTab && target.hasAttribute('data-empty') && currentTab.querySelector('[data-load]').getAttribute('data-load') != 'loaded') {
            setTimeout(() => {
                const prdCarousel = currentTab.querySelector('swiper-carousel');
                if (prdCarousel) {
                    prdCarousel.destroy();
                    prdCarousel.init();
                }
                currentTab.querySelector('[data-load]').setAttribute('data-load', 'loaded')
            }, 100)
        } else {
            this.setTabWrapHeight(true);
            if (currentTab) {
                const prdCarousel = currentTab.querySelector('swiper-carousel');
                if ('init' in prdCarousel) {
                    prdCarousel.carousel.update()
                }
            }
        }
    }

    shiftSelector() {
        if (this.trackAfter) {
            const activeItem = this.tabs.querySelector('.active'),
              tabsParent = this.querySelector('.tabs-wrap-track');
            let correctionLeft = (activeItem == tabsParent.firstElementChild) ? -1 : (activeItem == tabsParent.lastElementChild) ? 2 : 0,
              correctionWidth = (this.tab.length == 1) ? 4 : 1;
            if (document.body.classList.contains('rtl-mode')) correctionLeft = -correctionLeft;
            this.trackAfter.style.left = activeItem.offsetLeft + correctionLeft + 'px';
            this.trackAfter.style.width = activeItem.clientWidth + correctionWidth + 'px';
            setTimeout(() => {
                this.trackAfter.classList.remove('d-none')
            }, 300)
        }
    }
}

customElements.define('tab-slider', TabSlider);

class ImagesAccordion extends HTMLElement {
    constructor() {
        super();

        this.items = this.querySelectorAll('.card-category');
        this.itemsWrapper = this.querySelectorAll('.categories-accordion-row > .col');

        this.handlerClick = this.onImageClick.bind(this);
        this.handlerHover = this.onImageEnter.bind(this);

        this.init();

        window.addEventListener('resize', debounce(() => {
            this.removeListeners();
            this.init()
        }, 500))
    }
    removeListeners() {
        this.items.forEach(link => {
            link.removeEventListener('click', this.handlerClick);
            link.removeEventListener('mouseenter', this.handlerHover);
        })
    }
    init() {
        this.itemsWrapper.forEach(item => {
            this.setStyle(item);
            const imageLazyload = this.querySelector('img.lazyload');
            if (imageLazyload) {
                imageLazyload.addEventListener('lazyloaded', () => {
                    this.setStyle(item)
                })
            }
        });
        let isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;
        if (isTouchDevice && window.matchMedia(`(max-width:1024px)`).matches) {
            this.items.forEach(link => link.addEventListener('click',  this.handlerClick));
        } else {
            this.items.forEach(link => link.addEventListener('mouseenter', this.handlerHover));
        }
    }
    reInit() {
        this.itemsWrapper.forEach(item => {
            this.setStyle(item)
        })
    }
    setStyle(item) {
        const title = item.querySelector('.col-category-name');
        setStyle(item, {'flex': 'auto'});
        setStyle(title, {'height': 'auto'});
        const height =  item.offsetHeight,
          titleHeight = title ? title.offsetHeight : 0;
        setStyle(item, {'flex': ''});
        setStyle(title, {'height': ''});
        item.style.setProperty('--height',  Math.max(height, titleHeight) + 'px');
        item.style.setProperty('--title-height', titleHeight + 'px');
    }
    onImageEnter(e) {
        e.preventDefault();
        if (!document.body.classList.contains('touch')) {
            const target = e.currentTarget;
            if (target) {
                this.itemsWrapper.forEach(item => {
                    item.classList.remove('is-opened');
                });
                target.closest('.col')?.classList.add('is-opened')
            }
        }
    }
    onImageClick(e) {
        e.preventDefault();
        const target = e.currentTarget,
          wrapper = target.closest('.col');
        if (target && wrapper) {
            if (wrapper.classList.contains('is-opened')) {
                window.location.href = target.href;
            } else {
                this.itemsWrapper.forEach(item => {
                    item.classList.remove('is-opened');
                });
                wrapper.classList.add('is-opened')
            }
        }
    }
}
customElements.define('images-accordion', ImagesAccordion);

class FrequentlyBoughtTogether extends HTMLElement {
    constructor() {
        super();
        if (!this.querySelector('scroll-items')) this.classList.add('off-scroll');
        this.onLazyload();
    }

    onLazyload() {
        if (this.classList.contains('lazyload')) {
            this.addEventListener('lazyloaded', () => {
                this.loadAjax()
            })
        }
    }

    loadAjax() {
        const ajaxContainer = this;
        if (this.dataset.ajax && !this.classList.contains('ajax-loaded') && !this.classList.contains('ajax-loading')) {
            this.loaderTemplate = '<div data-load="loading"></div>';
            this.classList.add('ajax-loading');
            const urlAjax = this.dataset.ajax;
            if (!ajaxContainer.querySelector('[data-load]')) ajaxContainer.innerHTML = this.loaderTemplate;
            fetch(urlAjax).then((response) => response.text())
              .then((data) => {
                  ajaxContainer.querySelector('[data-load]')?.remove();
                  ajaxContainer.innerHTML = data;
                  const h = this.scrollHeight;
                  this.style.transitionDuration = h / 1200 + 's';
                  this.style.height = h + 'px';
                  setTimeout(() => {
                      this.classList.remove('ajax-loading');
                      this.classList.add('ajax-loaded')
                  }, 1000)
              })
              .catch((error) => {
                  console.error('error', error);
                  this.classList.remove('ajax-loading')
              })
        }
    }
}

customElements.define('frequently-bought-together', FrequentlyBoughtTogether);

class ProductsCardCompact extends HTMLElement {
    constructor() {
        super();
        if (!this.querySelector('scroll-items')) this.classList.add('off-scroll');
        this.productWidth();
        window.addEventListener('resize', () => {
            this.productWidth()
        })
    }

    productWidth() {
        let wrap = this.querySelector('.products-card-compact'),
          productWidth = this.hasAttribute('data-grid') ? (this.offsetWidth / 2 - 10) : this.querySelector('.minicart-prd').offsetWidth;
        productWidth < 265 ? wrap.classList.add('bw--listing') : wrap.classList.remove('bw--listing');
    }
}

customElements.define('products-card-compact', ProductsCardCompact);

class LoadingBar extends HTMLElement {
    constructor() {
        super();
        this.style.setProperty('--load-time', this.dataset.time);
    }

    start() {
        this.classList.remove('hidden');
        void this.offsetWidth;
        this.style.width = '100%';
        this.classList.add('lb--animated');
        this.addEventListener('transitionend', () => {
            this.hide()
        }, false)
    }

    hide() {
        this.classList.add('hidden');
        this.classList.remove('lb--animated');
        this.style.width = '0'
    }
}

customElements.define('loading-bar', LoadingBar);

class DropdownOnClick extends HTMLElement {
    constructor() {
        super();
        this.popupElement = this.querySelector('[data-dropdown-content]');
        if (this.popupElement) {
            if (this.closest('.prd-block-meta')) {
                this.checkPosition();
                window.addEventListener('resize', debounce(() => {
                    this.checkPosition()
                }, 500))
            }
            this.querySelector('[data-dropdown-link]')?.addEventListener('click', this.onLinkClick.bind(this));
            document.addEventListener('click', this.onDocumentClick.bind(this))
        }
    }

    checkPosition() {
        const parentCol = this.closest('.col-auto');
        if (parentCol) {
            const prevCol = parentCol.previousElementSibling;
            if (prevCol && getCoords(prevCol).top == getCoords(this).top) {
                this.classList.add('to-right')
            } else this.classList.remove('to-right')
        }
    }

    onLinkClick(e) {
        e.preventDefault();
        this.classList.toggle('is-opened');
        this.updateScroll();
    }

    onDocumentClick(e) {
        if (!this.contains(e.target)) {
            this.classList.remove('is-opened');
            this.querySelectorAll('.product-form__error-message-wrapper').forEach(el => {
                el.hidden = true
            });
            this.destroyScroll()
        }
    }

    destroyScroll() {
        const scroll = this.querySelector('.js-dropdn-content-scroll');
        if (scroll && Scrollbar.get(scroll) && scroll.dataset.scrollbar) {
            Scrollbar.get(scroll).destroy()
        }
    }

    updateScroll() {
        this.querySelectorAll('.js-dropdn-content-scroll').forEach(scroll => {
            if (Scrollbar.get(scroll) && scroll.dataset.scrollbar) {
                Scrollbar.get(scroll).update();
                this.popupElement.classList.remove('hide-scroll');
                this.hideTooltip(scroll);
            } else {
                Scrollbar.init(scroll, {
                    alwaysShowTracks: true,
                    damping: document.body.dataset.damping
                })
                this.hideTooltip(scroll);
                setTimeout(() => {
                    this.isScroll()
                }, 10)
            }
        })
    }

    hideTooltip(scroll) {
        if (Scrollbar.get(scroll)) {
            Scrollbar.get(scroll).addListener(function () {
                tippy && tippy.hideAll()
            })
        }
    }

    isScroll() {
        const scroll = this.querySelector('.js-dropdn-content-scroll');
        if (scroll && scroll.dataset.scrollbar && scroll.querySelector('.scrollbar-track-y')?.style.display == 'block') {
            scroll.classList.add('has-scroll')
        } else scroll.classList.remove('has-scroll')
    }
}

customElements.define('dropdown-onclick', DropdownOnClick);

class ButtonAnimated extends HTMLElement {
    constructor() {
        super();
        this.btn = this.children[0];
        this.pauseAnimate = parseInt(this.dataset.pause);
        if (this.dataset.onesAnimate == undefined) {
            this.start(parseInt(this.dataset.delayStart));
            if (!this.btn.classList.contains('disabled')) {
                this.btn.addEventListener('mouseenter', () => {
                    this.stop()
                });
                this.btn.addEventListener('mouseleave', () => {
                    this.start(parseInt(this.dataset.delayAfterStop))
                })
            }
        }
    }

    onesAnimate() {
        let btn = this.btn,
          styleClass = 'btn--animated-' + this.dataset.style;
        this.btn.classList.add(styleClass);
        setTimeout(() => {
            btn.classList.remove(styleClass)
        }, 1500);
    }

    start(delay) {
        let btn = this.btn,
          styleClass = 'btn--animated-' + this.dataset.style,
          that = this;
        that.animatedButton = setTimeout(function toggleClass() {
            btn.classList.add(styleClass);
            setTimeout(() => {
                btn.classList.remove(styleClass)
            }, 1500);
            that.animatedButton = setTimeout(toggleClass, that.pauseAnimate)
        }, delay);
    }

    stop() {
        if (this.animatedButton) {
            clearTimeout(this.animatedButton);
            this.animatedButton = 0;
        }
    }
}

customElements.define('button-animated', ButtonAnimated);

class FixedFooter extends HTMLElement {
    constructor() {
        super();
        this.placeholder = this.querySelector('.footer-placeholder');
        this.footer = this.querySelector('.page-footer');
        this.placeholderTop = 0;
        this.ticking = false;
        this.init();
        window.addEventListener('resize', debounce(() => {
            this.init()
        }, 100));
    }

    init() {
        this.updateHolderHeight()
        this.checkFooterHeight()
    }

    updateHolderHeight() {
        this.placeholder.style.height = `${this.footer.offsetHeight - 15}px`
    }

    checkFooterHeight() {
        if (this.footer.offsetHeight > window.innerHeight) {
            window.addEventListener('scroll', this.onScroll.bind(this))
            this.footer.style.bottom = 'unset'
            this.footer.style.top = '0px'
            this.footer.classList.add('footer--fixed-top')
        } else {
            window.removeEventListener('scroll', this.onScroll.bind(this))
            this.footer.style.top = 'unset'
            this.footer.style.bottom = '0px'
            this.footer.classList.remove('footer--fixed-top')
        }
    }

    onScroll() {
        this.placeholderTop = Math.round(this.placeholder.getBoundingClientRect().top)
        this.requestTick()
    }

    requestTick() {
        if (!this.ticking) requestAnimationFrame(this.updateBasedOnScroll.bind(this))
        this.ticking = true
    }

    updateBasedOnScroll() {
        this.ticking = false
        if (this.placeholderTop <= 0) {
            this.footer.style.top = `${this.placeholderTop}px`
        }
    }
}

customElements.define('fixed-footer', FixedFooter)

class StickySections extends HTMLElement {
    constructor() {
        super();
        this.stickySections = this.querySelectorAll('.sticky-section');
        this.init();
        window.addEventListener('resize', debounce(() => {
            this.init()
        }, 100));
    }

    init() {
        if (!window.matchMedia(`(max-width:1024px)`).matches) {
            window.addEventListener('scroll', this.onScroll.bind(this))
        } else {
            window.removeEventListener('scroll', this.onScroll.bind(this))
        }
    }

    onScroll() {
        for (let i = 0; i < this.stickySections.length; i++) {
            if (i > 0) {
                const factor = (this.stickySections[i].offsetTop - this.stickySections[i - 1].offsetTop) / window.innerHeight;
                const translation = -1 + factor;
                const scaleFactor = Math.max(Math.min(factor + 0.8, 1), 0.95);
                this.stickySections[i - 1].style.transform = `scale(${scaleFactor})`;
                const parallaxElements = this.stickySections[i - 1].querySelectorAll('[data-parallax]');
                for (let el of parallaxElements) {
                    const intensity = Number(el.dataset.parallax);
                    el.style.transform = `translateY(${translation * intensity}vh)`;
                }
            }
        }
    }
}

customElements.define('sticky-sections', StickySections)

let productWidthCache = {},
  productWidthCacheHor = {};

class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.checkImageRadius();
        this.hover = this.querySelector('.prd-hover');
        this.horInside = this.querySelector('.prd-hor-inside');
        this.errorMessage = this.querySelector('.product-form__error-message-wrapper');
        this.preloadedImages = [];
        this.preloadImagesWidth = 0;
        if (!this.classList.contains('prd-simple')) {
            this.dataScrollbar = this.querySelector('[data-scrollbar]');
            if (this.dataScrollbar && !window.matchMedia(`(max-width:1024px)`).matches) {
                if (this.querySelector('.scroll-content')) {
                    this.dataScrollbar.innerHTML = this.querySelector('.scroll-content').innerHTML;
                }
                this.scrollbar = Scrollbar.init(this.dataScrollbar, {alwaysShowTracks: true})
            }
            this.addEventListener('mouseenter', () => {
                this.enableHover();
                this.isDisableHover() && this.onProductHover();
            })
            this.addEventListener('mouseleave', () => {
                this.isDisableHover() && this.onProductUnHover();
            })
        }
        this.colors = this.querySelector('.prd-image-colors');
        this.querySelector('.prd-hover')?.addEventListener('mouseenter', () => {
            this.preloadImages()
        })

        this.querySelector('.prd-hover')?.addEventListener('touch', () => {
            this.preloadImages()
        })
        this.productWidth();
        this.onProductLazyload();
        document.addEventListener('DOMContentLoaded', () => this.productWidth());
        window.addEventListener('resize', debounce(() => {
            this.productWidth();
            if (this.classList.contains('lazyloaded') && this.querySelector('.ajax-container')) {
                this.classList.remove('lazyloaded');
                this.classList.add('lazyload')
            }
        }, 500))
    }

    isDisableHover() {
        return !this.hasAttribute('block-mouseleave')
    }

    disableHover() {
        this.setAttribute('block-mouseleave', true);
        this.classList.add('block-mouseleave');
    }

    enableHover() {
        this.removeAttribute('block-mouseleave');
        this.classList.remove('block-mouseleave');
    }

    onProductLazyload() {
        if (this.classList.contains('lazyload')) {
            this.addEventListener('lazyloaded', () => {
                const viewMode = document.querySelector('view-mode');
                if (window.matchMedia(`(max-width:1024px)`).matches || (viewMode && 'getCurrentBreakpointMode' in viewMode && this.closest('.grid_list_' + viewMode.getCurrentBreakpointMode()))) {
                    this.loadAjax()
                }
            })
        }
    }

    onProductUnHover() {
        const swatches = this.querySelector('.shopify-section');
        if (swatches) swatches.style.height = 'auto';
        if (this.classList.contains('prd-hor')) {
            this.hover.classList.remove('h-100');
            this.classList.remove('off-variants');
        }
        if (window.matchMedia(`(max-width:1024px)`).matches) {
            this.classList.remove('hovered')
        } else {
            this.querySelectorAll('select').forEach((input) => {
                input.blur()
            })
            this.classList.remove('hovered');
            if (this.errorMessage) this.errorMessage.hidden = true;
            setTimeout(() => {
                this.style.removeProperty('height');
                this.style.removeProperty('--maxheight')
            }, 100)
        }
    }

    loadAjax() {
        const ajaxContainer = this.querySelector('.ajax-container');
        if (ajaxContainer && this.dataset.ajax && !this.classList.contains('ajax-loaded') && !this.classList.contains('ajax-loading')) {
            this.loaderTemplate = '<div data-load="loading"></div>';
            this.classList.add('ajax-loading');
            const urlAjax = this.dataset.ajax;
            if (!ajaxContainer.querySelector('[data-load]')) ajaxContainer.innerHTML = this.loaderTemplate;
            fetch(urlAjax).then((response) => response.text())
              .then((data) => {
                  ajaxContainer.querySelector('[data-load]')?.remove();
                  ajaxContainer.innerHTML = data;
                  ajaxContainer.replaceWith(...ajaxContainer.childNodes);
                  const swatches = this.querySelector('.shopify-section');
                  if (swatches) swatches.style.height = swatches.scrollHeight + 'px';
                  this.classList.remove('ajax-loading');
                  this.classList.add('ajax-loaded');
                  this.disableSelect();
              })
              .catch((error) => {
                  console.error('error', error);
                  this.classList.remove('ajax-loading')
              })
        }
    }

    disableSelect() {
        if (!this.classList.contains('prd-simple')) {
            this.querySelectorAll('select').forEach((input) => {
                input.addEventListener('mouseenter', () => {
                    clearTimeout(this.selectBlockTimer);
                    this.disableHover()
                });
                input.addEventListener('mouseleave', () => {
                    this.selectBlockTimer = setTimeout(() => {
                        this.enableHover();
                        if(!this.matches(':hover')) {
                            this.onProductUnHover()
                        }
                    }, 100)
                })
            })
            const selects = this.querySelector('.prd-hover');
            if (selects && this.closest('swiper-carousel') && (document.body.classList.contains('mac') || document.body.classList.contains('firefox'))) {
                if (selects.querySelector('select')) {
                    selects.addEventListener('mouseenter', () => {
                        this.closest('swiper-carousel').carousel.allowTouchMove = false
                    });
                    selects.addEventListener('mouseleave', () => {
                        this.closest('swiper-carousel').carousel.allowTouchMove = true
                    })
                }
            }
        }
    }

    onProductHover() {
        if (this.classList.contains('hovered') || this.closest('.hover-off')) return;
        this.loadAjax();
        if (this.classList.contains('prd-hor')) {
            if (this.hover.offsetHeight >= this.horInside.offsetHeight) {
                this.classList.add('off-variants');
            }
            if ((this.hover.offsetHeight + this.querySelector('.prd-name').offsetHeight) >= this.horInside.offsetHeight) {
                this.hover.classList.add('h-100')
            }
        }
        if (window.innerWidth < 992) {
            this.classList.add('hovered')
        } else {
            const h = this.getBoundingClientRect().height,
              hn = this.querySelector('.prd-hover .prd-name') ? this.querySelector('.prd-hover .prd-name').getBoundingClientRect().height : 0,
              ha = this.querySelector('.prd-hover .prd-action') ? this.querySelector('.prd-hover .prd-action').getBoundingClientRect().height : 0,
              hMax = `${h - hn - ha - 50}px`;
            this.style.setProperty('height', `${h}px`);
            this.style.setProperty('--maxheight', hMax);
            this.classList.add('hovered');
            const scroll = this.querySelector('[data-scrollbar]');
            if (scroll && Scrollbar.get(scroll)) {
                Scrollbar.get(scroll).update()
            }
        }
    }

    parseJson() {
        this.productJson = this.querySelector('[type="application/json"]') ? JSON.parse(this.querySelector('[type="application/json"]').textContent) : false;
    }

    preloadImages() {
        const imageWidth = this.querySelector('.prd-image-wrap').offsetWidth * 2;
        if (!this.productJson) this.parseJson();
        if (this.productJson && this.preloadImagesWidth < imageWidth) {
            this.preloadedImages = [];
            this.colors.innerHTML = '';
            this.preloadImagesWidth = imageWidth;
            for (let i = 0; i < this.productJson.length; i++) {
                if (this.productJson[i].featured_image) {
                    let src = this.productJson[i].featured_image.src + '&width=' + imageWidth;
                    if (!this.preloadedImages.some(el => src === el)) {
                        this.preloadedImages.push(src);
                    }
                }
            }
            for (let i = 0; i < this.preloadedImages.length; i++) {
                let src = this.preloadedImages[i];
                preloadImage(src)
                  .then(img => {
                      this.colors.append(img);
                      this.preloadedImages.push(src);
                      img.classList.add('js-prd-img');
                  })
                  .catch(error => console.error("error", error));
            }
        }
    }

    productWidth() {
        let w = this.offsetWidth,
          wClass;
        if (w == 0) return;
        this.style.setProperty('height', '');
        this.querySelector('.shopify-section')?.style.setProperty('height', 'auto');
        removeClassByPrefix(this, 'prd-w-', '');
        removeClassByPrefix(this, 'prd-hor-w-', '');
        if (this.classList.contains('prd-hor')) {
            if (this.closest('.swiper-slide').length) {
                w = this.closest('.swiper-slide').offsetWidth
            }
            if (w in productWidthCacheHor) {
                wClass = productWidthCacheHor[w]
            } else {
                wClass = (w >= 510 && w < 580) ? 'prd-hor-w-lg' : (w >= 445 && w < 500) ? 'prd-hor-w-md' : (w >= 380 && w < 445) ? 'prd-hor-w-sm' : (w >= 360 && w < 380) ? 'prd-hor-w-xs' : (w < 360) ? 'prd-hor-w-xxs' : 'prd-hor-w-xl';
                productWidthCacheHor[w] = wClass;
            }
        } else {
            if (w in productWidthCache) {
                wClass = productWidthCache[w]
            } else {
                wClass = (w >= 260 && w < 300) ? 'prd-w-lg' : (w >= 240 && w < 260) ? 'prd-w-md' : (w >= 210 && w < 240) ? 'prd-w-sm' : (w >= 180 && w < 210) ? 'prd-w-xs' : (w < 180) ? 'prd-w-xxs' : 'prd-w-xl';
                productWidthCache[w] = wClass;
            }
        }
        this.classList.add(wClass);
    }

    updateImage(id) {
        if (!this.productJson) this.parseJson();
        const variants = this.productJson,
          currentVariant = variants.find(variant => variant.id == id);
        const url = currentVariant.featured_image.src;
        const currentURL = this.querySelector(`.prd-image > .js-prd-img:nth-child(${this.querySelectorAll('.prd-image > .js-prd-img').length})`).src;
        if (url.split("&width=")[0] == currentURL.split("&width=")[0]) return;
        this.image = this.querySelector('.prd-image');
        this.imageColors = this.colors.querySelectorAll('img');
        let preloaded = false,
          newImg,
          preloadedImg = this.colors.querySelectorAll('img');
        for (let i = 0; i < preloadedImg.length; ++i) {
            if (preloadedImg[i].src.split('&width=')[0] == url.split('&width=')[0]) {
                preloaded = true;
                newImg = preloadedImg[i];
                this.colors.append(preloadedImg[i].cloneNode());
                break;
            }
        }
        if (window.innerWidth >= 992) {
            this.querySelectorAll('.prd-image > .js-prd-img').length > 1 && this.querySelector('.prd-image > .js-prd-img:nth-child(1)')?.remove();
            const currentImg = this.querySelector('.js-prd-img:nth-child(1)');
            if (!preloaded) {
                this.querySelector('[data-load]').setAttribute('data-load', 'loading');
                loadImage(url)
                  .then(newImg => {
                      newImg.classList.add('js-prd-img');
                      this.querySelector('[data-load]').setAttribute('data-load', 'loaded');
                      currentImg.parentNode?.insertBefore(newImg, currentImg.nextSibling);
                      this.animateImage(currentImg, newImg, false);
                  })
                  .catch(error => console.error(error));
            } else {
                currentImg.parentNode?.insertBefore(newImg, currentImg.nextSibling);
                this.animateImage(currentImg, newImg, false)
            }
        } else {
            const currentImg = this.querySelector('.js-prd-img:nth-child(1)');
            if (!preloaded) {
                let cloneNode = this.querySelector('.prd-image-clone');
                if (this.processing && cloneNode) {
                    this.querySelector('.prd-image').remove();
                    cloneNode.classList.add('prd-image');
                    cloneNode.classList.remove('prd-image-clone', 'd-none');
                }
                this.processing = true;
                this.querySelectorAll('.prd-image > .js-prd-img').length > 1 && this.querySelector('.prd-image > .js-prd-img:nth-child(2)')?.remove();
                this.cloneImage();
                this.querySelector('[data-load]')?.setAttribute('data-load', 'loading');
                loadImage(url)
                  .then(newImg => {
                      newImg.classList.add('js-prd-img');
                      this.processing = false;
                      return newImg;
                  })
                  .then(newImg => {
                      if (!this.processing) {
                          currentImg.parentNode?.insertBefore(newImg, currentImg.nextSibling);
                          this.animateImage(currentImg, newImg, true);
                      }
                      this.querySelector('[data-load]')?.setAttribute('data-load', 'loaded');
                  })
                  .catch(error => console.error(error));
            } else {
                this.querySelectorAll('.prd-image > .js-prd-img').length > 1 && this.querySelector('.prd-image > .js-prd-img:nth-child(2)')?.remove();
                currentImg.parentNode?.insertBefore(newImg, currentImg.nextSibling);
                this.animateImage(currentImg, newImg, true)
            }
        }
    }

    checkImageRadius() {
        if (this.classList.contains('prd--style2') && !this.querySelector('.ic--rd')) {
            this.classList.add('ignore-top-radius')
        }
    }

    cloneImage() {
        let cloneNode = this.querySelector('.prd-image-clone');
        if (cloneNode) cloneNode.remove();
        let clone = this.querySelector('.prd-image').cloneNode(true);
        clone.classList.remove('prd-image');
        clone.classList.add('prd-image-clone', 'd-none');
        this.querySelector('.prd-image-wrap').appendChild(clone);
    }

    animateImage(firstImage, lastImage, remove) {
        firstImage.animate([{
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
        }, {
            transform: 'translate3D(0, -20%, 0)',
            opacity: 0
        }], {
            duration: 300,
            iterations: 1,
            fill: 'both'
        });
        lastImage.animate([{
            transform: 'translate3D(0, 20%,0)',
            opacity: 0
        }, {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
        }], {
            duration: 250,
            iterations: 1,
            fill: 'both'
        });
        if (remove) {
            setTimeout(() => {
                firstImage.remove();
                this.processing = false;
                this.cloneImage();
            }, 300)
        }
    }
}

customElements.define('product-card', ProductCard);

class LookbookButton extends HTMLElement {
    constructor() {
        super();
        let url = this.dataset.ajax,
          loader = this.querySelector('[data-load]');
        tippy(this.querySelector('.lookbook-popup-btn'), {
            content: '',
            theme: 'loading',
            duration: [200, 200],
            touch: true,
            trigger: 'click',
            appendTo: document.body,
            zIndex: 1062,
            hideOnClick: true,
            interactive: true,
            allowHTML: true,
            onCreate(instance) {
                instance.isFetching = false;
                instance.error = null;
            },
            onShow(instance) {
                tippy.hideAll({exclude: instance});
                if (instance.isFetching || instance.error) {
                    instance.popper.querySelector('wishlist-button')?.render();
                    const tippyNode = instance.popper.querySelector('wishlist-button>a');
                    if (tippyNode && tippyNode._tippy) tippyNode._tippy.hide();
                } else {
                    loader.setAttribute('data-load', 'loading');
                    instance.isFetching = true;
                    fetch(url)
                      .then((response) => response.text())
                      .then((data) => {
                          const shopifySection = new DOMParser().parseFromString(data, 'text/html').querySelector('.shopify-section'),
                            innerText = shopifySection ? shopifySection.innerHTML : data;
                          instance.setContent(innerText);
                          instance.hide();
                          instance.setProps({
                              theme: 'lookbook',
                          });
                          instance.show();
                          instance.popper.querySelector('wishlist-button')?.render();
                      })
                      .catch((error) => {
                          instance.error = error;
                          instance.setContent(`Lookbook request failed. ${error}`);
                      })
                      .finally(() => {
                          loader.setAttribute('data-load', 'loaded')
                      })
                }
            }
        })
    }
}

customElements.define('lookbook-button', LookbookButton)

class CategoryChangeImage extends HTMLElement {
    constructor() {
        super();
        let startImage = this.querySelector('[data-image-start]');
        this.querySelectorAll('[data-image]').forEach(
          button => button.addEventListener('mouseenter', this.onLinkHover.bind(this))
        )
        if (startImage && startImage.dataset.image) {
            this.lastURL = startImage.dataset.image;
            this.addEventListener('mouseleave', () => {
                this.updateImage(startImage.dataset.image)
            })
        }
        const imageWrap = this.querySelector('.image-hover-scale');
        if (imageWrap) imageWrap.innerHTML = `<div data-load="loaded"></div><div class="image-wrap">${imageWrap.innerHTML}</div>`;
    }

    onLinkHover(event) {
        event.preventDefault();
        const url = event.target.dataset.image;
        url && this.updateImage(url)
    }

    updateImage(url) {
        if (this.lastURL == url) return;
        this.lastURL = url
        if (this.querySelectorAll('.image-container img').length > 1) {
            this.querySelector('.image-container img').remove()
        }
        const currentImg = this.querySelector('.image-container img');
        this.querySelector('[data-load]')?.setAttribute('data-load', 'loading');
        loadImage(url)
          .then(newImg => {
              newImg.classList.add('w-100');
              this.processing = false;
              return newImg;
          })
          .then(newImg => {
              if (!this.processing) {
                  currentImg.parentNode?.insertBefore(newImg, currentImg.nextSibling);
                  this.animateImage(currentImg, newImg, true);
              }
              this.querySelector('[data-load]')?.setAttribute('data-load', 'loaded');
          })
          .catch(error => console.error(error));
    }

    animateImage(firstImage, lastImage, remove) {
        firstImage.animate([{
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
        }, {
            transform: 'translate3D(0, -20%, 0)',
            opacity: 0
        }], {
            duration: 300,
            iterations: 1,
            fill: 'both'
        });
        lastImage.animate([{
            transform: 'translate3D(0, 20%,0)',
            opacity: 0
        }, {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
        }], {
            duration: 250,
            iterations: 1,
            fill: 'both'
        });
        if (remove) {
            setTimeout(() => {
                firstImage.remove();
                this.processing = false;
            }, 300)
        }
    }
}

customElements.define('category-change-img', CategoryChangeImage);

class DeferredMedia extends HTMLElement {
    constructor() {
        super();
        this.mediaType = this.dataset.media;
        this.videoWrap = this.querySelector('.video-wrap-content');
        this.videoControl = this.querySelector('.video-control');
        if (this.mediaType == 'mp4') {
            const playButton = this.querySelector('.js-video-play');
            if (playButton) {
                playButton.addEventListener('click', this.loadContentMp4.bind(this));
                if (this.hasAttribute('data-autoplay')) {
                    playButton.click()
                }
            } else {
                this.loadContentMp4()
            }
        } else if (this.mediaType == 'vimeo') {
            let tag = document.createElement('script');
            tag.src = "https://player.vimeo.com/api/player.js";
            document.body.appendChild(tag);
            this.querySelector('.js-video-play')?.addEventListener('click', this.loadContentVimeo.bind(this));
            if (this.hasAttribute('data-autoplay')) this.querySelector('.js-video-play').click();
        } else if (this.mediaType == 'youtube') {
            this.querySelector('.js-video-play')?.addEventListener('click', this.loadContentYouTube.bind(this));
            if (this.hasAttribute('data-autoplay')) this.querySelector('.js-video-play').click();
        } else if (this.mediaType == 'googlemap') {
            this.querySelector('.js-map-play')?.addEventListener('click', this.loadContentGoogleMap.bind(this));
        }
    }

    stopAllVideos() {
        if (this.closest('.bnr-img')) return;
        document.querySelectorAll('deferred-media').forEach(
          (video) => {
              if (video.querySelector('.is-playing') && !video.closest('.bnr-img')) {
                  video.pauseVideo()
              }
          }
        )
    }

    loadContentYouTube() {
        this.stopAllVideos();
        const content = document.createElement('div');
        content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
        this.querySelector('.js-video-wrap').appendChild(content.querySelector('video, model-viewer, iframe'));
        const iframe = this.querySelector('iframe');

        function newPlayer(el) {
            el.player = new YT.Player(iframe, {
                events: {
                    onReady() {
                        el.stopAllVideos();
                        el.player.playVideo();
                        el.videoControl.remove();
                        el.addPlaying();
                        el.classList.add('init')
                    },
                    onStateChange(event) {
                        switch (event.data) {
                            case 1:
                                el.stopAllVideos();
                                el.addPlaying();
                                el.player.playVideo();
                                break;
                            case 2:
                                el.addPause();
                                break;
                        }
                    }
                }
            })
        }

        if (!this.classList.contains('init')) {
            if (document.body.classList.contains('youtube-ready')) {
                newPlayer(this)
            } else {
                let tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);
                window.onYouTubeIframeAPIReady = () => {
                    document.body.classList.add('youtube-ready');
                    newPlayer(this)
                }
            }
        } else {
            this.player.playVideo();
            this.addPlaying();
        }
    }

    loadContentVimeo() {
        this.stopAllVideos();
        if (!this.classList.contains('init')) {
            const content = document.createElement('div');
            content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
            this.querySelector('.js-video-wrap').appendChild(content.querySelector('video, model-viewer, iframe'));
            this.player = new Vimeo.Player(this.querySelector('iframe'));
            this.player.play();
            this.videoControl.remove();
            this.addPlaying();
            this.classList.add('init')
        } else {
            this.player.play();
            this.addPlaying();
        }
        this.player.on('play', () => {
            this.stopAllVideos();
            this.addPlaying();
            this.player.play();
        });
        this.player.on('pause', () => {
            this.addPause();
        });
    }

    loadContentMp4() {
        this.stopAllVideos();
        if (!this.classList.contains('init')) {
            const content = document.createElement('div');
            content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
            this.querySelector('.js-video-wrap').appendChild(content.querySelector('video, model-viewer, iframe'));
            this.player = this.querySelector('video');
            this.player.play();
            this.addPlaying();
            this.querySelector('.js-video-stop')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.addPause();
                this.player.pause();
            })
            this.querySelector('.js-video-play')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.addPlaying();
                this.player.play();
            })
            this.classList.add('init')
        } else {
            this.player.play();
            this.addPlaying();
        }
    }

    loadContentGoogleMap() {
        if (!this.classList.contains('init')) {
            const content = document.createElement('div');
            content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
            this.querySelector('.js-map-wrap').appendChild(content.querySelector('iframe'));
            this.querySelector('loading-bar').start();
            this.classList.add('map-loading');
            this.querySelector('iframe').addEventListener('load', () => {
                this.classList.add('map-loaded')
            })
        }
    }

    pauseVideo() {
        if (this.player) {
            this.addPause()
            if (this.mediaType == 'mp4') {
                this.player.pause();
            } else if (this.mediaType == 'vimeo') {
                this.player.pause();
            } else if (this.mediaType == 'youtube') {
                this.player.pauseVideo();
            }
        }
    }

    addPause() {
        this.videoWrap.classList.remove('is-playing');
        this.videoWrap.classList.add('is-paused');
    }

    addPlaying() {
        this.videoWrap.classList.add('is-playing');
        this.videoWrap.classList.remove('is-paused');
    }
}

customElements.define('deferred-media', DeferredMedia);

class PriceSlider extends HTMLElement {
    constructor() {
        super();
        this.isDecimal = this.hasAttribute('data-decimal');
        [this.minInput, this.maxInput] = this.querySelectorAll('input[type="range"]');
        this.inverseLeft = this.querySelector('.inverse-left');
        this.inverseRight = this.querySelector('.inverse-right');
        this.priceRange = this.querySelector('.price-slider-range');
        [this.priceThumbMin, this.priceThumbMax] = this.querySelectorAll('.price-slider-thumb');
        if (this.isDecimal) {
            [this.textInputMin, this.textInputMax] = this.querySelectorAll('.help-input');
        }
        this.tooltip = false;
        if (this.querySelectorAll('.price-slider-sign').length) {
            this.tooltip = true;
            [this.priceSignMin, this.priceSignMax] = this.querySelectorAll('.price-slider-sign');
        } else {
            [this.minInputCustom, this.maxInputCustom] = this.querySelectorAll('input[type="number"]');
            this.minInputCustom.addEventListener('input', () => {
                if (this.minInputCustom.value !== '') {
                    this.minInputCustomEvent()
                }
            });
            this.minInputCustom.addEventListener('change', () => {
                this.minInputCustomEvent()
            });
            this.minInputCustom.addEventListener('keyup', ({key}) => {
                this.minInputCustomEvent(key)
            });
            this.maxInputCustom.addEventListener('input', () => {
                this.minInputCustomEvent()
            });
            this.maxInputCustom.addEventListener('focusout', () => {
                if ((this.maxInputCustom.value - this.minInput.value) <= 0) {
                    this.maxInputCustom.value = this.maxInputCustom.max;
                    this.maxEvent(this.maxInputCustom.value)
                }
            });
            this.maxInputCustom.addEventListener('change', () => {
                this.maxInputCustomEvent()
            });
            this.maxInputCustom.addEventListener('keyup', ({key}) => {
                this.maxInputCustomEvent(key)
            })
        }
        this.minInput.setAttribute('value', this.minInput.value);
        this.maxInput.setAttribute('value', this.maxInput.value);
        this.minEvent();
        this.maxEvent();
        this.minInput.addEventListener('input', () => {
            this.minEvent()
        });
        this.maxInput.addEventListener('input', () => {
            this.maxEvent()
        });
        this.hoverState();
        if (this.isDecimal) {
            this.updateHelpInputs();

            this.textInputMin.addEventListener('keydown', (event) => {
                if (event.metaKey) return;
                const pattern = /[0-9]|\.|Tab|Backspace|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Delete|Escape/;
                if (!event.key.match(pattern)) {
                    event.preventDefault();
                }
            });

            this.textInputMin.addEventListener('input', () => {
                const rawValue = this.textInputMin.value;
                const sanitizedValue = rawValue.replace(/ /g, '');
                if (sanitizedValue.includes('.')) {
                    const numberValue = parseFloat(sanitizedValue) * 1000;
                    this.minInputCustom.value = numberValue;
                } else if (!isNaN(sanitizedValue) && sanitizedValue !== '') {
                    this.minInputCustom.value = sanitizedValue;
                }
                this.minInputCustomEvent();
            });

            this.textInputMax.addEventListener('keydown', (event) => {
                if (event.metaKey) return;
                const pattern = /[0-9]|\.|Tab|Backspace|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Delete|Escape/;
                if (!event.key.match(pattern)) {
                    event.preventDefault();
                }
            });

            this.textInputMax.addEventListener('input', () => {
                const rawValue = this.textInputMax.value;
                const sanitizedValue = rawValue.replace(/ /g, '');
                if (sanitizedValue.includes('.')) {
                    const numberValue = parseFloat(sanitizedValue) * 1000;
                    this.maxInputCustom.value = numberValue;
                } else if (!isNaN(sanitizedValue) && sanitizedValue !== '') {
                    this.maxInputCustom.value = sanitizedValue;
                }
                this.maxInputCustomEvent();
            });
        }

    }

    updateHelpInputs() {
        if (!this.isDecimal) return;
        if (this.minInputCustom.value) {
            this.textInputMin.value = this.formatWithThousands(this.minInputCustom.value);
        }
        if (this.maxInputCustom.value) {
            this.textInputMax.value = this.formatWithThousands(this.maxInputCustom.value);
        }
    }

    formatWithThousands(value) {
        const num = parseInt(value, 10);
        if (isNaN(num)) return value;
        return num.toLocaleString('de-DE').replace(/,/g, '.');
    }

    hoverState() {
        this.minInput.addEventListener('mouseenter', () => {
            !this.closest('.disable-filters') && this.priceThumbMin.classList.add('hovered');
        });
        this.minInput.addEventListener('mouseleave', () => {
            this.priceThumbMin.classList.remove('hovered');
        });
        this.maxInput.addEventListener('mouseenter', () => {
            this.priceThumbMax.classList.add('hovered')
        });
        this.maxInput.addEventListener('mouseleave', () => {
            this.priceThumbMax.classList.remove('hovered')
        })
    }

    minInputCustomEvent(key) {
        if (key !== "Backspace") {
            this.controlMinMax(this.minInputCustom)
            this.minEvent(this.minInputCustom.value)
        }
    }

    maxInputCustomEvent() {
        if ((this.maxInputCustom.value - this.minInputCustom.value) > 0) {
            this.controlMinMax(this.maxInputCustom)
            this.maxEvent(this.maxInputCustom.value)
        } else this.setError()
    }

    setError() {
        this.classList.add('price-slider--error');
    }

    removeError() {
        this.classList.remove('price-slider--error');
    }

    controlMinMax(input) {
        let val = input.value;
        if (val < input.min) {
            input.value = input.min;
        }
        if ((input.max - val) < 0) {
            input.value = input.max;
        }
    }

    minEvent(val) {
        if (val === undefined) {
            val = this.minInput.value
        }
        let minVal = this.isDecimal ? Math.min(val, this.maxInput.getAttribute('value') - 1000) : Math.min(val, this.maxInput.getAttribute('value') - 1);
        if (!this.tooltip) {
            this.minInputCustom.value = minVal;
            if (this.isDecimal) this.updateHelpInputs();
        }
        this.minInput.setAttribute('value', minVal);
        this.minInput.value = minVal;
        let value = (this.minInput.value / parseInt(this.minInput.max)) * 100;
        this.inverseLeft.style.width = value + '%';
        this.priceRange.style.left = value + '%';
        this.priceThumbMin.style.left = value + '%';
        this.priceThumbMin.style.zIndex = 2;
        this.priceThumbMax.style.zIndex = 1;
        if (this.tooltip) {
            this.priceSignMin.style.zIndex = 2;
            this.priceSignMax.style.zIndex = 1;
            this.priceSignMin.style.left = value + '%';
            this.priceSignMin.childNodes[1].innerHTML = this.minInput.value;
        }
    }

    maxEvent(val) {
        this.removeError();
        if (val === undefined) {
            val = this.maxInput.value
        }
        let maxVal = this.isDecimal ? Math.max(val, this.minInput.getAttribute('value') - (-1000)) : Math.max(val, this.minInput.getAttribute('value') - (-1));
        if (!this.tooltip) {
            this.maxInputCustom.value = maxVal;
            if (this.isDecimal) this.updateHelpInputs();
        }
        this.maxInput.setAttribute('value', maxVal);
        this.maxInput.value = maxVal;
        let value = (this.maxInput.value / parseInt(this.maxInput.max)) * 100;
        this.inverseLeft.style.width = (100 - value) + '%';
        this.priceRange.style.right = (100 - value) + '%';
        this.priceThumbMax.style.left = value + '%';
        this.priceThumbMax.style.zIndex = 2;
        this.priceThumbMin.style.zIndex = 1;
        if (this.tooltip) {
            this.priceSignMax.style.zIndex = 2;
            this.priceSignMin.style.zIndex = 1;
            this.priceSignMax.style.left = value + '%';
            this.priceSignMax.childNodes[1].innerHTML = this.maxInput.value;
        }
    }
}

customElements.define('price-slider', PriceSlider);

class ScrollItems extends HTMLElement {
    constructor() {
        super();
        this.scrollEnable = true;
        if (this.dataset.mode === 'items') {
            this.init(500);
        }
        window.addEventListener('resize', debounce(() => {
            this.scrollEnable && this.setHeight()
        }, 500))
    }

    init(delay) {
        this.items = this.querySelectorAll(this.dataset.element);
        this.hideOther(true);
        setTimeout(() => {
            this.setHeight()
        }, delay);
        bodyScrollLock.enableBodyScroll(this);
        this.scrollEnable = true;
    }

    destroy() {
        this.scrollEnable = false;
        if (this.dataset.mode === 'items') {
            Scrollbar.destroy(this);
            this.style.removeProperty('--scroll-height');
            if (this.querySelector('.scroll-content')) {
                let scrollContent = this.querySelector('.scroll-content')
                scrollContent.replaceWith(...scrollContent.childNodes)
            }
        }
    }

    hideOther(state) {
        for (let i = this.dataset.count; i < this.items.length; i++) {
            this.items[i].hidden = state
        }
    }

    setHeight() {
        let parentHeight = 20,
          max = Math.min(this.dataset.count, this.items.length);
        for (let i = 0; i < max; i++) {
            const item = this.items[i],
              style = item.currentStyle || window.getComputedStyle(item),
              margin = (i + 1 == max) ? 0 : parseInt(style.marginBottom, 10);
            parentHeight += item.offsetHeight + margin;
        }
        this.style.setProperty('--scroll-height', parentHeight + 'px');
        Scrollbar.init(this, {
            alwaysShowTracks: true,
            damping: document.body.dataset.damping
        })
        this.hideOther(false);
    }
}

customElements.define('scroll-items', ScrollItems);

class QuantityInput extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.changeEvent = new Event('change', {bubbles: true})
        this.querySelectorAll('button').forEach(
          button => button.addEventListener('click', this.onButtonClick.bind(this))
        );
        this.input.addEventListener('paste', (e) => {
            e.preventDefault()
        });
        this.min = this.input.getAttribute('min');
        this.max = this.input.getAttribute('max') || false;
        this.status = this.querySelector('.quantity-status');
        this.updateStatus(this.input.value);
        this.input.addEventListener('keyup', () => {
            this.updateStatus(this.input.value)
        });
        setTimeout(() => {
            this.status?.classList.add('has-animation')
        }, 500);
    }

    onButtonClick(event) {
        event.preventDefault();
        if (event.target.classList.contains('disabled')) return false;
        const previousValue = this.input.value;
        event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
        if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
        if (this.max) this.updateStatus(this.input.value);
    }

    updateStatus(val) {
        const value = parseFloat(val),
          persent = this.max ? value * 100 / this.max : 100;
        let statusClass = 'qs--start';

        if (this.max) {
            statusClass = this.dataset.inventoryStatus === "true" ? `qs--${getQuantityStatusClass({
                inventoryQuantity: +this.max,
                inventoryManagement: this.dataset.inventoryManagement,
                inventoryPolicy: this.dataset.inventoryPolicy,
                inventoryManyInStockFrom: +this.dataset.inventoryManyInStockFrom,
                inventoryLowInStockLessThan: +this.dataset.inventoryLowInStockLessThan
            }).qs_class}` : persent < 50 ? 'qs--start' : persent < 100 ? 'qs--middle' : 'qs--full';
        }

        if (this.status) {
            removeClassByPrefix(this.status, 'qs--', '');
            this.status.classList.add(statusClass)
        }

        this.style.setProperty('--qty-status-persent', persent + '%');

        if (this.min > value) {
            this.input.value = this.min;
            this.status?.classList.add('qs--full')
        } else if (this.max && this.max <= value) {
            this.input.value = this.max;
            this.querySelector('.prd-quantity-up').classList.add('disabled')
        } else {
            this.querySelector('.prd-quantity-up').classList.remove('disabled')
        }
    }
}

customElements.define('quantity-input', QuantityInput);

class NumberCounter extends HTMLElement {
    constructor() {
        super();
        if (this.classList.contains('lazyload')) {
            this.addEventListener('lazyloaded', () => {
                this.init();
            })
        } else this.init();
    }

    init() {
        const start = 0,
          endNumber = this.getAttribute('data-count'),
          duration = Math.min(this.getAttribute('data-count'), 2000) + 3000;
        this.classList.add('counter-initialized');
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            this.innerText = Math.floor(progress * (endNumber - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        }
        window.requestAnimationFrame(step);
    }

}

customElements.define('number-counter', NumberCounter);

let flowtypeCache = {};

class FlowType extends HTMLElement {
    connectedCallback() {
        this.banner = this.querySelector('[data-fontratio]');
        this.caption = this.querySelector('.bnr-caption');
        this.button = this.banner?.querySelector('.hide-if-out');
        this.button && this.button.style.setProperty('opacity', 0);
        if (this.banner) {
            this.options = {
                'maximum': 9999,
                'minimum': 1,
                'maxFont': 9999,
                'minFont': 8
            };
            this.init();
            window.addEventListener('resize', () => {
                if (window.innerWidth != document.body.dataset.innerWidth) this.hideCaption()
            })
            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth != document.body.dataset.innerWidth) this.reinit();
                this.showCaption()
            }, 300))
            if (!this.closest('main-slider') && this.querySelector('a.bnr-wrap')) {
                this.banner.addEventListener('mouseenter', () => {
                    this.querySelectorAll('.btn').forEach(el => el.classList.add('hovered'))
                });
                this.banner.addEventListener('mouseleave', () => {
                    this.querySelectorAll('.btn').forEach(el => el.classList.remove('hovered'))
                })
            }
        }
    }

    init() {
        if (this.banner) {
            let data = (window.matchMedia(`(max-width:767px)`).matches && this.banner.getAttribute('data-fontratio-mobile')) ? this.banner.getAttribute('data-fontratio-mobile') : this.banner.getAttribute('data-fontratio'),
              fontratio = Math.round(data * 100) / 100;
            if (fontratio > 0) {
                this._changes(fontratio)
            }
        }
    }

    hide() {
        this.banner.classList.remove('fontratio-calc');
    }

    hideCaption() {
        this.caption && this.caption.style.setProperty('opacity', 0);
    }

    showCaption() {
        this.caption && this.caption.style.setProperty('opacity', 1);
    }

    reinit() {
        if (this.banner) {
            this.hide();
            this.init();
        }
    }

    _changes(fontRatio) {
        this.button && this.button.classList.remove('d-none');
        new Promise(resolve => {
            let elw = this.banner.offsetWidth,
              cacheKey = elw + '_' + fontRatio,
              fontSize;
            if (cacheKey in flowtypeCache) {
                fontSize = flowtypeCache[cacheKey];
            } else {
                let width = elw > this.options.maximum ? this.options.maximum : elw < this.options.minimum ? this.options.minimum : elw,
                  fontBase = width / fontRatio;
                fontSize = fontBase > this.options.maxFont ? this.options.maxFont : fontBase < this.options.minFont ? this.options.minFont : fontBase;
                flowtypeCache[elw + '_' + fontRatio] = fontSize;

            }
            const demoClassNames = ['is-demo', 'localization-de'];
            if (this.closest('main-slider') && demoClassNames.some(className => document.body.classList.contains(className))) {
                fontSize *= 1 - 0.12;
            }
            return resolve(fontSize);
        }).then(fontSize => {
            this.banner.style.setProperty('font-size', fontSize + 'px');
            this.banner.classList.add('fontratio-calc');
            return;
        }).then(() => {
            if (!this.button) return;
            if (this.banner.clientHeight < this.caption.clientHeight + 20) {
                this.button.classList.add('d-none')
            } else this.button.style.setProperty('opacity', 1)
        })
    }
}

customElements.define('flow-type', FlowType);

class ImagesCompare extends HTMLElement {
    constructor() {
        super();
        const defaultOptions = {
            addCircle: true,
            addCircleBlur: true,
            controlShadow: false
        };
        const imageCompareElement = this.querySelector('.image-compare');
        const additionalOptions = JSON.parse(this.getAttribute('data-options'));
        new ImageCompare(imageCompareElement, { ...defaultOptions, ...additionalOptions}).mount();
    }
}
customElements.define('image-compare', ImagesCompare);

class MainSlider extends HTMLElement {
    constructor() {
        super();
        this.swiper = this.querySelector('.swiper-container');
        this.pagination = this.querySelector('.swiper-pagination');
        this.paginationWrap = this.querySelector('.swiper-pagination-wrap');
        this.hasDecorCompensate = this.hasAttribute('data-decor-compensate') ? true : false;
        this.progress = this.querySelector('.swiper-progress-bar');
        this.singleSlide = this.querySelectorAll('.swiper-slide').length > 1 ? false : true;
        this.boxed = this.querySelector('.slider-boxed') ? true : false;
        this.colorizePagination();
        this.videoControl();
        this.swiperAnimation = new SwiperAnimation();
        this.lazyLoadImage(this.boxed ? 3 : 1);

        if (this.getAttribute('data-autoplay')) {
            this.autoplay = {
                delay: this.getAttribute('data-autoplay'),
                disableOnInteraction: true
            }
        } else this.autoplay = false;
        this.timer = setInterval(() => {
            if (document.body.dataset.setRoot) {
                clearInterval(this.timer);
                this.initSwiper();
            }
        }, 100);

        document.addEventListener('visibilitychange', () => {
            if (this.progress) {
                if (document.visibilityState === 'visible') {
                    this.progress.classList.add('is-animate');
                } else {
                    this.progress.classList.remove('is-animate');
                }
            }
        })

        if (this.hasDecorCompensate) {
            this.setPaginationPosition();
            window.addEventListener('resize', debounce(() => {
                this.setPaginationPosition()
            }, 250))
        }

        if (this.boxed) {
            window.addEventListener('resize', debounce(() => {
                this.querySelectorAll('flow-type').forEach(flowtype => {
                    if ('reinit' in flowtype) flowtype.reinit()
                })
            }, 750))
        }
    }

    animateText(img, slider) {
        if (this.swiper.offsetParent === null) return;
        img && img.closest('.swiper-slide-img')?.querySelector('[data-load]')?.remove();
        slider && this.swiperAnimation.init(slider).animate()
    }

    lazyLoadImage(loadSlidesOnStart, slider) {
        if (!loadSlidesOnStart) {
            if (this.querySelector('.swiper-slide-visible img')) {
                this.querySelectorAll('.swiper-slide-visible img').forEach((img) => {
                    if (!img.classList.contains('lazyloaded')) {
                        img.classList.add('lazyload');
                        img.addEventListener('load', () => {
                            this.animateText(img, slider)
                        })
                    } else {
                        this.animateText(img, slider)
                    }
                })
            } else {
                this.animateText(false, slider)
            }
        } else {
            const slides = this.querySelectorAll('.swiper-slide');
            slides.forEach((el, index) => {
                if (index < loadSlidesOnStart) {
                    el.querySelectorAll('img').forEach((img) => {
                        if (!img.classList.contains('lazyloaded')) {
                            img.classList.add('lazyload')
                        }
                    })
                }
                if (this.boxed && index === slides.length - 1) {
                    el.querySelectorAll('img').forEach((img) => {
                        if (!img.classList.contains('lazyloaded')) {
                            img.classList.add('lazyload')
                        }
                    })
                }
            })
        }
    }

    initSwiper() {
        const options = {
            watchOverflow: true,
            slidesPerView: 1,
            touchRatio: 1,
            effect: this.boxed ? 'slide' : 'fade',
            watchSlidesVisibility: true,
            autoplay: this.singleSlide ? false : this.autoplay,
            loop: this.singleSlide ? false : true,
            loopAdditionalSlides: this.boxed ? 1 :0,
            speed: this.boxed ? 600 : 300,
            'pagination': {
                'el': this.querySelector('.swiper-pagination'),
                'clickable': true
            },
            'navigation': {
                'nextEl': this.querySelector('.swiper-button-next'),
                'prevEl': this.querySelector('.swiper-button-prev')
            },
            on: {
                init: (slider) => {
                    this.colorizePagination();
                    this.lazyLoadImage(0, slider);
                },
                afterInit: (slider) => {
                    if (this.singleSlide) playPauseVideo(this, this.swiper, 'init', true, false);
                    if (this.progress && slider.el.querySelector('.swiper-slide-active') && slider.el.querySelector('.swiper-slide-active').classList.contains('swiper-slide--video')) {
                        this.progress.classList.remove('is-animate')
                    }
                },
                slideChange: (slider) => {
                    this.lazyLoadImage(0, slider);
                    setTimeout(() => {
                        this.colorizePagination()
                    }, 500);
                    playPauseVideo(this, this.swiper, 'pauseAll', true, false);
                    this.swiper.classList.add('off-control');
                },
                slideChangeTransitionEnd: (slider) => {
                    if (this.progress && slider.el.querySelector('.swiper-slide-active') && !slider.el.querySelector('.swiper-slide-active').classList.contains('swiper-slide--video')) {
                        this.style.setProperty('--autoplay', this.getAttribute('data-autoplay') + 'ms');
                        this.swiper.classList.remove('video-paused');
                        if (this.autoplay) slider.autoplay.start();
                        this.progress.classList.add('is-animate')
                    }
                    setTimeout(() => {
                        playPauseVideo(this, this.swiper, 'init', true, false);
                        this.swiper.classList.remove('off-control');
                    }, 200)
                },
                slideChangeTransitionStart: () => {
                    if (this.progress) this.progress.classList.remove('is-animate')
                }
            }
        }
        this.slider = new Swiper(this.swiper, options);
    }

    setPaginationPosition() {
        const closestHolder = this.closest('.holder');

        if (closestHolder) {
            const decorHolder = closestHolder.nextElementSibling;
            if (decorHolder && decorHolder.classList.contains('holder--edge')) {
                const edgeBottom = decorHolder.querySelector('.edge-bottom');
                const compensateTop = edgeBottom.offsetHeight;
                this.closest('.shopify-section')?.style.setProperty('--decor-compensate-height', `${compensateTop}px`)
            }
        }
    }

    colorizePagination() {
        if (this.querySelector('.swiper-pagination--simple-left') || this.querySelector('.swiper-pagination--simple-right')) {
            this.swiper.classList.add('has-aside-pagination')
        }
        if (this.querySelector('.swiper-slide-active .colorize-invert')) {
            this.pagination?.classList.add('colorize-invert');
            this.paginationWrap?.classList.add('colorize-invert')
        } else {
            this.pagination?.classList.remove('colorize-invert');
            this.paginationWrap?.classList.remove('colorize-invert')
        }
    }

    stopAutoplay() {
        playPauseVideo(this, this.swiper, 'pause', true, true);
        if (this.autoplay) {
            this.slider?.autoplay.stop();
            if (this.progress) this.progress.classList.remove('is-animate')
        }
    }

    startAutoplay() {
        playPauseVideo(this, this.swiper, 'play', true, true);
        if (this.autoplay) {
            this.slider?.autoplay.start();
            if (this.progress) this.progress.classList.add('is-animate')
        }
    }

    videoControl() {
        this.swiper.addEventListener('click', (e) => {
            const target = e.target;
            if ((target.closest('.swiper-pagination-wrap') || target.closest('.swiper-arrows-carousel')) && this.autoplay) {
                this.autoplay = false;
                this.slider?.autoplay.stop();
                if (this.progress) {
                    this.progress.classList.remove('is-animate');
                    this.progress = false
                }
            }
            if (window.matchMedia(`(max-width:767px)`).matches || target.closest('.swiper-slide.off-control')) return;
            if (!target.closest('.btn') && target.closest('.swiper-slide--video')) {
                e.preventDefault();
                if (this.swiper.classList.contains('video-paused')) {
                    playPauseVideo(this, this.swiper, 'play', true, true);
                    if (this.autoplay) this.slider?.autoplay.start();

                } else if (this.swiper.classList.contains('video-playing')) {
                    playPauseVideo(this, this.swiper, 'pause', true, true);
                    if (this.autoplay) this.slider?.autoplay.stop();
                }
            }
        })
        this.swiper.addEventListener('click', (e) => {
            const target = e.target;
            if (!window.matchMedia(`(max-width:767px)`).matches || target.closest('.swiper-slide.off-control')) return;
            if (target.closest('[data-video-stop]')) {
                e.preventDefault();
                playPauseVideo(this, this.swiper, 'pause', true, true);
                if (this.autoplay) this.slider?.autoplay.stop();
            } else if (target.closest('[data-video-play]')) {
                e.preventDefault();
                playPauseVideo(this, this.swiper, 'play', true, true);
                if (this.autoplay) this.slider?.autoplay.start();
            }
        })
    }
}

customElements.define('main-slider', MainSlider);

class SwiperCarousel extends HTMLElement {
    constructor() {
        super();
        this.init();
        if (this.getAttribute('data-destroy') !== null) window.addEventListener('resize', debounce(() => {
            this.init()
        }, 15));
        this.addEventListener('mouseenter', () => {
            this.classList.remove('hover-off')
        });
        window.addEventListener('resize', debounce(() => {
            this.classList.remove('hover-off');
            if (this.carousel !== undefined) {
                this.checkScroll(this.carousel)
            }
        }, 100))
    }

    centerArrows() {
        const arrows = this.querySelector('.swiper-arrows-carousel'),
          imageContainer = this.querySelector('.image-container'),
          imageInside = this.querySelector('img');
        if (!arrows || this.querySelector('.prd--style1.prd--style3')) return;
        if (imageContainer || imageInside) {
            let h = imageContainer ? imageContainer.offsetHeight / 2 + 15 : imageInside.offsetHeight / 2;
            if (this.querySelector('.prd-top')) {
                h += (this.querySelector('.prd-top').offsetHeight - 10)
            }
            arrows.style.setProperty('top', `${h}px`);
            arrows.style.setProperty('transform', 'none');
            this.querySelector('[data-load]')?.style.setProperty('top', `${h}px`);
        }
    }

    init() {
        this.getAttribute('data-destroy') !== null && this.destroy();
        const breakpoint = this.getAttribute('data-init-breakpoint');
        if (breakpoint !== null) {
            if (window.matchMedia(`(max-width:${+breakpoint}px)`).matches) {
                this.initSwiper()
            }
        } else this.initSwiper();
        this.querySelectorAll('.js-promoline-copy').forEach(el => {
            tippy(el, {
                content: el.getAttribute('data-tippy-text'),
                trigger: 'click',
                animation: 'scale',
                placement: 'bottom',
                theme: 'dark',
                touch: true
            })
        })
    }

    initSwiper() {
        const options_default = {
            touchRatio: 3,
            watchSlidesVisibility: true,
            on: {
                init: function (slider) {
                    if (swiper.getAttribute('data-center-arrows') !== null) {
                        swiper.centerArrows();
                    }
                    typeof Waypoint !== 'undefined' && Waypoint.refreshAll();
                    swiper.querySelectorAll('product-card').forEach(element => {
                        if ('productWidth' in element) element.productWidth()
                    })
                    const searchModal = swiper.closest('#searchModal');
                    searchModal?.classList.add('swiper-visible');
                    if (searchModal && searchModal.querySelector('.js-dropdn-content-scroll')) {
                        Scrollbar.init(searchModal.querySelector('.js-dropdn-content-scroll'), {
                            alwaysShowTracks: true,
                            damping: document.body.dataset.damping
                        })
                    }
                    const swiperWrapper = swiper.querySelector('.swiper-wrapper');
                    if (swiperWrapper) {
                        swiperWrapper.addEventListener('mousemove', debounce(() => {
                            swiper.classList.remove('hover-off')
                        }, 500))
                        const observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                if (mutation.attributeName === 'style') {
                                    swiper.classList.add('hover-off')
                                }
                            })
                        })
                        const observerConfig = {
                            attributes: true,
                            attributeFilter: ['style'],
                            childList: false,
                            subtree: false,
                        };
                        observer.observe(swiperWrapper, observerConfig)
                    }
                    setTimeout(() => {
                        swiper.classList.remove('hover-off')
                    }, 100)
                },
                afterInit: (slider) => {
                    this.checkScroll(slider);
                    setTimeout(() => {
                        this.querySelectorAll('flow-type').forEach(flowtype => {
                            if ('reinit' in flowtype) flowtype.reinit()
                        })
                    }, 500)
                },
                slideChange: () => {
                    this.querySelectorAll('*').forEach(node => {
                        if (node._tippy) node._tippy.hide()
                    })
                },
                touchStart: () => {
                    if (!document.body.classList.contains('touch')) {
                        if (this.querySelector('.lookbook-grid')) tippy.hideAll();
                        this.querySelectorAll('*').forEach(node => {
                            if (node._tippy) node._tippy.hide()
                        })
                    }
                },
                transitionEnd: () => {
                    setTimeout(() => {
                        swiper.classList.remove('hover-off');
                    }, 100)
                }
            }
        }
        const swiper = this;
        this.optionsSelector = this.querySelector('.swiper-container ~ [type="application/json"]');
        this.options = this.optionsSelector ? JSON.parse(this.optionsSelector.textContent) : ''

        if (this.getAttribute('data-filter-variable') !== null && this.closest('.js-category-page-block')) {
            const filterOptions = document.querySelector('.js-category-page-block').classList.contains('has-filter-closed') ? this.querySelector('.swiper-container ~ [data-filter-closed]').textContent : this.querySelector('.swiper-container ~ [data-filter-opened]').textContent;
            if (filterOptions) this.options = JSON.parse(filterOptions)
        }

        if (this.options.pagination) {
            this.options.pagination['el'] = this.querySelector(this.options.pagination['el'])
        }

        if (this.options.navigation && !this.classList.contains('promoline-text')) {
            this.options.navigation['nextEl'] = this.querySelector(this.options.navigation['nextEl']);
            this.options.navigation['prevEl'] = this.querySelector(this.options.navigation['prevEl'])

        }

        Object.assign(options_default,this.options);
        this.carousel = new Swiper(this.querySelector('.swiper-container'), this.options);
    }

    checkScroll(slider) {
        if (slider && slider.isBeginning && slider.isEnd) {
            this.querySelector('.swiper-container').classList.add('swiper-no-scroll')
        } else this.querySelector('.swiper-container').classList.remove('swiper-no-scroll')
    }

    destroy() {
        this.carousel !== undefined && this.carousel.destroy()
    }

    start() {
        this.carousel !== undefined && this.carousel.slideTo(0, 0)
    }
}

customElements.define('swiper-carousel', SwiperCarousel);

class CustomSwiperNavigation extends HTMLElement {
    constructor() {
        super();
        const that = this;
        this.closest('.holder').querySelectorAll('swiper-carousel').forEach(el => {
            if (el.carousel) {
                this.setDisable(el, el.carousel);
            }
        })

        this.querySelector('.swiper-button-prev').addEventListener('click', function () {
            this.closest('.holder').querySelectorAll('swiper-carousel').forEach(el => {
                if (el.carousel) {
                    el.carousel.slidePrev(0);
                    that.setDisable(el, el.carousel);
                }
            })
        })
        this.querySelector('.swiper-button-next').addEventListener('click', function () {
            this.closest('.holder').querySelectorAll('swiper-carousel').forEach(el => {
                if (el.carousel) {
                    el.carousel.slideNext(0);
                    that.setDisable(el, el.carousel);
                }
            })
        })
        this.setSyncronize()
    }

    setSyncronize() {
        const sliderOne = this.closest('.holder').querySelectorAll('swiper-carousel')[0],
          sliderTwo = this.closest('.holder').querySelectorAll('swiper-carousel')[1];

        if (sliderOne && sliderTwo) {
            const sliderOneCarousel = sliderOne.carousel,
              sliderTwoCarousel = sliderTwo.carousel;
            if (sliderOneCarousel && sliderTwoCarousel) {
                sliderOneCarousel.controller.control = sliderTwoCarousel;
                sliderTwoCarousel.controller.control = sliderOneCarousel;
                sliderOneCarousel.on('slideChangeTransitionEnd, touchEnd', () => {
                    setTimeout(() => {
                        this.setDisable(sliderOne, sliderOneCarousel)
                    }, 100)
                })
                sliderTwoCarousel.on('slideChangeTransitionEnd, touchEnd', () => {
                    setTimeout(() => {
                        this.setDisable(sliderOne, sliderOneCarousel)
                    }, 100)
                })
            }
        }
    }

    setDisable(el, carousel) {
        if (carousel) {
            if (carousel.isEnd) {
                el.closest('.holder').querySelectorAll('.swiper-button-next').forEach(button => {
                    button.classList.add('swiper-button-disabled')
                })
            } else {
                el.closest('.holder').querySelectorAll('.swiper-button-next').forEach(button => {
                    button.classList.remove('swiper-button-disabled')
                })
            }
            if (carousel.isBeginning) {
                el.closest('.holder').querySelectorAll('.swiper-button-prev').forEach(button => {
                    button.classList.add('swiper-button-disabled')
                })
            } else {
                el.closest('.holder').querySelectorAll('.swiper-button-prev').forEach(button => {
                    button.classList.remove('swiper-button-disabled')
                })
            }
        }
    }
}

customElements.define('custom-swiper-navigation', CustomSwiperNavigation);

class CountDown extends HTMLElement {
    constructor() {
        super();
        const now = new Date();
        if (this.getAttribute('data-time-expire')) {
            const expireCases = {
                cartReserved() {
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + this.getAttribute('data-time-expire-minutes'))
                },
                halfhour() {
                    return now.getMinutes() < 30 ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 30) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1)
                },
                hour() {
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1)
                },
                day() {
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                },
                week() {
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + (now.getDay() > 0 ? 8 - now.getDay() : 1))
                },
                month() {
                    return new Date(now.getFullYear(), now.getMonth() + 1)
                },
                year() {
                    return new Date(now.getFullYear() + 1, 0)
                }
            };
            this.endDate = expireCases[this.getAttribute('data-time-expire')]()
        } else if (this.getAttribute('data-time-reserved')) {
            this.setReservedDate()
        } else if (this.getAttribute('data-time')) {
            this.endDate = new Date(this.getAttribute('data-time')).getTime()
        } else {
            this.remove();
            return
        }
        if (now < this.endDate) {
            this.timerInit();
            setTimeout(() => {
                this.classList.add('prd-countdown-initialized')
            }, 200)
        } else {
            this.remove();
            return
        }
    }

    timerInit() {
        this.timer = setInterval(() => {

            const date = new Date().getTime(),
              diff = this.endDate - date + 1000,
              calcDate = {
                  days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  hours: Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
                  minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                  seconds: Math.floor((diff % (1000 * 60)) / 1000)
              }

            for (const [key, value] of Object.entries(calcDate)) {
                if (this.querySelector(`[data-${key}]`)) this.querySelector(`[data-${key}]`).innerHTML = value < 10 ? '0' + value : value
            }

            if (diff <= 1000) {
                clearInterval(this.timer);
                if (this.getAttribute('data-time-reserved')) {
                    this.setReservedDate();
                    this.timerInit()
                } else this.remove()
            }

        }, 1000)
    }

    setReservedDate() {
        const now = new Date();
        this.endDate = new Date();
        this.endDate.setMinutes(now.getMinutes() + parseInt(this.getAttribute('data-time-reserved'), 10))
    }
}

customElements.define('count-down', CountDown);

class ImageOnHover extends HTMLElement {
    constructor() {
        super();
        const link = this.querySelector('a'),
          previewImage = link.dataset.preview;
        this.addEventListener('mouseenter', () => {
            if (previewImage && !link.dataset.loaded) {
                preloadImage(previewImage)
                  .then(img => {
                      this.querySelector('.submenu-list-wrap--image .image-container')?.append(img);
                      this.querySelector('[data-load]')?.setAttribute('data-load', 'loaded');
                      link.dataset.loaded = true
                  })
                  .catch(err => console.error('error', err));
            }
        })
    }
}

customElements.define('image-on-hover', ImageOnHover);

class ReviewsTab extends HTMLElement {
    constructor() {
        super();
        this.querySelectorAll('.js-reviews-tab').forEach((el, i) => {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = el.closest('.reviews-tab-row'),
                  holder = el.closest('.holder'),
                  swiper = holder.querySelector('swiper-carousel');
                parent.querySelectorAll('span').forEach(el => {
                    el.classList.remove('active')
                })
                el.querySelector('span').classList.add('active');
                if (swiper) swiper.carousel.slideTo(i, 500, false);
            })
        })
    }
}

customElements.define('reviews-tab', ReviewsTab);

class ProductSinglePreviews extends HTMLElement {
    constructor() {
        super();
        this.querySelectorAll('.js-ps-tab').forEach((el, i) => {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = el.closest('.ps-tabs'),
                  holder = el.closest('.holder'),
                  swiper = holder.querySelector('.ps-main-gallery swiper-carousel');
                parent.querySelectorAll('.js-ps-tab').forEach(el => {
                    el.classList.remove('active')
                })
                el.classList.add('active');
                if (swiper) swiper.carousel.slideTo(i, 500, false);
            })
        })
    }
}

customElements.define('product-single-previews', ProductSinglePreviews);

class TextareaAutosize extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('.form-control');
        this.input.setAttribute('rows', 1);
        this.resizeInput();
        this.input.addEventListener('input', () => {
            this.resizeInput()
        })
    }

    resizeInput() {
        this.input.style.height = 0;
        this.input.style.height = this.input.scrollHeight - 5.5 + 'px';
        if (this.getAttribute('data-maxheight')) {
            if (this.input.scrollHeight >= this.dataset.maxheight) {
                this.input.style.overflow = 'auto'
            } else {
                this.input.style.overflow = 'hidden'
            }
        }
        if (this.closest('.minicart-drop-fixed') && customElements.get('mini-cart-popup')) {
            document.querySelectorAll('mini-cart-popup').forEach(cart => {
                cart.isOpened() && cart.bottomFixedSlide()
            })
        }
        const setHeight = this.closest('.js-set-height');
        if (setHeight && this.input.scrollHeight > 38.5) {
            setHeight.style.setProperty('--tab-height', parseInt(setHeight.dataset.tabh) + this.input.scrollHeight + 'px')
        }
    }
}

customElements.define('textarea-autosize', TextareaAutosize);

class SearchFilter extends HTMLElement {
    constructor() {
        super();
        let options = {
            valueNames: ['js-filter-item', {
                attr: 'value',
                name: 'js-filter-input'
            }],
            listClass: 'js-filter-list',
        };
        let searchResult = new List(this, options);

        this.search = this.querySelector('.js-search-filter');
        this.input = this.querySelector('input.search');
        this.querySelector('.js-search-filter-clear').addEventListener('click', (e) => {
            this.input.value = '';
            searchResult.search();
            e.preventDefault();
        });

        searchResult.on('searchComplete', () => {
            let result = searchResult.update().matchingItems.length;
            this.scrollbar = this.querySelector('.sidebar-block_content-scroll');
            if (!!this.scrollbar && this.scrollbar.querySelector('.js-filter-list').scrollHeight > 203) {
                this.scrollbar?.style.setProperty('height', '');
                Scrollbar.init(this.scrollbar, {
                    alwaysShowTracks: true
                })
            } else {
                Scrollbar.destroy(this.scrollbar);
                this.scrollbar?.style.setProperty('height', 'auto');
            }
            if (result == 0) {
                this.querySelector('.js-search-filter-empty').classList.remove('d-none');
            } else {
                this.querySelector('.js-search-filter-empty').classList.add('d-none')
            }
        })
    }
}

customElements.define('search-filter', SearchFilter);

class AgreementCheckbox {
    constructor() {
        const checkboxAll = document.querySelectorAll('.js-agreement-checkbox');
        checkboxAll.forEach(el => {
            setTimeout(() => {
                this.checkAgreement(el)
            }, 1000);
            el.addEventListener('change', (e) => {
                let target = e.target;
                this.checkAgreement(target);
                if (target.closest('.minicart-drop-fixed')) {
                    document.querySelectorAll('mini-cart-popup').forEach(cart => {
                        cart.isOpened() && cart.bottomFixedSlide()
                    })
                }
            });
            document.addEventListener('click', (e) => {
                let target = e.target;
                if (!target.classList.contains('js-agreement-modal')) return;
                e.preventDefault();
                const checkbox = '.js-agreement-checkbox' + '[data-button="' + target.dataset.button + '"]';
                document.querySelector(checkbox).checked = true;
                target.closest('.fancybox-container')?.querySelector('[data-fancybox-close]').click();
                document.querySelectorAll(checkbox).forEach(el => {
                    this.checkAgreement(el);
                    if (el.closest('.minicart-drop-fixed')) {
                        document.querySelectorAll('mini-cart-popup').forEach(cart => {
                            cart.isOpened() && cart.bottomFixedSlide()
                        })
                    }
                })
            })
        })
    }

    checkAgreement(el) {
        const groupCheckbox = document.querySelectorAll('[data-button="' + el.dataset.button + '"]'),
          groupButtons = document.querySelectorAll(el.dataset.button);
        if (el.checked) {
            groupCheckbox.forEach(checkbox => {
                checkbox.checked = true
            })
            groupButtons.forEach(button => {
                button.classList.remove('disabled')
                button.classList.add('enabled')
            })
        } else {
            groupCheckbox.forEach(checkbox => {
                checkbox.checked = false
            })
            groupButtons.forEach(button => {
                button.classList.remove('enabled')
                button.classList.add('disabled')
            })
        }
    }

    checkAgreementAll() {
        document.querySelectorAll('.js-agreement-checkbox').forEach(el => {
            this.checkAgreement(el)
        })
    }
}

const agreementCheckbox = new AgreementCheckbox();

class SectionsRenameOnScroll extends HTMLElement {
    constructor() {
        super();
        this.sectionsDataSlot = document.querySelector('#sections-data');
        if (!this.sectionsDataSlot) return;
        this.sectionsData = JSON.parse(this.sectionsDataSlot.textContent);
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('#pageContent > .shopify-section').forEach(section => {
                this.init(section)
            })
        })
    }

    init(section) {
        if (!section || !this.sectionsData) return;
        new Waypoint({
            element: section,
            handler: (direction) => {
                if (direction === 'up') {
                    this.changeName(this.sectionsData[section.id])
                }
            },
            offset: '-10%'
        })
        new Waypoint({
            element: section,
            handler: (direction) => {
                if (direction === 'down') {
                    this.changeName(this.sectionsData[section.id])
                }
            },
            offset: '50%'
        })
    }

    changeName(options) {
        if (!options) return;
        const optionsTooltip = (options.tooltip && options.tooltip != '') ? `data-tippy-content="${options.tooltip}" data-tippy-placement="right"` : '';
        this.innerHTML = `<a href="${options.href}" target="blank" ${optionsTooltip}><span>${options.title}</span></a>`;
    }
}

customElements.define('sections-rename', SectionsRenameOnScroll);

class DemoPanel extends HTMLElement {
    constructor() {
        super();
        this.init();
        document.addEventListener('DOMContentLoaded', () => {
            this.querySelectorAll('label-animated').forEach(
              label => label.classList.add('is-appeared')
            )
        })
    }

    init() {
        this.querySelectorAll('[data-new]').forEach(
          button => button.addEventListener('mouseenter', this.onLinkHover.bind(this))
        )
        this.querySelector('[data-close]')?.addEventListener('click', this.onCloseButtonClick.bind(this));
        this.decorSelect();
        this.lazyloadImage()
    }


    lazyloadImage() {
        this.querySelectorAll('li.demo-popup').forEach( link => {
            link.addEventListener('mouseenter', () => {
                this.querySelectorAll('img:not(.lazyloaded)').forEach(image => {
                    image.classList.add('lazyload');
                })
            }, { once: true })
        })
    }

    onLinkHover(e) {
        e.target.removeAttribute('data-new')
    }

    onCloseButtonClick(e) {
        e.preventDefault();
        this.classList.add('is-closed');
        setTimeout(() => {
            this.remove()
        }, 500)
    }

    updateLinks(suffixToAdd, suffixToRemove) {
        this.querySelectorAll('.submenu-list--decor a').forEach(link => {
            const currentHref = link.getAttribute('href');
            link.setAttribute('href', currentHref.replace(suffixToRemove, '').concat(suffixToAdd))
        })
    }

    clearActive() {
        this.querySelectorAll('.submenu-list--decor a').forEach(link => {
            link.classList.remove('active')
        })
    }

    decorSelect() {
        const decorRadio = this.querySelector('.decor-style-select');
        if (decorRadio) {
            decorRadio.querySelector('#decorBoth')?.addEventListener('change', () => {
                this.updateLinks('', '.top');
                this.updateLinks('', '.bottom');
                this.clearActive()
            });

            decorRadio.querySelector('#decorTop')?.addEventListener('change', () => {
                this.updateLinks('.top', '.bottom');
                this.clearActive()
            });

            decorRadio.querySelector('#decorBottom')?.addEventListener('change', () => {
                this.updateLinks('.bottom', '.top');
                this.clearActive()
            })
        }
    }
}

customElements.define('demo-panel', DemoPanel);

class SliderEffect extends HTMLElement {
    connectedCallback() {
        this.effect = this.dataset.effect;
        if (this.effect == 'sparkles') {
            this.createSparkles()
        } else {
            this.createSnow();
            window.addEventListener('resize', debounce(() => {
                this.createSnow();
            }, 500))
        }
    }
    createSnow() {
        const c = this.querySelector('canvas'),
          context = c.getContext("2d");

        let w = c.width = this.offsetWidth,
          h = c.height = this.offsetHeight;
        let num = Math.floor(w/30), tsc = 1, sp = .1, sc = 5, mv = 1, min = .1, ksz = 100, ksp = .15;
        if (this.effect == 'heart') {
            num /= 2;
            sc = 10;
            ksz = 30;
            ksp = .015;
        } else if (this.effect == 'snowing2') {
            num *= 2;
            sp = 1;
            min = 1;
            ksp = .3
        }
        let snow, arr = [];
        for (let i = 0; i < num; ++i) {
            snow = this.effect == 'heart' ? new heart() : new flake();
            snow.y = Math.random() * (h + 50);
            snow.x = Math.random() * w;
            snow.t = Math.random() * (Math.PI * 2);
            if (this.effect == 'snowing2') {
                snow.sz = 4 + Math.random() * 3;
            } else snow.sz = (100 / (10 + (Math.random() * ksz))) * sc;
            snow.sp = (Math.pow(snow.sz * .8, 2) * ksp) * sp;
            snow.sp = snow.sp < min ? min : snow.sp;
            snow.op = 0.1 + Math.random() * 0.7;
            arr.push(snow);
        }
        go();
        function go() {
            window.requestAnimationFrame(go);
            context.clearRect(0, 0, w, h);
            for (let i = 0; i < arr.length; ++i) {
                let f = arr[i];
                f.t += .05;
                f.t = f.t >= Math.PI * 2 ? 0 : f.t;
                f.y += f.sp;
                f.x += Math.sin(f.t * tsc) * (f.sz * .015);
                if (f.y > h + 50) f.y = -10 - Math.random() * mv;
                if (f.x > w + mv) f.x = - mv;
                if (f.x < - mv) f.x = w + mv;
                f.draw()
            }
        }
        function flake() {
            this.draw = function() {
                this.g = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.sz);
                this.g.addColorStop(0, 'hsla(255,255%,255%,1)');
                if (this.effect == 'snowing2') {
                    this.g.addColorStop(1, 'hsla(255,255%,255%,0)')
                } else {
                    this.g.addColorStop(1, 'hsla(255,255%,255%,.2)')
                }
                context.moveTo(this.x, this.y);
                context.fillStyle = this.g;
                context.beginPath();
                context.arc(this.x, this.y, this.sz, 0, Math.PI * 2, true);
                context.fill();
            }
        }

        function heart() {
            this.draw = function() {

                const x = this.x;
                const y = this.y;
                const width = this.sz;
                const height = this.sz * 1.1;

                context.fillStyle = `rgba(255, 0, 0, ${this.op})`;

                context.save();
                context.beginPath();
                let topCurveHeight = height * 0.3;
                context.moveTo(x, y + topCurveHeight);

                context.bezierCurveTo( x, y,x - width / 2, y,x - width / 2, y + topCurveHeight);
                context.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2,x, y + (height + topCurveHeight) / 2, x, y + height);
                context.bezierCurveTo(x, y + (height + topCurveHeight) / 2,x + width / 2, y + (height + topCurveHeight) / 2,x + width / 2, y + topCurveHeight);
                context.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);

                context.closePath();
                context.fill();
                context.restore();

            }
        }

    }
    createSparkles() {
        const template = document.createElement('div');
        template.classList.add('template');

        const items = Math.floor(this.offsetWidth/8);
        const sparkle = 10;
        let size = 'small';

        const createItem = () => {
            const item = template.cloneNode(true);
            item.style.top = `${Math.random() * 100}%`;
            item.style.left = `${Math.random() * 100}%`;
            item.style.webkitAnimationDelay = `${Math.random() * sparkle}s`;
            item.style.mozAnimationDelay = `${Math.random() * sparkle}s`;
            item.classList.add(size);
            this.appendChild(item)
        };

        for (let i = 0; i < items; i++) {
            if (i % 2 === 0) {
                size = 'small';
            } else if (i % 3 === 0) {
                size = 'medium';
            } else {
                size = 'large';
            }

            createItem()
        }
    }
}

customElements.define('slider-effect', SliderEffect);

class SmartRow extends HTMLElement {
    connectedCallback() {
        this.row = this.querySelector('.row') || this.querySelector('.smart-row');
        this.init();
        window.addEventListener('resize', debounce(() => {
            this.init();
        }, 500))
    }

    init() {
        if (!this.row) return;
        this.grid = Array.from(this.row.children);
        if (!this.grid[0]) return;
        const totalItems = this.row.childElementCount / 2;
        removeClassByPrefix(this.row, 'col-break-after-', '');
        const baseOffset = this.grid[0].offsetTop,
          breakIndex = this.grid.findIndex(item => item.offsetTop > baseOffset),
          numPerRow = (breakIndex === -1 ? this.grid.length : breakIndex) / 2,
          numRows = Math.ceil(totalItems / numPerRow);
        this.row.classList.add(`col-break-after-${Math.ceil(totalItems / numRows)}`);
    }
}

customElements.define('smart-row', SmartRow);

class ShowOnScroll {
    constructor() {
        document.querySelectorAll('.show-on-scroll').forEach(section => {
            const offset = document.body.classList.contains('has-ajax-scroll') ? '150%' : '120%';
            new Waypoint({
                element: section,
                handler: function () {
                    if (section.getAttribute('data-ajax-section-scroll')) {
                        let urlAjax = section.dataset.ajaxSectionScroll;
                        fetch(urlAjax).then((response) => response.text())
                          .then((data) => {
                              section.innerHTML = data;
                              if (document.querySelector('sections-rename')) document.querySelector('sections-rename').init(section.querySelector('.shopify-section'));
                              setTimeout(() => {
                                  addResponsive(section);
                                  section.querySelectorAll('swiper-carousel').forEach(carousel => {
                                      carousel.destroy();
                                      carousel.init()
                                  });
                                  section.querySelectorAll('tab-slider').forEach(element => {
                                      element.shiftSelector()
                                  });
                                  section.querySelector('.show-on-scroll')?.classList.add('is-visible');
                                  section.querySelectorAll('masonry-grid').forEach((element) => {
                                      element.reInit()
                                  });
                                  section.querySelectorAll('.lazyload').forEach(el => {
                                      const wrapper = el.closest('.image-container');
                                      if (wrapper) {
                                          el.addEventListener('load', () => {
                                              wrapper.classList.add('ic--image-loaded')
                                          })
                                      }
                                  });
                                  section.querySelectorAll('.lazyloaded').forEach(el => {
                                      const wrapper = el.closest('.image-container');
                                      if (wrapper) wrapper.classList.add('ic--image-loaded')
                                  });
                                  section.querySelectorAll('[name="tab-accordion"]').forEach(el => {
                                      const tab = el.closest('.tab-accordion-item').querySelector('.js-set-height');
                                      if (tab) {
                                          el.addEventListener('change', function () {
                                              tab.style.setProperty('--tab-height', tab.scrollHeight + 'px');
                                          })
                                          const observer = new ResizeObserver(function () {
                                              tab.style.setProperty('--tab-height', tab.scrollHeight + 'px')
                                          })
                                          for (let i = 0; i < tab.children.length; i++) {
                                              observer.observe(tab.children[i])
                                          }
                                      }
                                  });
                                  section.querySelectorAll('images-accordion').forEach(element => {
                                      element.reInit()
                                  });

                                  section.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'));
                                  Waypoint.refreshAll();
                                  section.classList.add('is-visible');
                              }, 500)
                          })
                          .catch((error) => {
                              section.remove();
                              console.error('error', error);
                          })
                    } else section.classList.add('is-visible');
                    this.destroy();
                },
                offset: offset
            })
        })
    }
}

new ShowOnScroll();

/* video functions */

function postMessageToPlayer(player, command) {
    if (player == null || command == null) return;
    player.contentWindow.postMessage(JSON.stringify(command), "*");
}

function playPauseVideo(el, slider, control, mainSlider = false, manual = false, currentItem) {
    let currentSlide = slider.querySelector('.swiper-slide-active');
    if (currentItem) currentSlide = currentItem;
    if (control === 'pauseAll') {
        slider.querySelectorAll('[data-video]').forEach(slide => {
            const slideType = slide.dataset.video || false,
              player = slide.querySelector('iframe');
            if (slide.classList.contains('init-video')) {
                if (slideType === 'vimeo' && player) {
                    postMessageToPlayer(player, {
                        'method': 'pause',
                        'value': 1
                    })
                } else if (slideType === 'youtube' && player) {
                    postMessageToPlayer(player, {
                        'event': 'command',
                        'func': 'pauseVideo'
                    })
                } else if (slideType === 'mp4') {
                    const video = slide.querySelector('video');
                    ;
                    if (video) video.pause()
                }
            }
            slider.classList.remove('video-playing');
            slider.classList.add('video-paused');
        })
    } else {
        if (!currentSlide || !currentSlide.getAttribute('data-video')) return;
        if (!mainSlider) {
            const slideWrapper = el.dataset.quickview ? '#prdMainImageQW' : '#prdMainImage';
            if (document.querySelector(slideWrapper).classList.contains('js-preload-video') && control === 'init') {
                control = 'play'
            }
        } else if (currentSlide.classList.contains('init-video') && control === 'init') {
            control = 'play'
        }
        const slideType = currentSlide.dataset.video || false;
        if (currentSlide.getAttribute('data-video') && !currentSlide.classList.contains('init-video')) {
            const content = document.createElement('div');
            content.appendChild(currentSlide.querySelector('template').content.firstElementChild.cloneNode(true));
            currentSlide.querySelector('.js-inner-video').appendChild(content.querySelector('video, iframe'));
            currentSlide.querySelectorAll('.swiper-lazy-preloader').forEach(el => el.remove());
            currentSlide.querySelectorAll('[data-load]').forEach(el => el.remove());
            if (slideType === 'vimeo') {
                var script = document.createElement('script');
                script.onload = function () {
                    const iframeVimeo = currentSlide.querySelector('iframe');
                    const playerVimeo = new Vimeo.Player(iframeVimeo);
                    playerVimeo.pause();
                    playerVimeo.ready().then(function () {
                        if (currentSlide.classList.contains('has-autoplay')) {
                            slider.classList.add('video-playing');
                            slider.classList.remove('video-paused')
                        } else {
                            slider.classList.add('video-paused');
                            slider.classList.remove('video-playing')
                        }
                        currentSlide.classList.add('init-video');
                        if (iframeVimeo.closest('.swiper-slide-active')) {
                            setTimeout(() => {
                                playerVimeo.play()
                            }, 100)
                        }
                    })
                };
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/vimeo-player/2.15.0/player.min.js";
                document.head.appendChild(script);
            } else {
                if (currentSlide.classList.contains('has-autoplay')) {
                    slider.classList.add('video-playing');
                    slider.classList.remove('video-paused')
                } else {
                    slider.classList.add('video-paused');
                    slider.classList.remove('video-playing')
                }
                currentSlide.classList.add('init-video');
            }
        }
        const player = (slideType === 'vimeo' || slideType === 'youtube') ? currentSlide.querySelector('iframe') : currentSlide.querySelector('video');
        if (mainSlider && !currentSlide.classList.contains('loaded-video')) {
            const videoAutoplay = player.hasAttribute('autoplay');
            if (slideType === 'vimeo' || slideType === 'youtube') {
                currentSlide.classList.add('loaded-video');
                currentSlide.querySelectorAll('[data-load]').forEach(el => el.remove());
            } else if (slideType === 'mp4') {
                if (document.body.classList.contains('mac')) {
                    currentSlide.classList.add('loaded-video');
                    if (videoAutoplay) player.play()
                } else {
                    player.addEventListener('loadeddata', function () {
                        currentSlide.classList.add('loaded-video');
                        if (videoAutoplay) player.play()
                    })
                }
                player.addEventListener('ended', () => {
                    slider.classList.add('video-paused');
                    slider.classList.remove('video-playing');
                })
                if (el.slider && el.autoplay) {
                    player.addEventListener('play', function () {
                        currentSlide.querySelectorAll('[data-load]').forEach(el => el.remove());
                        el.slider.autoplay.stop();
                        setTimeout(() => {
                            let duration = parseInt(player.duration * 1000 + 1500, 10);
                            el.style.setProperty('--autoplay', duration + 'ms');
                            if (el.progress) el.progress.classList.add('is-animate');
                            if (player.loop) {
                                const nextSlide = setTimeout(() => {
                                    if (el.autoplay) {
                                        el.slider.autoplay.start();
                                        el.slider.slideNext();
                                    }
                                }, duration)
                                player.addEventListener('pause', () => {
                                    clearTimeout(nextSlide);
                                })
                            } else {
                                player.addEventListener('ended', () => {
                                    if (el.autoplay) {
                                        el.slider.autoplay.start();
                                        el.slider.slideNext();
                                    }
                                })
                            }
                        }, 500)
                    })
                }
            }
        }
        if (player && control !== 'init') {
            if (slideType === 'vimeo') {
                switch (control) {
                    case 'play':
                        if (mainSlider && !currentSlide.classList.contains('has-autoplay') && !manual) return;
                        postMessageToPlayer(player, {
                            'method': 'play',
                            'value': 1
                        });
                        slider.classList.add('video-playing');
                        slider.classList.remove('video-paused');
                        break;
                    case 'pause':
                        if (manual) currentSlide.classList.remove('has-autoplay');
                        postMessageToPlayer(player, {
                            'method': 'pause',
                            'value': 1
                        });
                        slider.classList.add('video-paused');
                        slider.classList.remove('video-playing');
                        break;
                }
            } else if (slideType === 'youtube') {
                switch (control) {
                    case 'play':
                        if (mainSlider && !currentSlide.classList.contains('has-autoplay') && !manual) return;
                        postMessageToPlayer(player, {
                            'event': 'command',
                            'func': 'playVideo'
                        });
                        slider.classList.add('video-playing');
                        slider.classList.remove('video-paused');
                        break;
                    case 'pause':
                        if (manual) currentSlide.classList.remove('has-autoplay');
                        postMessageToPlayer(player, {
                            'event': 'command',
                            'func': 'pauseVideo'
                        });
                        slider.classList.add('video-paused');
                        slider.classList.remove('video-playing');
                        break;
                }
            } else if (slideType === 'mp4') {
                if (player != null) {
                    el.style.setProperty('--autoplay', parseInt((player.duration) * 1000 + 1500, 10) + 'ms');
                    if (el.progress) el.progress.classList.add('is-animate');
                    if (control === 'play') {
                        if (mainSlider && !currentSlide.classList.contains('has-autoplay') && !manual) return;
                        currentSlide.classList.add('has-autoplay');
                        if (!manual) {
                            player.pause();
                            player.currentTime = 0;
                        }
                        player.play();
                        slider.classList.add('video-playing');
                        slider.classList.remove('video-paused');
                    } else {
                        if (manual) currentSlide.classList.remove('has-autoplay');
                        player.pause();
                        slider.classList.add('video-paused');
                        slider.classList.remove('video-playing');
                    }
                }
            }
        }
    }
}

/* product page */

class StickyAddtocart extends HTMLElement {
    constructor() {
        super();
        this.stickyPopup = this.querySelector('.sticky-add-to-cart');
        this.initEvents();
        this.detectPageScroll = () => {
            this.initScroll()
        };
        window.addEventListener('scroll', this.detectPageScroll)
    }

    loadAjax() {
        if (this.dataset.ajax && !this.classList.contains('ajax-loaded')) {
            if (!this.classList.contains('ajax-loading')) {
                const ajaxContainer = this.stickyPopup;
                const urlAjax = this.dataset.ajax;
                this.classList.add('ajax-loading');
                fetch(urlAjax).then((response) => response.text())
                  .then((data) => {
                      ajaxContainer.innerHTML = data;
                      this.classList.remove('ajax-loading');
                      this.classList.add('ajax-loaded');
                      setTimeout(() => {
                          this.openPopup()
                      }, 500)
                  })
                  .catch((error) => {
                      console.error('error', error);
                      this.classList.remove('ajax-loading')
                  })
            }
        } else this.openPopup()
    }

    openPopup() {
        this.stickyPopup.classList.add('sticky-add-to-cart--open');
        document.body.classList.add('has-sticky-addtocart')
    }

    closePopup() {
        this.stickyPopup.classList.remove('sticky-add-to-cart--open');
        document.body.classList.remove('has-sticky-addtocart');
    }

    initEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.js-sticky-add-to-cart-close')) {
                e.preventDefault();
                this.closePopup();
                setTimeout(() => {
                    this.initScroll();
                    window.removeEventListener('scroll', this.detectPageScroll);
                    this.stickyPopup.remove();
                    document.body.classList.remove('has-sticky-addtocart');
                }, 200)
            }
        })
    }

    initScroll() {
        const stickyMarker = document.querySelector('.js-sticky-add-to-cart-marker'),
          bottomMarker = document.querySelector('.page-footer'),
          backToTop = document.querySelector('.js-back-to-top'),
          promoPopup = document.querySelector('.payment-notification');
        const cookieBanner = document.querySelector('#pandectes-banner'),
          cookieBannerVisible = cookieBanner && !cookieBanner.style.display == 'none' && !cookieBanner.classList.contains('cc-invisible');
        if (cookieBannerVisible || (stickyMarker && inViewportTop(stickyMarker)) || (bottomMarker && inViewportBottom(bottomMarker))) {
            this.closePopup();
            backToTop?.classList.remove('hidden');
            promoPopup?.classList.remove('hidden');
        } else if (!document.body.dataset.scrolling && !cookieBannerVisible) {
            this.loadAjax();
            if (window.matchMedia(`(max-width:1250px)`).matches && window.matchMedia(`(min-width:992px)`).matches || window.matchMedia(`(max-width:450px)`).matches) {
                backToTop?.classList.add('hidden')
            }
            if (promoPopup && window.matchMedia(`(max-width:1780px)`).matches) {
                promoPopup.classList.remove('payment-notification--open');
                setTimeout(() => {
                    promoPopup.classList.add('hidden')
                }, 500)
            }
        }
    }
}

class ProductGallery extends HTMLElement {
    constructor() {
        super();
        this.breakpoint = window.matchMedia('(min-width:1025px)');
        if (this.dataset.grid) {
            this.grid = true;
            if (this.classList.contains('layout-grid3')) {
                this.gridCombined = true
            } else if (this.classList.contains('layout-grid2')) {
                this.gridLayout2 = true
            }
            if (this.breakpoint.matches === true ) {
                this.dataset.previousMode = 'grid';
                this.dataset.mode = 'grid'
            } else {
                this.dataset.previousMode = 'carousel';
                this.dataset.mode = 'carousel'
            }
        }
        this.wrapper = this.dataset.quickview ? '.modal-quickview' : '.page-content';
        this.scrollSync = (this.dataset.scrollSync === 'true');
        this.aspectRatio = this.dataset.aspect ? this.dataset.aspect / 100 : 1.2;
        this.horizontal = this.classList.contains('prd-block-gallery-container-hor');
        this.previews = !this.grid ? this.querySelector('.js-product-previews-carousel') : false;
        this.carousel = this.querySelector('.js-product-main-carousel');
        this.carouselWidth = this.carousel.offsetWidth;
        this.zoom = this.carousel.classList.contains('off-zoom') ? false : true;
        this.zoomLink = this.querySelectorAll('.js-prd-zoom-link');
        this.defaultZoomLink = this.zoomLink.length > 0 ? this.zoomLink[0].getAttribute('href') : '';
        this.galleryOff = this.closest('.off-gallery');
        this.currentIndex = false;
        this.zoomReserve = 1.1;
        if (this.dataset.filter && this.dataset.filter != 'all') {
            this.filter(this.dataset.filter, true)
        } else this.init('start');
        this.zoomLinkEvent();
        window.addEventListener('resize', debounce(() => {
            if (this.dataset.grid) {
                this.breakpointChecker();
                if (this.dataset.filter && this.dataset.filter != 'all') {
                    this.filter(this.dataset.filter, true)
                }
            }
            this.carouselWidth = this.carousel.offsetWidth;
            if (window.matchMedia(`(min-width:1025px)`).matches && this.previews && !this.horizontal) {
                this.verticalSetHeight();
            }
        }, 250));
        if (Shopify && Shopify.designMode && this.previews) {
            this.previews.querySelectorAll('.swiper-slide').forEach((el, index, array) => {
                if (!el.querySelector('.lazyloaded')) el.querySelector('img')?.classList.add('lazyload')
            })
        }
    }

    init(currentIndex = 0) {
        if (this.grid) {
            if (this.dataset.mediaCount == 1) {
                this.carousel.querySelectorAll('.swiper-slide').forEach((slide, i) => {
                    if (i !== 0) {
                        slide.remove()
                    }
                })
            }
            this.breakpointChecker(currentIndex)
        } else {
            if (this.previews) {
                this.buildCarousel(this.horizontal, currentIndex)
            }
            if (!this.galleryOff) {
                this.carousel && this.buildCarouselMain(currentIndex);
                this.buildGallery();
                this.events()
            }
        }
    }

    breakpointChecker(currentIndex) {
        if (this.breakpoint.matches === true ) {
            if (this.carousel) this.destroyAll();
            this.lazyLoadImageGrid();
            this.buildGallery();
            this.dataset.previousMode = this.dataset.mode;
            this.dataset.mode = 'grid'
        } else {
            if (!this.galleryOff) {
                this.carousel && this.buildCarouselMain(currentIndex);
                this.buildGallery();
                this.events();
                this.dataset.previousMode = this.dataset.mode;
                this.dataset.mode = 'carousel'
            }
        }
    }

    events() {
        if (this.previews && !this.scrollSync) {
            this.previews.querySelectorAll('.swiper-slide')?.forEach(
              slide => slide.addEventListener('click', (e) => {
                  e.preventDefault();
                  this.previews.querySelector('.swiper-slide-thumb--active')?.classList.remove(('swiper-slide-thumb--active'));
                  slide.classList.add(('swiper-slide-thumb--active'));
                  let mediaId = slide.dataset.mediaId,
                    slideMain = this.carousel.querySelector(`[data-media-id="${mediaId}"]`);
                  if (slideMain) {
                      this.galleryMain.slideTo([...slideMain.parentElement.children].indexOf(slideMain), 300);
                  }
              })
            )
        }
        if (this.previews) {
            this.previews.querySelectorAll('.swiper-slide')?.forEach(
              slide => slide.addEventListener('mouseenter', (e) => {
                  let mediaId = slide.dataset.mediaId,
                    slideMain = this.carousel.querySelector(`[data-media-id="${mediaId}"]`);
                  if (slideMain) {
                      if (!slideMain.querySelector('lazyloaded')) slideMain.querySelector('img')?.classList.add('lazyload');
                      if (this.zoom) this.addZoomImage(slideMain)
                  }
              })
            )
        }
    }

    filter(color, start = false, currentIndex = 0) {
        const mediaAll = this.carousel.querySelectorAll('[data-media-id]');
        let mediaFiltered = [];

        if (this.grid && this.dataset.mode == 'carousel' && this.dataset.previousMode == 'grid') {
            this.currentFilter = false
        }

        if (!this.carousel || !color || this.currentFilter == color && color !== 'all' || (!color.includes('-') && color !== 'all')) {
            if (start) this.init();
            return
        }

        this.currentFilter = color;

        if (color == 'all') {
            if (!this.classList.contains('filtered')) {
                this.galleryMain?.slideTo(currentIndex, 0);
                this.galleryPreviews?.slideTo(currentIndex, 0);
                return
            }
            this.destroyAll();
            this.init(currentIndex);
            this.previews && this.lazyLoadImage(this.galleryPreviews, true);
            this.classList.remove('filtered');
            return
        }
        this.classList.add('hide-countdown');
        this.destroyAll();
        this.colorOptionName = color.split('-')[0];
        let k = 0;

        mediaAll.forEach((el, i) => {
            let imageAlt = el.querySelector('img') ? el.querySelector('img').alt : color;
            imageAlt = imageAlt.toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
            if (imageAlt !== color) {
                el.classList.remove('swiper-slide');
                el.classList.add('swiper-slide--hidden');
                if (this.previews) {
                    const thumb = this.previews.querySelectorAll('[data-media-id]')[i];
                    thumb.style.setProperty('display', 'none');
                    thumb.classList.remove('swiper-slide')
                }
            } else {
                mediaFiltered.push(i);
                if (this.gridCombined) {
                    if (k % 3 === 0) {
                        el.classList.add('item-full');
                    } else {
                        el.classList.remove('item-full')
                    }
                }
                if (!el.classList.contains('lazyloaded')) el.classList.add('lazyload');
                el.classList.remove('swiper-slide--hidden');
                k++
            }

        })
        if (this.grid) {
            const preLastItem = mediaFiltered[mediaFiltered.length - 2];
            const lastItem = mediaFiltered[mediaFiltered.length - 1];

            if (preLastItem) {
                if (this.gridCombined) {
                    if (mediaAll[preLastItem].classList.contains('item-full')) {
                        mediaAll[lastItem].classList.add('item-full')
                    }
                } else if (this.gridLayout2) {
                    if (mediaFiltered.length % 2 !== 0 || mediaFiltered.length === 1) {
                        mediaAll[lastItem].classList.add('item-full')
                    }
                }
            }
        }
        this.init(0);
        this.previews && this.lazyLoadImage(this.galleryPreviews, true);
        this.classList.add('filtered');
        this.setAttribute('data-filter', color);
        setTimeout(() => {
            this.classList.remove('hide-countdown');
        }, 2500)
    }

    destroyAll() {
        this.galleryMain?.destroy();
        this.galleryPreviews?.destroy();
        this.carousel.querySelectorAll('[data-media-id]').forEach((el, i) => {
            el.classList.remove('swiper-slide-active');
            el.style.setProperty('opacity', '');
            el.classList.add('swiper-slide');

        })
        if (this.previews) {
            this.previews.querySelectorAll('[data-media-id]').forEach((el, i) => {
                el.style.setProperty('display', '');
                el.classList.add('swiper-slide');
            })
        }
        playPauseVideo(this, this.carousel, 'pauseAll')
    }

    updateCarousel() {
        if (!this.galleryOff) {
            this.galleryPreviews && this.galleryPreviews.update();
            this.galleryMain && this.galleryMain.update();
        }
    }

    lazyLoadImageGrid () {
        this.querySelectorAll('.swiper-slide').forEach((el) => {
            if (!el.querySelector('.lazyloaded')) {
                el.querySelector('.image-container img')?.classList.add('lazyload');
                el.querySelector('.image-container img')?.addEventListener('lazyloaded', () => {
                    el.querySelector('[data-load]')?.remove();
                })
                if (el.classList.contains('swiper-slide--video')) {
                    if (el.classList.contains('lazyloaded') || el.classList.contains('lazyloading')) {
                        playPauseVideo(this, this.carousel, 'init', false, false, el)
                    } else {
                        el.addEventListener('lazyloaded', () => {
                            playPauseVideo(this, this.carousel, 'init', false, false, el)
                        })
                    }
                }
            } else {
                el.querySelector('[data-load]')?.remove()
            }
        })
    }

    lazyLoadImage(slider, thumbs) {
        if (thumbs) {
            slider.el.querySelectorAll('.swiper-slide-visible').forEach((el, index, array) => {
                if (!el.querySelector('.lazyloaded')) el.querySelector('img')?.classList.add('lazyload');
                if (index == array.length - 1) {
                    const nextSlide = el.nextElementSibling;
                    if (nextSlide) nextSlide.querySelector('img')?.classList.add('lazyload')
                }
            })
        } else {
            slider.el.querySelectorAll('.swiper-slide-active,.swiper-slide-next').forEach((el) => {
                if (!el.querySelector('.lazyloaded')) {
                    el.querySelector('.image-container img')?.classList.add('lazyload');
                    el.querySelector('.image-container img')?.addEventListener('lazyloaded', () => {
                        el.querySelector('[data-load]')?.remove()
                    })
                } else {
                    el.querySelector('[data-load]')?.remove()
                }
            })
        }
    }

    verticalGetCount(windowsWidth) {
        const arrowsHeight = 40,
          itemsCount = Math.floor(((windowsWidth / 2 - 30 - this.previews.parentElement.offsetWidth) * this.aspectRatio - arrowsHeight + 10) / (this.previews.offsetWidth * this.aspectRatio + 10));
        return (itemsCount)
    }

    verticalGetCountQw(windowsWidth) {
        const arrowsHeight = 40,
          mainGalleryWidth = windowsWidth >= 1160 ? 386 : 340,
          itemsCount = Math.floor((mainGalleryWidth * this.aspectRatio - arrowsHeight + 10) / (this.previews.offsetWidth * this.aspectRatio + 10));
        return (itemsCount)
    }

    verticalSetHeight(slider) {
        const carousel = slider || this.galleryPreviews;
        if (carousel) {
            const carouselHeight = carousel.params.slidesPerView * (this.previews.offsetWidth * this.aspectRatio + 10) - 10;
            this.previews.style.height = carouselHeight + 'px';
            if (carousel.allowSlideNext && carousel.allowSlidePrev) {
                this.previews.classList.remove('swiper-transform-off')
            } else {
                this.previews.classList.add('swiper-transform-off')
            }
        }
    }

    buildCarousel(horizontal, currentIndex = 0) {

        let galleryPreviewsOptions = {
            loop: false,
            watchOverflow: true,
            watchSlidesVisibility: true,
            effect: 'slide',
            touchRatio: 3,
            observer: true,
            observeParents: true,
            pagination: {
                el: this.querySelector('.prd-block-gallery-pagination')
            },
            navigation: {
                nextEl: this.querySelector('.prd-block-gallery-nav .swiper-button-next'),
                prevEl: this.querySelector('.prd-block-gallery-nav .swiper-button-prev')
            },
            scrollbar: {
                el: this.querySelector('.swiper-scrollbar'),
                draggable: true,
                dragSize: 'auto'
            },
            on: {
                init: (slider) => {
                    this.lazyLoadImage(slider, true);
                    if (!this.scrollSync) {
                        slider.slides[slider.realIndex].classList.add(('swiper-slide-thumb--active'))
                    }
                },
                afterInit: (slider) => {
                    if (!horizontal) this.verticalSetHeight(slider)
                },
                activeIndexChange: (slider) => {
                    this.lazyLoadImage(slider, true)
                },
                slideChangeTransitionEnd: (slider) => {
                    this.lazyLoadImage(slider, true)
                },
                touchStart: () => {
                    this.querySelectorAll('*').forEach(node => {
                        if (node._tippy) node._tippy.disable()
                    })
                },
                touchEnd: () => {
                    this.querySelectorAll('*').forEach(node => {
                        if (node._tippy) node._tippy.enable()
                    })
                }
            }
        }

        const galleryPreviewsOptionsHor = {
            slidesPerView: 4,
            spaceBetween: 10,
            direction: 'horizontal',
            centerInsufficientSlides: true,
            breakpoints: {
                480: {
                    slidesPerView: 4,
                },
                575: {
                    slidesPerView: 5,
                },
                768: {
                    slidesPerView: 5,
                },
                992: {
                    slidesPerView: 5,
                },
                1200: {
                    slidesPerView: 5,
                    spaceBetween: 20,
                }
            }
        }

        if (this.dataset.quickview) {
            const galleryPreviewsOptionsVertQW = {
                slidesPerView: 4,
                spaceBetween: 10,
                centerInsufficientSlides: false,
                breakpoints: {
                    480: {
                        slidesPerView: 4,
                        direction: 'horizontal',
                    },
                    575: {
                        slidesPerView: 5,
                        direction: 'horizontal',
                    },
                    768: {
                        slidesPerView: 5,
                        direction: 'horizontal',
                        centerInsufficientSlides: true,
                    },
                    1025: {
                        slidesPerView: this.verticalGetCountQw(1025),
                        direction: 'vertical'
                    },
                    1160: {
                        slidesPerView: this.verticalGetCountQw(1160),
                        direction: 'vertical'
                    }
                }
            }
            galleryPreviewsOptions = Object.assign(galleryPreviewsOptions, horizontal ? galleryPreviewsOptionsHor : galleryPreviewsOptionsVertQW);
        } else {
            const containerMax = getComputedStyle(document.querySelector('.product-section .holder > .container')).getPropertyValue('--container-max-width');
            const maxWidth = containerMax ? containerMax.slice(0, -2) : 1178,
              step = Math.floor((maxWidth - 1025) / 6);
            const galleryPreviewsOptionsVert = {
                slidesPerView: 4,
                spaceBetween: 10,
                centerInsufficientSlides: false,
                breakpoints: {
                    480: {
                        slidesPerView: 4,
                        direction: 'horizontal',
                    },
                    575: {
                        slidesPerView: 5,
                        direction: 'horizontal',
                    },
                    768: {
                        slidesPerView: 5,
                        direction: 'horizontal',
                        centerInsufficientSlides: true,
                    },
                    1025: {
                        slidesPerView: this.verticalGetCount(1025),
                        direction: 'vertical'
                    },
                    [maxWidth - 5 * step]: {
                        slidesPerView: this.verticalGetCount(maxWidth - 5 * step),
                        direction: 'vertical'
                    },
                    [maxWidth - 4 * step]: {
                        slidesPerView: this.verticalGetCount(maxWidth - 4 * step),
                        direction: 'vertical'
                    },
                    [maxWidth - 3 * step]: {
                        slidesPerView: this.verticalGetCount(maxWidth - 3 * step),
                        direction: 'vertical'
                    },
                    [maxWidth - 2 * step]: {
                        slidesPerView: this.verticalGetCount(maxWidth - 2 * step),
                        direction: 'vertical'
                    },
                    [maxWidth - step]: {
                        slidesPerView: this.verticalGetCount(maxWidth - step),
                        direction: 'vertical'
                    },
                    [maxWidth]: {
                        slidesPerView: this.verticalGetCount(maxWidth),
                        direction: 'vertical'
                    }
                }
            }

            galleryPreviewsOptions = Object.assign(galleryPreviewsOptions, horizontal ? galleryPreviewsOptionsHor : galleryPreviewsOptionsVert);
        }

        this.galleryPreviews = new Swiper(this.previews, galleryPreviewsOptions)
    }

    buildCarouselMain(currentIndex = 0) {

        let galleryMainOptions = {
            observer: true,
            runCallbacksOnInit: true,
            watchSlidesProgress: true,
            loop: false,
            effect: 'fade',
            speed: 0,
            touchRatio: 1,
            noSwiping: true,
            noSwipingSelector: 'product-model,model-viewer,video,.zoomWindow',
            initialSlide: currentIndex,
            navigation: {
                nextEl: this.carousel.querySelector('.swiper-button-next'),
                prevEl: this.carousel.querySelector('.swiper-button-prev')
            },
            on: {
                afterInit: (slider) => {
                    if (currentIndex !== 'start') slider.slideTo(currentIndex, 0);
                    this.lazyLoadImage(slider, false);
                    slider.el.classList.add('swiper-first-init');
                    this.onInitEvent(slider, 500);
                },
                slideChangeTransitionEnd: (slider) => {
                    if (!slider.el.classList.contains('swiper-first-init')) return false;
                    this.lazyLoadImage(slider, false);
                    const activeSlide = slider.el.querySelector('.swiper-slide-active');
                    if (this.previews && !this.scrollSync) {
                        const mediaId = activeSlide.dataset.mediaId,
                          slideThumb = this.previews.querySelector(`[data-media-id="${mediaId}"]`);
                        this.previews.querySelector('.swiper-slide-thumb--active')?.classList.remove(('swiper-slide-thumb--active'));
                        if (slideThumb) {
                            if (!slideThumb.classList.contains('swiper-slide-visible')) this.galleryPreviews.slideTo([...slideThumb.parentElement.children].indexOf(slideThumb), 300);
                            slideThumb.classList.add(('swiper-slide-thumb--active'));
                        }
                    }
                    this.slideChangeEventsStop = false;
                    setTimeout(() => {
                        if (this.slideChangeEventsStop) return;
                        activeSlide.querySelector('product-model > button')?.dispatchEvent(new Event('click', {
                            bubbles: true
                        }));
                        activeSlide.querySelector('.shopify-model-viewer-ui__button.shopify-model-viewer-ui__button--poster')?.click();
                        playPauseVideo(this, this.carousel, 'init');
                    }, 200)
                    if (this.zoom) {
                        this.addZoom(slider)
                    }
                },
                slideChange: (slider) => {
                    if (!slider.el.classList.contains('swiper-first-init')) return false;
                    this.slideChangeEventsStop = true;
                    playPauseVideo(this, this.carousel, 'pauseAll');
                    if (this.manualZoomLink) this.updateZoomLink(this.defaultZoomLink);
                }
            }
        }
        if (this.previews && this.scrollSync) galleryMainOptions.thumbs = {
            swiper: this.galleryPreviews
        }
        if (this.dataset.initialSlide) galleryMainOptions.initialSlide = +this.dataset.initialSlide;
        this.galleryMain = new Swiper(this.carousel, galleryMainOptions);
    }

    onInitEvent(slider, zoomDelay = 0) {
        setTimeout(() => {
            if (this.zoom) {
                this.addZoom(slider);
            }
        }, zoomDelay);
        setTimeout(() => {
            playPauseVideo(this, this.carousel, 'init')
        }, 1000);
    }

    addZoom(slider, slide = false) {
        if (!this.zoom || !slider) return;
        const currentSlide = slide ? slide : this.carousel.querySelector('.swiper-slide.swiper-slide-active');
        if (currentSlide) {
            if (currentSlide.classList.contains('zoom-init') && currentSlide.querySelector('.zoomWrapper') && currentSlide.querySelector('.zoomWrapper').offsetWidth > 0) return;
            currentSlide.classList.add('zoom-initializing');
        }
        if (currentSlide && !currentSlide.classList.contains('swiper-slide--video') && !currentSlide.querySelector('product-model')) {
            if (slider.destroyed) {
                currentSlide.classList.remove('zoom-initializing');
                return;
            }
            slider.params.touchRatio = 1;
            const zoomContainer = this.dataset.quickview ? '#prdMainImageQW' : '#prdMainImage';
            this.zoomLink.forEach(link => {
                link.classList.remove('hidden')
            });
            if (document.querySelector(zoomContainer)) {
                this.zoomOptions = {
                    zoomType: 'inner',
                    zoomContainerAppendTo: currentSlide,
                    zoomWindowFadeIn: 500,
                    zoomWindowFadeOut: 500,
                    lensFadeIn: 500,
                    lensFadeOut: 500,
                    imageCrossfade: true,
                    responsive: true,
                    cursor: 'crosshair',
                    onZoomedImageLoaded: function () {
                        currentSlide.classList.add('zoom-init');
                        currentSlide.classList.remove('zoom-initializing');
                    },
                    respond: [{
                        range: '100-1024',
                        enabled: false,
                        showLens: false
                    }]
                }
                this.addZoomImage(currentSlide.querySelector('img'))
            }
        } else {
            this.zoomLink.forEach(link => {
                link.classList.add('hidden')
            });
            if (currentSlide && currentSlide.querySelector('product-model') && !slider.destroyed) slider.params.touchRatio = 0;
        }
    }

    addZoomImage(image) {
        if (image.getAttribute('data-zoom-image')) {
            if (image.dataset.imageWidth > 0) {
                if (image.dataset.imageWidth > this.carouselWidth * this.zoomReserve) {
                    jq_lumia(image).ezPlus(this.zoomOptions)
                } else image.closest('[data-media-id]').classList.remove('zoom-initializing')
            } else jq_lumia(image).ezPlus(this.zoomOptions)
        } else {
            image.closest('[data-media-id]').classList.remove('zoom-initializing')
        }
    }

    buildGallery() {

        let _galleryObj = [];
        const productName = this.closest('.prd-block').querySelector('.prd-block-name'),
          productNameInner = productName ? (this.dataset.quickview ? productName.querySelector('a').innerHTML : productName.innerHTML) : '';
        this.carousel.querySelectorAll('img').forEach((image, i) => {
            if (image.closest('.swiper-slide--video')) return;
            if (image.closest('.swiper-slide')) {
                const caption = (this.colorOptionName && image.alt.split('-')[0] == this.colorOptionName) ? productNameInner + '&nbsp;/&nbsp;' + this.colorOptionName + '&nbsp;' + image.alt.split('-')[1] : productNameInner;
                let src = (image.dataset.fancyboxImage == '' || !image.dataset.fancyboxImage) ? (image.dataset.src || image.src || image.srcset) : image.dataset.fancyboxImage,
                  images = {};
                images['src'] = src;
                images['opts'] = {
                    thumb: src,
                    caption: caption
                };
                if (src) {
                    _galleryObj.push(images);
                    if (image.closest('.swiper-slide')) image.closest('.swiper-slide').dataset.galleryIndex = _galleryObj.length - 1
                }
            }
        })
        this.galleryObj = _galleryObj;
    }


    zoomLinkEvent() {
        this.zoomLink.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                const optionsFancybox = {
                    loop: false,
                    animationEffect: 'zoom',
                    touch: true,
                    buttons: ['close'],
                    clickSlide: 'close',
                    clickOutside: 'close',
                    mobile: {
                        clickSlide: 'close',
                        clickOutside: 'close'
                    },
                    thumbs: {
                        autoStart: true,
                        axis: 'x'
                    },
                    arrows: true,
                    beforeShow: function () {
                        const fancyArray = document.querySelectorAll('.fancybox-container');
                        fancyArray[fancyArray.length - 1].classList.add('fancybox--light', 'fancybox-gallery');
                    }
                }
                if (target.getAttribute('href') == '#') {
                    let targetItem = this.carousel.querySelector('.swiper-slide-active') || target.closest('.swiper-slide');
                    jq_lumia.fancybox.open(this.galleryObj, optionsFancybox, targetItem.dataset.galleryIndex || false)

                } else {
                    jq_lumia.fancybox.open(Object.assign(optionsFancybox, {
                        src: target.href
                    }))
                }
            })
        })
    }
    updateZoomLink(link) {
        if (this.galleryObj.length < 2) {
            this.manualZoomLink = true;
            this.zoomLink.forEach(link => {
                link.setAttribute('href', link)
            })
        } else this.manualZoomLink = false
    }
}

document.querySelectorAll('[name="tab-accordion"]').forEach(el => {
    const tab = el.closest('.tab-accordion-item').querySelector('.js-set-height');
    if (tab) {
        el.addEventListener('change', function () {
            tab.style.setProperty('--tab-height', tab.scrollHeight + 'px');
        })
        const observer = new ResizeObserver(function () {
            tab.style.setProperty('--tab-height', tab.scrollHeight + 'px')
        })
        for (let i = 0; i < tab.children.length; i++) {
            observer.observe(tab.children[i])
        }
    }
})

document.addEventListener('click', function (e) {
    let target = e.target.closest('.spr-summary-actions-newreview');
    if (!target) return;
    const tab = target.closest('.tab-accordion-item')?.querySelector('.js-set-height');
    if (tab) {
        setTimeout(() => {
            tab && tab.style.setProperty('--tab-height', tab.querySelector('.tab-accordion-item-content-inside').scrollHeight + 'px');
        }, 50)
    }
})

document.addEventListener('click', (e) => {
    if (!e.target.closest('.js-reviews-link')) return;
    e.preventDefault();
    if (window.matchMedia(`(min-width:992px)`).matches) {
        const target = e.target,
          targetsArray = target.getAttribute('data-targets') ? JSON.parse(target.getAttribute('data-targets')) : false,
          tabNavs = document.querySelector('.product-tab-wrap'),
          productTabs = 'product-tabs',
          tabAccordeon = '.tab-accordion-item',
          offset = 60;
        let panReview = false;
        if (targetsArray) {
            targetsArray.forEach((id) => {
                if (document.querySelector(id)) {
                    panReview = document.querySelector(id)
                }
            })
        }
        if (panReview) {
            if (panReview.closest(productTabs)) {
                const activeTab = panReview.closest('.swiper-slide');
                if (activeTab) {
                    panReview.closest(productTabs).contentTabsCarousel?.slideTo([...activeTab.parentElement.children].indexOf(activeTab), 0)
                    tabNavs && smoothScrollTo(tabNavs.getBoundingClientRect().top - offset, 500)
                }
            } else if (panReview.closest(tabAccordeon)) {
                panReview.closest(tabAccordeon).querySelector('input[type="checkbox"]').checked = true;
                smoothScrollTo(panReview.getBoundingClientRect().top - offset, 200)
            } else {
                smoothScrollTo(panReview.getBoundingClientRect().top - offset, 500)
            }
        }
    }
})

class ProductTabs extends HTMLElement {
    connectedCallback() {
        this.navigationTabs = this.querySelector('.tab-wrap-nav');
        this.contentTabs = this.querySelector('.product-tab-wrap');
        this.buildCarouselNav();
        this.buildCarouselContent();
        if (this.navigationTabs) {
            this.navigationTabs.querySelector('.swiper-slide:first-child')?.addEventListener('click', () => {
                this.navigationTabsCarousel?.slideTo(0, 100)
            })
            this.navigationTabs.querySelector('.swiper-slide:last-child')?.addEventListener('click', () => {
                this.navigationTabsCarousel?.slideTo(this.navigationTabsCarousel.slides.length, 100)
            })
        }
        if (typeof Shopify !== 'undefined' && Shopify.designMode && this.navigationTabsCarousel) {
            setTimeout(() => {
                this.navigationTabsCarousel.update()
            }, 500)
        }
    }

    buildCarouselNav() {
        const options = {
            loop: false,
            watchOverflow: true,
            touchRatio: 1,
            watchSlidesVisibility: true,
            slidesPerView: 'auto',
            edgeSwipeThreshold: 50,
            setWrapperSize: true,
            slideToClickedSlide: true,
            updateOnWindowResize: true,
            scrollbar: {
                el: this.querySelector('.swiper-scrollbar'),
                draggable: true,
                dragSize: 150,
                snapOnRelease: true
            },
            spaceBetween: 0,
            direction: 'horizontal'
        };
        this.navigationTabsCarousel = new Swiper(this.navigationTabs, options)
    }

    buildCarouselContent() {
        const options = {
            loop: false,
            touchRatio: 1,
            effect: 'fade',
            autoHeight: true,
            speed: 0,
            noSwiping: true,
            noSwipingSelector: '.table-responsive',
            thumbs: {
                swiper: this.navigationTabsCarousel
            },
            on: {
                slideChangeTransitionEnd: (slider) => {
                    this.navigationTabsCarousel.slideTo(slider.realIndex, 100);
                    if (window.matchMedia(`(max-width:767px)`).matches) smoothScrollTo(getCoords(this).top - 65, 750)
                }
            },
            breakpoints: {
                992: {
                    allowTouchMove: false
                }
            }
        }
        this.contentTabsCarousel = new Swiper(this.contentTabs, options)
    }
}

customElements.define('product-tabs', ProductTabs)

document.addEventListener('DOMContentLoaded', () => {
    customElements.define('sticky-addtocart', StickyAddtocart);
    customElements.define('product-gallery', ProductGallery);
    const tabMobile = document.querySelector('.js-tab-wrap-mobile');
    if (tabMobile) {
        tabMobile.querySelectorAll('a').forEach(el => {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                const tabId = document.getElementById(el.href.substring(el.href.lastIndexOf('/') + 1));
                if (tabId.type == 'radio') tabId.checked = true;
                document.querySelectorAll('.js-dropdn-modal-slide-title').forEach(el => {
                    el.classList.remove('is-current');
                })
                for (let sibling of el.parentNode.children) {
                    sibling.classList.remove('is-current');
                }
                el.classList.add('is-current');
            })
        })
        Scrollbar.init(tabMobile, {
            alwaysShowTracks: true,
            damping: document.body.dataset.damping
        })
    }
    const sharing = document.querySelector('share-button');
    if (sharing) {
        sharing.closest('.holder').classList.add('to-upper')
    }
})

document.querySelectorAll('.product-tab-wrap input').forEach(el => {
    el.addEventListener('change', () => {
        if (typeof Waypoint !== 'undefined') {
            setTimeout(() => {
                Waypoint.refreshAll()
            }, 300);
        }
    })
})

/* end product page */
let cashWindowWidth;
let cashWindowHeight;
const webkitKeyboardHeightMin = 200;
checkDevice();
document.addEventListener('DOMContentLoaded', () => {
    cashWindowWidth = window.innerWidth;
    cashWindowHeight = window.innerHeight;
    document.querySelectorAll('.lazyload').forEach(el => {
        el.addEventListener('load', () => {
            if (el.closest('.image-container')) el.closest('.image-container').classList.add('ic--image-loaded')
        })
    })
    if (window.matchMedia(`(max-width:1024px)`).matches) {
        document.body.dataset.mobile = true;
    } else delete document.body.dataset.mobile;
    calcScrollWidth();
    setVH();
    setVHStart();
    addResponsive();
    document.body.classList.remove('initial-hide');
    if (document.querySelector('#shopify-chat')) document.body.classList.add('has-shopify-chat');

    tippy.delegate('body', {
        target: '[data-tippy-content]',
        theme: document.body.dataset.tooltipColor,
        animation: document.body.dataset.tooltipAnimation,
        duration: [document.body.dataset.tooltipDuration || 300, 0],
        delay: document.body.dataset.tooltipDelay || 0,
        touch: false,
        zIndex: 99999
    });

    Scrollbar.initAll({alwaysShowTracks: true});

    document.querySelectorAll('.menu-label').forEach(label => label.closest('a')?.style.setProperty('--label-width', label.offsetWidth + 'px'));

})

document.addEventListener('scroll', () => {
    tippy && tippy.hideAll()
})

if (window.visualViewport && document.body.classList.contains('safari')) {
    window.visualViewport.addEventListener('resize', debounce(() => {
        if (window.matchMedia('(orientation: portrait)').matches) {
            // document.querySelector('.hdr .hdr-logo').innerHTML =  (cashWindowHeight - window.visualViewport.height);
            if ((cashWindowHeight - window.visualViewport.height) > webkitKeyboardHeightMin) {
                document.body.classList.add('has-keyboard-open');
            } else {
                document.body.classList.remove('has-keyboard-open')
            }
        } else document.body.classList.remove('has-keyboard-open')
    }, 500))
}

window.addEventListener('resize', debounce(() => {
    setVH();
    checkDevice();
    if (window.innerWidth > 575) {
        setVHStart(true)
    }
    if (window.innerWidth != cashWindowWidth) {
        calcScrollWidth();
        setVHStart(true);
        if (window.matchMedia(`(max-width:1024px)`).matches) {
            document.body.dataset.mobile = true
        } else delete document.body.dataset.mobile;
        if (!window.matchMedia(`(max-width:1024px)`).matches) {
            if (document.querySelector('.fancybox-container.fancybox-is-open .filter-mobile-content:not(.filter-desktop-slide)') || document.querySelector('.fancybox-container.fancybox-is-open .mobilemenu-content')) {
                jq_lumia.fancybox.close()
            }
        }
        cashWindowWidth = window.innerWidth;
        cashWindowHeight = window.innerHeight;
    }
}, 500))

window.addEventListener('load', () => {
    document.body.classList.remove('full-load-hide')
})

document.addEventListener('DOMContentLoaded', () => {
    Object.assign(true, jq_lumia.fancybox.defaults, {
        buttons: {},
        btnTpl: {
            arrowLeft: '',
            arrowRight: ''
        },
        spinnerTpl: '<div data-load="loading"></div>',
        touch: false,
        backFocus: false,
        autoFocus: false,
        clickSlide: false,
        clickOutside: false,
        mobile: {
            clickSlide: false,
            clickOutside: false
        }
    })
})
