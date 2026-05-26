"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Network, Sparkles, X, Star, Eye, BookOpen, Layers, Info, Activity } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// A premium literary cosmos containing ONLY Core Category nodes.
const gData = {
  nodes: [
    { 
      id: "dark-academia", 
      name: "Dark Academia", 
      val: 28, 
      color: "#8b5cf6", 
      desc: "Classical studies, elite academic settings, tragic obsession, and dark intellectual secrets.",
      tropes: ["Scholarly Obsession", "Ancient Languages", "Moral Decay"]
    },
    { 
      id: "fantasy", 
      name: "High Fantasy", 
      val: 28, 
      color: "#c8a96b", 
      desc: "Epic world-spanning magic systems, legendary kingdoms, mythical beasts, and heroic character quests.",
      tropes: ["Mythical Beasts", "World-Spanning Quests", "High Magic"]
    },
    { 
      id: "existential", 
      name: "Existentialism", 
      val: 28, 
      color: "#ef4444", 
      desc: "Absurdist fiction, the search for meaning, moral philosophy, and individual isolation in an indifferent universe.",
      tropes: ["Absurdism", "Individual Isolation", "Philosophy of Meaning"]
    },
    { 
      id: "mystery", 
      name: "Mystery & Suspense", 
      val: 28, 
      color: "#3b82f6", 
      desc: "Tense psychological thrillers, gothic suspense, clever whodunits, and hidden family secrets.",
      tropes: ["Psychological Thrills", "Gothic Suspense", "Whodunit Puzzles"]
    },
    { 
      id: "sci-fi", 
      name: "Sci-Fi Adventures", 
      val: 28, 
      color: "#10b981", 
      desc: "Interstellar space travel, futuristic societies, high-tech warnings, and cosmic exploration.",
      tropes: ["Interstellar Voyages", "Futuristic Warnings", "Cyberpunk Realities"]
    },
    { 
      id: "romance", 
      name: "Cozy Romance", 
      val: 28, 
      color: "#ec4899", 
      desc: "Heartwarming found families, comforting romantic connections, self-discovery, and feel-good journeys.",
      tropes: ["Found Families", "Heartwarming Bonds", "Cozy Escapes"]
    },
    { 
      id: "historical", 
      name: "Historical Fiction", 
      val: 28, 
      color: "#f59e0b", 
      desc: "Richly detailed periods of history, real settings, time-spanning drama, and generational sagas.",
      tropes: ["Generational Sagas", "Detailed Past Eras", "Cathedrals & Kings"]
    },
    { 
      id: "autobiography", 
      name: "Autobiographies", 
      val: 28, 
      color: "#06b6d4", 
      desc: "Inspiring lives, personal struggles, and raw memoirs of historical figures and giants of humanity.",
      tropes: ["Historical Figure Memoirs", "Inspirational Giants", "Personal Triumphs"]
    }
  ],
  links: [
    { source: "dark-academia", target: "existential" },
    { source: "dark-academia", target: "mystery" },
    { source: "dark-academia", target: "historical" },
    { source: "fantasy", target: "sci-fi" },
    { source: "fantasy", target: "romance" },
    { source: "fantasy", target: "dark-academia" },
    { source: "sci-fi", target: "existential" },
    { source: "mystery", target: "historical" },
    { source: "romance", target: "mystery" },
    { source: "historical", target: "autobiography" }
  ]
};

