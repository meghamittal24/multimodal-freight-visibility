import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, ShieldCheck, ArrowRight, User, Scale, 
  Camera, PenTool, CheckCircle, HelpCircle, Lock, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BACKEND_URL = 'http://localhost:5000';

export default function HandoverVerification({ selectedShipment, onHandoverComplete }) {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  
  // Form states
  const [officerName, setOfficerName] = useState('R. S. Deshmukh (Central Railways)');
  const [scaleWeight, setScaleWeight] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [driverName, setDriverName] = useState('M. K. Yadav (MH-04-A-1290)');
  const [signatureHash, setSignatureHash] = useState('');
  
  // Canvas drawing reference
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Sync scaleWeight to shipment weight initially
  useEffect(() => {
    if (selectedShipment) {
      setScaleWeight(selectedShipment.weight);
      setStep1Done(false);
      setStep2Done(false);
      setPhotoPreview(null);
      setSignatureHash('');
      clearSignature();
    }
  }, [selectedShipment]);

  // Handle dummy photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Support touch and mouse
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e3a8a'; // Navy blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Simulate signature hash generation
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    setSignatureHash(hash);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureHash('');
    setStep2Done(false);
  };

  const confirmStep1 = () => {
    if (!officerName.trim()) {
      alert('Please enter officer name.');
      return;
    }
    if (!scaleWeight || Number(scaleWeight) <= 0) {
      alert('Please enter a valid scale weight.');
      return;
    }
    setStep1Done(true);
  };

  const confirmStep2 = () => {
    if (!driverName.trim()) {
      alert('Please enter driver name / license plate.');
      return;
    }
    if (!signatureHash) {
      alert('Please draw driver signature on the pad.');
      return;
    }
    setStep2Done(true);
  };

  const handleSubmitHandover = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/shipments/${selectedShipment.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName,
          weightConfirmed: Number(scaleWeight),
          signatureHash,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Explode confetti on successful demo handover verification!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        onHandoverComplete();
      } else {
        alert(data.error || 'Handover submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error submitting handover');
    }
  };

  if (!selectedShipment) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 text-center h-[500px]">
        <FileText className="h-16 w-16 text-slate-300 stroke-[1.5] mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Handover Context Selected</h2>
        <p className="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed">
          Please select an active shipment in the **"At Handover Point"** state from the Dashboard sidebar to authenticate transfer.
        </p>
      </div>
    );
  }

  const weightDiscrepancy = Math.abs(selectedShipment.weight - Number(scaleWeight));
  const hasDiscrepancy = weightDiscrepancy > (selectedShipment.weight * 0.02); // 2% warning buffer

  return (
    <div className="space-y-6">
      {/* Handover Flow Header */}
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Smart Custody Handover</h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-signature verification protocols checking weights and verifying cargo images before custody ledger updates.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs">
            <span className="text-blue-500 font-bold block uppercase text-[10px]">Processing Shipment</span>
            <span className="font-extrabold text-blue-950 text-sm">{selectedShipment.id}</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="grid grid-cols-3 gap-2 mt-6 text-center text-xs font-semibold">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl">
            1. Rail Transit Completed
          </div>
          <div className="bg-blue-500 text-white py-2.5 rounded-xl shadow-sm glow-blue animate-pulse">
            2. Multi-Sig Verification
          </div>
          <div className="bg-slate-50 border border-slate-100 text-slate-400 py-2.5 rounded-xl">
            3. Road Last-Mile Transit
          </div>
        </div>
      </div>

      {/* 2-Column Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Step 1: Rail Officer Panel */}
        <div className={`p-6 bg-white rounded-2xl border transition-all duration-300 ${
          step1Done ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                step1Done ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
              }`}>1</span>
              Railway Transfer Manifest
            </h2>
            {step1Done && <CheckCircle className="h-5 w-5 text-emerald-500" />}
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Railway Station Master / Officer Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => !step1Done && setOfficerName(e.target.value)}
                  disabled={step1Done}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Expected Bill of Lading Weight
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold font-mono">
                  {selectedShipment.weight} kg
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Physically Measured Scale Weight
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    value={scaleWeight}
                    onChange={(e) => !step1Done && setScaleWeight(e.target.value)}
                    disabled={step1Done}
                    placeholder="Enter scale reading"
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {scaleWeight && hasDiscrepancy && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
                ⚠️ WARNING: Weight variance detected is {weightDiscrepancy} kg! Verify seal tamper indicators.
              </div>
            )}

            {/* Photo verification */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Visual Seal & Cargo Photo Audit
              </label>
              <div className="flex items-center gap-4">
                <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl cursor-pointer ${
                  step1Done ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 border-slate-300'
                } w-24 h-24 shrink-0`}>
                  <Camera className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-[9px] font-bold text-slate-500">Upload Seal</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={step1Done}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 border border-slate-100 rounded-xl h-24 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Seal Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-[10px] text-slate-400">
                      <HelpCircle className="h-5 w-5 mx-auto mb-1 stroke-[1.5]" />
                      Seal / Lock photo preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!step1Done ? (
              <button
                onClick={confirmStep1}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                Sign Off Manifest Verification
              </button>
            ) : (
              <button
                onClick={() => setStep1Done(false)}
                className="w-full py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-all text-xs"
              >
                Unlock Manifest / Re-edit
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Truck Driver Panel */}
        <div className={`p-6 bg-white rounded-2xl border transition-all duration-300 ${
          !step1Done ? 'opacity-50 pointer-events-none' : ''
        } ${step2Done ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                step2Done ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'
              }`}>2</span>
              Road Carrier Acceptance
            </h2>
            {step2Done && <CheckCircle className="h-5 w-5 text-emerald-500" />}
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Receiving Truck Driver Details
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => !step2Done && setDriverName(e.target.value)}
                  disabled={step2Done}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            {/* Signature Draw Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">
                  Digital Signature Pad (Draw Below)
                </label>
                {!step2Done && signatureHash && (
                  <button
                    onClick={clearSignature}
                    className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5"
                  >
                    <RefreshCw className="h-2.5 w-2.5" /> Clear Ink
                  </button>
                )}
              </div>
              <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className={`w-full bg-slate-50 cursor-crosshair ${
                    step2Done ? 'pointer-events-none opacity-80' : ''
                  }`}
                />
                
                {/* Overlay indicating lock */}
                {!step1Done && (
                  <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                    <Lock className="h-4 w-4" /> Locked until Manifest Verified
                  </div>
                )}
              </div>
            </div>

            {signatureHash && (
              <div className="p-3 bg-slate-900 border border-slate-800 text-[10px] text-blue-400 rounded-xl font-mono space-y-1">
                <span className="text-slate-500 block font-sans uppercase font-bold text-[8px]">
                  Generated Signature Hash
                </span>
                <span className="break-all">{signatureHash}</span>
              </div>
            )}

            {!step2Done ? (
              <button
                onClick={confirmStep2}
                disabled={!signatureHash}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                Sign & Accept Custody
              </button>
            ) : (
              <button
                onClick={() => setStep2Done(false)}
                className="w-full py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-all text-xs"
              >
                Reset Signature / Re-sign
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Submit Handover Transaction to Secure Ledger */}
      {step1Done && step2Done && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-full">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-base">Security Verification Complete</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Custody handoff is fully authorized by both parties. Ready to write this checkpoint permanently to the ledger.
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmitHandover}
            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            Secure Handover Record
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
