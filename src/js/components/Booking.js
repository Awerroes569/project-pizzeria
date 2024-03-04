import { select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
        this.widgets.datePicker = new DatePicker(this.dom.datePicker);
        this.widgets.hourPicker = new HourPicker(this.dom.hourPicker);
    }

    getElements() {
        this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
        this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
        this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        //select.widgets.datePicker.wrapper i select.widgets.hourPicker.wrapper.
    }

    render(container) {
        const generatedHTML = templates.bookingWidget();
        container.innerHTML = generatedHTML;
    }
}

export default Booking;