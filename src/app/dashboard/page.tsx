"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, BookOpen, Clock, Heart, History, Sparkles, Edit2, ShieldAlert, Activity } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const ReadingDnaChart = dynamic(() => import("@/components/reading-dna-chart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
      Loading chart...
    </div>
  ),
});

const mockHistory = [
  { id: 1, title: "The Secret History", date: "2 days ago", match: 98 },
  { id: 2, title: "Babel", date: "1 week ago", match: 92 },
  { id: 3, title: "Piranesi", date: "2 weeks ago", match: 87 },
  { id: 4, title: "If We Were Villains", date: "1 month ago", match: 95 },
];

const defaultDna = [
  { subject: "Philosophical Depth", A: 85, fullMark: 100 },
  { subject: "Escapist Imagination", A: 70, fullMark: 100 },
  { subject: "Cognitive Puzzling", A: 75, fullMark: 100 },
  { subject: "Atmospheric Sensitivity", A: 60, fullMark: 100 },
  { subject: "Aesthetic Obsession", A: 80, fullMark: 100 },
  { subject: "Analytical Curiosity", A: 65, fullMark: 100 },
];

// DYNAMIC COGNITIVE PORTRAIT ARCHETYPE GENERATION ALGORITHM
const getReadingArchetype = (dnaData: { subject: string; A: number }[]) => {
  if (dnaData.length === 0) {
    return { 
      title: "The Literary Explorer", 
      desc: "A highly curious seeker of stories, roaming across genres with an open mind and a balance of styles.", 
      badgeColor: "from-slate-500 to-slate-700" 
    };
  }
  
  // Sort dimensions to find highest values
  const sorted = [...dnaData].sort((a, b) => b.A - a.A);
  const highest = sorted[0];
  const second = sorted[1];
  
  if (highest.subject === "Philosophical Depth") {
    if (second && second.subject === "Aesthetic Obsession") {
      return {
        title: "The Decadent Existentialist",
        desc: "You read to dissect the human condition, seeking dark intellectual secrets, moral complexity, and poignant philosophical questions set in beautifully atmospheric, classical prose.",
        badgeColor: "from-violet-600 to-indigo-950"
      };
    }
    return {
      title: "The Reflective Sage",
      desc: "Your primary reading motivation is the search for truth and raw human experiences. You value high cognitive depth, autobiographical journeys, and serious, thought-provoking themes.",
      badgeColor: "from-cyan-600 to-blue-950"
    };
  }
  
  if (highest.subject === "Escapist Imagination") {
    if (second && second.subject === "Cognitive Puzzling") {
      return {
        title: "The Cybernetic Detective",
        desc: "You love high-tech world-building coupled with complex plots. Cyberpunk matrix heists, interstellar mystery thrillers, and multi-layered scientific conspiracies are your absolute sweet spots.",
        badgeColor: "from-emerald-600 to-teal-950"
      };
    }
    return {
      title: "The Cosmic Voyager",
      desc: "You read for absolute world-expansion. You thrive on sprawling magic systems, epic space operas, and grand heroic kingdoms far removed from ordinary mundane reality.",
      badgeColor: "from-amber-600 to-yellow-950"
    };
  }

  if (highest.subject === "Cognitive Puzzling") {
    if (second && second.subject === "Atmospheric Sensitivity") {
      return {
        title: "The Gothic Sleuth",
        desc: "You are obsessed with toxic romances, haunted old estates, psychological twists, and tense family secrets wrapped in a thick, dark, and highly atmospheric density.",
        badgeColor: "from-rose-600 to-red-950"
      };
    }
    return {
      title: "The Analytical Mastermind",
      desc: "You treat reading as a chess game. You demand highly intricate psychological thrillers, clever whodunit puzzles, and complex narrative timelines that challenge your deduction.",
      badgeColor: "from-blue-600 to-indigo-900"
    };
  }

  if (highest.subject === "Atmospheric Sensitivity") {
    return {
      title: "The Cozy Escapist",
      desc: "You read primarily to capture a sensory feeling. You crave low-stakes cozy fantasies, heartwarming contemporary romance, and found-families that provide a soft, safe, and warm comfort zone.",
      badgeColor: "from-pink-600 to-rose-950"
    };
  }

  return {
    title: "The Thematic Alchemist",
    desc: "You have a highly versatile reading palate, effortlessly blending analytical deduction, rich historical periods, and imaginative escapism into a uniquely balanced literary diet.",
    badgeColor: "from-[#c8a96b] to-amber-950"
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Reader");
  const [isEditingName, setIsEditingName] = useState(false);
  const [stats, setStats] = useState({ explored: 124, favorites: 32 });
  const [history, setHistory] = useState(mockHistory);
  const [dna, setDna] = useState(defaultDna);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load dynamic data from local storage
    const savedName = localStorage.getItem('bookflux_name');
    if (savedName) setUserName(savedName);

    const savedStats = localStorage.getItem('bookflux_stats');
    if (savedStats) setStats(JSON.parse(savedStats));

    const savedHistory = localStorage.getItem('bookflux_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    // Calculate dynamic cognitive radar score based on actual user searches
    let phil = 68;
    let esc = 60;
    let puz = 65;
    let atm = 50;
    let aes = 62;
    let ana = 55;

    try {
      const historySource = savedHistory ? JSON.parse(savedHistory) : mockHistory;
      historySource.forEach((item: any) => {
        const title = (item.title || "").toLowerCase();
        
        // Match terms to adjust reading cognitive DNA authentically
        if (title.includes("history") || title.includes("babel") || title.includes("academia") || title.includes("rose")) aes += 8;
        if (title.includes("stranger") || title.includes("metamorphosis") || title.includes("nausea") || title.includes("existential") || title.includes("experiments")) phil += 10;
        if (title.includes("hobbit") || title.includes("kings") || title.includes("dune") || title.includes("fantasy") || title.includes("hail mary") || title.includes("star wars")) esc += 8;
        if (title.includes("silent") || title.includes("patient") || title.includes("gone") || title.includes("mystery") || title.includes("none")) puz += 8;
        if (title.includes("cozy") || title.includes("romance") || title.includes("house") || title.includes("normal") || title.includes("rebecca")) atm += 10;
      });
    } catch (e) {}

    setDna([
      { subject: "Philosophical Depth", A: Math.min(100, phil + Math.floor(Math.random() * 8)), fullMark: 100 },
      { subject: "Escapist Imagination", A: Math.min(100, esc + Math.floor(Math.random() * 8)), fullMark: 100 },
      { subject: "Cognitive Puzzling", A: Math.min(100, puz + Math.floor(Math.random() * 8)), fullMark: 100 },
      { subject: "Atmospheric Sensitivity", A: Math.min(100, atm + Math.floor(Math.random() * 10)), fullMark: 100 },
      { subject: "Aesthetic Obsession", A: Math.min(100, aes + Math.floor(Math.random() * 8)), fullMark: 100 },
      { subject: "Analytical Curiosity", A: Math.min(100, ana + Math.floor(Math.random() * 12)), fullMark: 100 },
    ]);
  }, []);

  const saveName = (e: any) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditingName(false);
      localStorage.setItem('bookflux_name', userName);
    }
  };

  const readingArchetype = getReadingArchetype(dna);

  if (!mounted) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 container mx-auto">
      
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" className="mb-6 sm:mb-8 hover:bg-white/5 -ml-4 text-xs h-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      {/* Profile Deck Row */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 flex-1"
        >
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center p-1 shrink-0">
            <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
          </div>
          
          {/* Profile Name & Badge */}
          <div className="min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              {isEditingName ? (
                <input 
                  autoFocus
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={saveName}
                  onBlur={saveName}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1 text-2xl sm:text-4xl font-heading font-bold outline-none text-white w-64 max-w-full text-center sm:text-left"
                />
              ) : (
                <>
                  <h1 className="text-2xl sm:text-4xl font-heading font-bold truncate">{userName}'s Profile</h1>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="h-8 w-8 rounded-full opacity-50 hover:opacity-100 shrink-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Glowing Badges */}
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
              <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-white/5 border border-white/10 text-white/50">
                Dynamic Reader
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-gradient-to-r ${readingArchetype.badgeColor} text-white border border-white/10 shadow-md animate-pulse`}>
                Archetype: {readingArchetype.title}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Global Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-2 md:flex gap-3 sm:gap-4 md:items-end justify-stretch md:justify-end flex-1 md:flex-none"
        >
          <Card className="bg-card/40 border-white/5 backdrop-blur-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary/70 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-none mb-1">Explored</p>
                <p className="text-lg sm:text-2xl font-bold leading-none">{stats.explored}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-white/5 backdrop-blur-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-secondary/70 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-none mb-1">Favorites</p>
                <p className="text-lg sm:text-2xl font-bold leading-none">{stats.favorites}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cognitive Fingerprint & Archetype Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Chart Card */}
          <Card className="glass border-white/10 overflow-hidden flex flex-col">
            <CardHeader className="p-5 pb-0">
              <CardTitle className="font-heading text-lg sm:text-xl flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-primary" />
                Reading Cognitive DNA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div className="h-[230px] w-full relative shrink-0">
                <ReadingDnaChart data={dna} />
              </div>
              <p className="text-[10px] text-white/40 text-center italic mt-2">
                Plots active cognitive dimensions derived from your exploration history.
              </p>
            </CardContent>
          </Card>

          {/* Archetype Essay Card */}
          <Card className="glass border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="p-5 pb-2">
              <span className="text-[8px] font-bold text-primary uppercase tracking-widest block mb-0.5">Cognitive Profile</span>
              <CardTitle className="font-heading text-lg sm:text-xl text-white">
                Thematic Persona
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${readingArchetype.badgeColor} border border-white/10 shadow-lg text-center`}>
                <span className="text-xs font-bold text-white uppercase tracking-widest block mb-1">Assigned Archetype</span>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white leading-tight">{readingArchetype.title}</h3>
              </div>
              
              <div className="bg-black/35 border border-white/5 rounded-xl p-4 text-[11px] sm:text-xs text-white/80 leading-relaxed font-medium">
                {readingArchetype.desc}
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                <Activity className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider leading-none">
                  Recalibrates instantly upon book exploration.
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Discoveries History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass h-full border-white/10">
            <CardHeader className="p-6">
              <CardTitle className="font-heading text-xl sm:text-2xl flex items-center gap-2 text-white">
                <History className="w-5 h-5 text-secondary animate-pulse" />
                Recent Discoveries Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-20 flex flex-col justify-center items-center gap-4 bg-white/5 border border-white/5 rounded-xl">
                    <History className="w-10 h-10 text-white/20 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white/70">Console History Empty</p>
                      <p className="text-xs text-white/40 max-w-xs leading-relaxed">You haven't discovered any books yet! Try transmitting custom sensory tuners on the Mood page.</p>
                    </div>
                  </div>
                ) : (
                  history.map((item: any, idx: number) => (
                    <div 
                      key={item.id} 
                      className="flex flex-row items-center justify-between gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg truncate group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-1.5 font-medium leading-none">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-white/40" /> {item.date}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <div className="text-primary font-extrabold text-sm sm:text-base font-mono">{item.match || 92}% Match</div>
                        <Button 
                          variant="link" 
                          onClick={() => router.push(`/recommend?q=${encodeURIComponent(item.title)}`)}
                          className="px-0 h-auto text-[10px] sm:text-xs text-secondary mt-0.5 font-bold uppercase tracking-widest group-hover:text-white"
                        >
                          Trace Again
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
