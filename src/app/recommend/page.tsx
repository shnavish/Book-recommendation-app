"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, BookHeart } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type Recommendation = {
  id: string;
  title: string;
  author: string;
  description: string;
  reason: string;
  matchScore: number;
  tags: string[];
  coverUrl?: string;
  purchaseLink?: string;
  amazonLink?: string;
  flipkartLink?: string;
  padhegaLink?: string;
};

function RecommendContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!query) return;

    // Simulate API call for recommendations
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await response.json();
        const recs = data.recommendations || [];
        setRecommendations(recs);

        // Sync with dashboard real-time data
        if (recs.length > 0) {
          try {
            const storedHistory = JSON.parse(localStorage.getItem('bookflux_history') || '[]');
            const newHistory = [
              { id: Date.now(), title: recs[0].title, date: 'Just now', match: recs[0].matchScore },
              ...storedHistory.filter((item: any) => item.title !== recs[0].title).slice(0, 4)
            ];
            localStorage.setItem('bookflux_history', JSON.stringify(newHistory));
            
            const stats = JSON.parse(localStorage.getItem('bookflux_stats') || '{"explored": 124, "favorites": 32}');
            stats.explored += recs.length;
            localStorage.setItem('bookflux_stats', JSON.stringify(stats));
          } catch (e) {}
        }
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [query]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 container mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-6 sm:mb-8 hover:bg-white/5 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12"
      >
        <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2 sm:mb-4">
          Curated for you
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 h-5 text-primary shrink-0" />
          Based on: <span className="text-foreground italic break-all">&quot;{query}&quot;</span>
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/30 border-white/5 animate-pulse overflow-hidden backdrop-blur-sm">
              <div className="h-48 sm:h-56 bg-white/5 w-full" />
              <CardContent className="p-5 sm:p-6">
                <div className="h-6 bg-white/10 w-3/4 mb-3 rounded" />
                <div className="h-4 bg-white/10 w-1/2 mb-6 rounded" />
                <div className="space-y-3">
                  <div className="h-3 bg-white/10 w-full rounded" />
                  <div className="h-3 bg-white/10 w-full rounded" />
                  <div className="h-3 bg-white/10 w-4/5 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 perspective-1000">
          {recommendations.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="h-full"
            >
              <Card className="glass overflow-hidden h-full flex flex-col group border-white/5 hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_-10px_rgba(200,169,107,0.3)] bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl">
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary/20 via-black/50 to-secondary/20 flex items-center justify-center border-b border-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <motion.div 
                    whileHover={{ rotateY: 15, rotateX: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-24 h-32 sm:w-28 sm:h-40 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded shadow-2xl flex items-center justify-center z-10 overflow-hidden"
                  >
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookHeart className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:text-primary/80 transition-all duration-500" />
                    )}
                  </motion.div>
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/80 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-primary border border-primary/30 shadow-[0_0_15px_rgba(200,169,107,0.2)]">
                    {book.matchScore}% Match
                  </div>
                </div>
                <CardContent className="p-5 sm:p-8 flex-1 flex flex-col relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-500" />
                  <h2 className="text-xl sm:text-2xl font-heading font-bold mb-1 group-hover:text-primary transition-colors duration-300 leading-tight">{book.title}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 uppercase tracking-widest">by {book.author}</p>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {book.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] rounded-full bg-white/5 text-white/70 border border-white/10 uppercase tracking-wider group-hover:border-primary/30 transition-colors duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div 
                    onClick={() => toggleExpand(book.id)}
                    className="mb-6 sm:mb-8 flex-1 cursor-pointer group/desc relative"
                  >
                    <p className={`text-xs sm:text-sm text-white/60 leading-relaxed transition-colors duration-300 group-hover/desc:text-white/90 ${expandedDesc[book.id] ? '' : 'line-clamp-4'}`}>
                      {book.description}
                    </p>
                    <span className="text-[9px] sm:text-[10px] text-primary/70 uppercase tracking-widest mt-2 block group-hover/desc:text-primary transition-colors">
                      {expandedDesc[book.id] ? 'Show less' : 'Read more'}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 sm:pt-5 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-2 mt-2 sm:mt-4">
                      {book.purchaseLink && (
                        <a href={book.purchaseLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded-lg h-9 sm:h-10 text-[9px] xs:text-[10px] sm:text-xs font-semibold">
                            Apple Books
                          </Button>
                        </a>
                      )}
                      {book.amazonLink && (
                        <a href={book.amazonLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded-lg h-9 sm:h-10 text-[9px] xs:text-[10px] sm:text-xs font-semibold">
                            Amazon
                          </Button>
                        </a>
                      )}
                      {book.flipkartLink && (
                        <a href={book.flipkartLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded-lg h-9 sm:h-10 text-[9px] xs:text-[10px] sm:text-xs font-semibold">
                            Flipkart
                          </Button>
                        </a>
                      )}
                      {book.padhegaLink && (
                        <a href={book.padhegaLink} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-primary/20 hover:bg-primary/40 text-primary hover:text-white border border-primary/30 transition-all rounded-lg h-9 sm:h-10 text-[9px] xs:text-[10px] sm:text-xs font-semibold">
                            Padhega India
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
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">No specific recommendations found.</p>
          <Button onClick={() => window.history.back()} variant="outline">Try another search</Button>
        </div>
      )}
    </div>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-20 px-6 container mx-auto text-center flex flex-col justify-center items-center">
        <p className="text-xl text-muted-foreground animate-pulse">Loading recommendations...</p>
      </div>
    }>
      <RecommendContent />
    </Suspense>
  );
}