// Resilient Curated Offline Fallback Lists (keeps console operational if rate limits are hit)
const localFallbackBooks: Record<string, { title: string; author: string; desc: string; rating: number; tags: string[] }[]> = {
  "dark-academia": [
    { title: "The Secret History", author: "Donna Tartt", desc: "A group of clever classics students discover a way of thinking that breaks down moral boundaries, leading to tragedy and isolation.", rating: 4.8, tags: ["Classics", "Moral Decay", "Isolation"] },
    { title: "Babel", author: "R.F. Kuang", desc: "A historical fantasy set in 1830s Oxford, where translation magic uses silver-working to sustain imperial power.", rating: 4.8, tags: ["Oxford", "Translation Magic", "Colonialism"] },
    { title: "If We Were Villains", author: "M.L. Rio", desc: "A Shakespearean boarding school mystery where the lines between theatrical tragedy and real murder are dangerously blurred.", rating: 4.6, tags: ["Shakespeare", "Boarding School", "Drama"] }
  ],
  "fantasy": [
    { title: "The Hobbit", author: "J.R.R. Tolkien", desc: "A classic high fantasy quest featuring Bilbo Baggins on a journey to reclaim an ancient dwarven kingdom from a dragon.", rating: 4.8, tags: ["Classic Quest", "Dragons", "Middle-earth"] },
    { title: "The Way of Kings", author: "Brandon Sanderson", desc: "In the storm-swept world of Roshar, Kaladin must survive slavery while Dalinar experiences visions of ancient Knights Radiant.", rating: 4.9, tags: ["Stormlight Archive", "Epic Magic", "Knights"] },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", desc: "Kvothe, a magically gifted young man, grows to become the most notorious wizard, artist, and hero the world has ever known.", rating: 4.8, tags: ["Magic Academy", "Lyrical Prose", "Legend"] }
  ],
  "existential": [
    { title: "The Stranger", author: "Albert Camus", desc: "Through the story of Meursault, an indifferent man who commits a murder on an Algerian beach, Camus explores absurdist philosophy.", rating: 4.5, tags: ["Absurdism", "Philosophy", "Alienation"] },
    { title: "The Metamorphosis", author: "Franz Kafka", desc: "Gregor Samsa wakes up to find himself transformed in his bed into a monstrous, giant insect, exploring family alienation.", rating: 4.6, tags: ["Alienation", "Surrealism", "Kafkaesque"] },
    { title: "Nausea", author: "Jean-Paul Sartre", desc: "Antoine Roquentin, a writer, becomes horrified by his own existence and the physical world around him, experiencing a deep existential dread.", rating: 4.4, tags: ["Existential Dread", "Philosophy", "Diary"] }
  ],
  "mystery": [
    { title: "The Silent Patient", author: "Alex Michaelides", desc: "Alicia Berenson shoots her husband five times in the face and never speaks another word, leaving a therapist obsessed with her motive.", rating: 4.6, tags: ["Psychological Thriller", "Twists", "Silence"] },
    { title: "Gone Girl", author: "Gillian Flynn", desc: "A toxic, dark marriage mystery told through unreliable narration under intense media scrutiny.", rating: 4.7, tags: ["Unreliable Narrator", "Toxic Romance", "Media Frenzy"] },
    { title: "And Then There Were None", author: "Agatha Christie", desc: "Ten strangers are lured to an isolated island and, one by one, are murdered according to a nursery rhyme.", rating: 4.8, tags: ["Classic Mystery", "Whodunit", "Island"] }
  ],
  "sci-fi": [
    { title: "Dune", author: "Frank Herbert", desc: "A cosmic space epic set on the desert planet Arrakis, exploring deep themes of human evolution, ecology, and messianic figures.", rating: 4.9, tags: ["Space Opera", "Ecology", "Philosophy"] },
    { title: "Project Hail Mary", author: "Andy Weir", desc: "A lone astronaut must save humanity from an extinction-level threat, relying on science, math, and an unlikely alien friend.", rating: 4.8, tags: ["Sci-Fi", "Space Adventure", "Extinction"] },
    { title: "Neuromancer", author: "William Gibson", desc: "The definitive cyberpunk thriller following a washed-up computer hacker hired for one last ultimate matrix heist.", rating: 4.7, tags: ["Cyberpunk", "Consciousness", "Matrix"] }
  ],
  "romance": [
    { title: "Pride and Prejudice", author: "Jane Austen", desc: "The timeless classic romance detailing the stormy relationship between Elizabeth Bennet and the proud Mr. Darcy.", rating: 4.8, tags: ["Classic Romance", "Literature", "Classics"] },
    { title: "The House in the Cerulean Sea", author: "TJ Klune", desc: "A heartwarming cozy fantasy about an isolated caseworker sent to inspect an orphanage of unique, magical children.", rating: 4.9, tags: ["Found Family", "Cozy Fantasy", "Queer Romance"] },
    { title: "Normal People", author: "Sally Rooney", desc: "A delicate, contemporary examination of the complex, winding connection between two Irish students.", rating: 4.6, tags: ["Contemporary", "Romance", "Ireland"] }
  ],
  "historical": [
    { title: "The Pillars of the Earth", author: "Ken Follett", desc: "A sweeping, epic historical drama centered around the construction of a grand cathedral in 12th-century England.", rating: 4.8, tags: ["Cathedral", "Middle Ages", "Generational"] },
    { title: "All the Light We Cannot See", author: "Anthony Doerr", desc: "A beautiful, Pulitzer-winning historical novel tracing the parallel lives of a blind French girl and a German orphan boy during WWII.", rating: 4.8, tags: ["WWII", "Generational", "Pulitzer"] },
    { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", desc: "An aging Hollywood icon tells her life story to a young journalist, revealing the secrets of her seven glamorous husbands.", rating: 4.7, tags: ["Hollywood", "LGBTQ+", "Secrets"] }
  ],
  "autobiography": [
    { title: "Wings of Fire", author: "A.P.J. Abdul Kalam", desc: "The inspiring, patriotic autobiography of the former President of India outlining his personal journey and missile program.", rating: 4.8, tags: ["Inspirational", "Patriotic", "APJ Kalam"] },
    { title: "The Story of My Experiments with Truth", author: "Mahatma Gandhi", desc: "The detailed, honest memoir outlining Gandhi's experiments with truth, non-violence, and India's independence fight.", rating: 4.7, tags: ["History", "Independence", "Memoirs"] },
    { title: "Autobiography of a Yogi", author: "Paramahansa Yogananda", desc: "The spiritual classic outlining Yogananda's encounters with saints, sages, and the ancient science of Kriya Yoga.", rating: 4.7, tags: ["Spiritual", "Yogi", "Classics"] }
  ]
};

const intersectionCurations: Record<string, { title: string; author: string; desc: string; rating: number; tags: string[] }[]> = {
  "dark-academia+fantasy": [
    { title: "Babel", author: "R.F. Kuang", desc: "Set in 1830s Oxford, a young Chinese orphan navigates the elite Royal Institute of Translation, discovering that magic relies on silver-working and colonial power.", rating: 4.8, tags: ["Oxford", "Translation Magic", "Colonialism"] },
    { title: "Ninth House", author: "Leigh Bardugo", desc: "A Yale freshman tasked with monitoring the university's occult secret societies discovers a dark conspiracy of murder and magic.", rating: 4.7, tags: ["Secret Societies", "Occult", "New Haven"] },
    { title: "A Deadly Education", author: "Naomi Novik", desc: "A dark magical academy where there are no teachers, and graduation means surviving a school filled with lethal monsters.", rating: 4.6, tags: ["Magic School", "Survival", "Dark Sorcery"] }
  ],
  "existential+sci-fi": [
    { title: "Dune", author: "Frank Herbert", desc: "A cosmic space epic set on the desert planet Arrakis, exploring deep themes of human evolution, ecology, messianic figures, and philosophy.", rating: 4.9, tags: ["Space Opera", "Ecology", "Philosophy"] },
    { title: "The Three-Body Problem", author: "Cixin Liu", desc: "A mind-bending hard sci-fi thriller detailing humanity's first contact with an alien civilization and the existential terror of the cosmos.", rating: 4.8, tags: ["First Contact", "Cosmic Horror", "Physics"] },
    { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", desc: "A post-apocalyptic cyberpunk classic following a bounty hunter tracking escaped replicants, exploring what defines humanity.", rating: 4.7, tags: ["Cyberpunk", "Consciousness", "Androids"] }
  ],
  "historical+mystery": [
    { title: "The Name of the Rose", author: "Umberto Eco", desc: "An intellectual, gothic murder mystery set in a wealthy Italian monastery in 1327, where a monk uses deductive logic to solve bizarre deaths.", rating: 4.8, tags: ["Monastery", "Semiotics", "Middle Ages"] },
    { title: "The Shadow of the Wind", author: "Carlos Ruiz Zafón", desc: "In 1945 Barcelona, a boy discovers a cursed book in the Cemetery of Forgotten Books, pulling him into a dark gothic mystery.", rating: 4.8, tags: ["Barcelona", "Bookish Gothic", "Tragedy"] }
  ],
  "fantasy+romance": [
    { title: "The House in the Cerulean Sea", author: "TJ Klune", desc: "A heartwarming cozy fantasy about an isolated caseworker sent to inspect an orphanage of unique, magical children on a beautiful island.", rating: 4.9, tags: ["Found Family", "Cozy Fantasy", "Queer Romance"] },
    { title: "Legends & Lattes", author: "Travis Baldree", desc: "A battle-weary female orc retires from adventuring to open the very first coffee shop in a high fantasy city, finding friendship.", rating: 4.7, tags: ["Low Stakes", "Cozy Fantasy", "Retirement"] }
  ],
  "dark-academia+existential": [
    { title: "The Picture of Dorian Gray", author: "Oscar Wilde", desc: "A decadent, philosophical dark academia gothic classic following a young man who sells his soul to remain eternally young.", rating: 4.8, tags: ["Aestheticism", "Gothic", "Sin"] },
    { title: "The Secret History", author: "Donna Tartt", desc: "A group of classics students discover a way of thinking that breaks down moral boundaries, leading to tragedy and absolute isolation.", rating: 4.8, tags: ["Classics", "Moral Decay", "Isolation"] }
  ],
  "fantasy+sci-fi": [
    { title: "Star Wars: Heir to the Empire", author: "Timothy Zahn", desc: "The defining space opera that seamlessly blends futuristic spaceships with the mystical, fantasy elements of the Force.", rating: 4.8, tags: ["Space Opera", "Mystical Force", "Saga"] },
    { title: "Gideon the Ninth", author: "Tamsyn Muir", desc: "A spectacular, dark science fantasy epic following space-faring necromancers exploring a gothic space station.", rating: 4.7, tags: ["Necromancers", "Space Gothic", "LGBTQ+"] }
  ],
  "mystery+romance": [
    { title: "Rebecca", author: "Daphne du Maurier", desc: "A young bride moves into her husband's grand seaside estate, only to find herself haunted by the lingering shadow of his deceased first wife.", rating: 4.8, tags: ["Gothic Suspense", "Romantic Thriller", "Manderley"] }
  ]
};

// PRE-COMPILED SYNERGY lookup matrix
const synergyMatrix: Record<string, { affinity: number; title: string; description: string; tropes: string[] }> = {
  "dark-academia+existential": {
    affinity: 88,
    title: "Decadent Solitude",
    description: "Intellectual isolation, moral decay, and aesthetic obsession colliding with existential dread.",
    tropes: ["Intellectual Hubris", "Existential Dread", "Aesthetic Melancholy"]
  },
  "dark-academia+fantasy": {
    affinity: 82,
    title: "Occult Curations",
    description: "Systems of ancient sorcery embedded within elite classical scholarly colleges.",
    tropes: ["Secret Societies", "Occult Studies", "Taboo Magic"]
  },
  "dark-academia+mystery": {
    affinity: 94,
    title: "Gothic Intrigue",
    description: "Toxic rivalries, tragic murders, and hidden archives inside ancient schoolyards.",
    tropes: ["Secret Societies", "Shakespearean Tragedy", "Unreliable Narrator"]
  },
  "dark-academia+historical": {
    affinity: 85,
    title: "Archival Nostalgia",
    description: "Historical dramas exploring long-forgotten classical manuscripts and elite academic lineages.",
    tropes: ["Forgotten Scribes", "Generational Secrets", "Antique Labyrinths"]
  },
  "fantasy+sci-fi": {
    affinity: 92,
    title: "Science Fantasy",
    description: "Space travel intersecting with ancient mystical forces, mythical guilds, and stellar power fields.",
    tropes: ["Space Opera", "Mystic Tech", "Planetary Pilgrimages"]
  },
  "fantasy+romance": {
    affinity: 88,
    title: "Cozy Enchantment",
    description: "Cozy magic systems, found family dynamics, and low-stakes romance in idyllic realms.",
    tropes: ["Found Families", "Low-Stakes Magic", "Slow Burn Connection"]
  },
  "existential+sci-fi": {
    affinity: 90,
    title: "Cosmic Absurdism",
    description: "Android consciousness, high-tech warnings, and human insignificance in an indifferent interstellar infinity.",
    tropes: ["Post-Humanism", "Extinction-Level Threats", "Artificial Minds"]
  },
  "historical+mystery": {
    affinity: 89,
    title: "Chronological Enigmas",
    description: "Gothic crimes, semiotic puzzles, and deductive profiling set in deeply detailed past eras.",
    tropes: ["Monasteries & Vaults", "Period Profiling", "Victorian Sleuths"]
  },
  "mystery+romance": {
    affinity: 80,
    title: "Gothic Thrill",
    description: "Gothic suspense, haunted estates, dark romantic obsessions, and deadly marital secrets.",
    tropes: ["Gothic Mansions", "Romantic Obsession", "Toxic Marriages"]
  }
};

const loadingMessages = [
  "Interlacing stellar matrices...",
  "Querying Gemini AI cosmic model...",
  "Gathering publisher transcripts...",
  "Synthesizing theme threads...",
  "Drawing stellar nodes..."
];

// Circular glowing neon progress gauge
function CompatibilityGauge({ score, color }: { score: number; color: string }) {
  const radius = 22;
  const strokeWidth = 3.5;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (score / 100) * circ;

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 shrink-0 relative overflow-hidden">
      <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle cx="24" cy="24" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle 
            cx="24" 
            cy="24" 
            r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth={strokeWidth} 
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease",
              filter: `drop-shadow(0 0 5px ${color}dd)` 
            }}
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-white font-mono">{score}%</span>
      </div>
      <div className="min-w-0">
        <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block leading-none mb-0.5">Thematic Fit</span>
        <span className="text-[11px] font-bold truncate block uppercase tracking-wider leading-none" style={{ color }}>Synergy</span>
      </div>
    </div>
  );
}

