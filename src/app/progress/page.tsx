"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { 
  Brain, 
  LineChart, 
  Zap, 
  Target, 
  Flame, 
  LayoutGrid, 
  Code2, 
  BookOpen, 
  History,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getProgressSummary, getJourneyStory } from "@/app/actions/ai";
import { getHindsightHistory } from "@/app/actions/hindsight";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { subDays, format, isAfter, startOfDay, eachDayOfInterval } from "date-fns";

function ProgressBackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: any[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    const frame = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
}

function ProgressLoadingSkeleton() {
  const fixedHeights = ["60%", "40%", "70%", "50%", "65%", "45%", "55%"];

  return (
    <div className="relative z-10 space-y-10 max-w-7xl mx-auto px-4 pt-6 animate-fade-in">
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/40 border-border p-4 rounded-xl flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 bg-card/40 border-border h-[400px]">
          <CardHeader><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60" /></CardHeader>
          <CardContent className="h-[280px] flex items-end gap-2 px-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: fixedHeights[i] }} />
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 bg-card/40 border-border h-[400px]">
          <CardHeader className="bg-indigo-500/5"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60" /></CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [summary, setSummary] = useState<any>(null);
  const [journeyStory, setJourneyStory] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [topicMastery, setTopicMastery] = useState<any[]>([]);
  const [languageUsage, setLanguageUsage] = useState<any[]>([]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const cloudMemories = await getHindsightHistory();
      const localHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
      const cloudArray = Array.isArray(cloudMemories) ? cloudMemories : [];
      const combined = [...localHistory, ...cloudArray];
      
      const seen = new Set();
      const uniqueHistory = combined.filter(item => {
        if (!item) return false;
        const id = item.id || `${item.timestamp}-${(item.content || "").substring(0, 20)}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Dynamically extract real user topics
      const rawTopics = uniqueHistory.map(h => h.metadata?.topic).filter(Boolean);
      const uniqueTopics = Array.from(new Set(rawTopics));
      
      const mastery = uniqueTopics.map(t => {
        const topicHistory = uniqueHistory.filter(m => m.metadata?.topic === t);
        const pass = topicHistory.filter(m => m.metadata?.type === 'success').length;
        const total = topicHistory.length;
        const value = total > 0 ? Math.round((pass / total) * 100) : 0;
        return { name: t as string, value };
      }).sort((a, b) => b.value - a.value).slice(0, 10);

      // REAL Language Distribution
      const langs = Array.from(new Set(uniqueHistory.map(h => h.metadata?.language).filter(Boolean)));
      const langDist = langs.map(l => ({
        name: l as string,
        percent: Math.round((uniqueHistory.filter(h => h.metadata?.language === l).length / (uniqueHistory.length || 1)) * 100)
      })).sort((a, b) => b.percent - a.percent).slice(0, 5);

      const historyContext = uniqueHistory.slice(-20).map(h => `${h.metadata?.type}: ${h.content}`).join("\n");

      // Fetch AI summary based on REAL history
      const [sumRes, storyRes] = await Promise.all([
        getProgressSummary({ 
          metrics: { total: uniqueHistory.length, accuracy: 0 },
          history: historyContext
        }),
        getJourneyStory(historyContext)
      ]);

      setSummary(sumRes);
      setJourneyStory(storyRes.story);
      setHistory(uniqueHistory);
      setTopicMastery(mastery);
      setLanguageUsage(langDist);

    } catch (e) {
      console.error("Progress data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredHistory = useMemo(() => {
    const now = new Date();
    let cutOff: Date | null = null;

    if (timeframe === 'today') cutOff = startOfDay(now);
    if (timeframe === 'week') cutOff = subDays(now, 7);
    if (timeframe === 'month') cutOff = subDays(now, 30);

    if (!cutOff) return history;
    return history.filter(item => isAfter(new Date(item.timestamp), cutOff!));
  }, [history, timeframe]);

  const processedStats = useMemo(() => {
    const successes = filteredHistory.filter(m => m.metadata?.type === 'success');
    const failures = filteredHistory.filter(m => m.metadata?.type === 'failure');
    const total = successes.length + failures.length;
    const accuracy = total > 0 ? Math.round((successes.length / total) * 100) : 0;
    
    const totalXP = successes.reduce((acc, m) => {
      const diff = m.metadata?.difficulty || 'Easy';
      if (diff === 'Hard') return acc + 50;
      if (diff === 'Medium') return acc + 25;
      return acc + 10;
    }, 0);

    return {
      total,
      accuracy,
      xpLevel: Math.floor(totalXP / 500) + 1,
      successes: successes.length
    };
  }, [filteredHistory]);

  const solvingData = useMemo(() => {
    const daysToCover = timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 14;
    const interval = eachDayOfInterval({
      start: subDays(new Date(), daysToCover - 1),
      end: new Date()
    });

    return interval.map(date => {
      const dStr = format(date, 'yyyy-MM-dd');
      const count = filteredHistory.filter(item => 
        format(new Date(item.timestamp), 'yyyy-MM-dd') === dStr && 
        (item.metadata?.type === 'success' || item.metadata?.type === 'failure')
      ).length;
      return { day: format(date, 'eee'), solved: count };
    });
  }, [filteredHistory, timeframe]);

  if (loading && !summary) {
    return (
      <div className="relative min-h-screen bg-background pb-20">
        <ProgressBackgroundParticles />
        <ProgressLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-20">
      <ProgressBackgroundParticles />

      <div className="relative z-10 space-y-10 animate-fade-in max-w-7xl mx-auto px-4">
        <header className="flex flex-col gap-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight">My Progress</h1>
              <p className="text-muted-foreground">Personalized analytics powered by REAL Hindsight Memory</p>
            </div>
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border backdrop-blur-sm">
              {['today', 'week', 'month', 'all'].map((t) => (
                <Button 
                  key={t}
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "text-xs h-8 px-4 transition-all capitalize font-bold", 
                    timeframe === t ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setTimeframe(t as any)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStat icon={LayoutGrid} label="Total Problems" value={processedStats.total} sub="Sessions analyzed" />
            <QuickStat icon={Target} label="Avg Accuracy" value={`${processedStats.accuracy}%`} sub="Success rate" />
            <QuickStat icon={Zap} label="XP Level" value={processedStats.xpLevel} sub="Engineer rank" />
            <QuickStat icon={Flame} label="Solved" value={processedStats.successes} sub="Correct solutions" />
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 bg-card/40 border-border backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-500" /> Solving Activity
              </CardTitle>
              <CardDescription>Frequency of REAL sessions in the selected timeframe</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solvingData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide />
                  <RechartsTooltip cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} />
                  <Bar dataKey="solved" radius={[4, 4, 0, 0]}>
                    {solvingData.map((entry, index) => (
                      <Cell key={index} fill={entry.solved > 0 ? 'url(#barGradient)' : 'rgba(150,150,150,0.1)'} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-card/40 border-border backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-indigo-500/5 border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" /> AI Progress Insights
              </CardTitle>
              <CardDescription>Deep patterns recalled from REAL history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <InsightRow icon={CheckCircle2} color="text-emerald-500" title="Top Strength" text={summary?.strengths?.[0] || "Collecting session data..."} />
              <InsightRow icon={AlertCircle} color="text-orange-500" title="Improvement Area" text={summary?.weaknesses?.[0] || "Perform more sessions."} />
              <div className="space-y-3 pt-2 border-t border-border">
                {Array.isArray(summary?.personalizedRecommendations) ? (
                  summary.personalizedRecommendations.slice(0, 3).map((rec: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start animate-slide-up">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{rec}</p>
                    </div>
                  ))
                ) : summary?.personalizedRecommendations ? (
                  <div className="flex gap-3 items-start animate-slide-up">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{String(summary.personalizedRecommendations)}</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/40 border-border backdrop-blur-md">
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Topic Mastery</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {topicMastery.length > 0 ? topicMastery.map((topic) => (
                <div key={topic.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">{topic.name}</span>
                    <span className={cn(topic.value > 80 ? "text-emerald-500" : topic.value > 50 ? "text-blue-500" : "text-orange-500")}>{topic.value}%</span>
                  </div>
                  <Progress value={topic.value} className="h-1.5 bg-muted" />
                </div>
              )) : (
                <div className="text-center py-12 opacity-30 italic text-sm">Start practicing to see REAL mastery stats</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border backdrop-blur-md">
            <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="w-5 h-5 text-cyan-500" /> Language Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-2">
              {languageUsage.length > 0 ? languageUsage.map((lang) => (
                <div key={lang.name} className="flex items-center gap-4 group">
                  <div className="w-20 text-xs font-black text-muted-foreground uppercase">{lang.name}</div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
                      style={{ width: `${lang.percent}%` }} 
                    />
                  </div>
                  <div className="w-10 text-right text-xs font-black">{lang.percent}%</div>
                </div>
              )) : (
                <div className="text-center py-12 text-muted-foreground italic">Execute sessions to see stack distribution.</div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-indigo-500/5 border-indigo-500/20 overflow-hidden relative group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black tracking-widest uppercase text-sm">
                <History className="w-5 h-5" /> Your REAL Coding Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic">
                "{journeyStory || "Your journey is being forged with every successful execution."}"
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-card/40 border border-border p-4 rounded-xl flex items-center gap-4 backdrop-blur-md hover:bg-muted/40 transition-colors">
      <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
        <h3 className="text-xl font-bold">{value}</h3>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function InsightRow({ icon: Icon, color, title, text }: any) {
  return (
    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1 group hover:bg-muted/50 transition-all">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", color)} />
        <span className={cn("font-black text-xs uppercase tracking-widest", color)}>{title}</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}