import React, { useState, useEffect } from 'react';
import { 
  Smartphone, ShieldAlert, CheckCircle, QrCode, 
  MapPin, Battery, Wifi, PenTool, ShieldCheck, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BACKEND_URL = 'http://localhost:5000';

export default function DriverView({ selectedShipment, onDeliveryComplete }) {
  const [panicActive, setPanicActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [recipientSig, setRecipientSig] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [delivered, setDelivered] = useState(false);

  useEffect(() => {
    if (selectedShipment) {
      setPanicActive(false);
      setScanned(false);
      setRecipientSig('');
      setDelivered(selectedShipment.status === 'Delivered');
    }
  }, [selectedShipment]);

  // Silent SOS trigger
  const handleSilentPanic = async () => {
    if (!selectedShipment) return;
    setPanicActive(true);
    try {
      await fetch(`${BACKEND_URL}/api/shipments/${selectedShipment.id}/panic`, {
        method: 'POST',
      });
      // Silent alarm: we show NO visible alert dialog or success message indicating an SOS was sent,
      // simulating a silent beacon. We just set a small visual state of connection or signal ok.
    } catch (err) {
      console.error('Error sending panic signal:', err);
    }
  };

  // Simulating QR code scan
  const handleQRScan = () => {
    setScanned(true);
  };

  const handleDeliverySubmit = async () => {
    if (!recipientSig.trim()) {
      alert('Please input receiver signature/initials.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/shipments/${selectedShipment.id}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientSignature: `0x992c${Math.random().toString(36).substr(2, 9)}f4a29ab8126b8cf`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDelivered(true);
        setIsSubmitting(false);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onDeliveryComplete) {
          onDeliveryComplete();
        }
      } else {
        alert(data.error || 'Delivery verification failed');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error confirming delivery');
      setIsSubmitting(false);
    }
  };

  if (!selectedShipment) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 text-center h-[500px]">
        <Smartphone className="h-16 w-16 text-slate-300 stroke-[1.5] mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800">No Driver Device Synced</h2>
        <p className="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed">
          Select an active road shipment on the Dashboard (e.g. In Transit - Road) and click **"Driver's Handset"** to simulate the mobile view.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4">
      {/* Mobile phone outer frame mockup */}
      <div className="relative w-80 h-[580px] bg-slate-900 rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Speaker / Camera Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>
          <div className="w-12 h-1 bg-slate-950 rounded-full"></div>
        </div>

        {/* Status bar */}
        <div className="bg-slate-950 px-6 pt-7 pb-2 flex items-center justify-between text-[10px] text-white/95 font-semibold font-sans z-40">
          <span>22:45 PM</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3" />
            <Battery className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Application Viewport */}
        <div className="flex-1 bg-slate-950 p-4 overflow-y-auto flex flex-col justify-between text-white">
          <div className="space-y-4">
            {/* App Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mt-1">
              <div>
                <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Driver Companion</span>
                <h3 className="font-extrabold text-sm text-blue-400">CargoChain Link</h3>
              </div>
              <span className="text-[9px] px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded-lg border border-blue-500/30">
                Connected
              </span>
            </div>

            {/* Shipment Overview Card */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-300">{selectedShipment.id}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">{selectedShipment.cargoType}</span>
              </div>
              <div className="text-[11px] text-white/60 space-y-1">
                <p><strong>Origin:</strong> {selectedShipment.origin}</p>
                <p><strong>Dest:</strong> {selectedShipment.destination}</p>
                <p><strong>Weight:</strong> {selectedShipment.weight} kg</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                <MapPin className="h-3.5 w-3.5" />
                <span>Simulated Route: Mumbai Last-Mile</span>
              </div>
            </div>

            {/* Silent Panic Button */}
            {!delivered && (
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Emergency Beacon</span>
                  {panicActive ? (
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                      ● Status: Link Secured
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400">Telemetry Active</span>
                  )}
                </div>
                <button
                  onClick={handleSilentPanic}
                  className="w-full py-3.5 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 active:scale-95 transition-all text-red-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                  {panicActive ? 'System Connected' : 'Trigger SOS Silent Alarm'}
                </button>
                <p className="text-[9px] text-white/35 leading-tight text-center">
                  *SOS button is silent. Telemetry data is permanently stored. No visible confirmation is shown to prevent hijacker alert.
                </p>
              </div>
            )}

            {/* QR Delivery Confirmation */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-[10px] font-bold text-white/40 block uppercase">Destination Verification</span>
              
              {delivered ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                  <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-300">Delivery Verified</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">Blockchain transaction finalized.</p>
                  </div>
                </div>
              ) : !scanned ? (
                <button
                  onClick={handleQRScan}
                  disabled={selectedShipment.status !== 'Pending Delivery'}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:border-white/10 disabled:text-white/20 border border-transparent rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <QrCode className="h-5 w-5" />
                  Scan Consignment QR
                </button>
              ) : (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-center font-semibold text-[10px]">
                    ✓ QR Authenticated! Sign below to unlock delivery.
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">
                      Recipient Signature / Initials
                    </label>
                    <input
                      type="text"
                      value={recipientSig}
                      onChange={(e) => setRecipientSig(e.target.value)}
                      placeholder="Enter receiver's name"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleDeliverySubmit}
                    disabled={isSubmitting || !recipientSig.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-white/20 text-white rounded-xl font-bold transition-all text-xs"
                  >
                    {isSubmitting ? 'Finalizing Hash on Chain...' : 'Confirm Delivery & Release Custody'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Home indicator bar at bottom of mobile view */}
          <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
        </div>
      </div>
      <span className="text-xs text-slate-400 mt-2 font-semibold">Simulated Carrier Handset HUD</span>
    </div>
  );
}
