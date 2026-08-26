export const renderActionButton = ({ label, id = '', disabled = false, disabledReason = '', className = '', data = '' }) => `
  <button class="btn btn--sm notification-action ${className}" ${id ? `id="${id}"` : ''} ${data} ${disabled ? `disabled title="${disabledReason}" aria-disabled="true"` : ''}>${label}</button>
`;