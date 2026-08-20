import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import { 
  AlertOctagon, Train, Truck, CheckCircle2, ShieldAlert, 
  MapPin, User, Navigation, Phone, Flame, HeartHandshake, Eye
} from 'lucide-react';
import { 
  RAIL_ROUTE, ROAD_ROUTE, ROAD_ROUTE_DEVIATION, 
  createTrainIcon, createTruckIcon, createAlertIcon, createWarehouseIcon 
} from '../utils/mapHelpers';

const BACKEND_URL = 'http://localhost:5000';

// Map controller to center map dynamically when a shipment is selected
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 9);
    }
  }, [center, map]);
  return null;
}

export default function Dashboard({ selectShipmentForHandover, openDriverMobileView }) {
  const [shipments, setShipments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [mapCenter, setMapCenter] = useState([22.5, 75.5]); // Midpoint of India approx
  const [activeAccidentAlert, setActiveAccidentAlert] = useState(null);

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/shipments`);
      const data = await res.json();
      setShipments(data);

      // Set map focus to the first active shipment if available
      const active = data.find(s => s.status !== 'Delivered');
      if (active) {
        setMapCenter(active.currentLocation);
        setSelectedShipment(active);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts`);
      const data = await res.json();
      setAlerts(data);
      
      // Auto display details if there is an active accident alert
      const accident = data.find(a => a.type === 'accident');
      if (accident) {
        setActiveAccidentAlert(accident);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchAlerts();

    const socket = io(BACKEND_URL);

    // Socket listeners for real-time tracking updates
    socket.on('gps_update', (data) => {
      setShipments((prevShipments) =>
        prevShipments.map((s) => {
          if (s.id === data.id) {
            const updatedShipment = { ...s, currentLocation: data.currentLocation };
            if (selectedShipment?.id === s.id) {
              setSelectedShipment(updatedShipment);
            }
            return updatedShipment;
          }
          return s;
        })
      );
    });

    socket.on('shipment_update', (updatedShipment) => {
      setShipments((prevShipments) =>
        prevShipments.map((s) => (s.id === updatedShipment.id ? updatedShipment : s))
      );
      if (selectedShipment?.id === updatedShipment.id) {
        setSelectedShipment(updatedShipment);
      }
    });

    socket.on('new_alert', (newAlert) => {
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
      if (newAlert.type === 'accident') {
        setActiveAccidentAlert(newAlert);
      }
    });

    socket.on('shipment_created', (newShipment) => {
      setShipments((prev) => [...prev, newShipment]);
    });

    socket.on('shipments_reset', (resetShipments) => {
      setShipments(resetShipments);
      setAlerts([]);
      setActiveAccidentAlert(null);
      const active = resetShipments.find(s => s.status !== 'Delivered');
      if (active) {
        setMapCenter(active.currentLocation);
        setSelectedShipment(active);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedShipment]);

  // Click handler to select shipment
  const handleSelectShipment = (shipment) => {
    setSelectedShipment(shipment);
    setMapCenter(shipment.currentLocation);
  };

  // Trigger deviation simulation API
  const handleSimulateDeviation = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/shipments/${id}/deviation`, { method: 'POST' });
      fetchShipments();
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger accident simulation API
  const handleSimulateAccident = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/shipments/${id}/accident`, { method: 'POST' });
      fetchShipments();
    } catch (err) {
      console.error(err);
    }
  };

  // Clear emergency popup
  const closeEmergencyAlert = () => {
    setActiveAccidentAlert(null);
  };

  // Helper to determine status styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Transit - Rail':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'At Handover Point':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold ring-1 ring-amber-400/30';
      case 'In Transit - Road':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Accident Alert':
        return 'bg-red-50 text-red-700 border-red-200 pulse-alert-red font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper to choose map marker icon
  const getMarkerIcon = (s) => {
    const isActive = selectedShipment?.id === s.id;
    if (s.status === 'Accident Alert') {
      return createAlertIcon();
    }
    if (s.vehicle === 'Train') {
      return createTrainIcon(isActive);
    } else {
      const isDeviated = s.alert && s.alert.type === 'Route Deviation';
      return createTruckIcon(isActive, isDeviated);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      
      {/* 1. Sidebar - Shipments List */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Shipments</h2>
          <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full font-semibold text-slate-600">
            {shipments.filter(s => s.status !== 'Delivered').length} in transit
          </span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1.5">
          {shipments.map((s) => (
            <div
              key={s.id}
              onClick={() => handleSelectShipment(s)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                selectedShipment?.id === s.id
                  ? 'bg-blue-50/60 border-blue-200'
                  : 'bg-transparent border-transparent hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{s.id}</span>
                <span className={`text-[10px] uppercase font-bold border px-2 py-0.5 rounded ${getStatusBadgeClass(s.status)}`}>
                  {s.status}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 text-xs text-slate-500">
                <div>
                  <span className="block text-[10px] text-slate-400">Cargo:</span>
                  <span className="font-medium text-slate-700">{s.cargoType} ({s.weight} kg)</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Vehicle:</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    {s.vehicle === 'Train' ? <Train className="h-3 w-3 text-blue-500" /> : <Truck className="h-3 w-3 text-amber-500" />}
                    {s.vehicle}
                  </span>
                </div>
              </div>
              
              {/* Context Action Shortcuts inside Sidebar for quick demo flow */}
              {selectedShipment?.id === s.id && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {s.status === 'At Handover Point' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectShipmentForHandover(s);
                      }}
                      className="w-full text-center px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-sm"
                    >
                      Process Verification Handover
                    </button>
                  )}
                  {s.status === 'In Transit - Road' && !s.isDeviated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateDeviation(s.id);
                      }}
                      className="flex-1 text-center px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold border border-amber-200"
                    >
                      Simulate Deviation
                    </button>
                  )}
                  {s.status === 'In Transit - Road' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateAccident(s.id);
                      }}
                      className="flex-1 text-center px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[10px] font-bold border border-red-200"
                    >
                      Simulate Accident
                    </button>
                  )}
                  {(s.status === 'In Transit - Road' || s.status === 'Pending Delivery') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDriverMobileView(s);
                      }}
                      className="w-full text-center px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 mt-1"
                    >
                      <Eye className="h-3 w-3" /> Driver's Handset (Panic/Delivery)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Centerpiece Map & Alerts */}
      <div className="lg:col-span-3 flex flex-col h-full gap-6">
        
        {/* Map Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-2 relative min-h-[300px]">
          <MapContainer center={mapCenter} zoom={6} scrollWheelZoom={true} className="rounded-xl overflow-hidden h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draw Predefined Paths */}
            <Polyline positions={RAIL_ROUTE} color="#3b82f6" weight={3} dashArray="5, 10" opacity={0.6} />
            <Polyline positions={ROAD_ROUTE} color="#10b981" weight={3.5} opacity={0.7} />
            <Polyline positions={ROAD_ROUTE_DEVIATION} color="#ef4444" weight={2.5} dashArray="2, 5" opacity={0.5} />

            {/* Render Warehouses / Endpoints */}
            <Marker position={RAIL_ROUTE[0]} icon={createWarehouseIcon()}>
              <Popup>
                <div className="text-xs">
                  <h4 className="font-bold text-slate-800">Delhi Railway Yard</h4>
                  <p className="text-slate-500">Origin Loading Station</p>
                </div>
              </Popup>
            </Marker>

            <Marker position={ROAD_ROUTE[ROAD_ROUTE.length - 1]} icon={createWarehouseIcon()}>
              <Popup>
                <div className="text-xs">
                  <h4 className="font-bold text-slate-800">Mumbai Warehouse</h4>
                  <p className="text-slate-500">Final Last-mile Depot</p>
                </div>
              </Popup>
            </Marker>

            {/* Render Active Shipments */}
            {shipments.map((s) => (
              <Marker key={s.id} position={s.currentLocation} icon={getMarkerIcon(s)}>
                <Popup>
                  <div className="p-1 space-y-1 text-slate-800">
                    <div className="flex items-center gap-1 justify-between font-bold border-b pb-1 text-xs">
                      <span>{s.id}</span>
                      <span className="text-[10px] text-slate-500 uppercase">({s.cargoType})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      <strong>Status:</strong> {s.status}<br />
                      <strong>Weight:</strong> {s.weight} kg<br />
                      <strong>From:</strong> {s.origin} <br />
                      <strong>To:</strong> {s.destination}
                    </p>
                    {s.alert && (
                      <div className="mt-1.5 p-1 bg-red-50 rounded border border-red-100 text-[10px] text-red-700 font-semibold animate-pulse">
                        ⚠️ {s.alert.message}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            <MapController center={mapCenter} />
          </MapContainer>

          {/* Emergency Hospital overlay card when an accident is triggered */}
          {activeAccidentAlert && (
            <div className="absolute bottom-5 left-5 z-[1000] max-w-sm bg-white rounded-2xl border-2 border-red-500 shadow-2xl p-4 space-y-3 glass-panel">
              <div className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="h-5 w-5 pulse-alert-red shrink-0" />
                <h4 className="font-bold text-sm tracking-tight">Accident SOS Dispatch Logged</h4>
              </div>
              <p className="text-xs text-slate-600">
                Automatic impact trigger reported for <strong>{activeAccidentAlert.shipmentId}</strong>. Emergency responders mobilized.
              </p>
              
              {activeAccidentAlert.emergencyContact && (
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-red-950">
                    <HeartHandshake className="h-4 w-4 text-red-600" />
                    <span>Rescue Unit: {activeAccidentAlert.emergencyContact.hospital}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-500" /> {activeAccidentAlert.emergencyContact.distance} away
                    </span>
                    <a
                      href={`tel:${activeAccidentAlert.emergencyContact.phone}`}
                      className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                    >
                      <Phone className="h-3 w-3" /> Call {activeAccidentAlert.emergencyContact.phone}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className="text-slate-400 font-mono">Blockchain block appended</span>
                <button
                  onClick={closeEmergencyAlert}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Dismiss HUD Alert
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alerts & Warnings Panel */}
        <div className="h-44 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Live Security Telemetry & Warnings Log
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
              Real-time audits
            </span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-1">
                <CheckCircle2 className="h-8 w-8 text-slate-200" />
                <p>No active anomalies detected in transit channels.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-2.5 p-2.5 border rounded-xl leading-relaxed ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200 text-red-900 font-medium'
                      : alert.severity === 'high'
                      ? 'bg-orange-50 border-orange-200 text-orange-950 font-medium'
                      : 'bg-sky-50/50 border-sky-100 text-sky-950'
                  }`}
                >
                  {alert.severity === 'critical' ? (
                    <Flame className="h-4 w-4 text-red-600 shrink-0 mt-0.5 pulse-alert-red" />
                  ) : alert.severity === 'high' ? (
                    <AlertOctagon className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>{alert.title} — {alert.shipmentId}</span>
                      <span className="text-[10px] font-mono font-normal opacity-75">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
