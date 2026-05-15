import React from 'react';
import { ArrowLeft, Play, Film, MessageCircle, Info, Accessibility } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovieProps {
  onBack: () => void;
}

export default function Movie({ onBack }: MovieProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                <Film className="w-10 h-10 text-rose-500" />
                Adaptive Cinema
              </h1>
              <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Subtitle-to-Sign Conversion Concept</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              {/* Mock Video Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center">
                 <Play className="w-24 h-24 text-white/20 group-hover:text-rose-500 transition-colors cursor-pointer" />
                 <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-sm">Preview Movie Stream</p>
              </div>

              {/* Live ASL Subtitle Overlay Concept */}
              <div className="absolute bottom-12 right-12 w-48 h-64 bg-slate-900/60 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex flex-col items-center justify-center overflow-hidden">
                 <motion.div 
                   animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="text-8xl mb-4"
                 >
                   👋
                 </motion.div>
                 <div className="px-3 py-1 bg-rose-500 text-[10px] font-black rounded-full uppercase mb-4">LIVE ASL</div>
                 <p className="text-center text-xs font-bold text-white/70 leading-relaxed uppercase tracking-tighter">
                    "Welcome back home, detective."
                 </p>
              </div>

              {/* Traditional Subtitle */}
              <div className="absolute bottom-8 left-12 right-64 text-center">
                 <p className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-xl text-lg font-bold inline-block border border-white/5">
                    Welcome back home, detective.
                 </p>
              </div>
            </div>

            <div className="flex items-start gap-6 bg-white/5 p-8 rounded-3xl border border-white/10">
               <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Accessibility className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-2xl font-bold mb-3">Accessibility Vision</h3>
                  <p className="text-slate-400 leading-relaxed">
                    This module demonstrates the feasibility of real-time subtitle-to-ASL conversion. 
                    Unlike traditional captions, ASL gestures provide a more immersive experience for natively 
                    sign-language users by conveying emotion, emphasis, and context through visual movement.
                  </p>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-900/40 relative overflow-hidden">
               <MessageCircle className="absolute -right-8 -top-8 w-40 h-40 text-white/5 rotate-12" />
               <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <Info className="w-4 h-4" />
                 Platform Idea
               </h4>
               <p className="text-white/80 leading-relaxed text-sm mb-6">
                 Using Gemini's structured output, we can break down complex movie scripts into fundamental ASL components 
                 which are then animated or mapped to a library of gesture visualizers.
               </p>
               <ul className="space-y-4">
                 {[
                   'Dynamic Sign Speed',
                   'Context-Aware Mapping',
                   'Inclusive UX Design',
                   'Native ASL Grammar'
                 ].map(item => (
                   <li key={item} className="flex items-center gap-3 text-white font-bold text-sm">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                      {item}
                   </li>
                 ))}
               </ul>
            </div>

            <div className="border border-white/10 rounded-3xl p-8 space-y-6">
               <h4 className="title text-slate-500 uppercase text-xs font-black tracking-widest">Metadata</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400 text-sm">Current Movie:</span>
                     <span className="font-bold">Interstellar</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400 text-sm">AI Engine:</span>
                     <span className="font-bold text-rose-500">SignBridge V4</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400 text-sm">Accuracy:</span>
                     <span className="font-bold">98.4%</span>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
