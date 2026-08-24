import { createElement } from '../utils/dom.js';
import { icon } from './icons.js';

let toastContainer = null;

const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = createElement('div', { className: 'toast-container' });
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const typeIcons = {
  success: 'check',
  danger: 'alertTriangle',
  warning: 'alertTriangle',
  info: 'bell'
};

export const showToast = (options) => {
  const { message, type = 'info', duration = 3000 } = options;
  
  const container = getToastContainer();
  
  const iconName = typeIcons[type] || 'info';
  
  const toastHTML = `
    <div class="toast-icon">
      ${icon(iconName, 18)}
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Cerrar">
      ${icon('x', 16)}
    </button>
  `;
  
  const toastEl = createElement('div', { className: `toast toast-${type}` });
  toastEl.innerHTML = toastHTML;
  
  container.appendChild(toastEl);
  
  // Trigger reflow for animation
  void toastEl.offsetWidth;
  toastEl.classList.add('toast-show');
  
  const removeToast = () => {
    toastEl.classList.remove('toast-show');
    toastEl.classList.add('toast-hide');
    setTimeout(() => {
      if (toastEl.parentNode === container) {
        container.removeChild(toastEl);
      }
    }, 300); // transition duration
  };
  
  // Close button
  const closeBtn = toastEl.querySelector('.toast-close');
  closeBtn.addEventListener('click', removeToast);
  
  // Auto remove
  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
};
