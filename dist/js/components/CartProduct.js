import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

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
        thisCartProduct.initAmountWidget();
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
        thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, thisCartProduct.amount);

        const changeHandler = function () {
            thisCartProduct.amount = thisCartProduct.amountWidget.value;
            thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
            thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
            thisCartProduct.amountWidget.announce();
        }

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

    getData() {
        const thisCartProduct = this;
        const productSummary = {
            id: thisCartProduct.id,
            name: thisCartProduct.name,
            amount: thisCartProduct.amount,
            price: thisCartProduct.price,
            priceSingle: thisCartProduct.priceSingle,
            params: thisCartProduct.params,
        };
        return productSummary;
    }
}

export default CartProduct;