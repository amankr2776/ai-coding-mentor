"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Brain, LayoutDashboard, Code2, GraduationCap, 
  History as HistoryIcon, LineChart, User, Settings, LogOut, Sun, Moon,
  Users, Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("Learner");
  const [userLevel, setUserLevel] = useState(1);
  const [avatar, setAvatar] = useState("https://picsum.photos/seed/aman/200");
  const [theme, setTheme] = useState("dark");
  const [role, setRole] = useState<'student' | 'faculty'>('student');

  const loadProfile = () => {
    const savedRole = localStorage.getItem('codementor_role') as 'student' | 'faculty';
    setRole(savedRole || 'student');

    const profile = localStorage.getItem("codementor_profile");
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        setUserName(parsed.name.split(" ")[0]);
        if (parsed.avatar) setAvatar(parsed.avatar);
        setTheme(parsed.theme || "dark");
      } catch (e) {}
    }
    
    const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
    const successes = history.filter((m: any) => m.metadata?.type === 'success');
    const xp = successes.reduce((acc: number, m: any) => {
      const diff = m.metadata?.difficulty || 'Easy';
      if (diff === 'Hard') return acc + 50;
      if (diff === 'Medium') return acc + 25;
      return acc + 10;
    }, 0);
    setUserLevel(Math.floor(xp / 500) + 1);
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    const profileStr = localStorage.getItem("codementor_profile");
    let profile = profileStr ? JSON.parse(profileStr) : {};
    profile.theme = newTheme;
    localStorage.setItem("codementor_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = () => {
    localStorage.removeItem('codementor_role');
    router.push('/');
  };

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/40 backdrop-blur-3xl">
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg leading-none tracking-tight">CodeMentor</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-primary">{role === 'faculty' ? 'Faculty' : 'Intelligence'}</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Core Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {role === 'student' ? (
                <>
                  <NavMenuItem href="/dashboard" icon={LayoutDashboard} label="Control Center" active={pathname === '/dashboard'} />
                  <NavMenuItem href="/practice" icon={Code2} label="Logic Execution" active={pathname === '/practice'} />
                  <NavMenuItem href="/quiz" icon={GraduationCap} label="Skill Evaluation" active={pathname === '/quiz'} />
                  <NavMenuItem href="/progress" icon={LineChart} label="Neural Insights" active={pathname === '/progress'} />
                  <NavMenuItem href="/history" icon={HistoryIcon} label="Session Archive" active={pathname === '/history'} />
                </>
              ) : (
                <>
                  <NavMenuItem href="/faculty" icon={Presentation} label="Cohort Command" active={pathname === '/faculty'} />
                  <NavMenuItem href="/history" icon={HistoryIcon} label="System History" active={pathname === '/history'} />
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">System Config</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavMenuItem 
                href="/profile" 
                icon={User} 
                label={role === 'faculty' ? "Faculty Persona" : "Engineer Persona"} 
                active={pathname === '/profile'} 
              />
              <SidebarMenuItem>
                <SidebarMenuButton className="px-6 h-12" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
                  <span className="text-sm tracking-tight">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 mt-auto">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border group hover:bg-muted transition-all cursor-pointer">
          <img src={role === 'faculty' ? 'https://picsum.photos/seed/faculty/200' : avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-primary/50 group-hover:scale-110 transition-transform object-cover" />
          <div className="flex flex-col grow min-w-0" onClick={() => router.push('/profile')}>
            <span className="text-xs font-black truncate">{role === 'faculty' ? 'Prof. Hindsight' : userName}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{role === 'faculty' ? 'Faculty Admin' : `Level ${userLevel}`}</span>
          </div>
          <button onClick={handleLogout}>
            <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavMenuItem({ href, icon: Icon, label, active }: any) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} className={cn(
        "px-6 h-12 rounded-none border-l-2 border-transparent transition-all",
        active ? "bg-primary/10 border-primary text-foreground font-black" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}>
        <Link href={href} className="flex items-center gap-4">
          <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm tracking-tight">{label}</span>
          {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
