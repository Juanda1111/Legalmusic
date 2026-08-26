export const STORAGE_KEYS = {
  USERS: 'lm_users',
  SESSION: 'lm_session',
  CONTRACTS: 'lm_contracts',
  EVENTS: 'lm_events',
  RIDERS: 'lm_riders',
  PAYMENTS: 'lm_payments',
  CONTRACT_TEMPLATES: 'lm_contract_templates',
  NOTIFICATIONS: 'lm_notifications',
  SEED_DONE: 'lm_seed_done'
};

export const getItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error al leer de localStorage [${key}]:`, error);
    return null;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error al guardar en localStorage [${key}]:`, error);
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error al eliminar de localStorage [${key}]:`, error);
  }
};

export const getUserStorageKey = (key, userId) => `${key}_${userId || 'default'}`;

export const getUserItem = (key, userId) => getItem(getUserStorageKey(key, userId));

export const setUserItem = (key, userId, value) => setItem(getUserStorageKey(key, userId), value);
