import { select, settings } from '../settings.js';
import utils from '../utils.js';   

class AmountWidget {

    constructor(element, value = settings.amountWidget.defaultValue) {
        const thisWidget = this;
        thisWidget.getElements(element);
        thisWidget.input.value = value;
        thisWidget.value = value;
        thisWidget.initActions();
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
        if (thisWidget.value !== newValue && utils.isAmountValid(newValue, settings.amountWidget.defaultMin, settings.amountWidget.defaultMax)) {
            thisWidget.value = newValue;
            thisWidget.announce();
        }
        thisWidget.input.value = thisWidget.value;
    }

    initActions() {
        const thisWidget = this;
        thisWidget.input.addEventListener('change', function () {
            thisWidget.setValue(thisWidget.input.value);
        });
        thisWidget.linkDecrease.addEventListener('click', function () {
            thisWidget.setValue(thisWidget.value - 1);
        });
        thisWidget.linkIncrease.addEventListener('click', function () {
            console.log('puls clicked');
            thisWidget.setValue(thisWidget.value + 1);
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

export default AmountWidget;