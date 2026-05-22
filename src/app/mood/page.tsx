"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, CloudRain, Flame, Moon, Coffee, HeartCrack, Compass } from "lucide-react";
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

export default function MoodPage() {
  const router = useRouter();

  const handleMoodSelect = (moodName: string) => {
    router.push(`/recommend?q=${encodeURIComponent(moodName)}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 container mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-8 hover:bg-white/5 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center max-w-2xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          Mood Engine
        </h1>
        <p className="text-muted-foreground text-lg">
          Not sure what to read? Select your current emotional state or aesthetic vibe, and we'll find the perfect match.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {moods.map((mood, index) => {
          const Icon = mood.icon;
          return (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleMoodSelect(mood.name)}
            >
              <Card className={`group cursor-pointer h-48 border-white/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden bg-gradient-to-br ${mood.color} ${mood.glow}`}>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                <CardContent className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10">
                  <Icon className="w-12 h-12 text-white/50 group-hover:text-white/90 mb-4 transition-colors duration-500" />
                  <h2 className="text-2xl font-heading font-bold text-white/90 group-hover:text-white transition-colors duration-500">
                    {mood.name}
                  </h2>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
