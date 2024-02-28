import { select, settings, templates } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
    constructor(element) {
        const thisCart = this;
        thisCart.products = [];
        thisCart.getElements(element);
        thisCart.initActions();
    }

    initActions() {
        const thisCart = this;
        thisCart.dom.toggleTrigger.addEventListener('click', function () {
            thisCart.dom.wrapper.classList.toggle('active');
        });
        thisCart.dom.productList.addEventListener('updated', function () { 
            thisCart.update();
        });
        thisCart.dom.productList.addEventListener('remove', function (event) {
            thisCart.remove(event.detail.cartProduct);
        });
        thisCart.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            console.log('inside submit event');
            thisCart.sendOrder();
        });
    }

    sendOrder() {
        const thisCart = this;
        const url = settings.db.url + '/' + settings.db.orders;
        const payload = {
            address: thisCart.dom.address.value,
            phone: thisCart.dom.phone.value,
            totalPrice: thisCart.totalPrice,
            deliveryFee: thisCart.deliveryFee,
            products: [],
        };
        for (let product of thisCart.products) {
            payload.products.push(product.getData());
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };
        fetch(url, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (parsedResponse) {
                console.log('parsedResponse:', parsedResponse);
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
        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
        thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
        thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
        thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
        thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
        thisCart.dom.totalPriceUp = thisCart.dom.wrapper.querySelector(select.cart.totalPriceUp);
        thisCart.dom.totalPriceDown = thisCart.dom.wrapper.querySelector(select.cart.totalPriceDown);
        thisCart.dom.address = thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address),
        thisCart.dom.phone = thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone),
        thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    add(productSummary) {
        const thisCart = this;
        const generatedHTML = templates.cartProduct(productSummary);
        thisCart.element = utils.createDOMFromHTML(generatedHTML);
        const cartContainer = document.querySelector(select.containerOf.cartList);
        cartContainer.appendChild(thisCart.element);
        thisCart.products.push(new CartProduct(productSummary, thisCart.element));
        thisCart.update();
    }

    update() {
        const thisCart = this;
        thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.totalNumber = 0;
        thisCart.subtotalPrice = 0;
        for (let product of thisCart.products) {
            thisCart.subtotalPrice += product.price;
            thisCart.totalNumber += 1;
        }
        thisCart.deliveryFee *= !!thisCart.totalNumber;
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
        thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
        thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
        thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
        thisCart.dom.totalPriceUp.innerHTML = thisCart.totalPrice;
        thisCart.dom.totalPriceDown.innerHTML = thisCart.totalPrice;
    }

}

export default Cart;