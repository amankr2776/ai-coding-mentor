"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, 
  Code2, Terminal, Info, Bug, HelpCircle, Trophy as TrophyIcon,
  Layers, Cpu, Box, Database, Globe, LayoutGrid, Search, Clock,
  BookOpen, ShieldCheck, Zap as ZapIcon, Lightbulb, TrendingUp,
  Activity, Target, ChevronRight, AlertCircle, History as HistoryIcon,
  Star, GraduationCap, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { 
  PolarAngleAxis,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts";
import { generateQuiz } from "@/app/actions/ai";
import { recallHindsight, retainHindsight } from "@/app/actions/hindsight";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const quizTypes = [
  { id: "Language Fundamentals", label: "Language Fundamentals", icon: Code2, description: "Syntax, keywords, and basic constructs", color: "blue", span: "md:col-span-2" },
  { id: "Data Structures", label: "Data Structures", icon: Layers, description: "Arrays, Trees, Graphs, and Lists", color: "purple", span: "md:col-span-1" },
  { id: "Algorithms", label: "Algorithms", icon: Cpu, description: "Sorting, searching, and logic patterns", color: "emerald", span: "md:col-span-1" },
  { id: "OOP Concepts", label: "OOP Concepts", icon: Box, description: "Classes, inheritance, and patterns", color: "orange", span: "md:col-span-2" },
  { id: "Database and SQL", label: "Database and SQL", icon: Database, description: "Query optimization and schema design", color: "cyan", span: "md:col-span-1" },
  { id: "Web Development", label: "Web Development", icon: Globe, description: "Frontend, backend, and architecture", color: "indigo", span: "md:col-span-1" },
  { id: "System Design", label: "System Design", icon: LayoutGrid, description: "Scalability and high-level architecture", color: "pink", span: "md:col-span-2" },
  { id: "Debugging", label: "Debugging", icon: Bug, description: "Identify and resolve logic gaps", color: "red", span: "md:col-span-1" },
  { id: "Code Review", label: "Code Review", icon: Search, description: "Analyze quality and best practices", color: "amber", span: "md:col-span-1" },
  { id: "Time Complexity", label: "Time Complexity", icon: Clock, description: "Big O and performance analysis", color: "violet", span: "md:col-span-2" },
];

const learningModes = [
  { id: "Practice", label: "Practice", icon: BookOpen, description: "Hints enabled", questions: 5, timeLimit: null },
  { id: "Exam", label: "Exam", icon: ShieldCheck, description: "Strict timer", questions: 5, timeLimit: 600 },
  { id: "Speed", label: "Speed", icon: ZapIcon, description: "60s limit", questions: 10, timeLimit: 60 },
];

const supportedLanguages = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "Go", "Rust", "Swift", "Kotlin", "SQL"
];

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  
  const [selectedType, setSelectedType] = useState("Language Fundamentals");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [selectedMode, setSelectedMode] = useState("Practice");
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Results analytics state
  const [resultAnalysis, setResultAnalysis] = useState<any>(null);
  const [previousAttempt, setPreviousAttempt] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (started && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleQuizFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, timeLeft]);

  async function startQuiz() {
    setLoading(true);
    try {
      const memories = await recallHindsight(`User performance in ${selectedLanguage} and ${selectedType}`, 5);
      const weaknessSummary = memories.length > 0 ? memories.map((m: any) => m.content).join(", ") : "Focus on fundamentals.";

      const modeConfig = learningModes.find(m => m.id === selectedMode);
      const res = await generateQuiz({
        type: selectedType,
        language: selectedLanguage,
        count: modeConfig?.questions || 5,
        weaknesses: weaknessSummary
      });

      if (res && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setUserAnswers([]);
        setTimeLeft(modeConfig?.timeLimit || null);
        setStarted(true);
      } else {
        throw new Error("Invalid format");
      }
    } catch (e) {
      toast({ title: "Sync Failed", description: "Re-calibrating logic patterns. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleQuizFinish() {
    setFinished(true);
    const totalQuestions = questions.length || 1;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // 1. Save to localStorage practiceHistory
    const localHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
    
    // Find previous attempt for comparison BEFORE adding new one
    const previous = localHistory.find((h: any) => 
      h.metadata?.type === 'quiz_result' && 
      h.metadata?.category === selectedType && 
      h.metadata?.language === selectedLanguage
    );
    setPreviousAttempt(previous?.metadata || null);

    const newEntry = {
      id: `quiz-${Date.now()}`,
      content: `Quiz Completed: ${selectedType} in ${selectedLanguage}. Accuracy: ${percentage}%. Score: ${score}/${totalQuestions}.`,
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'quiz_result',
        score: percentage,
        rawScore: score,
        totalQuestions,
        language: selectedLanguage,
        category: selectedType,
        mode: selectedMode
      }
    };
    localStorage.setItem('practiceHistory', JSON.stringify([newEntry, ...localHistory].slice(0, 100)));
    
    // 2. Perform topic-wise breakdown
    const topicStats: Record<string, { correct: number, total: number }> = {};
    const wrongTopics: string[] = [];
    
    questions.forEach((q, idx) => {
      const topic = q.topic || "General";
      if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
      topicStats[topic].total++;
      if (userAnswers[idx] === q.answer) {
        topicStats[topic].correct++;
      } else {
        wrongTopics.push(topic);
      }
    });

    const breakdown = Object.entries(topicStats).map(([name, s]) => ({
      name,
      value: Math.round((s.correct / s.total) * 100),
      isWeak: s.correct < s.total
    }));

    const recommendations = Array.from(new Set(wrongTopics)).map(t => `Deepen understanding of ${t} patterns in ${selectedLanguage}.`);
    
    const analysis = {
      percentage,
      breakdown,
      recommendations: recommendations.length > 0 ? recommendations : [`Continue maintaining high integrity in ${selectedType}. Try a higher difficulty.`],
      timestamp: new Date().toISOString()
    };
    setResultAnalysis(analysis);

    // 3. Save to Hindsight
    retainHindsight(
      `Quiz Result Summary: Finalized a ${selectedType} assessment in ${selectedLanguage} with ${percentage}% integrity. Topics analyzed: ${breakdown.map(b => `${b.name} (${b.value}%)`).join(', ')}.`,
      { 
        type: 'quiz_result', 
        score: percentage, 
        language: selectedLanguage, 
        category: selectedType, 
        timestamp: new Date().toISOString(),
        breakdown: JSON.stringify(breakdown)
      }
    ).catch(() => {});
    
    window.dispatchEvent(new Event('storage'));
  }

  function handleAnswer() {
    if (selected === null) return;
    const isCorrect = selected === questions[currentQuestion].answer;
    if (isCorrect) setScore(prev => prev + 1);
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selected;
    setUserAnswers(newAnswers);
    
    setShowExplanation(true);
  }

  async function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelected(null);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      handleQuizFinish();
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return (
      <div className="p-8 space-y-10 animate-fade-in pb-24 max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3 h-3" /> Evaluation Protocol v4.2
            </div>
            <h1 className="text-4xl font-black tracking-tight">Skill <span className="text-primary">Evaluation</span></h1>
            <p className="text-muted-foreground font-medium max-w-lg">Execute neural assessments tailored to your learning history and technical mastery.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Stack</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[180px] h-12 bg-card/50 border-border font-bold rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  {supportedLanguages.map(lang => <SelectItem key={lang} value={lang} className="font-bold">{lang}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logic Intensity</label>
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border h-12">
                {learningModes.map((m: any) => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMode(m.id)}
                    className={cn(
                      "px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedMode === m.id ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quizTypes.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            const colorMap: any = {
              blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
              purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
              emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
              orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
              cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
              indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
              pink: "text-pink-500 bg-pink-500/10 border-pink-500/20",
              red: "text-red-500 bg-red-500/10 border-red-500/20",
              amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              violet: "text-violet-500 bg-violet-500/10 border-violet-500/20"
            };

            return (
              <Card 
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "relative group cursor-pointer overflow-hidden transition-all duration-500 rounded-[2rem] border-border/50 bg-card/40 backdrop-blur-3xl hover:translate-y-[-4px]",
                  type.span,
                  isActive ? "border-primary/50 shadow-2xl shadow-primary/10 bg-primary/5" : "hover:border-border hover:bg-card/60"
                )}
              >
                {isActive && <div className="absolute top-0 right-0 p-4"><div className="w-2 h-2 rounded-full bg-primary animate-pulse" /></div>}
                <CardContent className="p-8 flex flex-col h-full gap-6">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", colorMap[type.color])}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight">{type.label}</h3>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">{type.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Protocol Active</span>
                    <ChevronRight className={cn("w-4 h-4 transition-all", isActive ? "text-primary translate-x-0" : "text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-6">
          <Button 
            size="lg" 
            className="h-16 px-16 text-sm font-black uppercase tracking-[0.3em] rounded-full glow-primary hover:scale-[1.02] active:scale-95 transition-all shadow-2xl" 
            onClick={startQuiz} 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-4" /> : <Sparkles className="w-5 h-5 mr-4" />}
            Initialize Assessment
          </Button>
        </div>
      </div>
    );
  }

  if (finished && resultAnalysis) {
    const percentage = resultAnalysis.percentage;
    const chartData = [{ name: 'Score', value: percentage, fill: '#3b82f6' }];
    const delta = previousAttempt ? percentage - previousAttempt.score : null;

    // Split breakdown into strong and weak
    const strongAreas = resultAnalysis.breakdown.filter((b: any) => b.value >= 70);
    const weakAreas = resultAnalysis.breakdown.filter((b: any) => b.value < 70);

    return (
      <div className="p-8 space-y-10 animate-fade-in max-w-6xl mx-auto pb-24">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs font-black uppercase tracking-widest">
            <TrophyIcon className="w-4 h-4" /> Assessment Finalized
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Neural Evaluation Results</h1>
          <p className="text-muted-foreground text-lg font-medium">Session vectors have been integrated into your Hindsight cloud matrix.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[2.5rem] bg-card/40 border-border/50 backdrop-blur-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" /> Logic Integrity Pulse
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Deep analysis of logic patterns</CardDescription>
              </div>
              {delta !== null && (
                <div className={cn(
                  "px-4 py-2 rounded-xl border flex items-center gap-2 font-black text-[10px] uppercase tracking-widest",
                  delta >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-destructive/10 border-destructive/20 text-destructive"
                )}>
                  {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {delta >= 0 ? `+${delta}` : delta}% Improvement Vector
                </div>
              )}
            </CardHeader>
            <CardContent className="p-8 space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="relative w-56 h-56 shrink-0 group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" barSize={14} data={chartData} startAngle={90} endAngle={450}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={10} className="transition-all duration-1000" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black tracking-tighter">{percentage}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integrity</span>
                  </div>
                </div>
                
                <div className="space-y-8 grow w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-muted/20 border border-border group hover:border-emerald-500/30 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-emerald-500 transition-colors">Passed Nodes</p>
                      <p className="text-3xl font-black text-emerald-500">{score}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/20 border border-border group hover:border-destructive/30 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-destructive transition-colors">Logic Errors</p>
                      <p className="text-3xl font-black text-destructive">{questions.length - score}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mastery Clusters
                      </h4>
                      <div className="space-y-4">
                        {strongAreas.length > 0 ? strongAreas.map((topic: any) => (
                          <div key={topic.name} className="space-y-2 group">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{topic.name}</span>
                              <span className="text-emerald-500">{topic.value}%</span>
                            </div>
                            <Progress value={topic.value} className="h-1.5 bg-muted/50" indicatorClassName="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                          </div>
                        )) : <p className="text-[10px] text-muted-foreground italic">No mastery clusters identified in this session.</p>}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" /> Optimization Priorities
                      </h4>
                      <div className="space-y-4">
                        {weakAreas.length > 0 ? weakAreas.map((topic: any) => (
                          <div key={topic.name} className="space-y-2 group">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{topic.name}</span>
                              <span className="text-destructive">{topic.value}%</span>
                            </div>
                            <Progress value={topic.value} className="h-1.5 bg-muted/50" indicatorClassName="bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                          </div>
                        )) : <p className="text-[10px] text-muted-foreground italic">Neural patterns optimized. No major priorities found.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                  <Lightbulb className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Next Growth Phase</h4>
                  <p className="text-xs font-bold text-muted-foreground">Neural Recommendations</p>
                </div>
              </div>
              <div className="space-y-4">
                {resultAnalysis.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 text-center space-y-4 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-primary fill-primary/20" />
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-black tracking-tighter text-foreground">+{score * 10} XP</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Advancement Bonus</p>
              </div>
            </div>

            <Button size="lg" className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] glow-primary transition-all hover:scale-[1.02] active:scale-95 shadow-2xl" onClick={() => window.location.reload()}>
              Re-Initialize Assessment
            </Button>
            
            <Button variant="ghost" className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all rounded-xl" onClick={() => window.location.href = '/dashboard'}>
              <HistoryIcon className="w-3 h-3 mr-3" /> View Archive
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  const qType = question.type || 'mcq';

  return (
    <div className="min-h-full p-8 flex flex-col items-center justify-center animate-fade-in pb-32">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {selectedLanguage} assessment // {selectedMode}
            </p>
            <h2 className="text-lg font-black tracking-tight">Step {currentQuestion + 1} of {questions.length}</h2>
          </div>
          {timeLeft !== null && (
            <div className={cn(
              "px-6 py-2 rounded-2xl border font-mono text-xl font-bold transition-all",
              timeLeft < 30 ? "bg-destructive/10 border-destructive text-destructive animate-pulse" : "bg-card/50 border-border text-foreground"
            )}>
              {formatTime(timeLeft)}
            </div>
          )}
        </header>

        <Progress value={((currentQuestion + 1) / (questions.length || 1)) * 100} className="h-1.5 bg-muted rounded-full overflow-hidden border border-border/20" indicatorClassName="bg-gradient-to-r from-primary to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

        <Card className="glass-card rounded-[3rem] border-border/50 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5"><Brain className="w-32 h-32 text-foreground" /></div>
          <div className={cn(
            "px-10 py-4 border-b border-border/50 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between",
            qType === 'bug' ? 'bg-destructive/5 text-destructive' : 'bg-primary/5 text-primary'
          )}>
            <span className="flex items-center gap-2">
              {qType === 'bug' ? <Bug className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
              {qType === 'bug' ? 'Debugger Session' : 'Logic Verification'}
              <span className="mx-2 opacity-20">|</span>
              <span className="text-muted-foreground">{question.topic || "General"}</span>
            </span>
            {selectedMode === 'Practice' && question.hint && (
              <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)} className="h-7 gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg">
                <Lightbulb className="w-3 h-3" /> {showHint ? 'Hide nudge' : 'Get a nudge'}
              </Button>
            )}
          </div>
          <CardContent className="p-10 md:p-16 space-y-10">
            <div className="space-y-8">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1]">
                {question.q}
              </h3>

              {showHint && (
                <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 animate-slide-up flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0"><Lightbulb className="w-5 h-5 text-yellow-500" /></div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 leading-relaxed italic">"{question.hint}"</p>
                </div>
              )}
              
              {question.code && (
                <div className="rounded-[2rem] bg-slate-950 border border-white/5 p-8 font-mono text-[14px] overflow-x-auto shadow-2xl leading-relaxed text-slate-300 relative">
                  <div className="absolute top-4 right-6 flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/20" /></div>
                  <pre>{question.code}</pre>
                </div>
              )}
            </div>

            <div className={cn("grid gap-4", qType === 'tf' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
              {(question.options || []).map((opt: string, i: number) => {
                const isSelected = selected === i;
                const isCorrect = i === question.answer;
                const showResult = showExplanation;

                return (
                  <button
                    key={i}
                    disabled={showExplanation}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "w-full p-6 md:p-8 text-left rounded-3xl border-2 transition-all relative overflow-hidden group/opt flex items-center justify-between",
                      showResult 
                        ? isCorrect 
                          ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                          : isSelected ? "border-destructive bg-destructive/10" : "border-border/20 opacity-40"
                        : isSelected 
                          ? "border-primary bg-primary/10 shadow-2xl shadow-primary/10 scale-[1.01]" 
                          : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-lg transition-all",
                        showResult
                          ? isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : isSelected ? "bg-destructive border-destructive text-white" : "border-border text-muted-foreground"
                          : isSelected ? "bg-primary border-primary text-white" : "border-border text-muted-foreground group-hover/opt:border-primary/50 group-hover/opt:text-primary"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-xl tracking-tight leading-tight">{opt}</span>
                    </div>
                    {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-destructive" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {showExplanation && (
          <div className="space-y-6 animate-slide-up">
            <Card className="border-primary/30 bg-primary/5 rounded-[2rem] p-8 border-2 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30"><Sparkles className="w-4 h-4 text-primary" /></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Neural Insight Breakdown</h4>
              </div>
              <p className="text-md leading-relaxed font-medium text-muted-foreground relative z-10">{question.explanation}</p>
            </Card>
            <div className="flex justify-end">
              <Button size="lg" className="px-12 h-16 gap-4 glow-primary font-black uppercase tracking-[0.2em] rounded-full shadow-2xl hover:scale-105 transition-all" onClick={nextQuestion}>
                {currentQuestion === questions.length - 1 ? "Finalize Neural Session" : "Advance Protocol"} <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {!showExplanation && (
          <div className="flex justify-end">
            <Button size="lg" className="px-12 h-16 gap-4 glow-primary font-black uppercase tracking-[0.2em] rounded-full shadow-2xl hover:scale-105 transition-all" onClick={handleAnswer} disabled={selected === null}>
              Check Pattern Integrity <Target className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}