"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, BookOpen } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type TrendingBook = {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  source: string;
  trendScore: number;
  tags: string[];
  description?: string;
  coverUrl?: string;
  amazonLink?: string;
  flipkartLink?: string;
  padhegaLink?: string;
};

export default function TrendingPage() {
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState<TrendingBook[]>([]);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch("/api/trending");
        const data = await response.json();
        setTrending(data.trending || []);
      } catch (error) {
        console.error("Failed to fetch trending", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 container mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-8 hover:bg-white/5 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-heading font-bold mb-4 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          Trending Worldwide
        </h1>
        <p className="text-muted-foreground text-lg">
          The most talked-about books across BookTok, Goodreads, and Reddit right now.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Card key={i} className="bg-card/50 border-white/5 animate-pulse h-80" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass overflow-hidden h-full flex flex-col group hover:border-primary/50 transition-all duration-300 hover:-translate-y-2">
                <div className={`relative h-64 bg-gradient-to-br ${book.coverColor} flex items-center justify-center border-b border-white/5 overflow-hidden`}>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <BookOpen className="w-16 h-16 text-white/30 drop-shadow-2xl z-10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white/80 uppercase tracking-wider z-10">
                    #{index + 1} Trending
                  </div>
                  <div className="absolute bottom-3 right-3 bg-primary/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-primary border border-primary/20 z-10">
                    From {book.source}
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h2 className="text-lg font-heading font-bold mb-1 line-clamp-2">{book.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">by {book.author}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {book.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-[10px] rounded bg-white/5 text-white/60 border border-white/10 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {book.description && (
                    <div 
                      onClick={() => toggleExpand(book.id)}
                      className="mb-6 flex-1 cursor-pointer group/desc relative"
                    >
                      <p className={`text-sm text-white/60 leading-relaxed transition-colors duration-300 group-hover/desc:text-white/90 ${expandedDesc[book.id] ? '' : 'line-clamp-4'}`}>
                        {book.description}
                      </p>
                      <span className="text-[10px] text-primary/70 uppercase tracking-widest mt-2 block group-hover/desc:text-primary transition-colors">
                        {expandedDesc[book.id] ? 'Show less' : 'Read more'}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-2">
                      {book.purchaseLink && (
                        <a href={book.purchaseLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded h-9 text-[9px] sm:text-[10px] font-semibold px-1">
                            Apple Books
                          </Button>
                        </a>
                      )}
                      {book.amazonLink && (
                        <a href={book.amazonLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded h-9 text-[9px] sm:text-[10px] font-semibold px-1">
                            Amazon
                          </Button>
                        </a>
                      )}
                      {book.flipkartLink && (
                        <a href={book.flipkartLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded h-9 text-[9px] sm:text-[10px] font-semibold px-1">
                            Flipkart
                          </Button>
                        </a>
                      )}
                      {book.padhegaLink && (
                        <a href={book.padhegaLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded h-9 text-[9px] sm:text-[10px] font-semibold px-1">
                            Padhega
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
