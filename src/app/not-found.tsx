"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Compass, Search, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const lostBookQuotes = [
  {
    quote: "I have always imagined that Paradise will be a kind of library.",
    author: "Jorge Luis Borges",
  },
  {
    quote: "Not all those who wander are lost... but this page definitely is.",
    author: "J.R.R. Tolkien (adapted)",
  },
  {
    quote: "There is no mistake; there has been some missing page in the story of my life.",
    author: "Wilkie Collins",
  },
  {
    quote: "The library is unlimited and periodic.",
    author: "Jorge Luis Borges",
  },
];

export default function NotFound() {
  const router = useRouter();
  
  // Pick a random quote on compile/render
  const randomQuote = lostBookQuotes[Math.floor(Math.random() * lostBookQuotes.length)];

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Cinematic Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-[96px] sm:blur-[128px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-secondary/20 rounded-full blur-[96px] sm:blur-[128px] -z-10" />
      
      {/* Interactive Cinematic Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_60%,_rgba(15,17,21,0.95))] pointer-events-none -z-15" />

      <div className="max-w-2xl w-full text-center z-10 space-y-8 sm:space-y-12">
        {/* Glowing Compass/Book Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center p-1.5 shadow-[0_0_50px_rgba(200,169,107,0.25)] border border-white/10"
        >
          <div className="w-full h-full bg-card rounded-full flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Compass className="w-10 h-10 sm:w-14 sm:h-14 text-primary animate-pulse" />
          </div>
        </motion.div>

        {/* 404 Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-2 sm:space-y-4"
        >
          <h1 className="text-gradient font-heading text-6xl sm:text-8xl font-black tracking-wider leading-none">
            404
          </h1>
          <h2 className="font-heading text-xl sm:text-3xl font-bold text-white tracking-wide">
            Page Lost in the Literary Cosmos
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The tome you seek has either been moved, deleted, or was never cataloged in our galactic archive.
          </p>
        </motion.div>

        {/* Literary Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass rounded-2xl p-5 sm:p-8 max-w-xl mx-auto shadow-2xl relative border border-white/10"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <BookOpen className="w-5 h-5 text-primary/40 mb-3 mx-auto" />
          <blockquote className="text-xs sm:text-base text-white/80 font-heading italic leading-relaxed">
            &ldquo;{randomQuote.quote}&rdquo;
          </blockquote>
          <cite className="block text-[10px] sm:text-xs text-primary font-mono uppercase tracking-widest mt-3 sm:mt-4 font-bold not-italic">
            &mdash; {randomQuote.author}
          </cite>
        </motion.div>

        {/* Navigation Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-11 sm:h-12 text-xs sm:text-sm font-semibold tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Link href="/" className="w-full">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 sm:h-12 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
