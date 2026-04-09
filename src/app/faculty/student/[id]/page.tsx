"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Brain, LineChart, Target, Flame, LayoutGrid, 
  CheckCircle2, AlertCircle, ArrowLeft, History,
  Database, ShieldCheck, Star, Activity, Code2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Mock student profile generator based on ID
const getMockStudent = (id: string) => {
  const students: Record<string, any> = {
    "s1": { name: "Aman Kumar", stack: "Python", solved: 42, accuracy: 88, level: 5, avatar: "https://picsum.photos/seed/aman/200", strengths: ["Algorithmic Optimization", "Clean Code Implementation"], weaknesses: ["Complex Tree Traversals"], recommendations: ["Focus on Hard-level dynamic programming questions."] },
    "s2": { name: "Sarah Chen", stack: "Rust", solved: 31, accuracy: 92, level: 4, avatar: "https://picsum.photos/seed/sarah/200", strengths: ["Memory Management", "Parallelism"], weaknesses: ["Macro Logic"], recommendations: ["Explore Rust procedural macros."] },
    "s3": { name: "Marco Rossi", stack: "C++", solved: 12, accuracy: 65, level: 2, avatar: "https://picsum.photos/seed/marco/200", strengths: ["Basic Loops"], weaknesses: ["Pointer Manipulation"], recommendations: ["Review memory address arithmetic."] },
  };
  return students[id] || students["s1"];
};

export default function StudentInsightPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const student = useMemo(() => getMockStudent(params.id as string), [params.id]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleAssignProblem = () => {
    try {
      const assigned = JSON.parse(localStorage.getItem('assigned_problems') || '[]');
      const weakness = student.weaknesses[0] || "General Logic";
      
      const newProblem = {
        id: `assigned-${Date.now()}`,
        title: `Targeted Challenge: ${weakness}`,
        description: `A specialized logic challenge architected by Prof. Hindsight to address your identified resistance in ${weakness}.\n\nObjective: Implement an optimized traversal algorithm that maintains O(N) time complexity while handling deep recursive paths.`,
        difficulty: "Medium",
        topic: weakness,
        assignedBy: "Prof. Hindsight",
        assignedAt: new Date().toISOString(),
        language: student.stack,
        status: 'pending'
      };

      localStorage.setItem('assigned_problems', JSON.stringify([newProblem, ...assigned]));
      
      // Also add to history as an assignment event for tracking
      const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
      history.unshift({
        id: `event-${Date.now()}`,
        content: `Prof. Hindsight assigned a new targeted challenge focusing on ${weakness}.`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'assignment',
          title: newProblem.title,
          assignedBy: "Prof. Hindsight",
          language: student.stack
        }
      });
      localStorage.setItem('practiceHistory', JSON.stringify(history));
      
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Challenge Dispatched",
        description: `Specialized logic vector has been assigned to ${student.name}.`,
      });
    } catch (e) {
      toast({
        title: "Dispatch Failed",
        description: "Could not synchronize with student memory matrix.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter uppercase tracking-[0.2em]">Recalling Neural Profile...</h2>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex items-center gap-6 pt-4">
        <Button variant="outline" size="icon" className="w-12 h-12 rounded-2xl border-border bg-card shadow-lg" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">{student.name}</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest">Level {student.level}</Badge>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" /> Primary Stack: {student.stack}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStat icon={LayoutGrid} label="Matrix Solved" value={student.solved} sub="Challenges" />
        <QuickStat icon={Target} label="Neural Integrity" value={`${student.accuracy}%`} sub="Avg Score" />
        <QuickStat icon={Flame} label="Neural Streak" value={12} sub="Days" />
        <QuickStat icon={Database} label="Synapses Mapped" value={student.solved * 8} sub="Vectors" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card/40 border-border shadow-2xl backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 border-b border-border/50 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" /> Hindsight Analysis
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deep patterns from student history</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Mastery Clusters
                </h4>
                <div className="space-y-6">
                  {student.strengths.map((s: string) => (
                    <div key={s} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{s}</p>
                      <Progress value={90} className="h-1 bg-muted" indicatorClassName="bg-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Logic Resistance
                </h4>
                <div className="space-y-6">
                  {student.weaknesses.map((w: string) => (
                    <div key={w} className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 space-y-2">
                      <p className="text-xs font-black text-destructive uppercase tracking-widest">{w}</p>
                      <Progress value={45} className="h-1 bg-muted" indicatorClassName="bg-destructive" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 p-8 space-y-6 relative overflow-hidden group h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Faculty Advisory</h4>
                <p className="text-xs font-bold text-muted-foreground">Neural Recommendations</p>
              </div>
            </div>
            <div className="space-y-6">
              {student.recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex gap-4 items-start animate-slide-up">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">"{rec}"</p>
                </div>
              ))}
            </div>
            <div className="pt-10">
              <Button 
                onClick={handleAssignProblem}
                className="w-full rounded-xl h-12 font-black uppercase text-[10px] tracking-widest glow-primary"
              >
                Generate Targeted Challenge
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-card/40 border border-border p-6 rounded-[2rem] flex items-center gap-6 backdrop-blur-md hover:bg-muted/40 transition-colors shadow-xl">
      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-2xl font-black">{value}</h3>
        <p className="text-[10px] text-muted-foreground font-medium">{sub}</p>
      </div>
    </div>
  );
}
