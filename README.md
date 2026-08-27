# LegalMusic

LegalMusic es una Single Page Application (SPA) orientada a dispositivos móviles (mobile-first), desarrollada para centralizar la gestión administrativa y operativa de estudios musicales y productores independientes. El sistema provee módulos dedicados para el ciclo de vida de contratos, programación de eventos, especificación de requerimientos técnicos (riders) y control de flujo de caja.

---

## Módulos Principales

- **Gestión de Contratos**: Implementa el seguimiento del estado de los contratos (borrador, firmado, en ejecución, finalizado) vinculado a las entidades de clientes y proyectos.
- **Control de Eventos y Riders Técnicos**: Modelo de datos relacional que asocia contratos a eventos en vivo, permitiendo la asignación de locaciones, fechas y el desglose de especificaciones técnicas (sistemas de PA, microfonía, backline y requerimientos de producción).
- **Control Financiero**: Módulo de seguimiento de flujo de transacciones, cálculo de balances pendientes y registro de pagos asociados a contratos.
- **Motor de Notificaciones**: Sistema de alertas integradas con generación de URIs para envíos vía WhatsApp y formateo de eventos exportables a formato ICS para calendarios.

---

## Arquitectura y Tecnologías

El proyecto fue construido priorizando el rendimiento, prescindiendo de frameworks reactivos de alto nivel en favor de un enfoque nativo y optimizado:

- **Core Lógico**: Vanilla JavaScript (ES6+). Implementa un patrón arquitectónico Pub/Sub para el manejo del estado global y la reactividad de los componentes de la UI.
- **Motor de Estilos**: SCSS (dart-sass) estructurado bajo el patrón 7-1, asegurando modularidad y encapsulamiento (Variables, Mixins, Base, Layout, Components, Views).
- **Build System**: Vite, utilizado para el empaquetado de assets, transpilación y servidor de desarrollo con Hot Module Replacement (HMR).
- **Capa de Persistencia**: Almacenamiento del lado del cliente mediante una abstracción de la API de `localStorage`.

---

## Requisitos del Sistema

Para el despliegue del entorno de desarrollo es necesario contar con:

- Node.js (versión >= 20.19.0, se recomienda la última versión LTS).
- Gestor de paquetes npm (incluido en la instalación de Node.js).

---

## Setup e Instalación

1. Clonar el repositorio localmente:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd LegalMusic
   ```

2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

---

## Scripts de Ejecución

### Entorno de Desarrollo
Para inicializar el servidor de desarrollo local con soporte HMR:

```bash
npm run dev
```
El servidor se expondrá por defecto en `http://localhost:5173/`. 

### Construcción para Producción
Para compilar y minificar los assets estáticos orientados a un entorno de producción:

```bash
npm run build
```
Los artefactos compilados se generarán en el directorio `/dist`, listos para ser servidos por cualquier servidor HTTP estático.

### Previsualización de Producción
Para levantar un servidor local que sirva los archivos generados en el directorio `/dist` y probar el build final:

```bash
npm run preview
```

---

## Estructura del Repositorio

```text
/
├── public/                 # Assets estáticos servidos en la raíz del proyecto
├── src/
│   ├── assets/             # Recursos multimedia procesables por Vite
│   ├── js/
│   │   ├── components/     # Módulos de UI reutilizables
│   │   ├── services/       # Lógica de negocio e integraciones
│   │   ├── state/          # Implementación del Store (Pub/Sub) y capa de persistencia
│   │   ├── utils/          # Módulos de validación, formateo y utilidades DOM
│   │   ├── views/          # Controladores de renderizado por vista
│   │   ├── main.js         # Entry point de la aplicación (hidratación inicial)
│   │   └── router.js       # Implementación de enrutamiento basado en Hash
│   └── scss/               # Arquitectura modular de hojas de estilo
│       ├── abstracts/      # Variables, funciones y mixins
│       ├── base/           # Reset CSS y tipografía global
│       ├── components/     # Definición de estilos de componentes aislados
│       ├── layout/         # Layouts maestros (Header, Bottom Nav, Container)
│       ├── views/          # Estilos acoplados a controladores de vista
│       └── main.scss       # Entry point de estilos
├── index.html              # Plantilla base del DOM
├── package.json            # Manifiesto del proyecto y scripts
└── vite.config.js          # Configuración del empaquetador Vite
```
