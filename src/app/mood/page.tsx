"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, CloudRain, Flame, Moon, Coffee, HeartCrack, Compass, Gauge, Activity, Shuffle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

const moods = [
  { id: "dark-academia", name: "Dark Academia", icon: Moon, color: "from-slate-800 to-black", glow: "group-hover:shadow-[0_0_30px_-5px_rgba(30,41,59,0.7)]" },
  { id: "cozy-fantasy", name: "Cozy Fantasy", icon: Coffee, color: "from-amber-700 to-orange-950", glow: "group-hover:shadow-[0_0_30px_-5px_rgba(180,83,9,0.7)]" },
  { id: "rainy-day", name: "Rainy Day Reads", icon: CloudRain, color: "from-blue-800 to-slate-900", glow: "group-hover:shadow-[0_0_30px_-5px_rgba(30,58,138,0.7)]" },
  { id: "existential", name: "Existential Crisis", icon: Compass, color: "from-purple-900 to-indigo-950", glow: "group-hover:shadow-[0_0_30px_-5px_rgba(88,28,135,0.7)]" },
  { id: "emotional-damage", name: "Emotional Damage", icon: HeartCrack, color: "from-rose-900 to-red-950", glow: "group-hover:shadow-[0_0_30px_-5px_rgba(159,18,57,0.7)]" },
  { id: "high-stakes", name: "High Stakes Action", icon: Flame, color: "from-orange-600 to-red-900", glow: "group-hover:shadow-[0_0_30px_-5px_rgba(234,88,12,0.7)]" },
];

// Interactive pulsing neon SVG Waveform
function Waveform({ pace, density, bias }: { pace: number; density: number; bias: number }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      // Speed scales dynamically with Pace value (1 -> Slow, 3 -> Fast)
      const speed = pace === 1 ? 0.025 : pace === 2 ? 0.065 : 0.15;
      setPhase((prev) => prev + speed);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [pace]);

  // Neon color spectrum shifting dynamically based on Emotional Ending Bias
  // 1 (Uplifting) -> Bright Emerald Green
  // 2 (Neutral) -> Warm Vintage Gold
  // 3 (Tragic) -> Radiant Ruby Red
  const strokeColor = bias === 1 ? "#10b981" : bias === 2 ? "#c8a96b" : "#ef4444";

  // Thickness & Glow shadows scale with Atmospheric Density (1 -> Light, 3 -> Gothic Heavy)
  const strokeWidth = density === 1 ? 1.5 : density === 2 ? 3.0 : 5.5;
  const shadowBlur = density === 1 ? 5 : density === 2 ? 15 : 30;

  // Wave amplitude and frequency settings
  const amp = density === 1 ? 6 : density === 2 ? 14 : 26;
  const freq = pace === 1 ? 0.015 : pace === 2 ? 0.028 : 0.045;

  const points = [];
  const width = 320;
  const height = 90;
  const centerY = height / 2;

  for (let x = 0; x <= width; x += 4) {
    const y = centerY + Math.sin(x * freq + phase) * amp * Math.cos(x * 0.006 + phase * 0.15);
    points.push(`${x},${y}`);
  }

  const d = `M ${points.join(" L ")}`;

  return (
    <div className="w-full max-w-[320px] mx-auto py-2 flex items-center justify-center">
      <svg width="320" height={height} className="overflow-visible select-none pointer-events-none">
        <defs>
          <filter id="neon-wave-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={shadowBlur / 4} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          filter="url(#neon-wave-glow)"
          style={{ transition: "stroke 0.4s ease, stroke-width 0.2s ease" }}
        />
      </svg>
    </div>
  );
}

