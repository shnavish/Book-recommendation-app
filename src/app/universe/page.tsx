"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Network, Filter } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// Mock graph data for Emotional Clustering
const gData = {
  nodes: [
    // Clusters / Genres
    { id: "dark-academia", name: "Dark Academia", val: 30, color: "#8b5cf6" },
    { id: "fantasy", name: "High Fantasy", val: 30, color: "#c8a96b" },
    { id: "existential", name: "Existential", val: 30, color: "#ef4444" },
    { id: "mystery", name: "Mystery", val: 30, color: "#3b82f6" },

    // Books
    { id: "secret-history", name: "The Secret History", val: 15, color: "#a78bfa", cluster: "dark-academia" },
    { id: "babel", name: "Babel", val: 15, color: "#a78bfa", cluster: "dark-academia" },
    { id: "if-we-were-villains", name: "If We Were Villains", val: 15, color: "#a78bfa", cluster: "dark-academia" },
    
    { id: "way-of-kings", name: "The Way of Kings", val: 15, color: "#fcd34d", cluster: "fantasy" },
    { id: "name-of-the-wind", name: "The Name of the Wind", val: 15, color: "#fcd34d", cluster: "fantasy" },
    { id: "fourth-wing", name: "Fourth Wing", val: 15, color: "#fcd34d", cluster: "fantasy" },

    { id: "stranger", name: "The Stranger", val: 15, color: "#fca5a5", cluster: "existential" },
    { id: "metamorphosis", name: "The Metamorphosis", val: 15, color: "#fca5a5", cluster: "existential" },
    { id: "nausea", name: "Nausea", val: 15, color: "#fca5a5", cluster: "existential" },

    { id: "silent-patient", name: "The Silent Patient", val: 15, color: "#93c5fd", cluster: "mystery" },
    { id: "gone-girl", name: "Gone Girl", val: 15, color: "#93c5fd", cluster: "mystery" },
  ],
  links: [
    // Dark Academia relationships
    { source: "dark-academia", target: "secret-history" },
    { source: "dark-academia", target: "babel" },
    { source: "dark-academia", target: "if-we-were-villains" },
    { source: "secret-history", target: "if-we-were-villains" },

    // Fantasy relationships
    { source: "fantasy", target: "way-of-kings" },
    { source: "fantasy", target: "name-of-the-wind" },
    { source: "fantasy", target: "fourth-wing" },
    { source: "name-of-the-wind", target: "babel" }, // Cross-genre link

    // Existential relationships
    { source: "existential", target: "stranger" },
    { source: "existential", target: "metamorphosis" },
    { source: "existential", target: "nausea" },
    { source: "secret-history", target: "stranger" }, // Cross-genre link

    // Mystery relationships
    { source: "mystery", target: "silent-patient" },
    { source: "mystery", target: "gone-girl" },
    { source: "secret-history", target: "gone-girl" }, // Cross-genre link
  ]
};

export default function UniversePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative flex flex-col">
      {/* HUD overlay */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none p-6">
        <div className="container mx-auto flex justify-between items-start pointer-events-auto">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-4 hover:bg-white/5 backdrop-blur-md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3 drop-shadow-lg">
                <Network className="w-8 h-8 text-primary" />
                Book Universe
              </h1>
              <p className="text-muted-foreground max-w-md drop-shadow-md bg-black/40 p-2 rounded backdrop-blur-sm">
                Explore emotional clusters and thematic overlaps. Drag nodes to interact with the galaxy of literature.
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="outline" className="backdrop-blur-md bg-black/40 border-white/10 hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Node Info tooltip */}
      {hoverNode && hoverNode.cluster && (
        <div 
          className="absolute z-20 pointer-events-none glass p-4 rounded-xl border border-white/10 shadow-2xl transition-all"
          style={{ 
            left: `${windowSize.width / 2}px`, 
            top: `calc(100% - 140px)`,
            transform: 'translateX(-50%)',
            minWidth: '300px'
          }}
        >
          <h3 className="text-xl font-heading font-bold text-white mb-1">{hoverNode.name}</h3>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hoverNode.color }}></span>
            <span className="text-sm text-muted-foreground uppercase tracking-widest">{hoverNode.cluster}</span>
          </div>
          <p className="text-xs text-white/50 mt-2">Click to explore recommendations related to this node.</p>
        </div>
      )}

      {/* Graph container */}
      <div className="flex-1 cursor-grab active:cursor-grabbing w-full h-full relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0 pointer-events-none" />
        
        {mounted && (
          <ForceGraph2D
            width={windowSize.width}
            height={windowSize.height}
            graphData={gData}
            nodeLabel="name"
            nodeColor={(node: any) => node.color}
            linkColor={() => "rgba(255,255,255,0.15)"}
            nodeRelSize={6}
            linkWidth={1.5}
            onNodeHover={setHoverNode}
            onNodeClick={(node: any) => {
              if (node.cluster) {
                router.push(`/recommend?q=${encodeURIComponent(node.name)}`);
              }
            }}
            backgroundColor="transparent"
          />
        )}
      </div>
    </div>
  );
}
