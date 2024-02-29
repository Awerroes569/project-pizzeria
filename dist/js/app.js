import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';


const app = {

  activatePage: function (pageId) {
    const thisApp = this;
    for (let page of thisApp.pages) {
      page.classList.toggle(
        classNames.pages.active,
        page.id == pageId
      );
    }
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
    
  },
  
  initPages: function () {
    const thisApp = this;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = idFromHash;
        break;
      }
    }
    
    thisApp.activatePage(pageMatchingHash );//thisApp.pages[0].id);
    console.log('thisApp.links:', thisApp.links);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const id = link.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }
  },
  
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {}; 
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse:', parsedResponse);
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
    console.log('thisApp.data:', JSON.stringify(thisApp.data));
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    thisApp.initPages();
    console.log('*** App initPages ***');
    thisApp.initData();
    console.log('*** App initData ***');
    thisApp.initCart();
    console.log('*** App initCart ***');
  },
};

app.init();
