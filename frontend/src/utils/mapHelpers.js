import L from 'leaflet';

export const RAIL_ROUTE = [
  [28.6429, 77.2191], // Delhi Railway Yard
  [27.4924, 77.6737], // Mathura
  [27.1578, 77.9609], // Agra
  [26.2183, 78.1828], // Gwalior
  [25.4484, 78.5685], // Jhansi
  [24.4822, 77.7241], // Bina
  [23.2599, 77.4126], // Bhopal
  [22.6133, 77.7554], // Itarsi
  [21.8286, 76.3533], // Khandwa
  [21.0478, 75.7876], // Bhusawal
  [20.2520, 74.4363], // Manmad
  [19.9975, 73.7898], // Nasik
  [19.2346, 73.1360], // Kalyan
  [19.0178, 72.8478], // Mumbai Railway Yard (Handover Point)
];

export const ROAD_ROUTE = [
  [19.0178, 72.8478], // Mumbai Railway Yard
  [19.0390, 72.8619], // Sion
  [19.0650, 72.8794], // Kurla
  [19.0863, 72.9080], // Ghatkopar
  [19.1136, 72.9060], // Mumbai Warehouse (Destination)
];

export const ROAD_ROUTE_DEVIATION = [
  [19.0178, 72.8478], // Mumbai Railway Yard
  [19.0390, 72.8619], // Sion
  [19.0433, 72.8188], // Bandra Reclamation (Deviating West!)
  [19.1000, 72.8250], // Juhu Beach
  [19.1350, 72.8150], // Versova (Way off route)
];

// Helper to create circular map markers using pure Tailwind-style HTML wrapper
export const createTrainIcon = (isActive) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center w-9 h-9 bg-blue-600 border-2 border-white rounded-full shadow-md text-white ${isActive ? 'pulse-marker-active' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="3" width="16" height="16" rx="2" />
          <path d="M4 11h16" />
          <path d="M12 3v8" />
          <path d="m8 19-2 2" />
          <path d="m16 19 2 2" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const createTruckIcon = (isActive, isAlert) => {
  const bgClass = isAlert ? 'bg-red-600 pulse-alert-red' : 'bg-amber-500';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center w-9 h-9 ${bgClass} border-2 border-white rounded-full shadow-md text-white ${isActive ? 'pulse-marker-active' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-5.1a1 1 0 0 0-.3-.7l-3.7-3.7A1 1 0 0 0 17.3 7H14" />
          <circle cx="7.5" cy="18.5" r="2.5" />
          <circle cx="17.5" cy="18.5" r="2.5" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const createAlertIcon = () => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="flex items-center justify-center w-9 h-9 bg-red-600 border-2 border-white rounded-full shadow-md text-white pulse-alert-red">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const createWarehouseIcon = () => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="flex items-center justify-center w-9 h-9 bg-emerald-600 border-2 border-white rounded-full shadow-md text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21h18" />
          <path d="M3 7v1a3 3 0 0 0 6 0v-1" />
          <path d="M9 8a3 3 0 0 0 6 0v-1" />
          <path d="M15 8a3 3 0 0 0 6 0v-1" />
          <path d="M4 4h16v3H4z" />
          <path d="M12 12v9" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};