export default function UniversePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(true);
  
  // Dynamic Recs & Interaction States
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cycle loading messages during active fetches
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 1400);
    } else {
      setLoadingMessageIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Dynamic Asynchronous Debounced Recommender
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setRecommendations([]);
      setLoading(false);
      setIsFallback(false);
      return;
    }

    const selectedNodes = selectedCategories
      .map(id => gData.nodes.find(n => n.id === id))
      .filter(Boolean);
    
    // Sort names alphabetically for stable cache key matching on server side
    const selectedNames = selectedNodes.map(n => n?.name).sort();
    const query = `${selectedNames.join(" and ")} genre intersection crossover analysis`;

    setLoading(true);
    setIsFallback(false);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
          setIsFallback(false);
        } else {
          throw new Error("Failed dynamic request");
        }
      } catch (err) {
        console.warn("Unable to fetch dynamic alignment from API, utilizing curated fallback.", err);
        const fallback = getLocalFallback();
        setRecommendations(fallback);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [selectedCategories]);

  // Dynamic synergy mapping
  const getSynergyMetadata = () => {
    if (selectedCategories.length < 2) {
      if (selectedCategories.length === 1) {
        const singleNode = selectedNodesMeta[0];
        return {
          affinity: 100,
          title: "Core Singularity",
          description: singleNode?.desc || "",
          tropes: singleNode?.tropes || []
        };
      }
      return null;
    }
    
    const sorted = [...selectedCategories].sort();
    const key2 = `${sorted[0]}+${sorted[1]}`;
    if (synergyMatrix[key2]) return synergyMatrix[key2];
    
    const key3 = sorted.join("+");
    if (synergyMatrix[key3]) return synergyMatrix[key3];
    
    // Fallback dynamic coefficient calculation
    const nameSum = sorted.reduce((acc, id) => acc + id.length, 0);
    const affinity = 58 + (nameSum % 17);
    return {
      affinity,
      title: "Experimental Fusion",
      description: "An atypical combination of contrasting narrative dimensions, pushing unique literary bounds.",
      tropes: ["Uncharted Tropes", "Narrative Tension", "Thematic Convergence"]
    };
  };

  // Offline / Graceful Local Fallback generator
  const getLocalFallback = () => {
    if (selectedCategories.length === 0) return [];
    
    if (selectedCategories.length >= 2) {
      const sorted = [...selectedCategories].sort();
      const key2 = `${sorted[0]}+${sorted[1]}`;
      if (intersectionCurations[key2]) return intersectionCurations[key2];
      
      const key3 = sorted.join("+");
      if (intersectionCurations[key3]) return intersectionCurations[key3];

      // Merge and shuffle books dynamically
      const mergedBooks: any[] = [];
      selectedCategories.forEach((catId) => {
        const books = localFallbackBooks[catId];
        if (books) {
          mergedBooks.push(...books);
        }
      });
      return [...mergedBooks].sort(() => 0.5 - Math.random()).slice(0, 4);
    }
    
    const singleCat = selectedCategories[0];
    return localFallbackBooks[singleCat] || [];
  };

  // Handle clicking a category node
  const handleNodeClick = (node: any) => {
    if (!node) return;
    
    setSelectedCategories((prev) => {
      // Toggle category selection
      if (prev.includes(node.id)) {
        return prev.filter((id) => id !== node.id);
      }
      // Max out selection at 3 categories for focused cosmic querying
      if (prev.length >= 3) {
        return [...prev.slice(1), node.id];
      }
      return [...prev, node.id];
    });
  };

  // Get active nodes metadata
  const selectedNodesMeta = selectedCategories.map(id => gData.nodes.find(n => n.id === id)).filter(Boolean);
  const synergyData = getSynergyMetadata();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative flex flex-col md:flex-row">
      
      {/* 🚀 LEFT SIDE: The Glowing Constellation Galaxy */}
      <div className="flex-1 h-[55%] md:h-full relative z-0">
        
        {/* HUD Overlay Header */}
        <div className="absolute top-0 left-0 w-full z-10 pointer-events-none p-4 sm:p-6">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <Link href="/">
              <Button variant="ghost" className="mb-2 hover:bg-white/5 backdrop-blur-md text-xs h-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold mb-1 flex items-center gap-2 drop-shadow-lg text-white">
                <Layers className="w-5 h-5 sm:w-6 h-6 text-primary" />
                Intersection Console
              </h1>
              <p className="hidden md:block text-xs text-white/50 max-w-sm bg-black/40 p-2 rounded backdrop-blur-sm border border-white/5">
                Click category stars in the galaxy to trace stellar links. The sidebar will dynamically compile Gemini recommendations based on the intersection of selected nodes!
              </p>
            </motion.div>
          </div>
        </div>

        {/* Floating Guide Drawer */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-28 left-6 z-10 glass p-3 rounded-lg border border-white/10 shadow-2xl max-w-[260px] pointer-events-auto hidden md:block"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Console Guide
                </span>
                <button onClick={() => setShowGuide(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <ul className="text-[10px] text-white/70 space-y-1">
                <li>🎯 Click core stars to select/deselect them</li>
                <li>🎯 Select multiple nodes to trace custom alignments</li>
                <li>🎯 Dynamic results compile instantly in the panel</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Hover Indicator */}
        {hoverNode && !selectedCategories.includes(hoverNode.id) && (
          <div 
            className="absolute z-20 pointer-events-none glass px-2.5 py-1.5 rounded-full border border-white/10 shadow-2xl text-[10px] sm:text-xs flex items-center gap-2 animate-fade-in"
            style={{ 
              left: `${windowSize.width / 4}px`, 
              top: `calc(100% - 48px)`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: hoverNode.color }} />
            <span className="font-heading font-semibold text-white">{hoverNode.name}</span>
            <span className="text-white/40">|</span>
            <span className="text-[9px] text-primary/80 uppercase font-bold tracking-widest">Click to Select</span>
          </div>
        )}

        {/* HTML5 Force Graph */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0 pointer-events-none" />
        
        {mounted && (
          <ForceGraph2D
            width={windowSize.width * (window.innerWidth < 768 ? 1.0 : 0.65)}
            height={windowSize.height * (window.innerWidth < 768 ? 0.55 : 1.0)}
            graphData={gData}
            nodeLabel="name"
            nodeColor={(node: any) => node.color}
            linkColor={(link: any) => {
              const sourceId = link.source && typeof link.source === "object" ? link.source.id : link.source;
              const targetId = link.target && typeof link.target === "object" ? link.target.id : link.target;
              
              // Highlight link if BOTH source and target categories are currently selected!
              const bothSelected = selectedCategories.includes(sourceId) && selectedCategories.includes(targetId);
              if (bothSelected) return "rgba(200, 169, 107, 0.95)"; // Glowing gold constellation lines
              
              return "rgba(255, 255, 255, 0.03)";
            }}
            nodeRelSize={6}
            linkWidth={(link: any) => {
              const sourceId = link.source && typeof link.source === "object" ? link.source.id : link.source;
              const targetId = link.target && typeof link.target === "object" ? link.target.id : link.target;
              const bothSelected = selectedCategories.includes(sourceId) && selectedCategories.includes(targetId);
              return bothSelected ? 5.0 : 1.5;
            }}
            onNodeHover={(node: any) => {
              setHoverNode(node);
            }}
            onNodeClick={(node: any, event) => {
              event.stopPropagation();
              handleNodeClick(node);
            }}
            backgroundColor="transparent"
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              if (typeof node.x !== "number" || typeof node.y !== "number" || isNaN(node.x) || isNaN(node.y)) {
                return;
              }
              const label = node.name;
              const isSelected = selectedCategories.includes(node.id);
              const isHovered = hoverNode && hoverNode.id === node.id;
              const isHighlight = isSelected || isHovered;
              
              const fontSize = 13 / globalScale;
              ctx.font = `${isSelected ? "bold" : "normal"} ${fontSize}px sans-serif`;
              
              // Draw glowing outer aura
              const auraRad = node.val * (isHighlight ? 1.6 : 1.1);
              const grad = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, auraRad);
              grad.addColorStop(0, node.color);
              grad.addColorStop(0.3, `${node.color}55`);
              grad.addColorStop(1, "rgba(0,0,0,0)");
              
              ctx.beginPath();
              ctx.arc(node.x, node.y, auraRad, 0, 2 * Math.PI, false);
              ctx.fillStyle = grad;
              ctx.fill();

              // Draw core star body
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val * (isSelected ? 0.5 : 0.35), 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.shadowColor = node.color;
              ctx.shadowBlur = isHighlight ? 25 : 5;
              ctx.fill();
              
              // Draw inner ring if selected
              if (isSelected) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val * 0.65, 0, 2 * Math.PI, false);
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 1.5;
                ctx.stroke();
              }
              
              ctx.shadowBlur = 0;

              // Draw subtle text label below the node
              const textWidth = ctx.measureText(label).width;
              const padding = fontSize * 0.3;
              const bckgDimensions = [textWidth + padding, fontSize + padding];
              
              ctx.fillStyle = "rgba(10, 10, 10, 0.75)";
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2, 
                node.y + (node.val * 0.6) - bckgDimensions[1] / 2 + 8, 
                bckgDimensions[0], 
                bckgDimensions[1]
              );
              
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = isHighlight ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
              ctx.fillText(label, node.x, node.y + (node.val * 0.6) + 8);
            }}
          />
        )}
      </div>

      {/* 🔮 RIGHT SIDE: Interactive Intersection Console Panel */}
      <div className="w-full md:w-[35%] h-[45%] md:h-full border-t md:border-t-0 md:border-l border-white/10 bg-background/80 backdrop-blur-2xl flex flex-col z-10 shadow-2xl relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary/80" />
        
        {/* Panel Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <h3 className="text-sm sm:text-base font-heading font-bold text-white uppercase tracking-widest">Intersection Console</h3>
          </div>
          {selectedCategories.length > 0 && (
            <button 
              onClick={() => setSelectedCategories([])}
              className="text-[10px] text-primary/80 hover:text-primary transition-colors font-bold uppercase tracking-widest flex items-center gap-1"
            >
              Reset Selected ({selectedCategories.length})
            </button>
          )}
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {selectedCategories.length === 0 ? (
            /* 1. Empty State - No Node Selected */
            <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner">
                <Network className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-heading font-bold text-white">Galaxy Console Offline</h4>
                <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                  Click on one or more category stars in the galaxy network to trace their stellar constellation and generate live recommendations based on their exact intersections!
                </p>
              </div>
            </div>
          ) : (
            /* 2. Active State - Nodes Selected */
            <div className="space-y-6">
              
              {/* Selected Categories Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-widest">
                  <span>Active Star Node(s)</span>
                  <span>Max 3 cores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNodesMeta.map((node: any) => (
                    <span 
                      key={node.id} 
                      onClick={() => handleNodeClick(node)}
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white/90 border flex items-center gap-1.5 cursor-pointer hover:bg-white/5 transition-all animate-fade-in"
                      style={{ 
                        borderColor: `${node.color}50`,
                        background: `linear-gradient(135deg, ${node.color}22, rgba(0,0,0,0.6))`
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                      {node.name}
                      <X className="w-3 h-3 text-white/40" />
                    </span>
                  ))}
                </div>
              </div>

              {/* 🌌 Differentiated: Thematic Constellation Crossover Box */}
              {synergyData && (
                <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group space-y-4">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  
                  {/* Gauge & Title Row */}
                  <div className="flex items-start gap-4">
                    <CompatibilityGauge 
                      score={synergyData.affinity} 
                      color={selectedNodesMeta[0]?.color || "#c8a96b"} 
                    />
                    
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 leading-none">
                        <Layers className="w-3 h-3 text-primary" /> Constellation Intersection Mapped
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                        {synergyData.title}
                      </h4>
                      <p className="text-[10px] text-white/50 leading-tight">
                        {selectedCategories.length === 1 ? "Core Genre Focus" : selectedNodesMeta.map(n => n?.name).join(" ✕ ")}
                      </p>
                    </div>
                  </div>

                  {/* Essay Summary block */}
                  <div className="space-y-1 bg-black/35 p-3 rounded-lg border border-white/5">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Cosmic Thematic Fusion</span>
                    <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed font-medium">
                      {synergyData.description}
                    </p>
                  </div>

                  {/* Tropes Badge list */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Thematic Overlapping Tropes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {synergyData.tropes.map((trope) => (
                        <span 
                          key={trope}
                          className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] uppercase tracking-wider font-semibold font-mono"
                        >
                          ✦ {trope}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Connection Badges */}
                  {!loading && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isFallback ? "bg-amber-400" : "bg-emerald-400"}`} />
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isFallback ? "bg-amber-500" : "bg-emerald-500"}`} />
                      </span>
                      <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold font-mono">
                        {isFallback ? "Loaded resilient offline cache" : "Live cosmic query alignment active"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Recommendations List */}
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Curated Intersected Results ({recommendations.length})
                </span>
                
                {loading ? (
                  /* Loading State - Premium Rotating Nebula & Card Skeletons */
                  <div className="space-y-4 py-2">
                    <div className="flex flex-col justify-center items-center py-6 space-y-3 bg-white/5 border border-white/5 rounded-xl">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        <div 
                          className="absolute inset-1.5 rounded-full border border-secondary/20 border-b-secondary"
                          style={{ animation: 'spin 3s linear infinite reverse' }}
                        />
                      </div>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">
                        {loadingMessages[loadingMessageIdx]}
                      </p>
                    </div>

                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="p-4 rounded-xl border border-white/5 bg-gradient-to-b from-card/30 to-card/10 shadow-md flex gap-4 animate-pulse"
                      >
                        <div className="w-12 h-16 sm:w-14 sm:h-20 bg-white/5 rounded shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 w-2/3 rounded" />
                          <div className="h-3 bg-white/10 w-1/3 rounded" />
                          <div className="space-y-1 pt-1">
                            <div className="h-2 bg-white/5 w-full rounded" />
                            <div className="h-2 bg-white/5 w-full rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Loaded Results List */
                  <div className="space-y-4 animate-fade-in">
                    {recommendations.map((book: any, idx: number) => (
                      <motion.div
                        key={`${book.title}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="p-4 rounded-xl border border-white/5 bg-gradient-to-b from-card/40 to-card/20 shadow-md flex gap-4 hover:border-primary/45 hover:from-white/5 transition-all duration-300 relative group"
                      >
                        {/* Left: Dynamic Book Cover Image or Glowing Icon */}
                        {book.coverUrl ? (
                          <div className="w-12 h-16 sm:w-14 sm:h-20 rounded shrink-0 select-none shadow-md overflow-hidden relative border border-white/10 group-hover:border-primary/40 transition-colors">
                            <img 
                              src={book.coverUrl} 
                              alt={book.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-16 sm:w-14 sm:h-20 bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 rounded flex flex-col justify-center items-center text-white/30 shrink-0 select-none shadow-md group-hover:text-primary transition-all duration-300">
                            <BookOpen className="w-5 h-5 sm:w-6 h-6" />
                            <span className="text-[8px] font-heading font-bold text-white/40 mt-1 uppercase tracking-wider text-center px-1 truncate w-full">{book.title.split(" ")[0]}</span>
                          </div>
                        )}

                        {/* Right: Detailed Metadata */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-heading font-bold text-sm sm:text-base text-white truncate leading-tight group-hover:text-primary transition-colors">{book.title}</h5>
                              {book.matchScore && (
                                <div className="flex items-center gap-1 text-[10px] text-primary shrink-0 font-bold bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                                  <Star className="w-3 h-3 fill-primary text-primary" />
                                  {book.matchScore}%
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mt-0.5 font-medium">by {book.author}</p>
                            <p className="text-[11px] sm:text-xs text-white/60 line-clamp-3 leading-relaxed mt-2">{book.description || book.desc}</p>
                          </div>
                          
                          {/* Action Tray & Tag Container */}
                          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/5">
                            {/* Tags */}
                            {(book.tags) && (
                              <div className="flex flex-wrap gap-1.5">
                                {book.tags.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70 text-[9px] uppercase tracking-wider font-semibold">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Direct Action Buying Badges */}
                            {(book.amazonLink || book.purchaseLink || book.flipkartLink) && (
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {book.purchaseLink && book.purchaseLink !== "#" && (
                                  <a 
                                    href={book.purchaseLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[9px] text-primary/80 hover:text-white bg-primary/10 hover:bg-primary/30 border border-primary/20 rounded px-2 py-0.5 transition-all font-semibold uppercase tracking-wider"
                                  >
                                    Apple
                                  </a>
                                )}
                                {book.amazonLink && (
                                  <a 
                                    href={book.amazonLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[9px] text-primary/80 hover:text-white bg-primary/10 hover:bg-primary/30 border border-primary/20 rounded px-2 py-0.5 transition-all font-semibold uppercase tracking-wider"
                                  >
                                    Amazon
                                  </a>
                                )}
                                {book.flipkartLink && (
                                  <a 
                                    href={book.flipkartLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[9px] text-primary/80 hover:text-white bg-primary/10 hover:bg-primary/30 border border-primary/20 rounded px-2 py-0.5 transition-all font-semibold uppercase tracking-wider"
                                  >
                                    Flipkart
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Panel Footer */}
        {selectedCategories.length > 0 && !loading && (
          <div className="p-4 sm:p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
            <Button 
              onClick={() => {
                const queryStr = selectedNodesMeta.map(n => n?.name).join(" and ");
                router.push(`/recommend?q=${encodeURIComponent(queryStr)}`);
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 sm:h-12 text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Explore Complete {selectedCategories.length === 1 ? "Genre" : "Intersection"} Curation
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
