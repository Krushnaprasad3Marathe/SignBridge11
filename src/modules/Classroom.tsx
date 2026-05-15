import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, BookOpen, GraduationCap, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock ASL emojis to represent the signs from the chart for visual feedback
const ASL_SIGNS: Record<string, string> = {
  'A': '✊', 'B': '✋', 'C': '👌', 'D': '☝️', 'E': '🤜', 'F': '👌', 'G': '👈', 'H': '👉', 
  'I': '🤙', 'J': '⤴️', 'K': '✌️', 'L': '🤘', 'M': '🖖', 'N': '🤟', 'O': '👌', 'P': '👇',
  'Q': '👎', 'R': '🤞', 'S': '👊', 'T': '✌️', 'U': '👆', 'V': '✌️', 'W': '🖖', 'X': '☝️',
  'Y': '🤙', 'Z': '👉'
};

interface ClassroomProps {
  onBack: () => void;
}

export default function Classroom({ onBack }: ClassroomProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript.toUpperCase());
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        if (isListening) recognitionInstance.start();
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 hover:bg-indigo-100 rounded-2xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <School className="w-10 h-10 text-indigo-600" />
                Classroom Interface
              </h1>
              <p className="text-slate-500 font-medium">Equal Way Educational Environment</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teacher Section */}
          <section className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-indigo-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">T</div>
                <div>
                  <p className="font-bold text-slate-900">Teacher's Desk</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Audio Processing</p>
                </div>
              </div>
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  isListening 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? "Stop Session" : "Start Session"}
              </button>
            </div>

            <div className="flex-1 bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center relative overflow-hidden">
               {!recognition && (
                 <div className="p-4 bg-amber-50 text-amber-800 rounded-xl mb-4 text-sm font-medium">
                   Speech recognition is not supported in this browser. Please use Chrome.
                 </div>
               )}
               <AnimatePresence mode="wait">
                 {isListening ? (
                   <motion.div 
                     key="listening"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="space-y-4 w-full"
                   >
                     <div className="flex justify-center gap-1 mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [20, 50, 20] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                            className="w-1 bg-indigo-500 rounded-full"
                          />
                        ))}
                     </div>
                     <p className="text-xl font-medium text-slate-500 italic">Listening to Teacher...</p>
                     <p className="text-3xl font-black text-indigo-900 leading-tight break-words">{transcript || "Waiting for audio..."}</p>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="idle"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="space-y-4"
                   >
                     <BookOpen className="w-16 h-16 text-slate-300 mx-auto" />
                     <p className="text-slate-400 font-medium max-w-xs mx-auto">Start the session to begin real-time speech to sign translation for students.</p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </section>

          {/* Student Section */}
          <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col h-full text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center font-bold">S</div>
              <div>
                <p className="font-bold">Student's View</p>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">ASL Visual Stream</p>
              </div>
            </div>

            <div className="flex-1 bg-white/5 rounded-2xl p-8 border border-white/10 flex flex-col">
              <div className="flex-1 flex flex-wrap gap-4 items-center justify-center content-center font-mono">
                {transcript.split('').map((char, i) => (
                  <motion.div 
                    key={`${transcript}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-20 h-24 bg-white/10 rounded-xl flex flex-col items-center justify-center border border-white/5 group hover:bg-indigo-500/20 transition-colors"
                  >
                    <span className="text-3xl mb-1">{ASL_SIGNS[char.toUpperCase()] || '🖐️'}</span>
                    <span className="text-xs font-black text-white/50">{char.toUpperCase()}</span>
                  </motion.div>
                ))}
                {!transcript && (
                  <GraduationCap className="w-20 h-20 text-white/10" />
                )}
              </div>
              
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Live Text Backlog</p>
                <p className="text-lg font-medium text-white/90">{transcript || "Live signs will appear here..."}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
