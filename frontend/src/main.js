/**
 * FreightPulse - Multimodal Operations & Connected Driver Dispatch
 * Functional enterprise dashboard with real-time two-way synchronization.
 */

let appState = {
  viewMode: 'split', // 'split' | 'admin' | 'driver'
  selectedVehicleId: 'VEH-01',
  driverLang: 'hinglish', // 'hinglish' | 'english'
  showQrModal: false,
  map: null,
  simulationActive: false,
  simulationInterval: null,
  vehicleMarkers: [],
  paths: {
    'VEH-01': [
      { coords: [30.9010, 75.8573], loc: 'ICD Ludhiana Yard' },
      { coords: [30.0000, 76.1000], loc: 'Ambala Line Junction' },
      { coords: [29.1000, 76.4000], loc: 'Rohtak Rail Bypass' },
      { coords: [28.1920, 76.6180], loc: 'Rewari WDFC Corridor' },
      { coords: [27.2000, 75.6000], loc: 'Jaipur Outer Yard' },
      { coords: [26.1000, 74.5000], loc: 'Ajmer Siding Segment' },
      { coords: [25.1000, 73.5000], loc: 'Abu Road Siding' },
      { coords: [24.1724, 72.4346], loc: 'Palanpur Siding, Gujarat Border' },
      { coords: [23.5000, 71.1000], loc: 'Mahesana Transit Loop' },
      { coords: [22.8390, 69.7042], loc: 'Mundra Port Berth 2 Gate-In' }
    ],
    'VEH-02': [
      { coords: [28.4595, 77.0266], loc: 'Gurugram Warehouse' },
      { coords: [28.3200, 76.8100], loc: 'Dharuhera Logistics Hub' },
      { coords: [28.1920, 76.6180], loc: 'NH-48 Shahjahanpur / Kotputli' },
      { coords: [27.3500, 75.8200], loc: 'Kotputli Bypass Road' },
      { coords: [26.5000, 74.9000], loc: 'Ajmer Link Highway' },
      { coords: [25.6000, 73.9500], loc: 'Beawar Road Toll Plaza' },
      { coords: [24.7000, 73.0000], loc: 'Sirohi Expressway Segment' },
      { coords: [23.9000, 72.0000], loc: 'Palanpur Link Road' },
      { coords: [23.3000, 70.8000], loc: 'Bhachau Crossing' },
      { coords: [22.8390, 69.7042], loc: 'Mundra Port Entrance Gate' }
    ],
    'VEH-03': [
      { coords: [28.5600, 77.5500], loc: 'ICD Dadri Yard' },
      { coords: [27.5000, 77.0000], loc: 'Mathura DFC Junction' },
      { coords: [26.2000, 76.2000], loc: 'Sawai Madhopur Corridor' },
      { coords: [24.8000, 75.5000], loc: 'Kota DFC Bypass' },
      { coords: [23.5000, 74.8000], loc: 'Ratlam West Line' },
      { coords: [22.2000, 74.1000], loc: 'Dahod Station Loop' },
      { coords: [21.2000, 73.5000], loc: 'Surat DFC Siding' },
      { coords: [20.2000, 73.0000], loc: 'Valsad Freight Track' },
      { coords: [19.2000, 72.8500], loc: 'Kalyan Inbound Track' },
      { coords: [18.9500, 72.9500], loc: 'JNPT Port, Mumbai' }
    ]
  },
  vehicles: [
    {
      id: 'VEH-01',
      code: 'TRN-9021',
      vehicleName: 'Electric Freight Rake RK-9021',
      type: 'TRAIN',
      driver: 'Suresh Yadav (Loco Pilot)',
      driverPhone: '+91 98765-43210',
      cargo: 'Punjab Oranges (Kinnow, 26 Tons)',
      route: 'Ludhiana ICD → Mundra Port (1,280 km)',
      currentLocation: 'Palanpur Siding, Gujarat Border',
      speedKmh: 74,
      tempCelsius: 5.1,
      targetTemp: '4.5°C',
      eta: 'Today 18:00 (Revised: Tomorrow 03:30)',
      status: 'PORT_DELAY', // 'ON_TIME' | 'PORT_DELAY' | 'HELD' | 'HIGHWAY_JAM' | 'REROUTED'
      delayMins: 210,
      delayReason: 'Mundra Berth 2 vessel delayed by 10 hours (Tidal storm).',
      dispatchOrder: 'HOLD train at Palanpur Station cold-shed for 4 hours.',
      alertHinglish: 'Gujarat Mundra Port par jahaaz 10 ghante late ho gaya hai. Gaadi ko Palanpur station cold-shed me 4 ghante ROKO (HOLD). Port par dhoop me khade hone se bachein.',
      alertEnglish: 'Vessel delayed by 10 hours at Mundra Port. HOLD train at Palanpur station cold-shed for 4 hours to avoid open-yard demurrage fines and fruit spoilage.',
      savings: '₹32,000 Port Fine Avoided',
      acknowledged: false,
      pathIndex: 7,
      coords: [24.1724, 72.4346],
      legs: [
        { name: 'Truck (Farm → ICD Ludhiana)', mode: 'ROAD', time: '19 Aug 06:00 → 10:45', status: 'DONE', delay: '+45m' },
        { name: 'ICD Staging & Customs Scan', mode: 'ICD', time: '19 Aug 10:45 → 15:30', status: 'DONE', delay: '+90m' },
        { name: 'WDFC Electric Freight Rail', mode: 'RAIL', time: '19 Aug 16:00 → Active', status: 'ACTIVE', delay: '+60m' },
        { name: 'Mundra Port Berth 2 Gate-In', mode: 'PORT', time: 'Pending Arrival', status: 'WAITING', delay: '+10h Port Delay' },
        { name: 'Ocean Vessel (Dubai Export)', mode: 'SHIP', time: 'New Berth: 21 Aug 03:30', status: 'PLANNED', delay: 'Rebooked' }
      ]
    },
    {
      id: 'VEH-02',
      code: 'TRK-4491',
      vehicleName: 'Truck HR-55-AB-4491 (Ashok Leyland)',
      type: 'TRUCK',
      driver: 'Ramesh Singh (Truck Driver)',
      driverPhone: '+91 99887-11223',
      cargo: 'Auto Spare Parts (18 Tons)',
      route: 'Gurugram → Mundra Port (1,150 km)',
      currentLocation: 'NH-48 Shahjahanpur / Kotputli',
      speedKmh: 8,
      tempCelsius: null,
      eta: 'Today 22:00',
      status: 'HIGHWAY_JAM',
      delayMins: 180,
      delayReason: 'NH-48 Shahjahanpur toll 4.5-hour traffic bottleneck.',
      dispatchOrder: 'REROUTE: Divert to Rewari ICD and load on WDFC rail.',
      alertHinglish: 'Aage NH-48 toll par 4.5 ghante ka jam hai. Truck ko turant paas ke Rewari Railway Station le jaakar maalgadi par load karein.',
      alertEnglish: 'Highway jam ahead (4.5 hours delay). Divert truck to nearest Rewari Railway Station and load cargo onto the freight train.',
      savings: '3.5 Hours & ₹45,000 Penalty Saved',
      acknowledged: false,
      pathIndex: 2,
      coords: [28.1920, 76.6180],
      legs: [
        { name: 'Gurugram Facility Dispatch', mode: 'ROAD', time: '20 Aug 08:00 → Active', status: 'ACTIVE', delay: '+4.5h Jam' },
        { name: 'Rewari Intermodal Rake Transfer', mode: 'RAIL', time: 'Reroute Assigned', status: 'PLANNED', delay: 'Express Rake' },
        { name: 'Mundra Port Gate Entry', mode: 'PORT', time: 'Pending', status: 'PLANNED', delay: 'On Schedule' }
      ]
    },
    {
      id: 'VEH-03',
      code: 'TRN-411',
      vehicleName: 'WDFC Superfast Freight Rake-411',
      type: 'TRAIN',
      driver: 'Vikram Joshi (Loco Pilot)',
      driverPhone: '+91 97112-99887',
      cargo: 'Solar Inverters & High-Tech (22 Tons)',
      route: 'ICD Dadri, Noida → JNPT Port, Mumbai (1,420 km)',
      currentLocation: 'Western DFC Track (Speed: 75 km/h)',
      speedKmh: 75,
      tempCelsius: null,
      eta: 'Tomorrow 08:00',
      status: 'ON_TIME',
      delayMins: 0,
      delayReason: 'All railway tracks, sidings, and port berths on schedule.',
      dispatchOrder: 'PROCEED on schedule.',
      alertHinglish: 'Rasta bilkul clear hai. Apni normal speed par chalte rahein. Sabhi berths confirmed hain.',
      alertEnglish: 'All signals and berths clear. Proceed at normal speed.',
      savings: 'On Schedule',
      acknowledged: true,
      pathIndex: 7,
      coords: [20.9042, 74.7749],
      legs: [
        { name: 'ICD Dadri WDFC Departure', mode: 'RAIL', time: '19 Aug 20:15 → Active', status: 'ACTIVE', delay: 'On Time' },
        { name: 'JNPT Port Rake Siding', mode: 'PORT', time: '20 Aug 22:00', status: 'PLANNED', delay: 'On Time' }
      ]
    }
  ]
};

