import React, { useState } from 'react';
import { 
  Package, Send, ArrowRight, QrCode, ShieldCheck, 
  RefreshCw, Layers, Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BACKEND_URL = 'http://localhost:5000';

export default function CreateShipment({ onShipmentCreated }) {
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [cargoType, setCargoType] = useState('General');
  const [weight, setWeight] = useState('');
  const [origin, setOrigin] = useState('Delhi Railway Yard');
  const [destination, setDestination] = useState('Mumbai Warehouse');
  
  // Loading states
  const [isMining, setIsMining] = useState(false);
  const [minedBlock, setMinedBlock] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [successShipment, setSuccessShipment] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sender.trim() || !receiver.trim() || !weight || Number(weight) <= 0) {
      alert('Please fill in all details with valid values.');
      return;
    }

    setIsMining(true);
    setMinedBlock(null);
    setQrCodeData('');

    // Simulate mining latency (1.5 seconds of high-tech ledger construction)
    setTimeout(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/shipments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender,
            receiver,
            cargoType,
            weight: Number(weight),
            origin,
            destination,
          }),
        });
        const data = await res.json();
        
        if (res.ok) {
          setMinedBlock(data.block);
          setQrCodeData(data.shipment.qrCodeUrl);
          setSuccessShipment(data.shipment);
          setIsMining(false);

          // Spark confetti!
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });

          // Reset inputs
          setSender('');
          setReceiver('');
          setWeight('');

          if (onShipmentCreated) {
            onShipmentCreated();
          }
        } else {
          alert(data.error || 'Failed to create shipment');
          setIsMining(false);
        }
      } catch (err) {
        console.error(err);
        alert('Server connection error during mining.');
        setIsMining(false);
      }
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Shipment creation form */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50 mb-5">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Register New Cargo Shipment</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sender Entity</label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. Northern Chemicals Ltd."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Receiver Entity</label>
                <input
                  type="text"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder="e.g. Maharashtra Distributors"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo Security Type</label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="General">General Cargo</option>
                  <option value="Medicines">Medicines (Temp-Controlled)</option>
                  <option value="Chemicals">Hazardous Chemicals</option>
                  <option value="High-Value">High-Value Jewels / Bullion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 2400"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Origin Terminal</label>
                <input
                  type="text"
                  value={origin}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Final Destination</label>
                <input
                  type="text"
                  value={destination}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isMining}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {isMining ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Signing Cargo Record & Securing Ledger...
                </>
              ) : (
                <>
                  <Layers className="h-5 w-5" />
                  Initiate Shipment & Secure Ledger
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Mining Block Display Console */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* State 1: Default Empty state */}
        {!isMining && !minedBlock && (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-400 min-h-[300px]">
            <Layers className="h-12 w-12 text-slate-700 mb-3 stroke-[1.5]" />
            <h3 className="text-white font-bold text-sm">Ledger Status: Awaiting Registration</h3>
            <p className="text-xs text-slate-500 max-w-[220px] mt-1.5 leading-relaxed">
              When a new consignment is initialized, the system calculates a cryptographic signature to lock the details.
            </p>
          </div>
        )}

        {/* State 2: Mining Animation */}
        {isMining && (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
              <Layers className="absolute inset-4 h-8 w-8 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider animate-pulse">
                Generating Secure Signature
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                calculating SHA-256 signature hash...
              </p>
            </div>
          </div>
        )}

        {/* State 3: Block Minted Successfully */}
        {minedBlock && (
          <div className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 flex flex-col justify-between min-h-[300px] border-l-4 border-l-emerald-500 glow-green animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-sm tracking-wide">Ledger Entry #{minedBlock.index} Sealed</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-black rounded uppercase">
                  Secured
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 block uppercase">Record Hash</span>
                  <span className="text-blue-400 break-all text-[11px] leading-tight block">{minedBlock.hash}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 block uppercase">Previous Record Link</span>
                  <span className="text-slate-400 break-all block">{minedBlock.previousHash}</span>
                </div>
                
                <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID Reference:</span>
                    <span className="font-bold text-white">{successShipment?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cargo Type:</span>
                    <span className="font-bold text-white">{minedBlock.data.cargoType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Net Weight:</span>
                    <span className="font-bold text-white">{minedBlock.data.weight} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Section */}
            {qrCodeData && (
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-4 bg-slate-950/50 p-2.5 rounded-xl">
                <div className="bg-white p-1.5 rounded-lg shrink-0">
                  <img src={qrCodeData} alt="Shipment QR" className="w-16 h-16" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-400">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>RFID/QR Generated</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This QR represents the digital cargo signature certificate. Paste on cargo door for receiver scanning.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
