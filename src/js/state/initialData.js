import { STORAGE_KEYS, getItem, setItem, getUserItem, setUserItem } from './storage.js';

export const initializeData = () => {
  // Check if seeding is already done
  if (getItem(STORAGE_KEYS.SEED_DONE)) {
    const demoUser = getItem(STORAGE_KEYS.USERS)?.find(user => user.id === 'user-1');
    if (demoUser && !getUserItem(STORAGE_KEYS.CONTRACTS, demoUser.id)) {
      ['CONTRACTS', 'EVENTS', 'RIDERS', 'PAYMENTS'].forEach(key => {
        const legacyData = getItem(STORAGE_KEYS[key]);
        if (legacyData) setUserItem(STORAGE_KEYS[key], demoUser.id, legacyData);
      });
    }
    return;
  }

  // Usuarios
  const demoUsers = [
    {
      id: 'user-1',
      name: 'Carlos Mendoza',
      email: 'admin@legalmusic.com',
      password: 'admin123', // En un sistema real esto iría hasheado
      studio: 'LegalMusic Studio',
      role: 'Administrador'
    }
  ];

  // Contratos
  const contracts = [
    { id: 'c-1', title: 'Grabación de Álbum Valentina Reyes', type: 'grabacion', client: 'Valentina Reyes', amount: 8500000, startDate: '2026-07-15', endDate: '2026-10-15', status: 'en_ejecucion', description: 'Grabación, mezcla y masterización de 10 temas.', linkedEventId: 'e-3' },
    { id: 'c-2', title: 'Mezcla y Masterización EP', type: 'mezcla', client: 'Banda Resonancia', amount: 3200000, startDate: '2026-08-01', endDate: '2026-09-30', status: 'firmado', description: 'Servicios de mezcla para 4 tracks.', linkedEventId: null },
    { id: 'c-3', title: 'Producción Musical Álbum', type: 'produccion', client: 'DJ Pulsar', amount: 12000000, startDate: '2026-06-01', endDate: '2026-12-31', status: 'en_ejecucion', description: 'Producción integral de álbum electrónico.', linkedEventId: null },
    { id: 'c-4', title: 'Sonido Festival Sonoro 2026', type: 'evento', client: 'Festival Sonoro 2026', amount: 25000000, startDate: '2026-09-20', endDate: '2026-09-22', status: 'firmado', description: 'Alquiler de backline y servicios de ingeniería de sonido FOH/Monitores.', linkedEventId: 'e-1' },
    { id: 'c-5', title: 'Alquiler Estudio Julio', type: 'alquiler', client: 'Productora Éxito', amount: 1800000, startDate: '2026-05-01', endDate: '2026-07-31', status: 'completado', description: 'Alquiler sala A por 30 horas mensuales.', linkedEventId: null }
  ];

  // Eventos
  const events = [
    { id: 'e-1', name: 'Festival Sonoro 2026', venue: 'Parque Simón Bolívar, Bogotá', date: '2026-09-21', soundcheckTime: '14:00', showTime: '20:00', capacity: 5000, status: 'programado', contractId: 'c-4', notes: 'Acceso desde las 8am.' },
    { id: 'e-2', name: 'Noche de Jazz en Vivo', venue: 'Teatro Libre, Bogotá', date: '2026-10-05', soundcheckTime: '16:00', showTime: '19:30', capacity: 300, status: 'programado', contractId: null, notes: 'Evento acústico' },
    { id: 'e-3', name: 'Lanzamiento Álbum Valentina Reyes', venue: 'Hard Rock Cafe Bogotá', date: '2026-10-20', soundcheckTime: '15:00', showTime: '21:00', capacity: 500, status: 'programado', contractId: 'c-1', notes: 'Showcase privado.' }
  ];

  // Riders Técnicos
  const riders = [
    {
      id: 'r-1', eventId: 'e-1',
      pa: 'Consola digital Yamaha CL5 - 72 canales, Sistema Line Array JBL VTX V25-II',
      monitoring: '6 mezclas de monitor, 4 packs In-Ear Shure PSM300',
      microphones: [
        { name: 'Shure SM58', qty: 6, use: 'Voces' },
        { name: 'Shure SM57', qty: 4, use: 'Instrumentos' },
        { name: 'Sennheiser e906', qty: 3, use: 'Amplificadores' },
        { name: 'AKG C414', qty: 2, use: 'Overhead Batería' },
        { name: 'Shure Beta 52A', qty: 1, use: 'Bombo' }
      ],
      backline: 'Batería Pearl Masters Maple, Amplificador Fender Twin Reverb, Ampeg SVT Classic',
      production: 'Camerino privado con aire acondicionado, 20 botellas de agua, frutas, café, acceso eléctrico independiente 220V',
      stageNotes: 'Tarima de 8x6m.'
    },
    {
      id: 'r-2', eventId: 'e-2',
      pa: 'Consola digital Allen & Heath SQ-6, Sistema Bose L1 Pro32',
      monitoring: '4 mezclas de monitor wedge, 2 In-Ear Sennheiser EW IEM G4',
      microphones: [
        { name: 'Neumann KMS 104', qty: 2, use: 'Voces' },
        { name: 'DPA 4099', qty: 4, use: 'Instrumentos acústicos' },
        { name: 'Shure SM57', qty: 2, use: 'Instrumentos' }
      ],
      backline: 'Piano Yamaha C3, Amplificador Roland JC-120, Contrabajo amplificado',
      production: 'Camerino compartido, 10 botellas de agua, toallas',
      stageNotes: 'Disposición íntima.'
    }
  ];

  // Pagos (Agosto 2026 base)
  const payments = [
    // Completado
    { id: 'p-1', contractId: 'c-5', concept: 'Pago total', amount: 1800000, dueDate: '2026-05-01', status: 'pagado', paidDate: '2026-05-02', notes: 'Transferencia bancaria' },
    
    // En Ejecución (Valentina Reyes)
    { id: 'p-2', contractId: 'c-1', concept: 'Anticipo 30%', amount: 2550000, dueDate: '2026-07-15', status: 'pagado', paidDate: '2026-07-16', notes: 'Efectivo' },
    { id: 'p-3', contractId: 'c-1', concept: 'Segundo pago', amount: 2550000, dueDate: '2026-08-30', status: 'pendiente', paidDate: null, notes: '' },
    { id: 'p-4', contractId: 'c-1', concept: 'Saldo final', amount: 3400000, dueDate: '2026-10-15', status: 'pendiente', paidDate: null, notes: '' },

    // Atrasados
    { id: 'p-5', contractId: 'c-3', concept: 'Mensualidad 2', amount: 2000000, dueDate: '2026-08-01', status: 'atrasado', paidDate: null, notes: 'Cliente solicitó prórroga.' },
    { id: 'p-6', contractId: 'c-3', concept: 'Mensualidad 1', amount: 2000000, dueDate: '2026-07-01', status: 'pagado', paidDate: '2026-07-05', notes: '' },

    // Próximos
    { id: 'p-7', contractId: 'c-4', concept: 'Anticipo 50%', amount: 12500000, dueDate: '2026-08-25', status: 'pendiente', paidDate: null, notes: 'Pendiente de factura electrónica' },
    { id: 'p-8', contractId: 'c-2', concept: 'Pago total', amount: 3200000, dueDate: '2026-09-01', status: 'pendiente', paidDate: null, notes: '' }
  ];

  // Guardar en localStorage
  setItem(STORAGE_KEYS.USERS, demoUsers);
  setUserItem(STORAGE_KEYS.CONTRACTS, 'user-1', contracts);
  setUserItem(STORAGE_KEYS.EVENTS, 'user-1', events);
  setUserItem(STORAGE_KEYS.RIDERS, 'user-1', riders);
  setUserItem(STORAGE_KEYS.PAYMENTS, 'user-1', payments);
  
  // Marcar como inicializado
  setItem(STORAGE_KEYS.SEED_DONE, true);
};