function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;

  const currentVeh = appState.vehicles.find(v => v.id === appState.selectedVehicleId) || appState.vehicles[0];

  root.innerHTML = `
    <!-- Top Enterprise Navigation -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        <!-- Logo & Status -->
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
            FP
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-sm sm:text-base tracking-tight">FreightPulse</span>
              <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold border border-slate-200">
                Multimodal Dispatch Tower
              </span>
            </div>
            <div class="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
              <span class="inline-flex items-center gap-1 text-emerald-600 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> FASTag</span>
              <span>&bull;</span>
              <span class="inline-flex items-center gap-1 text-blue-600 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> CRIS FOIS</span>
              <span>&bull;</span>
              <span class="inline-flex items-center gap-1 text-cyan-600 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> PCS1x Port</span>
            </div>
          </div>
        </div>

        <!-- View Switcher -->
        <div class="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button onclick="setViewMode('split')" class="px-2.5 py-1.5 rounded-lg transition-all ${appState.viewMode === 'split' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            🖥️ 📱 Connected Split
          </button>
          <button onclick="setViewMode('admin')" class="px-2.5 py-1.5 rounded-lg transition-all ${appState.viewMode === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            🖥️ Admin Tower
          </button>
          <button onclick="setViewMode('driver')" class="px-2.5 py-1.5 rounded-lg transition-all ${appState.viewMode === 'driver' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            📱 Driver App
          </button>
          <button onclick="setViewMode('shipper')" class="px-2.5 py-1.5 rounded-lg transition-all ${appState.viewMode === 'shipper' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            📊 Shipper (Company)
          </button>
          <button onclick="setViewMode('port')" class="px-2.5 py-1.5 rounded-lg transition-all ${appState.viewMode === 'port' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            ⚓ Port Operator
          </button>
        </div>

        <!-- Simulation Control -->
        <div class="flex items-center gap-2">
          <button onclick="toggleSimulation()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${appState.simulationActive ? 'bg-rose-600 hover:bg-rose-700 animate-pulse border-2 border-rose-300' : 'bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-500'}">
            ${appState.simulationActive ? '⏸️ Stop Auto-Sim' : '▶️ Run Auto-Sim'}
          </button>
        </div>

      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      
      <!-- Top Operational KPI Ribbon -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-slate-500 font-medium">Active Fleet Consignments</span>
          <div class="text-lg font-bold text-slate-900 mt-0.5">3 Units Tracked</div>
          <span class="text-[11px] text-slate-400 font-mono">2 Trains (WDFC) &bull; 1 Truck</span>
        </div>

        <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-slate-500 font-medium">Pending Driver Alerts</span>
          <div class="text-lg font-bold ${appState.vehicles.some(v => !v.acknowledged) ? 'text-rose-600 animate-pulse' : 'text-emerald-600'} mt-0.5">
            ${appState.vehicles.filter(v => !v.acknowledged).length} Requires Action
          </div>
          <span class="text-[11px] text-slate-400 font-mono">Live Dispatch Sync</span>
        </div>

        <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-slate-500 font-medium">Port Demurrage Avoided</span>
          <div class="text-lg font-bold text-emerald-600 mt-0.5">₹77,000 Saved</div>
          <span class="text-[11px] text-emerald-600 font-mono font-medium">Via Predictive Hold Orders</span>
        </div>

        <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-slate-500 font-medium">Carbon Abatement</span>
          <div class="text-lg font-bold text-blue-600 mt-0.5">128.4 MT CO₂</div>
          <span class="text-[11px] text-blue-600 font-mono font-medium">Electric DFC Modal Shift</span>
        </div>
      </div>

      <!-- Main Layout -->
      ${renderWorkspace(currentVeh)}

    </main>

    <!-- Digital QR Gate Pass Modal -->
    ${appState.showQrModal ? renderQrModal(currentVeh) : ''}
  `;

  if (appState.viewMode === 'split' || appState.viewMode === 'admin') {
    setTimeout(initConnectedMap, 60);
  }
}

