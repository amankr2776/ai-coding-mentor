"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Search, Clock, Calendar, Code2, AlertCircle, Sparkles, 
  FileCode, Filter, Database, Terminal, History as HistoryIcon, 
  Loader2, GraduationCap, UserCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [rawData, setRawData] = useState<any>(null);

  async function loadHistory() {
    setLoading(true);
    try {
      console.log("[History] Loading sessions from cloud and local storage...");
      
      let cloudHistory: any[] = [];
      try {
        const res = await axios.get('/api/hindsight/history');
        if (res.data.success) {
          cloudHistory = res.data.memories || [];
        }
      } catch (e) {
        console.warn("[History] Cloud history fetch failed, relying on local/recall:", e);
      }

      let recallData: any[] = [];
      try {
        const res = await axios.post('/api/hindsight/recall', { 
          query: "all user practice sessions, coding problems, solutions, assignments and mistakes", 
          topK: 100 
        });
        if (res.data.success) {
          recallData = res.data.memories || [];
        }
      } catch (e) {
        console.warn("[History] Recall fetch failed:", e);
      }

      let localHistory: any[] = [];
      try {
        const primary = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
        const legacy = JSON.parse(localStorage.getItem('codementor_local_history') || '[]');
        localHistory = [...primary, ...legacy];
      } catch (e) {
        console.warn("[History] Local storage read failed:", e);
      }

      const combined = [...localHistory, ...cloudHistory, ...recallData];
      const seen = new Set();
      const unique = combined.filter(item => {
        if (!item) return false;
        const key = item.id || `${item.timestamp}-${(item.content || "").substring(0, 30)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      unique.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA;
      });

      setMemories(unique);
      setRawData({ cloudCount: cloudHistory.length, recallCount: recallData.length, localCount: localHistory.length, totalUnique: unique.length });
    } catch (error) {
      console.error("[History] Fatal load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const languages = Array.from(new Set(memories.map(m => m.metadata?.language).filter(Boolean)));

  const filtered = memories.filter(m => {
    const contentText = (typeof m.content === 'string' ? m.content : "").toLowerCase();
    const topicText = (m.metadata?.topic || "").toLowerCase();
    const titleText = (m.metadata?.title || "").toLowerCase();
    const matchesSearch = contentText.includes(search.toLowerCase()) || 
                         topicText.includes(search.toLowerCase()) || 
                         titleText.includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "guided" && (m.metadata?.type === 'success' || m.metadata?.type === 'failure')) ||
      (typeFilter === "free" && m.metadata?.type === 'free_practice') ||
      (typeFilter === "assignment" && m.metadata?.type === 'assignment');
    
    const matchesLang = langFilter === "all" || m.metadata?.language === langFilter;

    return matchesSearch && matchesType && matchesLang;
  });

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20 bg-background text-foreground">
      <header className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary" /> Session Archive
          </h1>
          <Button variant="outline" size="sm" onClick={loadHistory} disabled={loading} className="gap-2 border-border bg-card">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Sync Matrix
          </Button>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> Synchronized with Hindsight Memory
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2 relative">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Vector Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search problems, topics, or faculty assignments..." 
              className="pl-10 bg-card border-border" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Session Type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="guided">Guided Problems</SelectItem>
              <SelectItem value="free">Free Practice</SelectItem>
              <SelectItem value="assignment">Faculty Assignments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Language</label>
          <Select value={langFilter} onValueChange={setLangFilter}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map(lang => (
                <SelectItem key={lang as string} value={lang as string}>{lang as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && memories.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 glass-card animate-pulse rounded-xl bg-muted/20" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((m) => {
            const isSuccess = m.metadata?.type === 'success';
            const isFailure = m.metadata?.type === 'failure';
            const isFree = m.metadata?.type === 'free_practice';
            const isAssignment = m.metadata?.type === 'assignment';
            const analysis = isFree && m.metadata?.analysis ? (typeof m.metadata.analysis === 'string' ? JSON.parse(m.metadata.analysis) : m.metadata.analysis) : null;
            const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);

            return (
              <Card key={m.id || m.timestamp} className="glass-card hover:border-primary/50 transition-all group overflow-hidden bg-card/40 border-border shadow-lg">
                <div className="flex flex-col md:flex-row h-full">
                  <div className={cn(
                    "w-full md:w-2",
                    isSuccess ? 'bg-emerald-500' : 
                    isFailure ? 'bg-destructive' : 
                    isFree ? 'bg-blue-500' : 
                    isAssignment ? 'bg-indigo-500' : 
                    'bg-orange-500'
                  )} />
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-3">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {isAssignment ? <GraduationCap className="w-5 h-5 text-indigo-500" /> : 
                             isFree ? <FileCode className="w-5 h-5 text-blue-500" /> : 
                             <Sparkles className="w-5 h-5 text-primary" />}
                            {m.metadata?.title || m.metadata?.topic || "Practice Session"}
                          </CardTitle>
                          <Badge variant={isSuccess ? 'default' : isFailure ? 'destructive' : 'secondary'} className={cn(
                            "h-5 font-black uppercase text-[8px]",
                            isAssignment && "bg-indigo-500 text-white"
                          )}>
                            {isSuccess ? 'Passed' : isFailure ? 'Failed' : isFree ? 'Free Practice' : isAssignment ? 'Assigned' : 'Hint'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <Code2 className="w-4 h-4" /> {m.metadata?.language || "N/A"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> {new Date(m.timestamp).toLocaleDateString()} at {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed text-muted-foreground italic font-medium">
                        {content}
                      </p>
                      
                      {isAssignment && (
                        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-1">
                            <UserCircle className="w-3 h-3" /> Origin Vector
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            This challenge was architected specifically for your neural profile by {m.metadata?.assignedBy || "Faculty"}.
                          </p>
                        </div>
                      )}

                      {isFailure && content.includes("Mistakes:") && (
                        <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-2 mb-1">
                            <AlertCircle className="w-3 h-3" /> Root Cause Analysis
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {content.split("Mistakes:")[1]?.split("Root cause:")[0]?.trim() || "Logic error detected."}
                          </p>
                        </div>
                      )}

                      {isFree && analysis && analysis.errors && analysis.errors.length > 0 && (
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                            <AlertCircle className="w-3 h-3" /> AI Analysis Fixes
                          </h5>
                          <div className="space-y-2">
                            {analysis.errors.slice(0, 3).map((err: any, idx: number) => (
                              <div key={idx} className="text-xs border-l-2 border-blue-400/30 ml-2">
                                <span className="font-bold text-foreground">{err.message}:</span> {err.fix}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-4">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
            <h3 className="text-xl font-bold">Your journey hasn't started yet.</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Complete your first practice problem or wait for faculty assignments to see your history synchronized here.</p>
          </div>
        )}
      </div>

      <Separator className="my-10" />
      
      <section className="mt-12">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="debug" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest font-bold">
                <Database className="w-3 h-3" /> Hindsight Debug Mode
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="bg-muted border-border font-mono text-[10px] overflow-x-auto p-4">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                  <span className="flex items-center gap-2 text-primary uppercase"><Terminal className="w-3 h-3" /> Internal Sync Data</span>
                  <Badge variant="outline" className="text-[10px] opacity-50">{memories.length} Total Sessions</Badge>
                </div>
                <pre className="text-blue-600 dark:text-green-400/80 leading-tight">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
