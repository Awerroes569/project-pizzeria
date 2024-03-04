//import { render } from 'sass';
import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';


class AmountWidget extends BaseWidget {

    constructor(element, value = settings.amountWidget.defaultValue) {
        super(element, value);
        console.log ('DEFAULT VALUE:',value);
        this.getElements();
        this.dom.input.value = value;
        this.initActions();
    }

    getElements() {
        this.dom.input = this.dom.wrapper.querySelector(select.widgets.amount.input);
        this.dom.linkDecrease = this.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
        this.dom.linkIncrease = this.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }

    renderValue() {
        const thisWidget = this;
        thisWidget.dom.input.value = thisWidget.value;
    }

    initActions() {
        const thisWidget = this;
        thisWidget.dom.input.addEventListener('change', function () {
            thisWidget.value=thisWidget.dom.input.value;
        });
        thisWidget.dom.linkDecrease.addEventListener('click', function () {
            thisWidget.value=thisWidget.value - 1;
        });
        thisWidget.dom.linkIncrease.addEventListener('click', function () {
            console.log('puls clicked');
            thisWidget.value=thisWidget.value + 1;
        });
    }

    parseValue(value) {
        if (!utils.isNumber(value)) {
            this.dom.input.value = this.correctValue;
            return;
        }
        return parseInt(value);
    }

    

    isValid(value) {
        if (utils.isAmountValid(value, settings.amountWidget.defaultMin, settings.amountWidget.defaultMax)) {
            this.dom.input.value = value;
            return true;
        }
        else {
            this.dom.input.value = this.correctValue;
            return false;
        }
    }

    verifyValue(value) {
        return utils.isNumber(value);
    }
}

export default AmountWidget;