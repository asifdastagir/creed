document.addEventListener('shopify:section:load', function(e) {
  e.target.querySelectorAll('swiper-carousel, tab-slider, main-password').forEach((element) => {
    if('destroy' in element) {element.destroy()};
    setTimeout(() => {element.init()}, 500)
  })

  e.target.querySelectorAll('flow-type').forEach((element) => {
    element.hideCaption();
    new Promise(function (resolve) {setTimeout(() => {element.init();resolve()},250)}).then(() => {setTimeout(() => {element.showCaption()}, 500)})
  })

  e.target.querySelectorAll('masonry-grid').forEach((element) => {
    element.init()
  })

  e.target.querySelectorAll('account-popup, wishlist-popup, mini-cart-popup, settings-collapse, search-popup').forEach((element) => {
    setTimeout(() => {element.reInit()}, 500)
    })

  e.target.querySelector('header-sticky')?.init()
});
document.addEventListener('shopify:block:select', function(e) {
  if(e.target.classList.contains('tabs-item')) e.target.click();
})
