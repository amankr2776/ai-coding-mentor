"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, Brain, Trophy, Target, 
  Search, ChevronRight, GraduationCap,
  Activity, ArrowUpRight, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const MOCK_STUDENTS = [
  { id: "s1", name: "Aman Kumar", stack: "Python", solved: 42, accuracy: 88, level: 5, lastActive: "2 mins ago", avatar: "https://picsum.photos/seed/aman/200" },
  { id: "s2", name: "Sarah Chen", stack: "Rust", solved: 31, accuracy: 92, level: 4, lastActive: "1 hour ago", avatar: "https://picsum.photos/seed/sarah/200" },
  { id: "s3", name: "Marco Rossi", stack: "C++", solved: 12, accuracy: 65, level: 2, lastActive: "5 hours ago", avatar: "https://picsum.photos/seed/marco/200" },
  { id: "s4", name: "Elena Gilbert", stack: "JavaScript", solved: 56, accuracy: 81, level: 6, lastActive: "Yesterday", avatar: "https://picsum.photos/seed/elena/200" },
  { id: "s5", name: "David Kim", stack: "Go", solved: 8, accuracy: 45, level: 1, lastActive: "3 days ago", avatar: "https://picsum.photos/seed/david/200" },
];

export default function FacultyPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.stack.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Users className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter">Initializing Cohort Command...</h2>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-fade-in max-w-[1600px] mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <GraduationCap className="w-3 h-3" /> Faculty Command Center
          </div>
          <h1 className="text-4xl font-black tracking-tight">Cohort <span className="text-primary">Intelligence</span></h1>
          <p className="text-muted-foreground font-medium">Monitor neural advancement and logic resistance across the cohort.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Brain className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Integrity</p>
              <p className="text-xl font-black">78.4%</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Learners</p>
              <p className="text-xl font-black">128</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Identify student by name or primary stack..." 
            className="pl-12 h-14 bg-card border-border rounded-2xl font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-6 rounded-2xl border-border bg-card gap-2 font-black uppercase text-[10px] tracking-widest shrink-0">
          <Filter className="w-4 h-4" /> Filter Stack
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card/40 border-border shadow-2xl backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr className="text-left">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Engineer</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Core Stack</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Progress</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Solved</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Accuracy</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-muted/20 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={student.avatar} className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover" />
                        <div>
                          <p className="font-black text-foreground">{student.name}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{student.lastActive}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">{student.stack}</Badge>
                    </td>
                    <td className="px-8 py-6 w-64">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-muted-foreground">Level {student.level}</span>
                          <span className="text-primary">{student.level * 15}%</span>
                        </div>
                        <Progress value={student.level * 15} className="h-1.5 bg-muted" indicatorClassName="bg-primary" />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-xl">{student.solved}</td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={cn(
                          "text-xl font-black",
                          student.accuracy >= 80 ? "text-emerald-500" : student.accuracy >= 60 ? "text-blue-500" : "text-destructive"
                        )}>{student.accuracy}%</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Integrity</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button asChild size="sm" className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest gap-2">
                        <Link href={`/faculty/student/${student.id}`}>
                          View Insights <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
