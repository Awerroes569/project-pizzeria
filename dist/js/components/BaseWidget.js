
class BaseWidget {
    constructor(wrapperElement, initialValue) {
        this.dom = {};
        this.dom.wrapper = wrapperElement;
        this.correctValue = initialValue;
    }

    get value() {
        return this.correctValue;
    }
    
    set value(value) {
        const newValue = this.parseValue(value);
        if (newValue !== this.correctValue && this.isValid(newValue)) {
            this.correctValue = newValue;
            this.announce();
        }
        this.renderValue();
        //if (this.verifyValue(value)) {
        //if (!utils.isNumber(value)) {
        //    this.ifNotNumber();
        //    return;
        //}
        //const newValue = parseInt(value);
        //if (thisWidget.value !== newValue && this.ifNotValid(newValue)) {
        //this.correctValue = value;
        //this.announce();
        //}
        //this.renderValue();
    }

    announce() {
        const thisWidget = this;
        const event = new CustomEvent('updated', {
            bubbles: true
        });
        thisWidget.dom.wrapper.dispatchEvent(event);
    }

    renderValue(value) {
        console.log('interface only: method renderValue not implemented',value);
        return;
    }

    parseValue(value) {
        console.log('interface only: method parseValue implemented',value);
        return null;
    }

    isValid(value) {
        console.log('interface only: method isValid not implemented', value);
        return false;
    }
}

export default BaseWidget;