import { icon } from './icons.js';
import { createElement, delegate } from '../utils/dom.js';

let currentModal = null;
let removeEscapeListener = null;

const normalizeModalOptions = (options, legacyContent) => {
  if (typeof options === 'string') {
    return { title: options, content: legacyContent };
  }

  return options || {};
};

export const closeModal = () => {
  const modalToClose = currentModal;

  if (removeEscapeListener) {
    removeEscapeListener();
    removeEscapeListener = null;
  }

  if (modalToClose && modalToClose.parentNode) {
    modalToClose.classList.add('modal-closing');
    
    // Enable scroll
    document.body.style.overflow = '';
    
    setTimeout(() => {
      if (modalToClose.parentNode) {
        modalToClose.parentNode.removeChild(modalToClose);
      }
      if (currentModal === modalToClose) {
        currentModal = null;
      }
    }, 300); // Wait for transition
  }
};

export const openModal = (options, legacyContent) => {
  closeModal(); // Close existing modal if any

  const { title, content, footer, onClose, className = '' } = normalizeModalOptions(options, legacyContent);

  const modalHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-container ${className}">
      <div class="modal-header">
        <h3 class="modal-title">${title || ''}</h3>
        <button class="modal-close-btn" aria-label="Cerrar">
          ${icon('x')}
        </button>
      </div>
      <div class="modal-body">
        ${content || ''}
      </div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  const modalWrapper = createElement('div', { className: 'modal-wrapper' });
  modalWrapper.innerHTML = modalHTML;
  document.body.appendChild(modalWrapper);
  
  // Disable body scroll
  document.body.style.overflow = 'hidden';
  
  currentModal = modalWrapper;
  
  // Animate in (using a tiny delay for CSS transitions)
  setTimeout(() => {
    modalWrapper.classList.add('modal-open');
  }, 10);

  // Events
  const closeBtn = modalWrapper.querySelector('.modal-close-btn');
  const overlay = modalWrapper.querySelector('.modal-overlay');

  const handleClose = () => {
    if (typeof onClose === 'function') onClose();
    closeModal();
  };

  closeBtn.addEventListener('click', handleClose);
  overlay.addEventListener('click', handleClose);
  
  // Esc key to close
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  removeEscapeListener = () => document.removeEventListener('keydown', handleEscape);

  return modalWrapper;
};

export const openConfirmDialog = (options, legacyMessage, legacyOnConfirm) => {
  const config = typeof options === 'string'
    ? {
        title: options,
        message: typeof legacyMessage === 'string' ? legacyMessage : '¿Deseas continuar?',
        onConfirm: typeof legacyMessage === 'function' ? legacyMessage : legacyOnConfirm
      }
    : options || {};
  const { title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, variant = 'primary' } = config;
  
  const content = `<p>${message}</p>`;
  
  const footer = `
    <button class="btn btn--secondary btn-cancel">${cancelText}</button>
    <button class="btn btn--${variant} btn-confirm">${confirmText}</button>
  `;

  const modal = openModal({
    title,
    content,
    footer,
    className: 'modal-confirm'
  });

  const btnCancel = modal.querySelector('.btn-cancel');
  const btnConfirm = modal.querySelector('.btn-confirm');

  btnCancel.addEventListener('click', () => {
    closeModal();
  });

  btnConfirm.addEventListener('click', () => {
    if (typeof onConfirm === 'function') onConfirm();
    closeModal();
  });
};

export const openBottomSheet = (options) => {
  return openModal({
    ...options,
    className: `bottom-sheet ${options.className || ''}`
  });
};
