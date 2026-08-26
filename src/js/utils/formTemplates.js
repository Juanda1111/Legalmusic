export const EVENT_TEMPLATES = {
  concierto: {
    name: 'Concierto', venue: '', artist: '', capacity: 500, soundcheckTime: '15:00', showTime: '20:00', notes: 'Confirmar llegada del artista, prueba de sonido y requerimientos técnicos.'
  },
  lanzamiento: {
    name: 'Lanzamiento de álbum', venue: '', artist: '', capacity: 300, soundcheckTime: '16:00', showTime: '21:00', notes: 'Coordinar prensa, acceso y prueba de sonido.'
  },
  showcase: {
    name: 'Showcase privado', venue: '', artist: '', capacity: 150, soundcheckTime: '17:00', showTime: '20:00', notes: 'Confirmar invitados y horario de llegada.'
  }
};

export const RIDER_TEMPLATES = {
  banda: {
    pa: 'Sistema PA estéreo para banda en vivo.', monitoring: '4 mezclas de monitor y 2 sistemas In-Ear.', backline: 'Batería, amplificador de bajo y amplificadores de guitarra.', production: 'Camerino, agua, café y alimentación para la banda.', stageNotes: 'Dejar espacio para batería y backline.', microphones: [{ name: 'Shure SM58', quantity: 2, use: 'Voces' }, { name: 'Shure SM57', quantity: 3, use: 'Instrumentos' }]
  },
  dj: {
    pa: 'Sistema PA estéreo con subwoofers.', monitoring: 'Monitor de cabina y retorno estéreo.', backline: 'Mesa para DJ, alimentación eléctrica y controladora.', production: 'Camerino, agua y alimentación para el artista.', stageNotes: 'Preparar conexión eléctrica independiente en cabina.', microphones: [{ name: 'Shure SM58', quantity: 1, use: 'Presentaciones' }]
  },
  acustico: {
    pa: 'Sistema PA compacto para formato acústico.', monitoring: '2 mezclas de monitor.', backline: '2 pies de micrófono y línea para instrumentos acústicos.', production: 'Agua y espacio de preparación para el artista.', stageNotes: 'Montaje íntimo con sillas y atriles.', microphones: [{ name: 'Shure SM58', quantity: 1, use: 'Voz' }, { name: 'DI Box', quantity: 2, use: 'Instrumentos acústicos' }]
  }
};

export const CONTRACT_TEMPLATES = {
  grabacion: {
    title: 'Contrato de grabación', type: 'grabacion', paymentFrequency: 'mensual', installmentValue: '', paymentDay: 1, customDays: '', description: 'Grabación, mezcla y masterización de material musical.', status: 'borrador'
  },
  evento: {
    title: 'Contrato para evento', type: 'evento', paymentFrequency: 'unico', installmentValue: '', paymentDay: '', customDays: '', description: 'Servicios de producción y operación técnica para evento.', status: 'borrador'
  },
  produccion: {
    title: 'Contrato de producción musical', type: 'produccion', paymentFrequency: 'mensual', installmentValue: '', paymentDay: 1, customDays: '', description: 'Producción integral de proyecto musical.', status: 'borrador'
  }
};