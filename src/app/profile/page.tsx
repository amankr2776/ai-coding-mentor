"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Phone, GraduationCap, Target, 
  Save, Camera, Loader2, Award, ShieldCheck, PencilLine,
  Mail, MapPin
} from "lucide-react";

const languages = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL"
];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "Learner",
    mobile: "",
    email: "",
    college: "",
    year: "",
    bio: "",
    language: "Python",
    goal: "3",
    theme: "dark",
    avatar: "https://picsum.photos/seed/aman/200"
  });

  const loadProfile = () => {
    const savedProfile = localStorage.getItem("codementor_profile");
    if (savedProfile) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
      } catch (e) {}
    }

    // REAL XP and Level calculation
    const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
    const successes = history.filter((m: any) => m.metadata?.type === 'success');
    const xp = successes.reduce((acc: number, m: any) => {
      const diff = m.metadata?.difficulty || 'Easy';
      if (diff === 'Hard') return acc + 50;
      if (diff === 'Medium') return acc + 25;
      return acc + 10;
    }, 0);
    setUserStats({ xp, level: Math.floor(xp / 500) + 1 });
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  const handleSave = () => {
    setLoading(true);
    localStorage.setItem("codementor_profile", JSON.stringify(formData));
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Profile Synchronized",
        description: "Your personalized settings have been saved.",
      });
      router.refresh();
    }, 800);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Payload too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
        toast({
          title: "Image Previewed",
          description: "Sync changes to apply your new avatar.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-x-hidden bg-background">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/5" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-500/5" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-10 animate-fade-in px-4 lg:px-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              <ShieldCheck className="w-3 h-3" /> Identity Verified
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              User <span className="text-primary">Profile</span>
            </h1>
            <p className="text-muted-foreground max-w-lg font-medium leading-relaxed">
              Configure your technical identity and preferences. These settings help the AI Mentor tailor your practice path.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleSave} className="h-12 px-10 font-black gap-2 glow-primary shadow-xl hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Sync Changes</>}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <Card className="glass-card border-border/50 shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <div className="h-32 bg-gradient-to-br from-primary/30 via-blue-600/20 to-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-background/50 backdrop-blur-md border-border/50 text-[10px] font-black uppercase tracking-tighter">
                    Level {userStats.level}
                  </Badge>
                </div>
              </div>
              <CardContent className="relative pt-0 px-8 pb-10 text-center space-y-6">
                <div 
                  className="relative w-36 h-32 mx-auto -mt-16 group cursor-pointer"
                  onClick={handleImageClick}
                >
                  <div className="absolute -inset-2 bg-gradient-to-tr from-primary/50 to-blue-400/50 rounded-full blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-700" />
                  <img 
                    src={formData.avatar} 
                    alt="Profile" 
                    className="relative w-32 h-32 mx-auto rounded-full object-cover border-4 border-background shadow-2xl transition-all duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/20">
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="text-white w-6 h-6" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Update Photo</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-foreground">{formData.name}</h3>
                  <div className="flex flex-col items-center gap-1.5">
                    <p className="text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-tighter">
                      <GraduationCap className="w-4 h-4" /> {formData.college || "Global Learner"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      {formData.year || "Learning Track"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/20 transition-all group/stat">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest group-hover/stat:text-primary transition-colors">Stack</p>
                    <p className="text-sm font-black text-foreground">{formData.language}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/20 transition-all group/stat">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest group-hover/stat:text-primary transition-colors">Goal</p>
                    <p className="text-sm font-black text-foreground">{formData.goal} Sets</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-2 py-1.5 px-4 font-black text-[10px] uppercase tracking-widest shadow-sm">
                    <Award className="w-3.5 h-3.5" /> Total XP: {userStats.xp}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="glass-card border-border/50 shadow-2xl overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/50 p-8">
                <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                  <PencilLine className="w-6 h-6 text-primary" /> Personal Details
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Your identity is used to contextualize AI logic assessments.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        className="pl-12 h-14 bg-background/50 border-border focus:border-primary/50 transition-all rounded-xl font-bold" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Mobile</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        className="pl-12 h-14 bg-background/50 border-border focus:border-primary/50 transition-all rounded-xl font-bold" 
                        placeholder="+1 (555) 000-0000"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        className="pl-12 h-14 bg-background/50 border-border focus:border-primary/50 transition-all rounded-xl font-bold" 
                        placeholder="engineer@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Institution</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        className="pl-12 h-14 bg-background/50 border-border focus:border-primary/50 transition-all rounded-xl font-bold" 
                        placeholder="Stanford, MIT, etc."
                        value={formData.college}
                        onChange={(e) => setFormData({...formData, college: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Engineer Bio</Label>
                  <Textarea 
                    placeholder="Briefly describe your technical background and what you're working towards..." 
                    className="min-h-[140px] bg-background/50 border-border rounded-xl p-5 focus:border-primary/50 transition-all resize-none font-medium leading-relaxed"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 p-10 space-y-8">
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Technical Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black tracking-widest text-primary/70 ml-1">PRIMARY LANGUAGE STACK</Label>
                    <Select value={formData.language} onValueChange={(v) => setFormData({...formData, language: v})}>
                      <SelectTrigger className="bg-background/50 border-border h-12 rounded-xl font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {languages.map(lang => (
                          <SelectItem key={lang} value={lang} className="font-bold">{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black tracking-widest text-primary/70 ml-1">DAILY PRACTICE GOAL</Label>
                    <div className="relative group">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="number" 
                        className="pl-12 bg-background/50 border-border h-12 rounded-xl font-bold" 
                        value={formData.goal}
                        onChange={(e) => setFormData({...formData, goal: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
