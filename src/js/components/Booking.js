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
        this.markedTable=[];
        this.render(container);
        this.getElements();
        this.initWidgets();
        this.getData();
        //this.parseData();   
    }

    initWidgets() {
        const thisBooking = this;
        this.widgets.peopleAmount = new AmountWidget(this.dom.peopleAmount);
        this.widgets.hoursAmount = new AmountWidget(this.dom.hoursAmount);
        this.widgets.datePicker = new DatePicker(this.dom.datePicker);
        this.widgets.hourPicker = new HourPicker(this.dom.hourPicker);

        this.dom.wrapper.addEventListener('updated', function () {
            thisBooking.markedTable=[];
            thisBooking.clearTables();
            thisBooking.updateDOM();
        });

        this.dom.tablesWrapper.addEventListener('click', function (event) {
            event.preventDefault();
            //console.log('event', event.target);
            if (
                event.target.classList.contains(classNames.booking.table)
                &&
                !event.target.classList.contains(classNames.booking.tableBooked)                
            ) {
                const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
                //console.log('tableId', tableId);
                if (thisBooking.markedTable.includes(tableId)) {
                    thisBooking.markedTable.pop();
                }
                else {
                    thisBooking.markedTable.pop();
                    thisBooking.markedTable.push(tableId);
                }
                thisBooking.updateMarkedTable();
            }
        });

        this.dom.bookingSendButton.addEventListener('click', function (event) {
            event.preventDefault();
            thisBooking.sendBooking();
        });
    }

    clearTables() {
        for (let table of this.dom.tables) {
            table.classList.remove(classNames.booking.marked);
        }
    }
    
    updateMarkedTable() {
        const thisBooking = this;
        thisBooking.clearTables();

        if (thisBooking.markedTable.length > 0) {
            for (let table of thisBooking.dom.tables) {
                if (table.getAttribute(settings.booking.tableIdAttribute) === thisBooking.markedTable[0]) {
                    table.classList.add(classNames.booking.marked);
                }
            }
                
        }
    }

    prepareStarters() {
        const thisBooking = this;
        let starters = [];
        if (thisBooking.dom.water.checked) {
            starters.push('water');
        }
        if (thisBooking.dom.bread.checked) {
            starters.push('bread');
        }
        return starters;
    }


    sendBooking() {
        const thisBooking = this;
        const url = settings.db.url + '/' + settings.db.bookings;
        let starters = thisBooking.prepareStarters();
        const payload = {
            date: thisBooking.date,
            hour: utils.numberToHour(thisBooking.hour),
            table:  parseInt(thisBooking.markedTable[0]),
            duration: thisBooking.widgets.hoursAmount.value,
            ppl: parseInt(thisBooking.widgets.peopleAmount.value),
            starters: starters,
            phone: thisBooking.dom.phone.value,
            address: thisBooking.dom.address.value,


        };
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
            });

        thisBooking.markedTable=[];
        thisBooking.clearTables();
        thisBooking.getData();
        thisBooking.updateDOM();
    }

    getElements() {
        this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
        this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
        console.log('this.dom.hoursAmount', this.dom.hoursAmount);
        this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
        this.dom.tablesWrapper = this.dom.wrapper.querySelector(select.booking.tablesWrapper);
        this.dom.address = this.dom.wrapper.querySelector(select.booking.address);
        this.dom.phone = this.dom.wrapper.querySelector(select.booking.phone);
        this.dom.bookingSendButton = this.dom.wrapper.querySelector(select.booking.button);
        this.dom.water = this.dom.wrapper.querySelector(select.booking.water);
        this.dom.bread = this.dom.wrapper.querySelector(select.booking.bread);
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
            //console.log('thisBooking', thisBooking);
            //console.log(bookings, eventsCurrent, eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        });

        
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        
        const thisBooking = this;
        thisBooking.booked = {};
        for (let item of bookings) {
            console.log('BOOKING ITEM', item);
            this.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of eventsCurrent) {
            this.makeBooked(item.date, item.hour, item.duration, item.table);
        }

   

        const minDate = this.widgets.datePicker.minDate;
        const maxDate = this.widgets.datePicker.maxDate;

        for (let item of eventsRepeat) {
           
            if (item.repeat === 'daily') {
                for (let loopDate = minDate; loopDate<=maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        this.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
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

        let allAvailable = false;

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