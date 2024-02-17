/* global Handlebars */

const utils = {}; // eslint-disable-line no-unused-vars

utils.createDOMFromHTML = function(htmlString) {
  let div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

utils.createPropIfUndefined = function(obj, key, value = []){
  if(!obj.hasOwnProperty(key)){
    obj[key] = value;
  }
};

utils.serializeFormToObject = function(form){
  let output = {};
  if (typeof form == 'object' && form.nodeName == 'FORM') {
    for (let field of form.elements) {
      if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
        if (field.type == 'select-multiple') {
          for (let option of field.options) {
            if(option.selected) {
              utils.createPropIfUndefined(output, field.name);
              output[field.name].push(option.value);
            }
          }
        } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
          utils.createPropIfUndefined(output, field.name);
          output[field.name].push(field.value);
        } else if(!output[field.name]) output[field.name] = [];
      }
    }
  }
  return output;
};

utils.correctPrice = function (isSelected, isDefault, price) {
  let correction = 0;
  if (isSelected && !isDefault) {
    correction += price;
  } else if (!isSelected && isDefault) {
    correction -= price;
  }
  return correction;
};

utils.shouldToggleActive = function (isSelected, isActive) {
  if (isSelected && !isActive) {
    return true;
  } else if (!isSelected && isActive) {
    return true;
  } else {
    return false;
  }
};

utils.isNumber = function (value) {
  return /^\d+$/.test(value);
};


utils.isAmountValid = function (price,min,max) {
  if (price >= min && price <= max) {
    return true;
  }
  return false;
};

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
