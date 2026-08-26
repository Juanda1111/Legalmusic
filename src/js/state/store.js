import { STORAGE_KEYS, getItem, setItem, getUserItem, setUserItem } from './storage.js';
import { contractService } from '../services/contractService.js';

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
    const userId = this.state.currentUser?.id;
    this.state.contracts = getUserItem(STORAGE_KEYS.CONTRACTS, userId) || [];
    this.state.events = getUserItem(STORAGE_KEYS.EVENTS, userId) || [];
    this.state.riders = getUserItem(STORAGE_KEYS.RIDERS, userId) || [];
    this.state.payments = getUserItem(STORAGE_KEYS.PAYMENTS, userId) || [];
    
    this.emit('stateLoaded', this.state);
  }

  // Métodos específicos
  addContract(contract) {
    const contracts = [...this.state.contracts, contract];
    this.setState('contracts', contracts);
    setUserItem(STORAGE_KEYS.CONTRACTS, this.state.currentUser?.id, contracts);

    const generatedPayments = contractService.generatePaymentSchedule(contract);
    if (generatedPayments.length > 0) {
      const payments = [...this.state.payments, ...generatedPayments];
      this.setState('payments', payments);
      setUserItem(STORAGE_KEYS.PAYMENTS, this.state.currentUser?.id, payments);
    }
  }

  updateContract(id, updates) {
    const contracts = this.state.contracts.map(c => String(c.id) === String(id) ? { ...c, ...updates } : c);
    this.setState('contracts', contracts);
    setUserItem(STORAGE_KEYS.CONTRACTS, this.state.currentUser?.id, contracts);

    const updatedContract = contracts.find(contract => String(contract.id) === String(id));
    if (!updatedContract || !('paymentFrequency' in updates || 'startDate' in updates || 'endDate' in updates || 'installmentValue' in updates || 'paymentDay' in updates || 'customDays' in updates)) return;

    const currentPayments = this.state.payments.filter(payment => String(payment.contractId) !== String(id));
    const previousPayments = this.state.payments.filter(payment => String(payment.contractId) === String(id));
    const generatedPayments = contractService.generatePaymentSchedule(updatedContract).map(payment => {
      const previous = previousPayments.find(item => item.dueDate === payment.dueDate);
      return previous ? { ...payment, id: previous.id, status: previous.status, paidDate: previous.paidDate, notes: previous.notes } : payment;
    });
    const payments = [...currentPayments, ...generatedPayments, ...previousPayments.filter(payment => payment.status === 'pagado' && !generatedPayments.some(item => item.id === payment.id))];
    this.setState('payments', payments);
    setUserItem(STORAGE_KEYS.PAYMENTS, this.state.currentUser?.id, payments);
  }

  addEvent(eventData) {
    const events = [...this.state.events, eventData];
    this.setState('events', events);
    setUserItem(STORAGE_KEYS.EVENTS, this.state.currentUser?.id, events);
  }
  
  updateEvent(id, updates) {
    const events = this.state.events.map(e => String(e.id) === String(id) ? { ...e, ...updates } : e);
    this.setState('events', events);
    setUserItem(STORAGE_KEYS.EVENTS, this.state.currentUser?.id, events);
  }

  deleteEvent(id) {
    const events = this.state.events.filter(e => String(e.id) !== String(id));
    this.setState('events', events);
    setUserItem(STORAGE_KEYS.EVENTS, this.state.currentUser?.id, events);
  }

  saveRider(rider) {
    const riders = this.state.riders.some(item => String(item.id) === String(rider.id))
      ? this.state.riders.map(item => String(item.id) === String(rider.id) ? rider : item)
      : [...this.state.riders, rider];
    this.setState('riders', riders);
    setUserItem(STORAGE_KEYS.RIDERS, this.state.currentUser?.id, riders);
  }
  
  addPayment(payment) {
    const payments = [...this.state.payments, payment];
    this.setState('payments', payments);
    setUserItem(STORAGE_KEYS.PAYMENTS, this.state.currentUser?.id, payments);
  }
  
  updatePayment(id, updates) {
    const payments = this.state.payments.map(p => String(p.id) === String(id) ? { ...p, ...updates } : p);
    this.setState('payments', payments);
    setUserItem(STORAGE_KEYS.PAYMENTS, this.state.currentUser?.id, payments);
  }

  syncPaymentStatuses() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let changed = false;
    const payments = this.state.payments.map(payment => {
      if (payment.status === 'pendiente' && contractService.parseDate(payment.dueDate) < todayStart) {
        changed = true;
        return { ...payment, status: 'atrasado' };
      }
      return payment;
    });
    if (!changed) return;
    this.setState('payments', payments);
    setUserItem(STORAGE_KEYS.PAYMENTS, this.state.currentUser?.id, payments);
  }

  deleteContract(id) {
    const contracts = this.state.contracts.filter(contract => String(contract.id) !== String(id));
    const payments = this.state.payments.filter(payment => String(payment.contractId) !== String(id));
    this.setState('contracts', contracts);
    this.setState('payments', payments);
    setUserItem(STORAGE_KEYS.CONTRACTS, this.state.currentUser?.id, contracts);
    setUserItem(STORAGE_KEYS.PAYMENTS, this.state.currentUser?.id, payments);
  }
}

export const store = new Store();
