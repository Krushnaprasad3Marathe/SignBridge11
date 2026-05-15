import React, { useState } from 'react';
import { ArrowLeft, Train, Bus, Plane, Ticket, CheckCircle2, Hand } from 'lucide-react';
import { motion } from 'framer-motion';
import RestrictedSignDetector from '../components/RestrictedSignDetector';

const LIBRARIES = {
  RAILWAY: ['NASHIK', 'PUNE', 'MUMBAI', 'KOLHAPUR', 'SANGLI', 'HINGOLI', 'THANE'],
  BUS: ['CBS', 'NASHIK ROAD', 'TRIAMBAK', 'ABB', 'SATPUR', 'GANGAPUR', 'PANCHAVATI', 'TAKET'],
  AIRPORT: ['INDIA', 'USA', 'SWITZERLAND', 'CHINA', 'RUSSIA', 'JAPAN', 'DUBAI', 'BALI']
};

interface TicketBookingProps {
  onBack: () => void;
}

export default function TicketBooking({ onBack }: TicketBookingProps) {
  const [view, setView] = useState<'main' | 'railway' | 'bus' | 'airport'>('main');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [showSignInput, setShowSignInput] = useState(false);

  const renderMain = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MenuCard 
        title="Railway Booking" 
        icon={<Train className="w-10 h-10" />} 
        description="Book train tickets with sign assistance"
        onClick={() => setView('railway')}
        color="bg-blue-600"
      />
      <MenuCard 
        title="Bus Booking" 
        icon={<Bus className="w-10 h-10" />} 
        description="Local and intercity bus routes"
        onClick={() => setView('bus')}
        color="bg-emerald-600"
      />
      <MenuCard 
        title="Airport Booking" 
        icon={<Plane className="w-10 h-10" />} 
        description="International and domestic flights"
        onClick={() => setView('airport')}
        color="bg-indigo-600"
      />
    </div>
  );

  const renderBooking = (type: keyof typeof LIBRARIES) => {
    const stations = LIBRARIES[type];
    
    if (isBooked) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 text-center shadow-xl border border-emerald-100 max-w-xl mx-auto"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Ticket Confirmed!</h2>
          <p className="text-slate-500 mb-8">Your ticket to <span className="font-bold text-emerald-600">{selectedStation}</span> has been booked successfully using your gestures.</p>
          <button 
            onClick={() => { setIsBooked(false); setSelectedStation(null); setView('main'); setShowSignInput(false); }}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Back to Menu
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => { setView('main'); setShowSignInput(false); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-xs uppercase tracking-widest">
            <ArrowLeft className="w-5 h-5" /> Back to Categories
          </button>
          <div className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
            {type} Division
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Library Display */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                 <Ticket className="w-6 h-6 text-indigo-400" />
                 Navigation Library
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {stations.map(station => (
                  <div
                    key={station}
                    className={`py-4 px-3 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                      selectedStation === station 
                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg' 
                        : 'border-slate-800 bg-slate-800/30 text-slate-500'
                    }`}
                  >
                    <span className="text-sm font-bold tracking-tight">{station}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
              <Hand className="w-12 h-12 mb-6 text-indigo-300" />
              <h3 className="text-2xl font-black mb-4 tracking-tight">Sign to Choose</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                Manual selection is disabled to prioritize accessibility. Use the sign language detector on the right to select your destination from the library above.
              </p>
            </div>
          </div>

          {/* Detector and Confirmation */}
          <div className="lg:col-span-2 space-y-6">
            <RestrictedSignDetector 
              title={`${type} Station Predictor`}
              library={stations}
              onMatch={(matched) => setSelectedStation(matched)}
            />

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Target Destination</p>
                    <p className="text-4xl font-black text-slate-900">{selectedStation || '---'}</p>
                  </div>
                  {selectedStation && (
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest animate-fade-in">
                      Ready
                    </div>
                  )}
                </div>
                <button 
                  disabled={!selectedStation}
                  onClick={() => setIsBooked(true)}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-3"
                >
                  Confirm & Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex gap-4 text-indigo-900">
           <div className="w-12 h-12 bg-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
           </div>
           <div>
              <p className="font-bold">Restricted Smart Predictor Logic</p>
              <p className="text-sm text-indigo-800/80">Gestures are being filtered against the <span className="font-bold underline">{type}</span> library for maximum accuracy. Powered by Sign Bridge core.</p>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ticket Booking</h1>
              <p className="text-slate-500 font-medium">Gesture-Assisted Travel Interaction</p>
            </div>
          </div>
        </header>

        {view === 'main' && renderMain()}
        {view === 'railway' && renderBooking('RAILWAY')}
        {view === 'bus' && renderBooking('BUS')}
        {view === 'airport' && renderBooking('AIRPORT')}
      </div>
    </div>
  );
}

function MenuCard({ title, icon, description, onClick, color }: any) {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left hover:shadow-xl hover:border-indigo-100 transition-all group overflow-hidden relative"
    >
      <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed mb-6">{description}</p>
      <div className="w-full py-3 bg-slate-50 text-slate-900 text-center rounded-xl font-bold border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        Enter Module
      </div>
    </motion.button>
  );
}
