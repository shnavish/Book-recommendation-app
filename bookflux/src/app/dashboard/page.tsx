"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, BookOpen, Clock, Heart, History, Sparkles } from "lucide-react";
import Link from "next/link";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const dnaData = [
  { subject: "Emotional Depth", A: 90, fullMark: 100 },
  { subject: "Darkness Level", A: 85, fullMark: 100 },
  { subject: "Complexity", A: 75, fullMark: 100 },
  { subject: "Optimism", A: 30, fullMark: 100 },
  { subject: "Prose Density", A: 80, fullMark: 100 },
  { subject: "Pacing Tolerance", A: 60, fullMark: 100 },
];

import { Edit2 } from "lucide-react";
import { useEffect, useState } from "react";

const mockHistory = [
  { id: 1, title: "The Secret History", date: "2 days ago", match: 98 },
  { id: 2, title: "Babel", date: "1 week ago", match: 92 },
  { id: 3, title: "Piranesi", date: "2 weeks ago", match: 87 },
  { id: 4, title: "If We Were Villains", date: "1 month ago", match: 95 },
];

const defaultDna = [
  { subject: "Emotional Depth", A: 90, fullMark: 100 },
  { subject: "Darkness Level", A: 85, fullMark: 100 },
  { subject: "Complexity", A: 75, fullMark: 100 },
  { subject: "Optimism", A: 30, fullMark: 100 },
  { subject: "Prose Density", A: 80, fullMark: 100 },
  { subject: "Pacing Tolerance", A: 60, fullMark: 100 },
];

export default function DashboardPage() {
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
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    // Simulate real-time DNA calculation based on recent activity
    setDna([
      { subject: "Emotional Depth", A: Math.floor(Math.random() * 20) + 70, fullMark: 100 },
      { subject: "Darkness Level", A: Math.floor(Math.random() * 30) + 60, fullMark: 100 },
      { subject: "Complexity", A: Math.floor(Math.random() * 25) + 65, fullMark: 100 },
      { subject: "Optimism", A: Math.floor(Math.random() * 40) + 30, fullMark: 100 },
      { subject: "Prose Density", A: Math.floor(Math.random() * 20) + 75, fullMark: 100 },
      { subject: "Pacing Tolerance", A: Math.floor(Math.random() * 30) + 50, fullMark: 100 },
    ]);
  }, []);

  const saveName = (e: any) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditingName(false);
      localStorage.setItem('bookflux_name', userName);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 container mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-8 hover:bg-white/5 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6 flex-1"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center p-1">
            <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isEditingName ? (
                <input 
                  autoFocus
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={saveName}
                  onBlur={saveName}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1 text-4xl font-heading font-bold outline-none text-white w-64 max-w-full"
                />
              ) : (
                <>
                  <h1 className="text-4xl font-heading font-bold">{userName}'s Profile</h1>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="h-8 w-8 rounded-full opacity-50 hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <p className="text-muted-foreground">Dynamic Book Explorer & Enthusiast</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4 md:items-end justify-start md:justify-end flex-wrap"
        >
          <Card className="bg-card/40 border-white/5 backdrop-blur-md">
            <CardContent className="p-4 flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary/70" />
              <div>
                <p className="text-sm text-muted-foreground">Books Explored</p>
                <p className="text-2xl font-bold">{stats.explored}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-white/5 backdrop-blur-md">
            <CardContent className="p-4 flex items-center gap-4">
              <Heart className="w-8 h-8 text-secondary/70" />
              <div>
                <p className="text-sm text-muted-foreground">Favorites Saved</p>
                <p className="text-2xl font-bold">{stats.favorites}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="glass h-full border-white/10">
            <CardHeader>
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Reading DNA
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dna}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="DNA" dataKey="A" stroke="#c8a96b" fill="#c8a96b" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Your unique, real-time literary fingerprint.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass h-full border-white/10">
            <CardHeader>
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <History className="w-5 h-5 text-secondary" />
                Recent Discoveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">You haven't discovered any books yet! Try searching for a mood.</p>
                ) : (
                  history.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" /> {item.date}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-primary font-bold">{item.match}% Match</div>
                        <Button variant="link" className="px-0 h-auto text-xs text-secondary mt-1">View Details</Button>
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
