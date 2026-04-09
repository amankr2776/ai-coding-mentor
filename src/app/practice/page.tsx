"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, Play, Loader2, AlertCircle, CheckCircle2, 
  Sparkles, FileCode, HelpCircle, Languages, ArrowRight, 
  Copy, Check, FileText, ChevronRight, Terminal, Info,
  RefreshCcw, ShieldAlert, Settings, GraduationCap
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { submitFreePractice, getPersonalizedProblem } from "@/app/actions/practice";

const supportedLanguages = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL"
];

export default function PracticePage() {
  const [mode, setMode] = useState<'Guided' | 'Free'>('Guided');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [problem, setProblem] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [feedback, setFeedback] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [freeDescription, setFreeDescription] = useState("");
  const [freeAnalysis, setFreeAnalysis] = useState<any>(null);

  const [explanation, setExplanation] = useState<any>(null);
  const [explaining, setExplaining] = useState(false);
  const [conversions, setConversions] = useState<Record<string, any> | null>(null);
  const [converting, setConverting] = useState(false);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [assignedProblems, setAssignedProblems] = useState<any[]>([]);
  
  const { toast } = useToast();

  const renderText = (val: any) => {
    if (typeof val === 'string') return val;
    if (val === undefined || val === null) return '';
    try {
      return JSON.stringify(val, null, 2);
    } catch(e) {
      return String(val);
    }
  };

  const saveToLocalHistory = (submissionData: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
      const isGuided = mode === 'Guided';
      const title = isGuided ? problem?.title : (freeDescription || "Free Practice");
      const topic = isGuided ? problem?.topic : "General";
      const status = submissionData.metadata?.type || (isGuided ? (feedback?.passed ? 'success' : 'failure') : 'free_practice');

      const newEntry = {
        id: `local-${Date.now()}`,
        content: submissionData.content,
        timestamp: new Date().toISOString(),
        metadata: {
          type: status,
          language,
          topic,
          title,
          difficulty: isGuided ? (problem?.difficulty || difficulty) : 'Easy',
          ...submissionData.metadata
        }
      };

      existing.unshift(newEntry);
      localStorage.setItem('practiceHistory', JSON.stringify(existing.slice(0, 100)));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn("[Practice] History archival error:", e);
    }
  };

  async function loadProblem(isRetry = false) {
    setLoading(true);
    setFeedback(null);
    setExplanation(null);
    setConversions(null);
    setFreeAnalysis(null);
    setProblem(null);
    try {
      const data = await getPersonalizedProblem(difficulty, language);
      
      if (data) {
        setProblem(data);
        const starter = data.starterCode?.[language] || (language === 'Python' ? "# Write logic here\n" : "// Write logic here\n");
        setCode(starter);

        if (data.isDemoMode && data.error && !isRetry) {
          toast({
            title: "Demo Mode Active",
            description: "AI Generator interrupted. Serving a calibration challenge.",
            variant: "default"
          });
        }
      }
    } catch (e: any) {
      console.warn("[Practice] Problem load bypassed:", e.message);
    } finally {
      setLoading(false);
    }
  }

  const loadAssignedProblem = (assigned: any) => {
    setProblem(assigned);
    setLanguage(assigned.language || "Python");
    setCode(assigned.starterCode?.[assigned.language] || (assigned.language === 'Python' ? "# Write logic here\n" : "// Write logic here\n"));
    setFeedback(null);
    setExplanation(null);
    setConversions(null);
    
    // Clear the specific assignment once loaded
    const remaining = assignedProblems.filter(p => p.id !== assigned.id);
    localStorage.setItem('assigned_problems', JSON.stringify(remaining));
    setAssignedProblems(remaining);
    
    toast({
      title: "Faculty Challenge Initialized",
      description: `Now practicing targeted challenge: ${assigned.title}`,
    });
  };

  useEffect(() => {
    // Check for assigned problems
    const checkAssignments = () => {
      const assigned = JSON.parse(localStorage.getItem('assigned_problems') || '[]');
      setAssignedProblems(assigned);
    };
    
    checkAssignments();
    window.addEventListener('storage', checkAssignments);

    if (mode === 'Guided') loadProblem();
    else {
      setLoading(false);
      setFeedback(null);
      setProblem(null);
      setCode("");
      setExplanation(null);
      setConversions(null);
      setFreeAnalysis(null);
    }

    return () => window.removeEventListener('storage', checkAssignments);
  }, [difficulty, mode, language]);

  async function handleSubmit() {
    if (!code.trim()) {
      toast({ title: "Empty Payload", description: "Please provide implementation logic.", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    setFeedback(null);
    try {
      if (mode === 'Guided') {
        const response = await axios.post('/api/problems/submit', { code, language, problem });
        const res = response.data;
        setFeedback(res);
        
        const status = res.passed ? 'success' : 'failure';
        saveToLocalHistory({
          content: `Practiced ${problem.topic}. Assessment: ${status}.`,
          metadata: { type: status, timestamp: res.timestamp || new Date().toISOString() }
        });

        if (res.passed) {
          toast({ title: "LOGIC ACCEPTED", className: "bg-emerald-500 text-white font-black" });
        } else {
          toast({ title: "LOGIC REJECTED", variant: "destructive", className: "font-black" });
        }
      } else {
        const res = await submitFreePractice({ code, language, description: freeDescription });
        setFreeAnalysis(res);
        saveToLocalHistory({
          content: `Free practice execution in ${language}.`,
          metadata: { type: 'free_practice', analysis: JSON.stringify(res) }
        });
        toast({ title: "ANALYSIS COMPLETE" });
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.message || "Network Error";
      toast({ title: "Execution Failed", description: errorMsg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExplain() {
    if (!code.trim()) return;
    setExplaining(true);
    setExplanation(null);
    try {
      const response = await axios.post('/api/problems/explain', { code, language });
      setExplanation(response.data);
      toast({ title: "EXPLAINED" });
    } catch (e: any) {
      toast({ title: "Scan Failed", variant: "destructive" });
    } finally {
      setExplaining(false);
    }
  }

  async function handleConvert() {
    if (!code.trim()) return;
    setConverting(true);
    setConversions(null);
    try {
      const response = await axios.post('/api/problems/convert', { code, language });
      setConversions(response.data);
      toast({ title: "TRANSLATED" });
    } catch (e: any) {
      toast({ title: "Conversion Failed", variant: "destructive" });
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="p-8 space-y-6 min-h-full pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Logic <span className="text-primary">Execution</span></h1>
          <p className="text-muted-foreground text-sm font-medium">Solve challenges using neural simulation.</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full max-w-md">
            <TabsList className="grid grid-cols-2 bg-muted/50 border border-border p-1 rounded-xl">
              <TabsTrigger value="Guided" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest"><Sparkles className="w-3 h-3" /> Guided</TabsTrigger>
              <TabsTrigger value="Free" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest"><FileCode className="w-3 h-3" /> Free</TabsTrigger>
            </TabsList>
          </Tabs>
          {mode === 'Guided' && (
            <Button onClick={() => loadProblem(true)} variant="secondary" className="gap-2 font-black uppercase text-[10px] tracking-widest rounded-xl h-10 px-6 border border-border hover:bg-muted" disabled={loading}>
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCcw className="w-3 h-3" /> Retry Sync</>}
            </Button>
          )}
        </div>
      </div>

      {assignedProblems.length > 0 && mode === 'Guided' && (
        <div className="grid grid-cols-1 gap-4">
          {assignedProblems.map((p) => (
            <div key={p.id} className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <GraduationCap className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-indigo-600 dark:text-indigo-400">Faculty Assigned Challenge</h4>
                  <p className="text-sm font-medium text-muted-foreground">{p.title} • {p.assignedBy}</p>
                </div>
              </div>
              <Button 
                onClick={() => loadAssignedProblem(p)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-xl"
              >
                Load Assigned Logic
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in items-start">
        <div className="space-y-8 overflow-y-auto max-h-[calc(100vh-200px)] pr-4 custom-scrollbar pb-10">
          {mode === 'Guided' ? (
            <>
              {problem ? (
                <Card className="glass-card bg-card/40 border-border shadow-2xl rounded-[2rem] overflow-hidden">
                  <CardHeader className="border-b border-border/50 p-10 bg-muted/10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-[9px] uppercase font-black tracking-[0.2em] text-primary bg-primary/5">{renderText(problem.topic)}</Badge>
                        <CardTitle className="text-3xl font-black tracking-tight">{renderText(problem.title)}</CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {problem.assignedBy && (
                          <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-black text-[8px] uppercase tracking-widest mb-1">
                            Assigned by {problem.assignedBy}
                          </Badge>
                        )}
                        <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                          <SelectTrigger className="w-[120px] h-9 font-black text-[10px] uppercase tracking-widest rounded-lg bg-card/50 border-border"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl border-border"><SelectItem value="Easy" className="text-[10px] font-black uppercase">Easy</SelectItem><SelectItem value="Medium" className="text-[10px] font-black uppercase">Medium</SelectItem><SelectItem value="Hard" className="text-[10px] font-black uppercase">Hard</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8 p-10">
                    {problem.isDemoMode && problem.error && (
                      <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-4">
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="w-6 h-6 text-orange-500" />
                          <h4 className="text-sm font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Neural Pathway Saturation</h4>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                          Your GROQ_API_KEY appears to be missing or invalid. CodeMentor is serving a **Calibration Challenge** from the local seed library to maintain session integrity. 
                          <br/><br/>
                          <span className="font-bold text-foreground">Action Required:</span> Update your `.env.local` file with a valid key from console.groq.com.
                        </p>
                      </div>
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap font-medium">{renderText(problem.description)}</p>
                    </div>
                    
                    {problem.testCases?.length > 0 && (
                      <div className="space-y-6 pt-8 border-t border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5" /> Logical Constraints</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-6 rounded-2xl bg-muted/20 border border-border shadow-inner space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Target Input</span>
                                <pre className="p-4 bg-background/50 rounded-xl text-xs font-mono border border-border/50 text-foreground overflow-x-auto">{renderText(problem.testCases[0].input)}</pre>
                              </div>
                              <div className="space-y-2">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Expected Output</span>
                                <pre className="p-4 bg-background/50 rounded-xl text-xs font-mono border border-border/50 text-emerald-500 overflow-x-auto">{renderText(problem.testCases[0].expectedOutput)}</pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : loading && <Card className="glass-card rounded-[2rem] h-96 flex flex-col items-center justify-center gap-6"><Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Architecting Challenge...</p></Card>}

              {feedback && (
                <div className={cn("p-10 rounded-[2.5rem] border animate-slide-up space-y-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden", feedback.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-destructive/5 border-destructive/20")}>
                  <div className="flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center border-2", feedback.passed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-destructive/10 border-destructive/20")}>
                      {feedback.passed ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <AlertCircle className="w-8 h-8 text-destructive" />}
                    </div>
                    <div className="space-y-1">
                      <h4 className={cn("text-3xl font-black tracking-tighter", feedback.passed ? "text-emerald-600" : "text-destructive")}>{feedback.passed ? 'LOGIC ACCEPTED' : 'LOGIC REJECTED'}</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Neural Assessment Finalized</p>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/40 border border-border/50">
                    <p className="text-muted-foreground italic font-medium leading-relaxed">"{renderText(feedback.feedback)}"</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="glass-card bg-card/40 border-border rounded-[2rem] overflow-hidden">
              <CardHeader className="p-10 bg-muted/10 border-b border-border/50"><CardTitle className="text-xl font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3"><FileText className="w-5 h-5 text-primary" /> Logic Objective</CardTitle></CardHeader>
              <CardContent className="p-10">
                <Textarea placeholder="Describe the logic you are implementing..." value={freeDescription} onChange={(e) => setFreeDescription(e.target.value)} className="min-h-[240px] bg-muted/20 border-border rounded-[1.5rem] p-8 text-lg font-medium leading-relaxed focus-visible:ring-primary/20 transition-all resize-none shadow-inner" />
              </CardContent>
            </Card>
          )}

          {explanation && (
            <Card className="glass-card border-orange-500/20 animate-slide-up bg-card/40 rounded-[2rem] overflow-hidden mt-8 shadow-2xl">
              <CardHeader className="p-10 flex flex-row items-center justify-between border-b border-border/50 bg-orange-500/5">
                <CardTitle className="text-lg font-black uppercase tracking-[0.3em] text-orange-500">Neural Logic Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 shadow-inner">
                  <p className="text-sm font-bold text-foreground leading-relaxed italic">"{renderText(explanation.summary)}"</p>
                </div>
                <div className="p-8 rounded-[1.5rem] bg-muted/30 border border-border shadow-inner">
                  <p className="text-[13px] text-muted-foreground font-medium leading-loose whitespace-pre-wrap">{renderText(explanation.explanation)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {conversions && Object.keys(conversions).length > 0 && (
            <Card className="glass-card border-purple-500/20 animate-slide-up bg-card/40 rounded-[2rem] overflow-hidden mt-8 shadow-2xl">
              <CardHeader className="p-10 border-b border-border/50 bg-purple-500/5"><CardTitle className="text-lg font-black uppercase tracking-[0.3em] text-purple-500">Cross-Stack Logic Vectors</CardTitle></CardHeader>
              <CardContent className="space-y-10 p-10">
                {Object.entries(conversions).map(([lang, conv]) => (
                  <div key={lang} className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-500/80">{lang}</h5>
                    <pre className="bg-slate-950/90 border border-border p-8 rounded-[1.5rem] text-[12px] font-mono overflow-x-auto text-slate-300 shadow-xl">{renderText(conv)}</pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col space-y-6 h-[calc(100vh-200px)] sticky top-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Terminal className="w-5 h-5 text-primary" /></div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px] bg-card/50 border-border h-12 rounded-xl font-black text-xs uppercase tracking-widest"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[300px] rounded-xl border-border">
                  {supportedLanguages.map(lang => <SelectItem key={lang} value={lang} className="font-bold text-xs">{lang}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" onClick={handleExplain} className="w-12 h-12 rounded-xl hover:bg-orange-500/10 text-muted-foreground hover:text-orange-500 border-border bg-card/50 shadow-sm" disabled={explaining || !code.trim()}>
                {explaining ? <Loader2 className="w-5 h-5 animate-spin" /> : <HelpCircle className="w-5 h-5" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleConvert} className="w-12 h-12 rounded-xl hover:bg-purple-500/10 text-muted-foreground hover:text-purple-500 border-border bg-card/50 shadow-sm" disabled={converting || !code.trim()}>
                {converting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="flex-1 border-2 border-border/50 rounded-[2.5rem] overflow-hidden glass-card shadow-2xl relative group">
            <Textarea 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="w-full h-full p-10 font-mono text-[14px] resize-none bg-background/20 border-none focus-visible:ring-0 leading-relaxed custom-scrollbar" 
              spellCheck={false} 
              placeholder={language === 'Python' ? "# Define logic pattern here..." : "// Define logic pattern here..."} 
            />
          </div>

          <Button className="w-full h-20 glow-primary text-sm font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all group" disabled={submitting || !code.trim()} onClick={handleSubmit}>
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Play className="w-6 h-6 mr-4 fill-current" /> EXECUTE LOGIC</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
