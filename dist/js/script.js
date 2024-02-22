/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
      cartList: '.cart__order-summary',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',   //input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      //toggleTrigger: '.cart__summary',
      //productList: '.cart__order-summary',
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: '.cart__total-number',
      totalPriceUp: '.cart__total-price strong',
      totalPriceDown: '.cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget()
      thisProduct.processOrder();
      //console.log('new Product:', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

      //console.log('thisProduct.accordionTrigger:', thisProduct.accordionTrigger);
      //console.log('thisProduct.form:', thisProduct.form);
      //console.log('thisProduct.formInputs:', thisProduct.formInputs);
      //console.log('thisProduct.cartButton:', thisProduct.cartButton);
      //console.log('thisProduct.priceElem:', thisProduct.priceElem);
      //console.log('thisProduct.imageWrapper:', thisProduct.imageWrapper);
      //console.log('thisProduct.amountWidgetElem:', thisProduct.amountWidgetElem);
    }

    initAccordion() {
      const thisProduct = this;

      /* XXXXXXfind the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      //clickableTrigger.addEventListener('click', function (event) {
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
      
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        //console.log('activeProducts:', activeProducts);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProducts) {
          for (let activeProduct of activeProducts) {
            if (activeProduct !== thisProduct.element) {
              activeProduct.classList.remove('active');
            }
          }
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });

    }

    initOrderForm() {
      const thisProduct = this;
      //console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder(); 
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.addToCart();
        thisProduct.processOrder();
      }); 
    
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      //console.log('thisProduct.amountWidget:', thisProduct.amountWidget);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    
    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;
      let priceAdjustment=0;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log("for every cathegory",paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log("for every option", optionId, option);
          let isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('isOptionSelected:', isOptionSelected);
          let isOptionDefault = option.default;
          //console.log('isOptionDefault:', isOptionDefault);
          let optionPrice = option.price;
          //console.log('optionPrice:', optionPrice);
          priceAdjustment += utils.correctPrice(isOptionSelected, isOptionDefault, optionPrice);
          //console.log('priceAdjustment:', priceAdjustment);
          let optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log('optionImage:', optionImage);
          if (optionImage) {
            let isActive = optionImage.classList.contains('active');
            //console.log('isActive:', isActive);
            if (utils.shouldToggleActive(isOptionSelected, isActive)) {
              optionImage.classList.toggle('active');
            }
          
          }

        }
      }
      //console.log('FINAL PRICE ADJUSTMENT:', priceAdjustment); 
      // update calculated price in the HTML
      price += priceAdjustment;
      thisProduct.price = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.totalPrice = price;
      thisProduct.priceElem.innerHTML = price;
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.price,
        price: thisProduct.totalPrice,
        params: thisProduct.prepareCartProductParams(),
      };
      //console.log('PRODUCT SUMMARY:', productSummary);
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log("CART for every cathegory", paramId, param);
        params[paramId] = {
          label: param.label,
          options: {}//{}
        };

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log("for every option", optionId, option);
          let isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('isOptionSelected:', isOptionSelected);
          //let isOptionDefault = option.default;
          ////console.log('isOptionDefault:', isOptionDefault);
          //let optionPrice = option.price;
          ////console.log('optionPrice:', optionPrice);
          //priceAdjustment += utils.correctPrice(isOptionSelected, isOptionDefault, optionPrice);
          ////console.log('priceAdjustment:', priceAdjustment);
          //let optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          ////console.log('optionImage:', optionImage);
          if (isOptionSelected) {
            //params.paramId.options.optionId = 'pupa';//option.label; 
            params[paramId].options[optionId] = option.label;

          }
        }
      }
      //console.log('CART PARAMS:', params);
      return params;
    }
      
  }
  
  class AmountWidget {
    
    constructor(element, value = settings.amountWidget.defaultValue) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.input.value = value;
      thisWidget.value = value;
      thisWidget.initActions();

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);
    }

    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      if (!utils.isNumber(value)) {
        thisWidget.input.value = thisWidget.value;
        return;
      }
      const newValue = parseInt(value);
      /* add validation */
      if (thisWidget.value !== newValue && utils.isAmountValid(newValue, settings.amountWidget.defaultMin, settings.amountWidget.defaultMax)) {
        //console.log('newValue:', newValue);
        thisWidget.value = newValue;
        thisWidget.announce();   //UPDATE CARTPRODUCT
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function () {
        thisWidget.setValue(thisWidget.value-1);   
      });
      thisWidget.linkIncrease.addEventListener('click', function () {
        thisWidget.setValue(thisWidget.value+1);
      });
    }

    announce() {  
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      //console.log('new Cart:', thisCart);
    }

    initActions() { 
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle('active');
      });
      thisCart.dom.productList.addEventListener('updated', function () {  //widget update amount and announce event updated
        //console.log('inside updated event');
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });
    }

    remove(cartProduct) {
      const thisCart = this;
      const indexOfProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfProduct, 1);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      //console.log('thisCart.dom.toggleTrigger:', thisCart.dom.toggleTrigger);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPriceUp = thisCart.dom.wrapper.querySelector(select.cart.totalPriceUp);
      thisCart.dom.totalPriceDown = thisCart.dom.wrapper.querySelector(select.cart.totalPriceDown);
      
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    add(productSummary) {
      const thisCart = this;
      //console.log('ADDING product:', productSummary);

      ////////////////////////////////////////////////

        /* generate HTML based on template */
        const generatedHTML = templates.cartProduct(productSummary);
        /* create element using utils.createElementFromHTML */
        thisCart.element = utils.createDOMFromHTML(generatedHTML);
        /* find menu container */
        const cartContainer = document.querySelector(select.containerOf.cartList);
        /* add element to menu */
        cartContainer.appendChild(thisCart.element);
      ////////////////////////////////////////////////

      thisCart.products.push(new CartProduct(productSummary, thisCart.element));
      //console.log('thisCart.products:', thisCart.products);
      thisCart.update();
      
    }

    update() {
      const thisCart = this;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      for (let product of thisCart.products) {
        //console.log('product in loop:', product);
        thisCart.subtotalPrice += product.price;//priceSingle*product.amount;
        thisCart.totalNumber += 1;
      }
      thisCart.deliveryFee*=!!thisCart.totalNumber;
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      //console.log('totalNumber:', thisCart.totalNumber);
      //console.log('subtotalPrice:', thisCart.subtotalPrice);
      //console.log('totalPrice:', thisCart.totalPrice);
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPriceUp.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalPriceDown.innerHTML = thisCart.totalPrice;
    }

    
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      //thisCartProduct.initActions();
      thisCartProduct.initAmountWidget();
      //console.log('new CartProduct:', thisCartProduct);
      thisCartProduct.initActions();
    }

    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget,thisCartProduct.amount);
      //console.log('thisCartProduct.amountWidget:', thisCartProduct.amountWidget);

      const changeHandler = function () {
        //console.log('XXXXXXXXXXXXXXXXXXXX');
          thisCartProduct.amount = thisCartProduct.amountWidget.value;
          //console.log('thisCartProduct.amount:', thisCartProduct.amount);
          thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
          //console.log('thisCartProduct.price:', thisCartProduct.price);
          thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        //console.log('thisCartProduct.dom.price:', thisCartProduct.dom.price);
        thisCartProduct.amountWidget.announce(); 
        }

      //thisWidget.setValue(thisWidget.value + 1);
      thisCartProduct.amountWidget.input.addEventListener('change', changeHandler);
      thisCartProduct.amountWidget.linkDecrease.addEventListener('click', changeHandler);
      thisCartProduct.amountWidget.linkIncrease.addEventListener('click', changeHandler);
    }

    remove() {
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('remove event:', event);
    }

    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('remove clicked');
        thisCartProduct.remove();
      });
    }
  }

  const app = {

    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
      //console.log('thisApp.cart:', thisApp.cart);
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
  
}