export default function MoodPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string>("Dark Academia");
  const [pace, setPace] = useState(2);
  const [density, setDensity] = useState(2);
  const [bias, setBias] = useState(2);

  // Formulate the customized search query representing all selections
  const handleDiscover = () => {
    const pacingText = pace === 1 ? "slow burn" : pace === 2 ? "moderate pacing" : "breakneck speed";
    const densityText = density === 1 ? "lighthearted and cozy" : density === 2 ? "balanced" : "heavy, dark and gothic";
    const biasText = bias === 1 ? "warm, inspiring and uplifting" : bias === 2 ? "poignant, melancholic" : "tragic, existential, or deeply emotional";

    const compiledQuery = `${selectedMood} book with ${pacingText} pace, ${densityText} atmospheric density, and ${biasText} tone`;
    router.push(`/recommend?q=${encodeURIComponent(compiledQuery)}`);
  };

  // Compile sensory recipe overview
  const getRecipeSummary = () => {
    const paceWord = pace === 1 ? "Slow Burn" : pace === 2 ? "Balanced" : "Accelerated";
    const densityWord = density === 1 ? "Luminous" : density === 2 ? "Substantial" : "Nocturnal & Gothic";
    const biasWord = bias === 1 ? "Sanguine" : bias === 2 ? "Poignant" : "Tragic & Heavy";
    return `${paceWord} pacing ✕ ${densityWord} environment ✕ ${biasWord} resolution`;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 container mx-auto flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 sm:mb-8 hover:bg-white/5 -ml-4 text-xs h-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 flex items-center justify-center gap-2 text-white">
            <Activity className="w-6 h-6 sm:w-8 h-8 text-primary animate-pulse" />
            Atmospheric Sensory Tuner
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Standard genre searches only cover category tags. Select your core vibe below and adjust narrative sliders to synthesize a customized sensory formula.
          </p>
        </motion.div>

        {/* STEP 1: Select Vibe Card */}
        <div className="mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary select-none">1</span>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Select Core Vibe Alignment</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {moods.map((mood, index) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.name;
            return (
              <motion.div
                key={mood.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMood(mood.name)}
              >
                <Card 
                  className={`group cursor-pointer h-28 sm:h-36 border-white/10 transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${mood.color} ${
                    isSelected 
                      ? 'ring-2 ring-primary border-primary shadow-[0_0_25px_rgba(200,169,107,0.35)] scale-[0.98]' 
                      : 'hover:-translate-y-1 hover:border-white/20 ' + mood.glow
                  }`}
                >
                  <div className="absolute inset-0 bg-black/55 group-hover:bg-black/35 transition-colors duration-300" />
                  
                  {/* Selected Indicator Dot */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-ping" />
                  )}
                  
                  <CardContent className="relative h-full flex flex-col items-center justify-center p-3 sm:p-4 text-center z-10">
                    <Icon className={`w-6 h-6 sm:w-8 h-8 ${isSelected ? 'text-primary' : 'text-white/40 group-hover:text-white/80'} mb-1.5 sm:mb-2 transition-colors duration-300`} />
                    <h2 className={`text-xs sm:text-base font-heading font-bold ${isSelected ? 'text-primary' : 'text-white/80 group-hover:text-white'} transition-colors duration-300`}>
                      {mood.name}
                    </h2>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* STEP 2: Sliders Tuning Console */}
        <div className="mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary select-none">2</span>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Adjust Thematic Sensory Parameters</h3>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-card/75 to-card/25 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row gap-8 relative overflow-hidden"
        >
          {/* Subtle cosmic background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left Side: Waveform Signatures & Cockpit */}
          <div className="w-full md:w-[40%] flex flex-col justify-center items-center gap-4 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-8">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5 self-start">
              <Activity className="w-3.5 h-3.5 text-primary" /> Waveform Sensory Signature
            </span>
            
            {/* Pulsing visual feedback */}
            <div className="w-full h-32 rounded-xl bg-black/45 border border-white/5 flex items-center justify-center overflow-hidden shadow-inner relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_60%,_rgba(10,10,10,0.85))] pointer-events-none z-10" />
              <Waveform pace={pace} density={density} bias={bias} />
            </div>

            {/* Status Deck */}
            <div className="w-full space-y-1 mt-2">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Active Recipe</span>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{getRecipeSummary()}</span>
              </div>
              <p className="text-[10px] text-white/40 text-center italic mt-1.5">
                Wave colors map emotional resolution, thickness represents density, and motion tracks pacing.
              </p>
            </div>
          </div>

          {/* Right Side: Slider Grid & Transmit */}
          <div className="flex-1 space-y-6 sm:space-y-8 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-primary" /> Calibration Controls
            </span>

            <div className="space-y-6">
              {/* Slider 1: Narrative Pace */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white/80">Narrative Pace</span>
                  <span className="text-primary font-bold tracking-wide uppercase text-[10px]">
                    {pace === 1 ? "Slow Burn (Reflective)" : pace === 2 ? "Standard Pacing" : "Breakneck Speed (High Stakes)"}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={pace} 
                  onChange={(e) => setPace(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-wider font-semibold">
                  <span>Slow</span>
                  <span>Balanced</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Slider 2: Atmospheric Density */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white/80">Atmospheric Density</span>
                  <span className="text-primary font-bold tracking-wide uppercase text-[10px]">
                    {density === 1 ? "Luminous & Airy" : density === 2 ? "Balanced Focus" : "Heavy, Gothic & Immersive"}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={density} 
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-wider font-semibold">
                  <span>Light</span>
                  <span>Balanced</span>
                  <span>Heavy</span>
                </div>
              </div>

              {/* Slider 3: Emotional Bias */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white/80">Story Resolution Bias</span>
                  <span className="text-primary font-bold tracking-wide uppercase text-[10px]">
                    {bias === 1 ? "Inspiring & Uplifting" : bias === 2 ? "Bitter-Sweet / Poignant" : "Tragic & Existential"}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={bias} 
                  onChange={(e) => setBias(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-wider font-semibold">
                  <span>Uplifting</span>
                  <span>Bitter-Sweet</span>
                  <span>Tragic</span>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-white/5 mt-auto">
              <Button 
                onClick={handleDiscover}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                Transmit Atmospheric Calibration
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
