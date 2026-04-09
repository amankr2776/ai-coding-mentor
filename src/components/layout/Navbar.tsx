
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, Code2, GraduationCap, History, LineChart, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Practice", href: "/practice", icon: Code2 },
  { name: "Quiz", href: "/quiz", icon: GraduationCap },
  { name: "History", href: "/history", icon: History },
  { name: "Progress", href: "/progress", icon: LineChart },
  { name: "Profile", href: "/profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("dark");
  const [userProfile, setUserProfile] = useState({
    name: "Learner",
    avatar: "https://picsum.photos/seed/aman/200",
    initials: "L"
  });

  const isDashboard = pathname.startsWith('/dashboard');

  const loadSharedData = () => {
    const profileStr = localStorage.getItem("codementor_profile");
    if (profileStr) {
      try {
        const parsed = JSON.parse(profileStr);
        setTheme(parsed.theme || "dark");
        const names = (parsed.name || "Learner").split(" ");
        const initials = names.length > 1 
          ? (names[0][0] + (names[1] ? names[1][0] : "")).toUpperCase() 
          : names[0][0].toUpperCase();
        
        setUserProfile({
          name: names[0],
          avatar: parsed.avatar,
          initials: initials
        });
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadSharedData();
    window.addEventListener('storage', loadSharedData);
    return () => window.removeEventListener('storage', loadSharedData);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Apply immediately to DOM
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Persist to storage
    const profileStr = localStorage.getItem("codementor_profile");
    let profile = profileStr ? JSON.parse(profileStr) : {};
    profile.theme = newTheme;
    localStorage.setItem("codementor_profile", JSON.stringify(profile));
    
    // Notify other components
    window.dispatchEvent(new Event("storage"));
  };

  // Do not show top navbar on dashboard as it has a professional sidebar
  if (isDashboard) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:block">
            CodeMentor <span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full w-9 h-9"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </Button>

          <Link href="/profile" className="flex items-center gap-2 group ml-1">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold leading-none">{userProfile.name}</p>
              <p className="text-[10px] text-muted-foreground">Pro Member</p>
            </div>
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-primary/50 object-cover group-hover:scale-110 transition-transform"
                data-ai-hint="user portrait"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-bold text-primary text-xs group-hover:scale-110 transition-transform">
                {userProfile.initials}
              </div>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
