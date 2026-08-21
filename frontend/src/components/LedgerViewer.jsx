import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, ShieldAlert, RotateCcw, AlertTriangle, ArrowRight, Eye, Edit2 } from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

export default function LedgerViewer() {
  const [chain, setChain] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [tamperedIndex, setTamperedIndex] = useState(null);
  const [reason, setReason] = useState('');
  const [tamperIndexMode, setTamperIndexMode] = useState(null);
  const [tamperForm, setTamperForm] = useState({ field: '', value: '' });

  const fetchLedger = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/blockchain`);
      const data = await res.json();
      setChain(data.chain || []);
      setIsValid(data.isValid);
      setTamperedIndex(data.tamperedIndex);
      setReason(data.reason || '');
    } catch (err) {
      console.error('Error fetching ledger:', err);
    }
  };

  useEffect(() => {
    fetchLedger();
    const socket = io(BACKEND_URL);
    socket.on('chain_updated', (updatedChain) => {
      // Re-fetch to get server-side validation status
      fetchLedger();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleTamper = async (index, field, currentValue) => {
    setTamperIndexMode(index);
    setTamperForm({ field, value: String(currentValue) });
  };

  const submitTamper = async (index) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/blockchain/tamper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index,
          field: tamperForm.field,
          value: tamperForm.value,
        }),
      });
      const data = await res.json();
      setChain(data.chain);
      setIsValid(data.isValid);
      setTamperedIndex(data.tamperedIndex);
      setReason(data.reason || '');
      setTamperIndexMode(null);
    } catch (err) {
      console.error('Tampering error:', err);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/blockchain/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTamperIndexMode(null);
        fetchLedger();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-white rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Secure Cryptographic Ledger</h1>
          </div>
          <p className="text-slate-500 mt-1">
            Real-time cryptographic audit trail of all logistical checkpoints and telemetry warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Ledger State
          </button>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
              isValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 glow-green'
                : 'bg-red-50 text-red-700 border-red-200 glow-red pulse-alert-red'
            }`}
          >
            {isValid ? (
              <>
                <ShieldCheck className="h-5 w-5" />
                Ledger Status: SECURED & VALID
              </>
            ) : (
              <>
                <ShieldAlert className="h-5 w-5" />
                Ledger Status: CORRUPTED / TAMPER DETECTED
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corruption Banner */}
      {!isValid && (
        <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-800 animate-pulse">
          <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg">Ledger Integrity Compromised</h3>
            <p className="mt-1 text-sm text-red-700">
              The cryptographic hash link has been broken starting at <strong>Record #{tamperedIndex}</strong> due to data modifications. 
              The validation algorithm detected that the record's current hash does not correspond to its inputs, or the subsequent record's previous hash link is severed.
            </p>
            <div className="mt-3 text-xs bg-red-100 font-mono py-1 px-3 rounded-lg inline-block text-red-900">
              Fail Reason: {reason}
            </div>
          </div>
        </div>
      )}

      {/* Ledger Visualization Flow */}
      <div className="flex flex-col gap-6 relative">
        {chain.map((block, idx) => {
          const isBlockTampered = !isValid && idx >= tamperedIndex;
          const isDirectTarget = !isValid && idx === tamperedIndex;

          return (
            <div key={block.index} className="flex flex-col md:flex-row items-center gap-4">
              {/* Block Card */}
              <div
                className={`w-full bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
                  isDirectTarget
                    ? 'border-red-500 ring-2 ring-red-200 glow-red'
                    : isBlockTampered
                    ? 'border-red-300 border-dashed bg-red-50/20'
                    : 'border-slate-100 hover:border-blue-200'
                }`}
              >
                {/* Block Header */}
                <div
                  className={`flex items-center justify-between px-5 py-3 border-b rounded-t-2xl ${
                    isDirectTarget
                      ? 'bg-red-500 text-white border-red-500'
                      : isBlockTampered
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-slate-50 text-slate-800 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm uppercase px-2 py-0.5 bg-white/20 rounded">
                      Record #{block.index}
                    </span>
                    {block.index === 0 && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-800 dark:text-blue-100 font-bold rounded">
                        Genesis Record
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono opacity-80">
                    {new Date(block.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Block Body */}
                <div className="p-5 space-y-4">
                  {/* Hashes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-sans">Previous Hash:</span>
                      <span className="text-slate-700 truncate block" title={block.previousHash}>
                        {block.previousHash}
                      </span>
                    </div>
                    <div
                      className={`p-2.5 border rounded-xl space-y-1 ${
                        isDirectTarget
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-slate-400 block font-sans">Record Hash:</span>
                      <span className="truncate block font-bold" title={block.hash}>
                        {block.hash}
                      </span>
                    </div>
                  </div>

                  {/* Block Payload */}
                  <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                    <div className="text-slate-400 font-sans border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
                      <span>Payload Data (Immutable Audit Log)</span>
                      <span className="text-[10px] text-blue-400">Nonce: {block.nonce}</span>
                    </div>
                    {tamperIndexMode === block.index ? (
                      <div className="space-y-3 p-2 bg-slate-800 rounded-lg">
                        <div className="flex gap-2 items-center">
                          <label className="text-[10px] text-slate-400 w-16">Field Key:</label>
                          <input
                            type="text"
                            value={tamperForm.field}
                            onChange={(e) => setTamperForm({ ...tamperForm, field: e.target.value })}
                            className="bg-slate-700 text-white rounded px-2 py-0.5 w-full outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="text-[10px] text-slate-400 w-16">Tamper Val:</label>
                          <input
                            type="text"
                            value={tamperForm.value}
                            onChange={(e) => setTamperForm({ ...tamperForm, value: e.target.value })}
                            className="bg-slate-700 text-white rounded px-2 py-0.5 w-full outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex justify-end gap-2 text-[10px] pt-1">
                          <button
                            onClick={() => setTamperIndexMode(null)}
                            className="px-2 py-1 bg-slate-600 rounded text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitTamper(block.index)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            Inject Tamper
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(block.data, null, 2)}</pre>
                        {block.index !== 0 && (
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => {
                                // Default tamper selection helpers based on payload type
                                const key = block.data.type === 'CREATE' ? 'cargoType' : 
                                            block.data.type === 'HANDOVER' ? 'weightConfirmed' : 'status';
                                const val = block.data.type === 'CREATE' ? 'Illegal Waste' : 
                                            block.data.type === 'HANDOVER' ? '1200' : 'HIJACKED';
                                handleTamper(block.index, key, val);
                              }}
                              className="flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-800 hover:bg-red-900 hover:text-red-100 border border-slate-700 hover:border-red-800 transition-colors rounded text-slate-400 font-sans"
                            >
                              <Edit2 className="h-3 w-3" />
                              Simulate Tampering
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
