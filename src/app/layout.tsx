import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeInitializer } from '@/components/ThemeInitializer';
import { HindsightConnectionCheck } from '@/components/HindsightConnectionCheck';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'CodeMentor AI - The Mentor That Remembers',
  description: 'AI-powered coding practice platform that tracks your mistakes and helps you grow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen selection:bg-primary/30">
        <ThemeInitializer />
        <HindsightConnectionCheck />
        
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full overflow-hidden">
            <DashboardSidebar />
            
            <main className="relative flex-1 flex flex-col min-w-0 h-full z-10">
              <header className="h-20 flex items-center justify-between px-8 border-b border-border/50 bg-background/50 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                  <div className="h-6 w-px bg-border hidden md:block" />
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border w-80">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Search archives...</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync: Optimal</span>
                  </div>
                  <Button size="sm" className="h-9 gap-2 glow-primary font-black text-[10px] uppercase tracking-widest rounded-xl" asChild>
                    <Link href="/practice">New Session <Zap className="w-3 h-3 fill-current" /></Link>
                  </Button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>

        <Toaster />
      </body>
    </html>
  );
}
