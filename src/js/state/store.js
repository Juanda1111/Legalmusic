import { STORAGE_KEYS, getItem, setItem } from './storage.js';

// Simple Pub/Sub State Store
class Store {
  constructor() {
    this.state = {
      currentUser: null,
      contracts: [],
      events: [],
      riders: [],
      payments: [],
      notifications: [],
      currentView: 'dashboard',
      activeFilters: {}
    };
    
    this.listeners = {};
  }

  // Suscribirse a un evento
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  // Emitir un evento
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Obtener estado actual
  getState() {
    return { ...this.state };
  }

  // Actualizar estado y notificar
  setState(key, value) {
    this.state[key] = value;
    this.emit(`${key}Changed`, value);
    this.emit('stateChanged', this.state);
  }

  // Cargar datos de localStorage
  loadFromStorage() {
    this.state.currentUser = getItem(STORAGE_KEYS.SESSION);
    this.state.contracts = getItem(STORAGE_KEYS.CONTRACTS) || [];
    this.state.events = getItem(STORAGE_KEYS.EVENTS) || [];
    this.state.riders = getItem(STORAGE_KEYS.RIDERS) || [];
    this.state.payments = getItem(STORAGE_KEYS.PAYMENTS) || [];
    
    this.emit('stateLoaded', this.state);
  }

  // Métodos específicos
  addContract(contract) {
    const contracts = [...this.state.contracts, contract];
    this.setState('contracts', contracts);
    setItem(STORAGE_KEYS.CONTRACTS, contracts);
  }

  updateContract(id, updates) {
    const contracts = this.state.contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    this.setState('contracts', contracts);
    setItem(STORAGE_KEYS.CONTRACTS, contracts);
  }

  addEvent(eventData) {
    const events = [...this.state.events, eventData];
    this.setState('events', events);
    setItem(STORAGE_KEYS.EVENTS, events);
  }
  
  updateEvent(id, updates) {
    const events = this.state.events.map(e => e.id === id ? { ...e, ...updates } : e);
    this.setState('events', events);
    setItem(STORAGE_KEYS.EVENTS, events);
  }
  
  addPayment(payment) {
    const payments = [...this.state.payments, payment];
    this.setState('payments', payments);
    setItem(STORAGE_KEYS.PAYMENTS, payments);
  }
  
  updatePayment(id, updates) {
    const payments = this.state.payments.map(p => p.id === id ? { ...p, ...updates } : p);
    this.setState('payments', payments);
    setItem(STORAGE_KEYS.PAYMENTS, payments);
  }
}

export const store = new Store();
