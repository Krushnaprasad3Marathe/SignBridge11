import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Volume2, Trash2, Delete, Play, Square, Info, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera as MPCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { classifySign } from './lib/aslClassifier';
import { correctWord } from './services/geminiService';

export default function App() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<string>("");
  const [word, setWord] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState<"idle" | "detecting" | "error">("idle");
  const [activeHand, setActiveHand] = useState<string>("None");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<MPCamera | null>(null);
  
  // Advanced Smoothing: Store last 10 detections and pick the most frequent
  const smoothingBuffer = useRef<string[]>([]);
  const detectionCounter = useRef<{ letter: string; count: number }>({ letter: "", count: 0 });

  // Text-to-Speech
  const speak = (text: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleDetectedLetter = useCallback((letter: string) => {
    // Add to buffer
    smoothingBuffer.current.push(letter);
    if (smoothingBuffer.current.length > 10) smoothingBuffer.current.shift();

    // Find most frequent in buffer
    const counts = smoothingBuffer.current.reduce((acc: any, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    
    const dominantLetter = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "");

    if (!dominantLetter) {
      detectionCounter.current = { letter: "", count: 0 };
      setConfidence(0);
      setCurrentLetter("");
      return;
    }

    setCurrentLetter(dominantLetter);

    if (detectionCounter.current.letter === dominantLetter) {
      detectionCounter.current.count += 1;
      setConfidence(Math.min(100, (detectionCounter.current.count / 45) * 100));
      
      if (detectionCounter.current.count === 45) {
        setWord((prev) => prev + dominantLetter);
        detectionCounter.current = { letter: "", count: 0 };
        setConfidence(0);
        smoothingBuffer.current = []; // Clear buffer after lock-in
      }
    } else {
      detectionCounter.current = { letter: dominantLetter, count: 1 };
      setConfidence(0);
    }
  }, []);

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setStatus("detecting");
      const firstHand = results.multiHandedness[0];
      setActiveHand(firstHand.label);

      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness[index].label; 
        
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: handedness === 'Right' ? '#6366f1' : '#10b981', lineWidth: 4 });
        drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
        
        const letter = classifySign(landmarks, handedness);
        handleDetectedLetter(letter);
      });
    } else {
      setStatus("idle");
      setActiveHand("None");
      handleDetectedLetter("");
    }
    canvasCtx.restore();
  }, [handleDetectedLetter]);

  useEffect(() => {
    handsRef.current = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsRef.current.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    handsRef.current.onResults(onResults);

    return () => {
      handsRef.current?.close();
      cameraRef.current?.stop();
    };
  }, [onResults]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      cameraRef.current?.stop();
      setIsCameraActive(false);
      setStatus("idle");
    } else {
      if (videoRef.current) {
        cameraRef.current = new MPCamera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current.start();
        setIsCameraActive(true);
      }
    }
  };

  useEffect(() => {
    const getSuggestion = async () => {
      if (word.length >= 3) {
        setIsAiLoading(true);
        const suggestion = await correctWord(word);
        setAiSuggestion(suggestion);
        setIsAiLoading(false);
      } else {
        setAiSuggestion("");
      }
    };
    
    const timer = setTimeout(getSuggestion, 1000);
    return () => clearTimeout(timer);
  }, [word]);

  const clearWord = () => {
    if (word) setHistory(prev => [word, ...prev].slice(0, 5));
    setWord("");
  };

  const backspace = () => setWord(prev => prev.slice(0, -1));
  const addSpace = () => setWord(prev => prev + " ");

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 id="app-title" className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Camera className="w-8 h-8 text-indigo-600" />
              ASL Vision Translator
            </h1>
            <p className="text-slate-500 font-medium">Real-time Sign-to-Speech Translation</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              id="toggle-camera"
              onClick={toggleCamera}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm ${
                isCameraActive 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isCameraActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isCameraActive ? "Stop Camera" : "Start Camera"}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feed Section */}
          <section className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <video
                ref={videoRef}
                className="hidden"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="w-full h-full object-cover scale-x-[-1]"
              />
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white text-center p-6">
                  <Camera className="w-16 h-16 mb-4 text-slate-400" />
                  <h3 className="text-xl font-semibold mb-2">Camera is Off</h3>
                  <p className="text-slate-400 max-w-sm">Click "Start Camera" to begin translating ASL signs in real-time.</p>
                </div>
              )}

              {/* Real-time Status Overlay */}
              <AnimatePresence>
                {status === "detecting" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs uppercase tracking-widest text-white/70 font-bold">Handedness</span>
                      <span className={`text-sm font-bold ${activeHand === 'Right' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {activeHand === 'Right' ? 'Right (A-M)' : 'Left (N-Z)'}
                      </span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs uppercase tracking-widest text-white/70 font-bold">Detected</span>
                      <span className="text-4xl font-black text-white leading-none">{currentLetter || "?"}</span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-white/70 font-bold">Confidence</span>
                      <div className="w-32 h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-400" 
                          animate={{ width: `${confidence}%` }} 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hint Box */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-900">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-bold">Hand Split Mode:</span> Use your <span className="font-bold text-indigo-600">Right Hand</span> for letters <span className="font-mono bg-white px-1">A-M</span> and your <span className="font-bold text-emerald-600">Left Hand</span> for letters <span className="font-mono bg-white px-1">N-Z</span>.
                Hold steady for 1.5s to lock in.
              </p>
            </div>
          </section>

          {/* Results Section */}
          <section className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 h-full flex flex-col">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-600" />
                Translation
              </h2>
              
              {/* Display Panel */}
              <div className="flex-1 bg-slate-50 rounded-xl p-6 mb-6 border-2 border-dashed border-slate-200 min-h-[200px] relative group">
                <p className="text-4xl font-bold break-words tracking-wide">
                  {word || <span className="text-slate-300 italic font-normal text-xl">Sign letters to form a word...</span>}
                </p>
                {word && (
                  <button 
                    onClick={() => speak(word)}
                    className="absolute top-2 right-2 p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* AI Suggestion */}
              <AnimatePresence>
                {aiSuggestion && aiSuggestion !== word && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">AI Suggestion</span>
                      {isAiLoading && <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-emerald-900 group-hover:text-emerald-700 transition-colors">
                        {aiSuggestion}
                      </p>
                      <button 
                        onClick={() => {
                          setWord(aiSuggestion);
                          setAiSuggestion("");
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1"
                      >
                        Accept
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  id="add-space"
                  onClick={addSpace}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors"
                >
                  Space
                </button>
                <button
                  id="backspace"
                  onClick={backspace}
                  disabled={!word}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl font-semibold text-slate-700 transition-colors"
                >
                  <Delete className="w-4 h-4" />
                  Back
                </button>
                <button
                  id="speak-all"
                  onClick={() => speak(word)}
                  disabled={!word}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
                >
                  <Volume2 className="w-5 h-5" />
                  Speak Word
                </button>
                <button
                  id="clear-all"
                  onClick={clearWord}
                  disabled={!word}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 disabled:opacity-50 rounded-xl font-semibold text-slate-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear & Archive
                </button>
              </div>

              {/* History */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <History className="w-3 h-3" />
                  Recent Words
                </h3>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg flex justify-between items-center"
                    >
                      <span>{h}</span>
                      <button onClick={() => speak(h)} className="text-slate-400 hover:text-indigo-600">
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                  {history.length === 0 && <p className="text-xs text-slate-400 italic">No history yet.</p>}
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Footer info */}
        <footer className="text-center text-slate-400 text-sm py-4">
          Built with MediaPipe Hands & React • Privacy First: No video data leaves your device.
        </footer>
      </div>
    </div>
  );
}

