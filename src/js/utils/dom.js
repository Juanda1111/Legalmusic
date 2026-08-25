export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

export const createElement = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (value !== null && value !== undefined) {
      el.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
};

export const on = (element, event, handler, options = false) => {
  if (element) {
    element.addEventListener(event, handler, options);
  }
};

export const delegate = (parent, selector, event, handler) => {
  on(parent, event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e, target);
    }
  });
};

export const clearElement = (el) => {
  if (el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
};

export const show = (el) => {
  if (el) el.style.display = '';
};

export const hide = (el) => {
  if (el) el.style.display = 'none';
};

export const toggle = (el, condition) => {
  if (el) {
    const shouldShow = condition !== undefined ? condition : el.style.display === 'none';
    el.style.display = shouldShow ? '' : 'none';
  }
};
