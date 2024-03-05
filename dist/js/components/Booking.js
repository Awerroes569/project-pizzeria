import { select, settings, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
    constructor(container) {
        this.dom = {};
        this.widgets= {};
        this.dom.wrapper = container;
        this.render(container);
        this.getElements();
        this.initWidgets();
        this.getData();
        //this.parseData();   
    }

    initWidgets() {
        const thisBooking = this;
        this.widgets.peopleAmount = new AmountWidget(this.dom.peopleAmount);
        this.widgets.hoursAmounthoursAmount = new AmountWidget(this.dom.hoursAmount);
        this.widgets.datePicker = new DatePicker(this.dom.datePicker);
        this.widgets.hourPicker = new HourPicker(this.dom.hourPicker);

        this.dom.wrapper.addEventListener('updated', function() {
            thisBooking.updateDOM();
        });
    }

    getElements() {
        this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
        this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
        this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    }

    render(container) {
        const generatedHTML = templates.bookingWidget();
        container.innerHTML = generatedHTML;

    }

    getData() {

        const thisBooking = this;
        
        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.widgets.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.widgets.datePicker.maxDate);
        
        const params = {
            bookings: [startDateParam, endDateParam],
            eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
            eventsRepeat: [settings.db.repeatParam, endDateParam],
        };

        const urls = {
            bookings: settings.db.url + '/' + settings.db.bookings +'?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events +'?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events +'?' + params.eventsRepeat.join('&'),
        };

        console.log('getData urls', urls);

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
        .then(function(allResponses){
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]) {
            console.log('thisBooking', thisBooking);
            console.log(bookings, eventsCurrent, eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        });
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        
        const thisBooking = this;
        console.log('INSIDE PARSE DATA this', this);
        thisBooking.booked = {};
        for (let item of bookings) {
            this.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        

        for (let item of eventsCurrent) {
            this.makeBooked(item.date, item.hour, item.duration, item.table);
        }

   

        const minDate = this.widgets.datePicker.minDate;
        const maxDate = this.widgets.datePicker.maxDate;
        console.log('minDate', minDate);
        console.log('maxDate', maxDate);

        console.log('INSIDE PARSE DATA');
        //let a = 0;
        //let b = 1;
        //if (b > a) { return }


        for (let item of eventsRepeat) {
            //console.log('item', item);
           
            if (item.repeat === 'daily') {
                console.log('inside daily');
                //if (b > a) { continue; }
                for (let loopDate = minDate; loopDate<=maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    console.log('loopDate', loopDate);
                    this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

      
        console.log('this.booked', this.booked);
        this.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
        console.log('inside makeBooked');
        if(typeof this.booked[date] === 'undefined') {
            this.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            if (typeof this.booked[date][hourBlock] === 'undefined') {
                this.booked[date][hourBlock] = [];
            }
            this.booked[date][hourBlock].push(table);
        }
    }

    updateDOM() {
        this.date = this.widgets.datePicker.value;
        this.hour = utils.hourToNumber(this.widgets.hourPicker.value);
        console.log('widget hour', this.widgets.hourPicker.value);
        console.log('this.date', this.date);
        console.log('this.hour', this.hour);

        let allAvailable = false;

        console.log('this.booked', this.booked);
        if (
            typeof this.booked[this.date] === 'undefined' ||
            typeof this.booked[this.date][this.hour] === 'undefined'
        ) {
            allAvailable = true;
        }

        for (let table of this.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (
                !allAvailable &&
                this.booked[this.date][this.hour].includes(tableId)
            ) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }
}

export default Booking;