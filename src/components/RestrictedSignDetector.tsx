import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, CheckCircle, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera as MPCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { classifySign } from '../lib/aslClassifier';
import { restrictedPredict } from '../services/geminiService';

interface RestrictedSignDetectorProps {
  library: string[];
  onMatch: (matchedWord: string) => void;
  title: string;
}

export default function RestrictedSignDetector({ library, onMatch, title }: RestrictedSignDetectorProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [rawWord, setRawWord] = useState<string>("");
  const [confidence, setConfidence] = useState(0);
  const [prediction, setPrediction] = useState<string>("");
  const [isPredicting, setIsPredicting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<MPCamera | null>(null);
  
  const smoothingBuffer = useRef<string[]>([]);
  const detectionCounter = useRef<{ letter: string; count: number }>({ letter: "", count: 0 });

  const handleDetectedLetter = useCallback((letter: string) => {
    if (!letter) {
      detectionCounter.current = { letter: "", count: 0 };
      setConfidence(0);
      return;
    }

    if (detectionCounter.current.letter === letter) {
      detectionCounter.current.count += 1;
      setConfidence(Math.min(100, (detectionCounter.current.count / 30) * 100)); // Faster detection in restricted mode
      
      if (detectionCounter.current.count === 30) {
        setRawWord((prev) => prev + letter);
        detectionCounter.current = { letter: "", count: 0 };
        setConfidence(0);
      }
    } else {
      detectionCounter.current = { letter: letter, count: 1 };
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
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness[index].label; 
        
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: handedness === 'Right' ? '#6366f1' : '#10b981', lineWidth: 4 });
        drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
        
        const letter = classifySign(landmarks, handedness);
        handleDetectedLetter(letter);
      });
    } else {
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
    const getPrediction = async () => {
      if (rawWord.length === 0) {
        setPrediction("");
        return;
      }

      // 1. Try local matching IMMEDIATELY
      const firstChar = rawWord[0].toUpperCase();
      const localMatches = library.filter(word => word.toUpperCase().startsWith(firstChar));
      
      if (localMatches.length === 1) {
        setPrediction(localMatches[0]);
        setIsPredicting(false);
        return;
      }

      // 2. If multiple options or no starting char match, use debounced Gemini predictor
      const timer = setTimeout(async () => {
        setIsPredicting(true);
        const result = await restrictedPredict(rawWord, library);
        setPrediction(result);
        setIsPredicting(false);
      }, 300);

      return () => clearTimeout(timer);
    };
    
    getPrediction();
  }, [rawWord, library]);

  const reset = () => {
    setRawWord("");
    setPrediction("");
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Hand className="w-5 h-5 text-indigo-400" />
          <span className="font-bold tracking-tight">{title}</span>
        </div>
        <button 
          onClick={toggleCamera}
          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            isCameraActive ? 'bg-rose-500' : 'bg-indigo-600'
          }`}
        >
          {isCameraActive ? 'Stop' : 'Start Camera'}
        </button>
      </div>

      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover scale-x-[-1]" />
        
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80 text-white">
            <Camera className="w-12 h-12 mb-2 text-slate-500" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-50">Camera Standby</p>
          </div>
        )}

        {isCameraActive && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Confidence</span>
              <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${confidence}%` }} className="h-full bg-indigo-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Detected Raw</p>
            <p className="text-2xl font-black tracking-widest">{rawWord || "---"}</p>
          </div>
          <button onClick={reset} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <AnimatePresence>
          {prediction && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-100"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Instant Library Match
                </p>
                <p className="text-2xl font-black text-emerald-900">{prediction}</p>
              </div>
              <button 
                onClick={() => onMatch(prediction)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                Select
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isPredicting && (
          <div className="flex items-center gap-2 text-indigo-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Consulting Library...</span>
          </div>
        )}
      </div>
    </div>
  );
}
