import { STORAGE_KEYS, getItem, setItem, removeItem, setUserItem } from '../state/storage.js';

export const DEMO_CREDENTIALS = {
  email: 'admin@legalmusic.com',
  password: 'admin123'
};

class AuthService {
  register(userData) {
    const users = getItem(STORAGE_KEYS.USERS) || [];
    
    // Check si el email ya existe
    if (users.find(u => u.email === userData.email)) {
      throw new Error('El correo electrónico ya está registrado.');
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: 'Administrador' // Por defecto para esta app
    };
    
    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);
    ['CONTRACTS', 'EVENTS', 'RIDERS', 'PAYMENTS', 'PEOPLE'].forEach(key => setUserItem(STORAGE_KEYS[key], newUser.id, []));
    
    // Auto login
    setItem(STORAGE_KEYS.SESSION, newUser);
    return newUser;
  }

  login(email, password) {
    const users = getItem(STORAGE_KEYS.USERS) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Credenciales inválidas.');
    }
    
    setItem(STORAGE_KEYS.SESSION, user);
    return user;
  }

  logout() {
    removeItem(STORAGE_KEYS.SESSION);
    return true;
  }

  getCurrentUser() {
    return getItem(STORAGE_KEYS.SESSION);
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

export const authService = new AuthService();
