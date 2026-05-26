"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, TrendingUp, BookOpen, Network, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/recommend?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary w-6 h-6" />
            <div className="flex flex-col">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-wider leading-none">BookFlux</span>
              <span className="text-[9px] sm:text-[10px] text-primary/85 tracking-widest font-bold mt-1 uppercase">By Shivansh</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/universe" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
              <Network className="w-4 h-4" /> Universe
            </Link>
            <Link href="/mood" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Mood
            </Link>
            <Link href="/trending" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Trending
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 rounded-full px-6">
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Mobile Nav Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-primary transition-colors p-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6 text-base font-medium">
                <Link 
                  href="/universe" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors flex items-center gap-3 py-2 border-b border-white/5"
                >
                  <Network className="w-5 h-5 text-primary" /> Universe
                </Link>
                <Link 
                  href="/mood" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors flex items-center gap-3 py-2 border-b border-white/5"
                >
                  <Sparkles className="w-5 h-5 text-primary" /> Mood
                </Link>
                <Link 
                  href="/trending" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors flex items-center gap-3 py-2 border-b border-white/5"
                >
                  <TrendingUp className="w-5 h-5 text-primary" /> Trending
                </Link>
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2"
                >
                  <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 rounded-full py-5 text-base">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-[96px] sm:blur-[128px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-secondary/20 rounded-full blur-[96px] sm:blur-[128px] -z-10" />

        <div className="container mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Discover Books That <br />
              <span className="text-gradient">Match Your Vibe</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12">
              AI-powered cinematic book discovery platform. Tell us your mood, personality, or emotional state, and we&apos;ll find your next unforgettable read.
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
            <div className="relative flex items-center glass rounded-full p-1.5 pl-4 md:p-2 md:pl-6 border border-white/10 shadow-2xl">
              <Search className="w-5 h-5 md:w-6 h-6 text-muted-foreground mr-2 md:mr-3 shrink-0" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Something like Harry Potter but darker..."
                className="flex-1 bg-transparent border-none shadow-none text-sm md:text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-10 md:h-14 min-w-0"
              />
              <Button type="submit" size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 md:h-12 px-4 md:px-8 font-semibold text-xs md:text-base transition-all hover:scale-105 shrink-0">
                <Sparkles className="w-3.5 h-3.5 md:w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Discover</span>
              </Button>
            </div>
            
            {/* Suggestions Chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-muted-foreground"
            >
              <span className="text-white/40">Try searching:</span>
              <button 
                type="button" 
                onClick={() => {
                  setQuery("Surprise Me");
                  router.push(`/recommend?q=${encodeURIComponent("Surprise Me")}`);
                }}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all font-semibold cursor-pointer text-[10px] sm:text-xs flex items-center gap-1 shadow-sm backdrop-blur-md"
              >
                🎲 Surprise Me
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setQuery("Dark Academia");
                  router.push(`/recommend?q=${encodeURIComponent("Dark Academia")}`);
                }}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all font-semibold cursor-pointer text-[10px] sm:text-xs flex items-center gap-1 shadow-sm backdrop-blur-md"
              >
                🔮 Dark Academia
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setQuery("Epic High Fantasy");
                  router.push(`/recommend?q=${encodeURIComponent("Epic High Fantasy")}`);
                }}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all font-semibold cursor-pointer text-[10px] sm:text-xs flex items-center gap-1 shadow-sm backdrop-blur-md"
              >
                🐉 High Fantasy
              </button>
            </motion.div>
          </motion.form>
        </div>

        {/* Floating Book Covers Mockup */}
        <div className="mt-16 sm:mt-24 container mx-auto px-6 relative h-[250px] sm:h-[350px] md:h-[500px]">
          <motion.div 
            className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-5xl flex justify-center items-center gap-2 sm:gap-4 perspective-1000"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {[
              { name: 'Shadows', desc: 'Dark Academia & Thrillers', img: '/tome_of_shadows.png' },
              { name: 'Light', desc: 'Cozy Reads & Romance', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400' },
              { name: 'Secrets', desc: 'Mystery & Suspense', img: 'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?auto=format&fit=crop&q=80&w=400' },
              { name: 'Eternity', desc: 'Epic High Fantasy', img: '/tome_of_eternity.png' },
              { name: 'Wisdom', desc: 'Philosophy & Literary', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400' },
              { name: 'Time', desc: 'Historical Fiction', img: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400' },
              { name: 'Space', desc: 'Sci-Fi Adventures', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400' },
            ].map((tome, index) => {
              const i = index + 1;
              const isCenter = i === 4;
              const offset = Math.abs(i - 4);
              const zIndex = 10 - offset;
              const scale = isCenter ? 1.1 : 1 - offset * 0.1;
              const yPos = offset * (isMobile ? 8 : 20);
              const rotateY = (i - 4) * (isMobile ? 8 : 15);
              const isMiddleThree = i >= 3 && i <= 5;
              
              return (
                <motion.div
                  key={i}
                  onClick={() => router.push(`/recommend?q=${encodeURIComponent(tome.desc)}`)}
                  initial={{ y: 150, opacity: 0, rotateY: rotateY * 2 }}
                  animate={{ 
                    y: yPos, 
                    opacity: isCenter ? 1 : 1 - offset * 0.15, 
                    rotateY,
                    scale,
                    z: isCenter ? 100 : 0
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: 0.3 + i * 0.1, 
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  whileHover={{ 
                    y: yPos - (isMobile ? 10 : 30), 
                    rotateY: 0, 
                    scale: scale * 1.1, 
                    zIndex: 20,
                    boxShadow: "0 30px 60px -12px rgba(200, 169, 107, 0.4)"
                  }}
                  className={`relative w-20 sm:w-28 md:w-48 aspect-[2/3] rounded-md overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer group ${!isMiddleThree ? 'hidden md:block' : ''}`}
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                  }}
                >
                  <img src={tome.img} alt={tome.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  
                  <div className={`relative z-20 w-full h-full flex flex-col justify-end items-center p-2 sm:p-4 text-center border border-white/10`}>
                    <div className="w-8 md:w-12 h-1 bg-white/20 mb-auto mt-2 md:mt-4 rounded-full group-hover:bg-primary/50 transition-colors" />
                    <p className="font-heading font-bold text-white/90 text-[10px] sm:text-sm md:text-xl tracking-wider mb-1 drop-shadow-md leading-tight">Tome of <br/>{tome.name}</p>
                    <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-primary font-medium mt-1 md:mt-2 leading-tight drop-shadow-md">{tome.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          {/* Glowing Ambient Base */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
        </div>
      </section>
    </div>
  );
}
