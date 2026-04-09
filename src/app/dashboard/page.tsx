
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, Trophy, Brain, Target, 
  Zap, Star, 
  CheckCircle2, Quote, ChevronRight,
  ShieldCheck, Activity,
  AlertCircle, History as HistoryIcon,
  Loader2, Database, GraduationCap, ArrowRight
} from "lucide-react";
import { getHindsightHistory } from "@/app/actions/hindsight";
import { getSmartTips } from "@/app/actions/ai";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  Cell
} from "recharts";

function HyperdimensionalWormholeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    let mouse = { x: width / 2, y: height / 2 };
    let currentCenter = { x: width / 2, y: height / 2 };
    let currentSpeed = 1;

    const stars: any[] = [];
    
    class Star {
      x: number = 0; y: number = 0; z: number = 0; speed: number = 0; color: string = ""; size: number = 0;
      constructor() { this.reset(); }
      reset() {
        this.x = (Math.random() - 0.5) * 20;
        this.y = (Math.random() - 0.5) * 20;
        this.z = 0;
        this.speed = Math.random() * 0.05 + 0.01;
        const colors = ["#3b82f6", "#6366f1", "#a855f7"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = 0.5;
      }
      update(spd: number) {
        const d = Math.sqrt(this.x * this.x + this.y * this.y);
        const move = (d * 0.05 + 1) * spd * 0.5;
        this.x += (this.x / (d || 1)) * move;
        this.y += (this.y / (d || 1)) * move;
        this.size = Math.min(2, 0.5 + d * 0.005);
        if (Math.abs(this.x) > width || Math.abs(this.y) > height) this.reset();
      }
    }

    for (let i = 0; i < 300; i++) stars.push(new Star());

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const render = () => {
      currentCenter.x += (width/2 + (mouse.x - width/2)*0.05 - currentCenter.x) * 0.05;
      currentCenter.y += (height/2 + (mouse.y - height/2)*0.05 - currentCenter.y) * 0.05;

      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? "#020617" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      stars.forEach(s => {
        s.update(currentSpeed);
        const sx = Math.round(currentCenter.x + s.x);
        const sy = Math.round(currentCenter.y + s.y);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize(); render();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-20" />;
}

function ProgressRing({ value, size = 64, stroke = 4, color = "currentColor", className = "" }: { value: number, size?: number, stroke?: number, color?: string, className?: string }) {
  const [offset, setOffset] = useState(0);
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progressOffset = circumference - (value / 100) * circumference;
    setOffset(progressOffset);
  }, [value, circumference]);

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeOpacity="0.05"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-black">{Math.round(value)}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Learner");
  const [userLevel, setUserLevel] = useState(1);
  const [smartTips, setSmartTips] = useState<string[]>([]);
  const [dailyQuote, setDailyQuote] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    solved: 0,
    streak: 0,
    xp: 0,
    accuracy: 0
  });
  
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [strongAreas, setStrongAreas] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const quotes = [
        "Code is like humor. When you have to explain it, it's bad.",
        "Clean code always looks like it was written by someone who cares.",
        "First, solve the problem. Then, write the code.",
        "Logic will get you from A to B. Imagination will take you everywhere."
      ];
      setDailyQuote(quotes[new Date().getDate() % quotes.length]);

      const profile = localStorage.getItem("codementor_profile");
      if (profile) {
        const parsed = JSON.parse(profile);
        setUserName(parsed.name.split(" ")[0]);
      }

      // Load Faculty Assignments
      const assigned = JSON.parse(localStorage.getItem('assigned_problems') || '[]');
      setAssignments(assigned);

      // Fetch ALL history for REAL data analysis
      const cloudMemories = await getHindsightHistory();
      const localHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
      const cloudArray = Array.isArray(cloudMemories) ? cloudMemories : [];
      const combinedRaw = [...localHistory, ...cloudArray];
      
      const seen = new Set();
      const history = combinedRaw.filter(item => {
        if (!item) return false;
        const id = item.id || `${item.timestamp}-${item.content?.substring(0, 20)}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const reversedHistory = [...history].reverse();
      const successes = reversedHistory.filter(m => m.metadata?.type === 'success');
      const failures = reversedHistory.filter(m => m.metadata?.type === 'failure');
      const totalAttempts = successes.length + failures.length;

      // REAL XP calculation
      const calculatedXP = successes.reduce((acc, m) => {
        const diff = m.metadata?.difficulty || 'Easy';
        if (diff === 'Hard') return acc + 50;
        if (diff === 'Medium') return acc + 25;
        return acc + 10;
      }, 0);

      const accuracy = totalAttempts > 0 ? Math.round((successes.length / totalAttempts) * 100) : 0;

      // REAL Streak calculation
      const dates = Array.from(new Set(
        reversedHistory
          .filter(m => m.metadata?.type === 'success' || m.metadata?.type === 'failure')
          .map(m => new Date(m.timestamp).toDateString())
      )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      if (dates.length > 0) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (dates[0] === today || dates[0] === yesterday) {
          streak = 1;
          let checkDate = new Date(dates[0]);
          for (let i = 1; i < dates.length; i++) {
            checkDate.setDate(checkDate.getDate() - 1);
            if (dates[i] === checkDate.toDateString()) streak++;
            else break;
          }
        }
      }

      // REAL Topic analysis
      const topicStats: Record<string, { pass: number, fail: number }> = {};
      reversedHistory.forEach(m => {
        const topic = m.metadata?.topic;
        if (!topic) return;
        if (!topicStats[topic]) topicStats[topic] = { pass: 0, fail: 0 };
        if (m.metadata.type === 'success') topicStats[topic].pass++;
        if (m.metadata.type === 'failure') topicStats[topic].fail++;
      });

      const weak = Object.entries(topicStats)
        .map(([name, s]) => ({ 
          name, 
          score: s.pass + s.fail > 0 ? Math.round((s.fail / (s.pass + s.fail)) * 100) : 0,
          failCount: s.fail
        }))
        .sort((a, b) => b.failCount - a.failCount)
        .filter(a => a.failCount > 0)
        .slice(0, 4);

      const strong = Object.entries(topicStats)
        .filter(([_, s]) => s.pass > s.fail)
        .sort((a, b) => b[1].pass - a[1].pass)
        .map(e => e[0])
        .slice(0, 5);

      const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toDateString();
        const count = reversedHistory.filter(h => new Date(h.timestamp).toDateString() === dateStr).length;
        return { day: dateStr.split(' ')[0], count };
      });

      setStats({
        solved: successes.length,
        streak: streak,
        xp: calculatedXP,
        accuracy: accuracy
      });
      setUserLevel(Math.floor(calculatedXP / 500) + 1);
      setWeakAreas(weak);
      setStrongAreas(strong);
      setRecentActivity(reversedHistory.slice(0, 8));
      setWeeklyData(weekDays);

      // REAL AI Tips based on history
      const historyContext = reversedHistory.slice(0, 15).map(h => `${h.metadata?.type}: ${h.content}`).join("\n");
      const tipRes = await getSmartTips(historyContext);
      setSmartTips(tipRes.tips || ["Focus on consistent daily practice.", "Analyze logic errors in your primary stack.", "Try increasing problem complexity."]);

    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-black tracking-tighter">Neural Sync in Progress...</h2>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-50">Recalling Hindsight Cores</p>
        </div>
      </div>
    );
  }

  const xpProgress = (stats.xp % 500) / 5;

  return (
    <div className="p-8 space-y-8 animate-fade-in relative min-h-full pb-20">
      <HyperdimensionalWormholeBackground />
      
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-card/40 border border-border/50 p-10 md:p-14 transition-all duration-700 hover:border-primary/20 backdrop-blur-3xl shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center lg:text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3.5 h-3.5" /> Engineer Authentication Confirmed
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">{userName}.</span>
            </h1>
            <p className="text-muted-foreground text-xl font-medium leading-relaxed max-w-2xl">
              Hindsight Core has mapped <span className="text-foreground font-bold">{stats.solved} solutions</span> to your neural profile. 
              Target accuracy is <span className="text-primary font-bold">{stats.accuracy}%</span>. 
            </p>
            <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 backdrop-blur-xl flex items-center gap-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Quote className="w-5 h-5 text-primary/60" />
              </div>
              <p className="text-sm font-bold text-muted-foreground italic grow">"{dailyQuote}"</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 p-8 rounded-[2rem] bg-card/60 border border-border backdrop-blur-2xl shadow-2xl relative shrink-0">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Synapse Threshold</p>
              <ProgressRing value={xpProgress} size={160} stroke={12} color="#3b82f6" />
            </div>
            <div className="flex gap-10 items-center w-full justify-center pt-2">
              <div className="text-center">
                <p className="text-xl font-black">{stats.xp}</p>
                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Total XP</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xl font-black">Level {userLevel}</p>
                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Engineer Rank</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {assignments.length > 0 && (
        <section className="animate-slide-up">
          <Card className="rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 overflow-hidden shadow-xl">
            <CardHeader className="p-8 border-b border-indigo-500/20 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="w-6 h-6" /> Pending Faculty Assignments
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60">Targeted logic challenges dispatched by faculty</CardDescription>
              </div>
              <Button asChild className="bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl">
                <Link href="/practice">Execute All <ArrowRight className="w-3 h-3 ml-2" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((p) => (
                <div key={p.id} className="p-6 rounded-3xl bg-background/40 border border-indigo-500/20 space-y-4 hover:border-indigo-500/50 transition-all group">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-indigo-500/30 text-indigo-500">{p.topic}</Badge>
                    <span className="text-[8px] font-black text-muted-foreground uppercase">{p.difficulty}</span>
                  </div>
                  <h4 className="text-lg font-black group-hover:text-indigo-500 transition-colors">{p.title}</h4>
                  <div className="pt-2 flex items-center justify-between border-t border-indigo-500/10">
                    <span className="text-[10px] font-bold text-muted-foreground">From: {p.assignedBy}</span>
                    <Button asChild size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-indigo-500 hover:bg-indigo-500/10">
                      <Link href="/practice">Start Challenge</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumBentoCard title="Matrix Solved" value={stats.solved} sub="Active Challenges" icon={Trophy} color="blue" chartData={weeklyData} />
        <PremiumBentoCard title="Neural Streak" value={stats.streak} sub="Consecutive Days" icon={Flame} color="orange" unit="D" />
        <PremiumBentoCard title="Sync Accuracy" value={stats.accuracy} sub="Success Vectors" icon={Target} color="emerald" unit="%" />
        <PremiumBentoCard title="Matrix Level" value={userLevel} sub="Engineer Status" icon={ShieldCheck} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card/40 border-border shadow-2xl overflow-hidden backdrop-blur-3xl rounded-[2.5rem]">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                <Brain className="w-6 h-6 text-primary" /> Hindsight Neural Analysis
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recalling REAL cognitive patterns from your history</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Optimization Priorities
                </h4>
                <div className="space-y-6">
                  {weakAreas.length > 0 ? weakAreas.map((area) => (
                    <div key={area.name} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-foreground">{area.name}</span>
                        <span className="text-[10px] font-black text-destructive uppercase tracking-widest">{area.score}% Resistance</span>
                      </div>
                      <div className="h-2 w-full bg-destructive/10 rounded-full overflow-hidden border border-border/50">
                        <div 
                          className="h-full bg-gradient-to-r from-destructive to-orange-500" 
                          style={{ width: `${area.score}%` }} 
                        />
                      </div>
                    </div>
                  )) : <p className="text-xs text-muted-foreground italic">No logic resistance detected in history.</p>}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Mastery neural clusters
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {strongAreas.length > 0 ? strongAreas.map((area) => (
                    <div 
                      key={area} 
                      className="px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.1em]"
                    >
                      {area}
                    </div>
                  )) : <p className="text-xs text-muted-foreground italic">Execute successful sessions to identify mastery.</p>}
                </div>
                
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 mt-4">
                  <h5 className="text-[9px] font-black uppercase text-primary mb-3 flex items-center gap-2 tracking-[0.3em]">
                    <Star className="w-3 h-3 fill-current" /> Synapse Optimization
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {smartTips[0] || "Execute more sessions to unlock neural optimization tips."}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Personalized Smart Vectors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartTips.length > 1 ? smartTips.slice(1, 3).map((tip, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-muted/30 border border-border flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground font-medium leading-relaxed tracking-tight">{tip}</p>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground italic col-span-2 text-center py-4">Collect more history for smart tips.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border shadow-2xl backdrop-blur-3xl rounded-[2.5rem] flex flex-col h-full">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" /> Session Activity
            </CardTitle>
            <CardDescription className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Real-time memory sync</CardDescription>
          </CardHeader>
          <CardContent className="grow overflow-y-auto px-8 py-6 custom-scrollbar">
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => {
                const isSuccess = activity.metadata?.type === 'success';
                const isFailure = activity.metadata?.type === 'failure';
                const isQuiz = activity.metadata?.type === 'quiz_result';
                const isAssignment = activity.metadata?.type === 'assignment';
                
                return (
                  <div key={i} className="relative pl-10 group/act">
                    <div className={cn(
                      "absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center z-10",
                      isSuccess ? "bg-emerald-500" : isFailure ? "bg-destructive" : isQuiz ? "bg-primary" : isAssignment ? "bg-indigo-500" : "bg-slate-400"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border hover:bg-muted/40 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-1.5">
                        <h5 className="text-[13px] font-black text-foreground truncate max-w-[120px]">
                          {activity.metadata?.title || activity.metadata?.topic || "Logic Test"}
                        </h5>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-2">
                          {format(new Date(activity.timestamp), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[7px] px-1.5 border-border bg-muted/50 font-black uppercase">{activity.metadata?.language || 'All'}</Badge>
                        <Badge variant="outline" className="text-[7px] px-1.5 border-border bg-muted/50 font-black uppercase">{activity.metadata?.type?.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                  <HistoryIcon className="w-12 h-12" />
                  <p className="text-[9px] uppercase tracking-[0.4em] font-black">Zero Activity Streams</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PremiumBentoCard({ title, value, sub, icon: Icon, color, unit = "", chartData }: any) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
  };

  return (
    <Card className="bg-card/40 border-border rounded-[2rem] overflow-hidden group hover:border-border backdrop-blur-3xl shadow-xl">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-8 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
              <span className="text-xl font-bold text-muted-foreground">{unit}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{sub}</p>
          </div>
          <div className={cn("p-4 rounded-2xl border", colorMap[color as keyof typeof colorMap])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {chartData && (
          <div className="h-12 w-full px-6 pb-4 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell 
                      key={index} 
                      fill={entry.count > 0 ? "rgba(59, 130, 246, 0.4)" : "rgba(150,150,150,0.05)"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