function renderWorkspace(currentVeh) {
  if (appState.viewMode === 'admin') {
    return `<div class="max-w-5xl mx-auto space-y-4">${renderAdminTower(currentVeh)}</div>`;
  }
  if (appState.viewMode === 'driver') {
    return `<div class="max-w-md mx-auto">${renderDriverPhone(currentVeh)}</div>`;
  }
  if (appState.viewMode === 'shipper') {
    return renderShipperDashboard();
  }
  if (appState.viewMode === 'port') {
    return renderPortOperatorDashboard();
  }

  // Side-by-Side Connected View
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div class="lg:col-span-7 space-y-4">
        ${renderAdminTower(currentVeh)}
      </div>

      <div class="lg:col-span-5 space-y-4">
        ${renderDriverPhone(currentVeh)}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 1. ADMIN DISPATCH TOWER (Functional Control Center)
// -------------------------------------------------------------
function renderAdminTower(currentVeh) {
  const isDelay = currentVeh.status.includes('DELAY') || currentVeh.status.includes('JAM');

  return `
    <div class="space-y-4">
      
      <!-- Fleet Vehicles Matrix -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Live Fleet Monitoring Matrix (Click to Inspect)
          </h2>
          <span class="text-[11px] font-mono text-slate-400">Select vehicle to manage dispatch</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          ${appState.vehicles.map(v => {
            const isSelected = v.id === appState.selectedVehicleId;
            const isVDelay = v.status.includes('DELAY') || v.status.includes('JAM');
            return `
              <div 
                onclick="selectVehicle('${v.id}')"
                class="p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900">${v.type === 'TRAIN' ? '🚂' : '🚚'} ${v.code}</span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    v.status === 'HELD' ? 'bg-purple-100 text-purple-800' :
                    v.status === 'REROUTED' ? 'bg-teal-100 text-teal-800' :
                    isVDelay ? 'bg-rose-100 text-rose-800 animate-pulse' :
                    'bg-emerald-100 text-emerald-800'
                  }">
                    ${v.status === 'HELD' ? 'HELD' : v.status === 'REROUTED' ? 'REROUTED' : isVDelay ? 'DELAY ALERT' : 'ON TIME'}
                  </span>
                </div>
                <div class="font-semibold text-slate-800 mt-1 truncate">${v.cargo}</div>
                <div class="text-[11px] text-slate-500 truncate">${v.route}</div>

                <div class="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span class="text-slate-400">Driver Status:</span>
                  <span class="font-bold ${v.acknowledged ? 'text-emerald-600' : isVDelay ? 'text-rose-600 font-bold' : 'text-slate-600'}">
                    ${v.acknowledged ? '✓ Confirmed' : isVDelay ? '⚠️ Waiting Ack' : '✓ Normal'}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Functional Dispatch Control Unit -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-900">Dispatch Order Control Unit</span>
            <span class="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
              ${currentVeh.vehicleName}
            </span>
          </div>
          <span class="text-xs text-slate-500 font-mono">Driver: ${currentVeh.driver}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button 
            onclick="adminSendOrder('${currentVeh.id}', 'PORT_DELAY')"
            class="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200 transition-colors text-left"
          >
            🚨 Trigger Port Delay (+10h) → Order HOLD
          </button>

          <button 
            onclick="adminSendOrder('${currentVeh.id}', 'HIGHWAY_JAM')"
            class="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition-colors text-left"
          >
            ⚠️ Trigger Highway Jam (+4.5h) → Order REROUTE
          </button>

          <button 
            onclick="adminSendOrder('${currentVeh.id}', 'ON_TIME')"
            class="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition-colors text-left"
          >
            ✅ Clear Disruption → Order PROCEED
          </button>
        </div>

        <!-- Current Active Order Summary -->
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <span class="text-slate-500 font-medium block">Current AI Dispatch Order:</span>
            <span class="font-bold text-slate-900">${currentVeh.dispatchOrder}</span>
          </div>
          <div class="text-right">
            <span class="text-slate-500 font-medium block">Driver Response:</span>
            <span class="font-mono font-bold ${currentVeh.acknowledged ? 'text-emerald-600' : 'text-rose-600'}">
              ${currentVeh.acknowledged ? '✓ ACKNOWLEDGED' : '⚠️ PENDING DRIVER ACTION'}
            </span>
          </div>
        </div>
      </div>

      <!-- Interactive Route Map & Handoff Timeline -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <!-- Live Route Map -->
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-900">Corridor Route (Ludhiana → Mundra)</span>
            <span class="text-[11px] text-slate-500 font-mono">${currentVeh.speedKmh} km/h</span>
          </div>
          <div id="connected-map" class="w-full h-48 bg-slate-100 rounded-lg border border-slate-200"></div>
          <div class="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>● Ludhiana ICD</span>
            <span>● Palanpur Siding</span>
            <span>● Mundra Port</span>
          </div>
        </div>

        <!-- 4-Step Handoff Stepper for Selected Vehicle -->
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <span class="text-xs font-bold text-slate-900">Multimodal Handoff Legs</span>
          
          <div class="space-y-1.5 text-xs">
            ${currentVeh.legs.map((leg, idx) => `
              <div class="p-2 rounded border flex items-center justify-between ${
                leg.status === 'ACTIVE' ? 'border-blue-400 bg-blue-50/60 font-bold' :
                leg.status === 'DONE' ? 'border-slate-200 bg-slate-50 text-slate-600' :
                'border-slate-200 bg-white text-slate-400'
              }">
                <div class="truncate">
                  <span class="text-[10px] font-mono px-1 bg-slate-200 text-slate-700 rounded mr-1">${leg.mode}</span>
                  <span class="text-slate-800 text-[11px]">${leg.name}</span>
                </div>
                <span class="text-[10px] font-mono shrink-0 ${leg.delay.includes('+') ? 'text-amber-700 font-bold' : 'text-slate-500'}">
                  ${leg.delay}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// 2. DRIVER MOBILE PHONE APP (Clean, Functional, Driver-Friendly)
// -------------------------------------------------------------
function renderDriverPhone(vehicle) {
  const isHinglish = appState.driverLang === 'hinglish';
  const isDelay = vehicle.status.includes('DELAY') || vehicle.status.includes('JAM');

  return `
    <div class="bg-slate-900 p-3.5 rounded-3xl border-4 border-slate-800 shadow-2xl space-y-3 max-w-sm mx-auto text-white relative overflow-hidden">
      
      <!-- ⭐ REAL-TIME LIVE PUSH NOTIFICATION POPUP OVERLAY ⭐ -->
      ${isDelay && !vehicle.acknowledged ? `
        <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 rounded-2xl">
          <div class="bg-rose-600 text-white p-5 rounded-2xl shadow-2xl border-2 border-rose-400 space-y-3.5 text-center">
            
            <div class="flex flex-col items-center gap-1.5">
              <span class="w-12 h-12 bg-rose-800 text-white rounded-full flex items-center justify-center text-2xl font-bold animate-pulse shadow-md">
                🚨
              </span>
              <span class="text-xs font-black uppercase tracking-wider bg-rose-900 px-2.5 py-1 rounded font-mono mt-1">
                NEW DISPATCH ORDER
              </span>
              <span class="text-[11px] font-bold text-rose-200 font-mono">+${vehicle.delayMins}m Predicted Delay</span>
            </div>

            <p class="text-xs text-rose-50 leading-relaxed font-semibold">
              ${isHinglish ? vehicle.alertHinglish : vehicle.alertEnglish}
            </p>

            <div class="bg-rose-800/80 p-2.5 rounded-lg font-mono font-bold text-[11px] border border-rose-500/30">
              👉 COMMAND: ${vehicle.dispatchOrder}
            </div>

            <!-- 1-Tap Acknowledge Button -->
            <button 
              onclick="driverAcknowledge('${vehicle.id}')" 
              class="w-full py-3 px-4 bg-white hover:bg-slate-100 text-rose-700 font-black rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 border-2 border-white"
            >
              <span>👉 ${isHinglish ? 'OK, Samjh Gaya (Confirm)' : 'Acknowledge & Confirm Order'}</span>
            </button>
            
          </div>
        </div>
      ` : ''}

      <!-- Phone Top Bar -->
      <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
        <span>09:41</span>
        <div class="w-14 h-3 bg-slate-800 rounded-full mx-auto"></div>
        <span>5G ● 96%</span>
      </div>

      <!-- Driver Profile Card -->
      <div class="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow">
            ${vehicle.type === 'TRAIN' ? '👨‍✈️' : '🚚'}
          </div>
          <div>
            <div class="text-xs font-bold text-white">${vehicle.driver}</div>
            <div class="text-[10px] text-slate-400 font-mono">${vehicle.vehicleName}</div>
          </div>
        </div>

        <div class="text-[10px] bg-slate-900 p-0.5 rounded-lg border border-slate-700 flex">
          <button onclick="setDriverLang('hinglish')" class="px-1.5 py-0.5 rounded ${isHinglish ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}">
            Hinglish
          </button>
          <button onclick="setDriverLang('english')" class="px-1.5 py-0.5 rounded ${!isHinglish ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}">
            English
          </button>
        </div>
      </div>

      <!-- ⭐ POST-ACKNOWLEDGMENT DISPATCH STATUS CARD ⭐ -->
      ${vehicle.status === 'HELD' ? `
        <div class="bg-purple-900/60 border border-purple-500/50 p-3.5 rounded-2xl text-xs space-y-1">
          <div class="font-bold text-purple-300">🛑 Train Held Safely at Palanpur Station</div>
          <div class="text-slate-300 text-[11px]">Engine idle. Waiting for 03:30 AM vessel berthing window. ${vehicle.savings}.</div>
        </div>
      ` : vehicle.status === 'REROUTED' ? `
        <div class="bg-teal-900/60 border border-teal-500/50 p-3.5 rounded-2xl text-xs space-y-1">
          <div class="font-bold text-teal-300">⚡ Rerouted to Rewari WDFC Rail</div>
          <div class="text-slate-300 text-[11px]">Cargo loaded on electric freight train. Highway jam bypassed.</div>
        </div>
      ` : `
        <div class="bg-emerald-900/60 border border-emerald-500/50 p-3.5 rounded-2xl text-xs flex items-center gap-2.5">
          <span class="text-lg">✓</span>
          <div>
            <div class="font-bold text-emerald-300">All Signals Clear</div>
            <div class="text-slate-300 text-[11px]">No delay ahead. Proceed on normal schedule.</div>
          </div>
        </div>
      `}

      <!-- Live Vehicle Gauges & Telemetry -->
      <div class="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 space-y-2 text-xs">
        <div class="flex items-center justify-between border-b border-slate-700 pb-1.5">
          <span class="text-slate-400 font-bold uppercase text-[10px] font-mono">Assigned Cargo</span>
          <span class="font-mono font-bold text-blue-400">${vehicle.code}</span>
        </div>

        <div class="space-y-1.5 text-[11px] text-slate-300">
          <div class="flex justify-between">
            <span class="text-slate-400">Cargo:</span>
            <span class="font-bold text-white">${vehicle.cargo}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Destination:</span>
            <span class="text-white">${vehicle.route.split('→')[1]}</span>
          </div>
          ${vehicle.tempCelsius ? `
            <div class="flex justify-between">
              <span class="text-slate-400">Cold Chain Reefer:</span>
              <span class="font-bold text-emerald-400">${vehicle.tempCelsius}°C (Optimal)</span>
            </div>
          ` : ''}
          <div class="flex justify-between">
            <span class="text-slate-400">Live Speed:</span>
            <span class="font-bold text-blue-400 font-mono">${vehicle.speedKmh} km/h</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Driver Tools -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <button onclick="toggleQrModal(true)" class="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-left transition-colors">
          <div class="text-base">📲</div>
          <div class="font-bold text-white text-[11px]">Gate Pass QR</div>
          <div class="text-[9px] text-slate-400">Scan at Toll/Port</div>
        </button>

        <a href="tel:1800112233" class="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-left transition-colors block">
          <div class="text-base">📞</div>
          <div class="font-bold text-white text-[11px]">Call Control Room</div>
          <div class="text-[9px] text-slate-400">24/7 Dispatch Desk</div>
        </a>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// DIGITAL QR MODAL
// -------------------------------------------------------------
function renderQrModal(veh) {
  return `
    <div class="fixed inset-0 bg-slate-950/75 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-xs w-full p-5 text-center space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
          <span class="text-xs font-bold text-slate-800">Digital Gate Pass</span>
          <button onclick="toggleQrModal(false)" class="text-slate-400 hover:text-slate-700 text-sm font-bold">&times;</button>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <div class="w-32 h-32 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs p-2 text-center">
            [ FASTAG & PCS1X VERIFIED QR ]
          </div>
          <span class="text-[11px] font-mono font-bold text-slate-700 mt-2">${veh.code} - ${veh.id}</span>
        </div>

        <div class="text-[11px] text-slate-500">
          Scan this QR at Toll Plazas and Mundra Port Gate for automated gate-in.
        </div>

        <button onclick="toggleQrModal(false)" class="w-full py-2 bg-slate-900 text-white font-bold rounded-lg text-xs">
          Close
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// INTERACTIVE HANDLERS & TWO-WAY STATE SYNCHRONIZATION
// -------------------------------------------------------------
function setViewMode(mode) {
  appState.viewMode = mode;
  renderApp();
}
window.setViewMode = setViewMode;

function selectVehicle(id) {
  appState.selectedVehicleId = id;
  renderApp();
}
window.selectVehicle = selectVehicle;

function setDriverLang(lang) {
  appState.driverLang = lang;
  renderApp();
}
window.setDriverLang = setDriverLang;

function toggleQrModal(show) {
  appState.showQrModal = show;
  renderApp();
}
window.toggleQrModal = toggleQrModal;

// Admin sends dispatch order to a vehicle
function adminSendOrder(vehId, statusType) {
  const veh = appState.vehicles.find(v => v.id === vehId);
  if (veh) {
    veh.status = statusType;
    veh.acknowledged = false;
    appState.selectedVehicleId = vehId;

    if (statusType === 'PORT_DELAY') {
      veh.delayMins = 210;
      veh.delayReason = 'Mundra Berth 2 vessel delayed by 10 hours (Tidal storm).';
      veh.dispatchOrder = 'HOLD train at Palanpur Station cold-shed for 4 hours.';
    } else if (statusType === 'HIGHWAY_JAM') {
      veh.delayMins = 180;
      veh.delayReason = 'NH-48 Shahjahanpur toll 4.5-hour traffic bottleneck.';
      veh.dispatchOrder = 'REROUTE: Divert to Rewari ICD and load on WDFC rail.';
    } else if (statusType === 'ON_TIME') {
      veh.acknowledged = true;
      veh.delayMins = 0;
      veh.delayReason = 'All railway tracks, sidings, and port berths on schedule.';
      veh.dispatchOrder = 'PROCEED on schedule.';
    }
  }
  renderApp();
}
window.adminSendOrder = adminSendOrder;

// Driver clicks "Samjh Gaya" / Confirm
function driverAcknowledge(vehId) {
  const veh = appState.vehicles.find(v => v.id === vehId);
  if (veh) {
    veh.acknowledged = true;
    if (veh.status === 'PORT_DELAY') {
      veh.status = 'HELD';
      veh.dispatchOrder = 'CONFIRMED: Held at Palanpur cold-shed siding.';
    } else if (veh.status === 'HIGHWAY_JAM') {
      veh.status = 'REROUTED';
      veh.dispatchOrder = 'CONFIRMED: Rerouted to Rewari WDFC freight train.';
    }
  }
  renderApp();
}
window.driverAcknowledge = driverAcknowledge;

function initConnectedMap() {
  const mapElem = document.getElementById('connected-map');
  if (!mapElem || typeof L === 'undefined') return;

  let map = appState.map;
  if (!map || mapElem.innerHTML === "") {
    if (appState.map) {
      appState.map.remove();
    }
    map = L.map('connected-map').setView([26.5000, 72.5000], 5);
    appState.map = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    const coords = [
      [30.9010, 75.8573], // Ludhiana
      [28.1920, 76.6180], // Rewari
      [24.1724, 72.4346], // Palanpur
      [22.8390, 69.7042]  // Mundra Port
    ];

    L.polyline(coords, { color: '#2563eb', weight: 4, opacity: 0.5 }).addTo(map);

    L.circleMarker([30.9010, 75.8573], { radius: 6, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1 }).addTo(map).bindPopup('Ludhiana ICD');
    L.circleMarker([24.1724, 72.4346], { radius: 7, color: '#d97706', fillColor: '#d97706', fillOpacity: 1 }).addTo(map).bindPopup('Palanpur Siding (HOLD Point)');
    L.circleMarker([22.8390, 69.7042], { radius: 6, color: '#dc2626', fillColor: '#dc2626', fillOpacity: 1 }).addTo(map).bindPopup('Mundra Marine Port');
  }

  // Remove existing vehicle markers
  if (appState.vehicleMarkers) {
    appState.vehicleMarkers.forEach(m => map.removeLayer(m));
  }
  appState.vehicleMarkers = [];

  // Draw all vehicle markers with emojis
  appState.vehicles.forEach(v => {
    const isSelected = v.id === appState.selectedVehicleId;
    const emoji = v.type === 'TRAIN' ? '🚂' : '🚚';
    const markerHtml = `<div style="font-size:18px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); border: ${isSelected ? '2px solid #2563eb' : '1px solid #94a3b8'}; padding: 3px; background: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">${emoji}</div>`;
    
    const icon = L.divIcon({
      html: markerHtml,
      className: 'custom-vehicle-icon',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    
    const marker = L.marker(v.coords, { icon: icon }).addTo(map).bindPopup(`<b>${v.code}</b><br>${v.cargo}<br>${v.currentLocation}`);
    appState.vehicleMarkers.push(marker);
  });
}

function toggleSimulation() {
  if (appState.simulationActive) {
    appState.simulationActive = false;
    if (appState.simulationInterval) {
      clearInterval(appState.simulationInterval);
      appState.simulationInterval = null;
    }
  } else {
    appState.simulationActive = true;
    // Reset all vehicles to the start of their paths
    appState.vehicles.forEach(v => {
      v.pathIndex = 0;
      const path = appState.paths[v.id];
      v.coords = path[0].coords;
      v.currentLocation = path[0].loc;
      v.status = 'ON_TIME';
      v.acknowledged = true;
      v.delayMins = 0;
      v.delayReason = 'All railway tracks, sidings, and port berths on schedule.';
      v.dispatchOrder = 'PROCEED on schedule.';
    });
    
    appState.simulationInterval = setInterval(runSimulationStep, 2500);
  }
  renderApp();
}
window.toggleSimulation = toggleSimulation;

function runSimulationStep() {
  appState.vehicles.forEach(v => {
    const path = appState.paths[v.id];
    
    // For HELD state, hold the train at Palanpur (index 7)
    if (v.status === 'HELD') {
      if (v.pathIndex >= 7) {
        v.coords = path[7].coords;
        v.currentLocation = path[7].loc;
        return;
      }
    }
    
    // For REROUTED state, we can simulate the truck cargo transferring to the WDFC train
    if (v.status === 'REROUTED') {
      // Keep moving along path, but change the vehicle name / type to reflect modal shift
      v.vehicleName = 'Rerouted to WDFC Train (HR-55)';
    }

    v.pathIndex++;
    if (v.pathIndex >= path.length) {
      v.pathIndex = 0; // Loop simulation
    }

    const currentStep = path[v.pathIndex];
    v.coords = currentStep.coords;
    v.currentLocation = currentStep.loc;

    // Trigger alerts automatically at specific checkpoints
    if (v.id === 'VEH-01' && v.pathIndex === 7) {
      // Reached Palanpur. Trigger port delay and push notification popup!
      adminSendOrder('VEH-01', 'PORT_DELAY');
    } else if (v.id === 'VEH-02' && v.pathIndex === 2) {
      // Reached Shahjahanpur. Trigger highway traffic jam and push notification!
      adminSendOrder('VEH-02', 'HIGHWAY_JAM');
    }
  });

  renderApp();
}

function renderShipperDashboard() {
  return `
    <div class="space-y-4 max-w-5xl mx-auto">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-sm">
        <h2 class="text-base font-bold">Jugaad Agro Exporters Ltd. &mdash; Client Portal</h2>
        <p class="text-[11px] text-blue-100 mt-1">Enterprise Shipper Dashboard • Real-time SLA Tracking & Cost Savings</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-slate-400 font-bold uppercase text-[9px] font-mono">Consignment Safety Rate</span>
          <div class="text-base font-extrabold text-slate-800 mt-1">100% Intact</div>
          <p class="text-[10px] text-emerald-600 font-mono mt-1">✓ Cold-chain holding averted 2 spoilage risks</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-slate-400 font-bold uppercase text-[9px] font-mono">Total Demurrage Saved</span>
          <div class="text-base font-extrabold text-emerald-600 mt-1">₹77,000 Saved</div>
          <p class="text-[10px] text-slate-500 font-mono mt-1">Via proactive rail siding holding orders</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-slate-400 font-bold uppercase text-[9px] font-mono">Carbon Abatement Credits</span>
          <div class="text-base font-extrabold text-blue-600 mt-1">1,240.5 kg CO₂</div>
          <p class="text-[10px] text-slate-500 font-mono mt-1">By shifting road freights to electric WDFC</p>
        </div>
      </div>

      <!-- Active Shipments Detail Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">My Active Cargo Consignments</h3>
          <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono font-bold">2 Active</span>
        </div>
        
        <div class="overflow-x-auto text-xs">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                <th class="p-3">Consignment</th>
                <th class="p-3">Route</th>
                <th class="p-3">Status</th>
                <th class="p-3">Mitigation / Action Taken</th>
                <th class="p-3 text-right">Fines Saved</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="p-3">
                  <div class="font-bold text-slate-800">PB-Oranges (Kinnow, 26 Tons)</div>
                  <div class="text-[10px] text-slate-400 font-mono">ID: VEH-01 &bull; Perishable</div>
                </td>
                <td class="p-3">Ludhiana ICD → Mundra Port</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">HELD (Safe)</span>
                </td>
                <td class="p-3 text-slate-600 font-medium">Held at Palanpur cold-shed siding due to Mundra Port tidal delay.</td>
                <td class="p-3 text-right font-extrabold text-emerald-600">₹32,000</td>
              </tr>
              <tr>
                <td class="p-3">
                  <div class="font-bold text-slate-800">Auto Spare Parts (18 Tons)</div>
                  <div class="text-[10px] text-slate-400 font-mono">ID: VEH-02 &bull; Industrial</div>
                </td>
                <td class="p-3">Gurugram → Mundra Port</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">REROUTED</span>
                </td>
                <td class="p-3 text-slate-600 font-medium">Rerouted from NH48 traffic bottleneck to Rewari electric rail.</td>
                <td class="p-3 text-right font-extrabold text-emerald-600">₹45,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderPortOperatorDashboard() {
  return `
    <div class="space-y-4 max-w-5xl mx-auto">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-5 rounded-2xl shadow-sm">
        <h2 class="text-base font-bold">Mundra Marine Port &mdash; Terminal Operator Console</h2>
        <p class="text-[11px] text-teal-100 mt-1">Adani Ports (APSEZ) • Berth Allocation & Customs Clearances</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-slate-400 font-bold uppercase text-[9px] font-mono">Terminal Berth Queue</span>
          <div class="text-base font-extrabold text-slate-800 mt-1">3 Vessels in Anchorage</div>
          <p class="text-[10px] text-slate-500 font-mono mt-1">Queue cleared rate: 1.2 vessels / hr</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-slate-400 font-bold uppercase text-[9px] font-mono">Customs Gate Clearance</span>
          <div class="text-base font-extrabold text-emerald-600 mt-1">98.2% Auto-Approved</div>
          <p class="text-[10px] text-slate-500 font-mono mt-1">Via ICEGATE integrated customs API</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-slate-400 font-bold uppercase text-[9px] font-mono">Average Container Turnaround</span>
          <div class="text-base font-extrabold text-blue-600 mt-1">18.4 Hours</div>
          <p class="text-[10px] text-slate-500 font-mono mt-1">Target turnaround limit: 24.0 Hours</p>
        </div>
      </div>

      <!-- Port Gate Clearance Console -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Inbound Freight Gate-In Approvals</h3>
          <span class="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">Requires Port Action</span>
        </div>

        <div class="p-4 space-y-3">
          <!-- Item 1: Rake Arrival -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">🚂 RAKE-WDFC-9021</span>
                <span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">HELD AT PALANPUR</span>
              </div>
              <div class="text-slate-500 mt-1">Cargo: Punjab Oranges (Kinnow, 26 Tons) • ETA: Tomorrow 03:30</div>
            </div>
            <div class="flex gap-2">
              <button onclick="alert('Berth 2 pre-allocated for train cargo.')" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                Pre-Allocate Berth 2
              </button>
              <button onclick="alert('Customs cleared. Train permitted to enter gate-in upon arrival.')" class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                Approve Gate-In
              </button>
            </div>
          </div>

          <!-- Item 2: Truck Arrival -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">🚚 TRK-4491 (Ashok Leyland)</span>
                <span class="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono font-bold">REROUTED TO RAIL</span>
              </div>
              <div class="text-slate-500 mt-1">Cargo: Auto Spare Parts (18 Tons) • ETA: Today 22:00</div>
            </div>
            <div class="flex gap-2">
              <button onclick="alert('Digital QR code approved for gate-in.')" class="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg font-bold transition-colors">
                Verify QR Code
              </button>
              <button onclick="alert('Gatepass generated and sent to driver Ramesh Singh.')" class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                Issue Gatepass
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});
renderApp();
