import { STORAGE_KEYS, getItem, setItem } from '../state/storage.js';

const getTemplateKey = () => {
  const session = getItem(STORAGE_KEYS.SESSION);
  return `${STORAGE_KEYS.CONTRACT_TEMPLATES}_${session?.id || 'default'}`;
};

export const getSavedContractTemplates = () => getItem(getTemplateKey()) || [];

export const saveContractTemplate = (name, data) => {
  const templates = [...getSavedContractTemplates(), { id: `template-${Date.now()}`, name, data }];
  setItem(getTemplateKey(), templates);
  return templates;
};