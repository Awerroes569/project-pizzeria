export const select = {
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

export const classNames = {
    menuProduct: {
        wrapperActive: 'active',
        imageVisible: 'active',
    },

    cart: {
        wrapperActive: 'active',
    },
};

export const settings = {
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
    db: {
        url: '//localhost:3131',
        products: 'products',
        orders: 'orders',
    }
};

export const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
};