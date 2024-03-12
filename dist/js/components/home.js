import { select, settings, templates, classNames } from '../settings.js';
import app from '../app.js';

class Home {
    constructor() {
        this.dom = {};
        
        this.getElements();
        this.initLinks();
   
    }

    initLinks() {

        this.dom.order.addEventListener('click', function () {
            console.log('order clicked');
            app.activatePage('order');
        });

        this.dom.book.addEventListener('click', function () {
            console.log('book clicked');
            app.activatePage('booking');
        });

    }

    getElements() {
        this.dom.order = document.querySelector(select.home.order);
        this.dom.book = document.querySelector(select.home.book);
    } 
}

export default Home;