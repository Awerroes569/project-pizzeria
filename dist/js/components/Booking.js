import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(container) {
        this.dom = {};
        this.widgets= {};
        this.dom.wrapper = container;
        this.render(container);
        this.getElements();
        this.initWidgets();

    }

    initWidgets() {
        this.widgets.peopleAmount = new AmountWidget(this.dom.peopleAmount);
        this.widgets.hoursAmounthoursAmount = new AmountWidget(this.dom.hoursAmount);
    }

    getElements() {
        this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
        this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    }

    render(container) {
        const generatedHTML = templates.bookingWidget();
        container.innerHTML = generatedHTML;
    }
}

export default Booking;