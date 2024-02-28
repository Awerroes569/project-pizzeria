import { select, templates} from '../settings.js';
import utils  from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
    constructor(id, data) {
        const thisProduct = this;
        thisProduct.id = id;
        thisProduct.data = data;
        thisProduct.renderInMenu();
        thisProduct.getElements();
        thisProduct.initAccordion();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget()
        thisProduct.processOrder();
    }

    renderInMenu() {
        const thisProduct = this;
        const generatedHTML = templates.menuProduct(thisProduct.data);
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        const menuContainer = document.querySelector(select.containerOf.menu);
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
    }

    initAccordion() {
        const thisProduct = this;

        thisProduct.accordionTrigger.addEventListener('click', function (event) {

            event.preventDefault();
            const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

            if (activeProducts) {
                for (let activeProduct of activeProducts) {
                    if (activeProduct !== thisProduct.element) {
                        activeProduct.classList.remove('active');
                    }
                }
            }
            thisProduct.element.classList.toggle('active');
        });

    }

    initOrderForm() {
        const thisProduct = this;

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
        thisProduct.amountWidgetElem.addEventListener('updated', function () {
            thisProduct.processOrder();
        });
    }

    processOrder() {
        const thisProduct = this;

        const formData = utils.serializeFormToObject(thisProduct.form);

        let price = thisProduct.data.price;
        let priceAdjustment = 0;

        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];

            for (let optionId in param.options) {
                const option = param.options[optionId];
                let isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);
                let isOptionDefault = option.default;
                let optionPrice = option.price;
                priceAdjustment += utils.correctPrice(isOptionSelected, isOptionDefault, optionPrice);
                let optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

                if (optionImage) {
                    let isActive = optionImage.classList.contains('active');
                    if (utils.shouldToggleActive(isOptionSelected, isActive)) {
                        optionImage.classList.toggle('active');
                    }
                }
            }
        }

        price += priceAdjustment;
        thisProduct.price = price;
        price *= thisProduct.amountWidget.value;
        thisProduct.totalPrice = price;
        thisProduct.priceElem.innerHTML = price;
    }

    addToCart() {
        const thisProduct = this;
        //app.cart.add(thisProduct.prepareCartProduct());
        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct.prepareCartProduct(),
            },
        });
        thisProduct.element.dispatchEvent(event);
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
        return productSummary;
    }

    prepareCartProductParams() {
        const thisProduct = this;

        const formData = utils.serializeFormToObject(thisProduct.form);
        const params = {};

        for (let paramId in thisProduct.data.params) {

            const param = thisProduct.data.params[paramId];
            params[paramId] = {
                label: param.label,
                options: {}//{}
            };

            for (let optionId in param.options) {
                const option = param.options[optionId];
                let isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);
                if (isOptionSelected) {
                    params[paramId].options[optionId] = option.label;
                }
            }
        }
        return params;
    }

}

export default Product;