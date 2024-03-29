/**
 * Delays a function for the given number of milliseconds, and then calls
 * it with the arguments supplied.
 *
 * @param  {Function} fn   function
 * @param  {Number}   wait delay
 * @param  {Number}   args arguments
 * @return {Function}
 */
export const delay = (fn, wait, ...args) => setTimeout(() => fn.apply(null, args), wait);

/**
 * Returns a debounced function that will make sure the given
 * function is not triggered too much.
 *
 * @param  {Function} fn Function to debounce.
 * @param  {Number}   debounceDuration OPTIONAL. The amount of time in milliseconds for which we will debounce the
 *         function. (defaults to 100ms)
 * @return {Function}
 */
export const debounce = (fn, debounceDuration = 100) => (...args) => {
  if (!fn.debouncing) {
    fn.lastReturnVal = fn.apply(window, args);
    fn.debouncing = true;
  }
  clearTimeout(fn.debounceTimeout);
  fn.debounceTimeout = setTimeout(() => {
    fn.debouncing = false;
  }, debounceDuration);
  return fn.lastReturnVal;
};

export const isString = obj => obj === '' + obj;

export const isArray = obj => Object.prototype.toString.call(obj) === '[object Array]';

export const isNumberLike = (obj) =>
  (obj !== null && obj !== undefined && ((isString(obj) && isFinite(parseFloat(obj))) || (isFinite(obj))));

export const getFirsNumberLike = (...args) => {
  if (!args.length) {
    return null;
  }

  for (let i = 0, len = args.length; i < len; i++) {
    if (isNumberLike(args[i])) {
      return args[i];
    }
  }

  return null;
};

export const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

export const simpleExtend = (defaultOpt, options) => {
  const opt = {};

  for (let key in defaultOpt) {
    opt[key] = defaultOpt[key];
  }
  for (let key in options) {
    opt[key] = options[key];
  }

  return opt;
};

export const between = (pos, min, max) => {
  if (pos < min) {
    return min;
  }
  if (pos > max) {
    return max;
  }
  return pos;
};

//lacking uuid
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
