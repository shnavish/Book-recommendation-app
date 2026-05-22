"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, TrendingUp, BookOpen, Network } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

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
              <span className="font-heading text-2xl font-bold tracking-wider leading-none">BookFlux</span>
              <span className="text-[10px] text-primary/85 tracking-widest font-bold mt-1 uppercase">By Shivansh</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] -z-10" />

        <div className="container mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-heading text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover Books That <br />
              <span className="text-gradient">Match Your Vibe</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
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
            <div className="relative flex items-center glass rounded-full p-2 pl-6 border border-white/10 shadow-2xl">
              <Search className="w-6 h-6 text-muted-foreground mr-3" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Something like Harry Potter but darker and philosophical..."
                className="flex-1 bg-transparent border-none shadow-none text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-14"
              />
              <Button type="submit" size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-semibold text-base transition-all hover:scale-105">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover
              </Button>
            </div>
          </motion.form>
        </div>

        {/* Floating Book Covers Mockup */}
        <div className="mt-24 container mx-auto px-6 relative h-[500px]">
          <motion.div 
            className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-5xl flex justify-center items-center gap-4 perspective-1000"
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
              const yPos = offset * 20;
              const rotateY = (i - 4) * 15;
              
              return (
                <motion.div
                  key={i}
                  onClick={() => router.push(`/recommend?q=${encodeURIComponent(tome.desc)}`)}
                  initial={{ y: 200, opacity: 0, rotateY: rotateY * 2 }}
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
                    y: yPos - 30, 
                    rotateY: 0, 
                    scale: scale * 1.1, 
                    zIndex: 20,
                    boxShadow: "0 30px 60px -12px rgba(200, 169, 107, 0.4)"
                  }}
                  className={`relative w-28 md:w-48 aspect-[2/3] rounded-md overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer group`}
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                  }}
                >
                  <img src={tome.img} alt={tome.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  
                  <div className={`relative z-20 w-full h-full flex flex-col justify-end items-center p-4 text-center border border-white/10`}>
                    <div className="w-12 h-1 bg-white/20 mb-auto mt-4 rounded-full group-hover:bg-primary/50 transition-colors" />
                    <p className="font-heading font-bold text-white/90 text-sm md:text-xl tracking-wider mb-1 drop-shadow-md">Tome of <br/>{tome.name}</p>
                    <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                      <p className="text-[10px] md:text-xs text-primary font-medium mt-2 leading-tight drop-shadow-md">{tome.desc}</p>
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
