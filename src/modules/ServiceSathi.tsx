import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Stethoscope, Landmark, MessageSquare, AlertTriangle, UserCheck, Hand, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RestrictedSignDetector from '../components/RestrictedSignDetector';

const CATEGORIES = {
  AADHAAR: {
    title: 'Aadhaar Kendra',
    icon: <Landmark className="w-8 h-8" />,
    color: 'bg-orange-500',
    options: ['Change in Name', 'Address Update', 'Photo Change', 'Date of Birth Update']
  },
  HOSPITAL: {
    title: 'Hospital Support',
    icon: <Stethoscope className="w-8 h-8" />,
    color: 'bg-rose-500',
    options: ['Pain', 'Headache', 'Stomachache', 'Nausea', 'Fever', 'Dizziness']
  },
  POLICE: {
    title: 'Police Station',
    icon: <ShieldCheck className="w-8 h-8" />,
    color: 'bg-slate-900',
    options: ['Theft', 'Threat', 'Kidnapping', 'Bullying', 'Murder', 'Accident']
  }
};

interface ServiceSathiProps {
  onBack: () => void;
}

export default function ServiceSathi({ onBack }: ServiceSathiProps) {
  const [selectedCat, setSelectedCat] = useState<keyof typeof CATEGORIES | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSignInput, setShowSignInput] = useState(false);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl border border-emerald-100 text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
            <UserCheck className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Request Registered</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">Your <span className="text-emerald-600 font-bold">{selectedIssue}</span> report has been securely submitted. An official will be with you shortly using ASL protocols.</p>
          <button 
            onClick={() => { setIsSubmitted(false); setSelectedCat(null); setSelectedIssue(null); setShowSignInput(false); }}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            Return to Service Sathi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-4 bg-white hover:bg-slate-200 rounded-2xl transition-colors shadow-sm border border-slate-200">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                Service Sathi
                <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest font-black">Beta Assistant</span>
              </h1>
              <p className="text-slate-500 font-medium">Accessibility Support for Public Services</p>
            </div>
          </div>
        </header>

        {!selectedCat ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, typeof CATEGORIES.AADHAAR][]).map(([key, cat]) => (
              <motion.button
                key={key}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelectedCat(key)}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 text-left hover:shadow-2xl hover:border-indigo-200 transition-all group flex flex-col h-full"
              >
                <div className={`w-20 h-20 ${cat.color} text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl group-hover:rotate-6 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{cat.title}</h3>
                <p className="text-slate-500 font-medium mb-8 flex-1">Smart gesture translation for {cat.title} requests.</p>
                <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                  Open Support <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <button onClick={() => { setSelectedCat(null); setSelectedIssue(null); setShowSignInput(false); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase text-xs tracking-widest transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Change Department
               </button>
               <div className={`px-4 py-2 ${CATEGORIES[selectedCat].color} text-white text-[10px] font-black rounded-full uppercase tracking-tighter`}>
                  Smart Predictor: Restricted Mode
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl">
                 <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
                    {CATEGORIES[selectedCat].icon}
                    Issue Library
                 </h2>
                 <div className="grid grid-cols-1 gap-3">
                    {CATEGORIES[selectedCat].options.map(option => (
                      <div
                        key={option}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                          selectedIssue === option 
                            ? 'bg-white/20 border-white/40 text-white' 
                            : 'bg-white/5 border-white/10 text-white/20'
                        }`}
                      >
                         <span className="font-bold text-lg">{option}</span>
                         {selectedIssue === option && <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />}
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">Instructions</p>
                    <p className="text-sm font-medium text-white/70">
                       Sign language detection is mandatory for this service. Perform the gestures for the labels above.
                    </p>
                 </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <RestrictedSignDetector 
                  title={`${CATEGORIES[selectedCat].title} Detector`}
                  library={CATEGORIES[selectedCat].options}
                  onMatch={(matched) => setSelectedIssue(matched)}
                />

                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-200">
                  <div className="flex flex-col gap-8">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Confirmed Intent</h4>
                           <p className="text-4xl font-black text-slate-900">{selectedIssue || '---'}</p>
                        </div>
                        {selectedIssue && (
                          <div className="px-6 py-2 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">
                             Verified
                          </div>
                        )}
                     </div>
                     <button 
                        disabled={!selectedIssue}
                        onClick={() => setIsSubmitted(true)}
                        className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-xl hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200"
                     >
                        <ShieldCheck className="w-6 h-6" />
                        Finalize Submission
                     </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex gap-5 items-start">
               <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg shadow-rose-200">
                  <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-rose-900 font-bold text-lg">Emergency Protocol</p>
                  <p className="text-rose-800/70 font-medium">In case of life-threatening situations, use 'Hospital' or 'Police' modules immediately. Our restricted predictor prioritization ensures your signs are understood 2x faster than normal bridge mode.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckCircle2({ className }: any) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
