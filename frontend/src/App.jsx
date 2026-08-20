import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CreateShipment from './components/CreateShipment';
import HandoverVerification from './components/HandoverVerification';
import LedgerViewer from './components/LedgerViewer';
import DriverView from './components/DriverView';
import { 
  LayoutDashboard, PackagePlus, FileCheck, Layers, 
  Smartphone, RotateCcw, Activity, Shield 
} from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeShipment, setActiveShipment] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = io(BACKEND_URL);
    
    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSelectShipmentForHandover = (shipment) => {
    setActiveShipment(shipment);
    setCurrentView('handover');
  };

  const handleOpenDriverMobileView = (shipment) => {
    setActiveShipment(shipment);
    setCurrentView('driver');
  };

  const handleResetSystem = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/blockchain/reset`, { method: 'POST' });
      if (res.ok) {
        setActiveShipment(null);
        setIsResetting(false);
        // Switch back to dashboard on reset to show fresh state
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Error resetting database:', err);
      setIsResetting(false);
    }
  };

  // Render active view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            selectShipmentForHandover={handleSelectShipmentForHandover}
            openDriverMobileView={handleOpenDriverMobileView}
          />
        );
      case 'create':
        return (
          <CreateShipment
            onShipmentCreated={() => {
              // Redirect to dashboard after a delay so they see the mined block first
              setTimeout(() => {
                setCurrentView('dashboard');
              }, 4000);
            }}
          />
        );
      case 'handover':
        return (
          <HandoverVerification
            selectedShipment={activeShipment}
            onHandoverComplete={() => {
              setActiveShipment(null);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'ledger':
        return <LedgerViewer />;
      case 'driver':
        return (
          <DriverView
            selectedShipment={activeShipment}
            onDeliveryComplete={() => {
              setActiveShipment(null);
              // Small delay to let delivery completion sink in
              setTimeout(() => {
                setCurrentView('dashboard');
              }, 3000);
            }}
          />
        );
      default:
        return (
          <Dashboard
            selectShipmentForHandover={handleSelectShipmentForHandover}
            openDriverMobileView={handleOpenDriverMobileView}
          />
        );
    }
  };

  // Nav item list
  const navItems = [
    { id: 'dashboard', name: 'Control Room HUD', icon: LayoutDashboard },
    { id: 'create', name: 'Register Cargo', icon: PackagePlus },
    { id: 'handover', name: 'Custody Handover', icon: FileCheck },
    { id: 'ledger', name: 'Ledger Explorer', icon: Layers },
    { id: 'driver', name: 'Driver Handset', icon: Smartphone },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* 1. Sidebar Panel */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col justify-between shrink-0 border-r border-slate-950 z-30">
        <div>
          {/* Brand Logo & Title */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Shield className="h-5 w-5 fill-blue-400 stroke-blue-200" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-0.5">
                  CargoChain
                </h1>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block -mt-0.5">
                  Secure Freight Ledger
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium italic">
              "Smart India Hackathon Demo"
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                      : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/20">
          <div className="flex items-center justify-between text-[10px] px-1">
            <span className="text-slate-500 font-medium">Simulator Sync:</span>
            <span className="flex items-center gap-1 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
              {socketConnected ? 'LIVE' : 'DISCONNECTED'}
            </span>
          </div>

          <button
            onClick={handleResetSystem}
            disabled={isResetting}
            className="w-full py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-300 disabled:bg-slate-900 disabled:text-slate-600 border border-slate-700 hover:border-red-900 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {isResetting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Reset Hackathon Demo
          </button>
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Control Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-bold capitalize">
              {navItems.find(n => n.id === currentView)?.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* System Health Pulse */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs">
              <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
              <span className="text-slate-600 font-semibold">Nodes Online: 4</span>
            </div>
            
            <div className="text-xs text-right text-slate-400 font-mono hidden md:block">
              14 Aug 2026 | 22:45
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {renderView()}
        </main>
      </div>

    </div>
  );
}
