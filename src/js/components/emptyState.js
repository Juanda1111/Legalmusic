import { icon } from './icons.js';

export const renderEmptyState = ({ iconName, title, description, actionId, actionLabel, compact = false, page = false }) => `
  <div class="empty-state${compact ? ' empty-state--compact' : ''}${page ? ' empty-state--page' : ''}">
    <div class="empty-state__icon">${icon(iconName, 32)}</div>
    <strong class="empty-state__title">${title}</strong>
    <p class="empty-state__text">${description}</p>
    ${actionId && actionLabel ? `<button class="btn btn--primary btn--sm empty-state__action" id="${actionId}">${icon('plus', 16)} ${actionLabel}</button>` : ''}
  </div>
`;