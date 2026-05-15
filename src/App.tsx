import React, { useState } from 'react';
import { Camera, Ticket, School, Film, UserCircle, Accessibility, ArrowRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import modules
import SignBridge from './modules/SignBridge';
import TicketBooking from './modules/TicketBooking';
import Classroom from './modules/Classroom';
import Movie from './modules/Movie';
import ServiceSathi from './modules/ServiceSathi';

type ModuleType = 'menu' | 'sign-bridge' | 'ticket' | 'classroom' | 'movie' | 'service';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('menu');

  const renderModule = () => {
    switch (activeModule) {
      case 'sign-bridge': return <SignBridge onBack={() => setActiveModule('menu')} />;
      case 'ticket': return <TicketBooking onBack={() => setActiveModule('menu')} />;
      case 'classroom': return <Classroom onBack={() => setActiveModule('menu')} />;
      case 'movie': return <Movie onBack={() => setActiveModule('menu')} />;
      case 'service': return <ServiceSathi onBack={() => setActiveModule('menu')} />;
      default: return <MainMenu onSelect={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderModule()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MainMenu({ onSelect }: { onSelect: (module: ModuleType) => void }) {
  return (
    <div className="min-h-screen bg-[#fafbff] py-12 px-6 md:px-12 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-16">
        
        {/* Hero Section */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-4"
          >
            <Accessibility className="w-4 h-4" />
            Equal Way
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            Accessibility <br />
            <span className="text-indigo-600">Community Platform</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            AI-assisted gesture recognition and inclusive digital ecosystems for speech and hearing impaired individuals.
          </p>
        </header>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ModuleCard
            title="Sign Bridge"
            subtitle="Core Translation"
            description="Real-time open gestures to text/speech conversion."
            icon={<Camera className="w-10 h-10" />}
            onClick={() => onSelect('sign-bridge')}
            accent="bg-indigo-600"
            isLarge
          />
          <ModuleCard
            title="Ticket Booking"
            subtitle="Travel Hub"
            description="Restricted smart prediction for railway, bus and flights."
            icon={<Ticket className="w-10 h-10" />}
            onClick={() => onSelect('ticket')}
            accent="bg-emerald-600"
          />
          <ModuleCard
            title="Classroom"
            subtitle="Smart Education"
            description="Speech to sign conversion for inclusive learning."
            icon={<School className="w-10 h-10" />}
            onClick={() => onSelect('classroom')}
            accent="bg-amber-600"
          />
          <ModuleCard
            title="Movie"
            subtitle="Adaptive Media"
            description="Subtitle to ASL sign conversion concept for cinema."
            icon={<Film className="w-10 h-10" />}
            onClick={() => onSelect('movie')}
            accent="bg-rose-600"
          />
          <ModuleCard
            title="Service Sathi"
            subtitle="Public Services"
            description="Gesture support for hospitals, police and Aadhaar Kendra."
            icon={<UserCircle className="w-10 h-10" />}
            onClick={() => onSelect('service')}
            accent="bg-slate-900"
            isLarge
          />
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Sign Bridge Core Integrated
          </div>
          <p>© 2026 Accessibility Community Platform • Equal Way Initiative</p>
          <div className="flex items-center gap-6">
            <div className="group relative">
              <button className="hover:text-slate-900 transition-colors">Privacy</button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
                Your privacy is paramount. Camera data is processed locally on your device using MediaPipe. No video information is ever recorded, stored, or shared with third parties or our servers.
              </div>
            </div>
            <button className="hover:text-slate-900 transition-colors">Terms</button>
            <button className="hover:text-slate-900 transition-colors">Support</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ModuleCard({ title, subtitle, description, icon, onClick, accent, isLarge }: any) {
  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`text-left group relative flex flex-col h-full bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all ${isLarge ? 'md:col-span-1' : ''}`}
    >
      <div className={`w-16 md:w-20 h-16 md:h-20 ${accent} text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="space-y-3 flex-1 flex flex-col">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">{subtitle}</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h3>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed flex-1">{description}</p>
        <div className="pt-6 flex items-center gap-3 font-black text-slate-900 uppercase text-xs tracking-widest">
           Access Module <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -z-10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
