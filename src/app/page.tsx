"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Brain, Code2, Zap, ShieldCheck, ArrowDown, UserCircle, GraduationCap } from "lucide-react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (role: 'student' | 'faculty') => {
    localStorage.setItem('codementor_role', role);
    window.dispatchEvent(new Event('storage'));
    router.push(role === 'faculty' ? '/faculty' : '/dashboard');
  };

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const PARTICLE_COUNT = 200;
    const COLORS = ["#3b82f6", "#a855f7", "#22c55e", "#00d4ff"];
    const PERSPECTIVE = 500;
    const CONNECTION_DIST = 180;
    const HOLD_TIME = 3000;
    const TRANSITION_TIME = 2000;
    const TOTAL_CYCLE = HOLD_TIME + TRANSITION_TIME;

    let currentShapeIndex = 0;
    let startTime = Date.now();
    let mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number; y: number; z: number;
      tx: number; ty: number; tz: number;
      px: number; py: number; pz: number;
      size: number;
      color: string;
      id: number;
      flash: number = 0;

      constructor(id: number) {
        this.id = id;
        this.x = (Math.random() - 0.5) * 2000;
        this.y = (Math.random() - 0.5) * 2000;
        this.z = (Math.random() - 0.5) * 1000;
        this.tx = this.x; this.ty = this.y; this.tz = this.z;
        this.px = this.x; this.py = this.y; this.pz = this.z;
        this.size = Math.max(0.5, 3 + Math.random() * 3);
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }

      update(progress: number, isTransitioning: boolean) {
        if (isTransitioning) {
          this.x = this.px + (this.tx - this.px) * progress;
          this.y = this.py + (this.ty - this.py) * progress;
          this.z = this.pz + (this.tz - this.pz) * progress;
        } else {
          this.x += Math.sin(Date.now() * 0.001 + this.id) * 0.2;
          this.y += Math.cos(Date.now() * 0.001 + this.id) * 0.2;
        }

        const dx = mouse.x - (this.x * (PERSPECTIVE / (PERSPECTIVE + this.z)) + width / 2);
        const dy = mouse.y - (this.y * (PERSPECTIVE / (PERSPECTIVE + this.z)) + height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          this.x += dx * 0.02;
          this.y += dy * 0.02;
        }

        if (Math.random() > 0.999) this.flash = 1;
        this.flash *= 0.95;
      }
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => new Particle(i));

    const setShape = (index: number) => {
      const hLimit = height * 0.42;
      const wLimit = width * 0.4;

      particles.forEach((p, i) => {
        p.px = p.x; p.py = p.y; p.pz = p.z;
        const t = i / PARTICLE_COUNT;

        switch (index) {
          case 0:
            const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
            const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
            p.tx = hLimit * Math.sin(phi) * Math.cos(theta);
            p.ty = hLimit * Math.sin(phi) * Math.sin(theta);
            p.tz = hLimit * Math.cos(phi);
            break;
          case 1:
            const hTheta = t * Math.PI * 2;
            const hPhi = (i % 5) * (Math.PI / 2.5);
            const r1 = wLimit * 0.8;
            const r2 = wLimit * 0.3;
            p.tx = (r1 + r2 * Math.cos(hTheta)) * Math.cos(hPhi);
            p.ty = (r1 + r2 * Math.cos(hTheta)) * Math.sin(hPhi);
            p.tz = r2 * Math.sin(hTheta);
            break;
          case 2:
            let lx = 0.1, ly = 0, lz = 0;
            const dt = 0.01;
            for(let j=0; j<i*5; j++) {
              lx += 10 * (ly - lx) * dt;
              ly += (lx * (28 - lz) - ly) * dt;
              lz += (lx * ly - (8/3) * lz) * dt;
            }
            p.tx = lx * 15; p.ty = ly * 15; p.tz = (lz - 25) * 15;
            break;
          case 3:
            const pAngle = i * 137.5 * (Math.PI / 180);
            const pRad = Math.sqrt(i) * (Math.min(width, height) * 0.04);
            p.tx = pRad * Math.cos(pAngle);
            p.ty = pRad * Math.sin(pAngle);
            p.tz = 0;
            break;
          case 4:
            const h1 = 2, h2 = 3, h3 = 1.01, h4 = 2.02;
            p.tx = Math.sin(t * 50 * h1) * wLimit;
            p.ty = Math.sin(t * 50 * h2) * hLimit;
            p.tz = Math.sin(t * 50 * h3) * 200;
            break;
          case 5:
            const rdX = (i % 20) / 20 * width - width/2;
            const rdY = Math.floor(i / 20) / 10 * height - height/2;
            p.tx = rdX + Math.sin(rdY * 0.01) * 50;
            p.ty = rdY + Math.cos(rdX * 0.01) * 50;
            p.tz = Math.sin(rdX * rdY) * 100;
            break;
          case 6:
            const nlRow = Math.floor(i / 4);
            const nlLayer = i % 4;
            p.tx = (nlLayer - 1.5) * (width * 0.25);
            p.ty = (nlRow - 25) * 20;
            p.tz = 0;
            break;
          case 7:
            let depth = Math.floor(Math.log2(i + 1));
            let posInLayer = i + 1 - Math.pow(2, depth);
            p.tx = (posInLayer - Math.pow(2, depth-1) + 0.5) * (width / Math.pow(2, depth-1)) * 0.4;
            p.ty = depth * (height * 0.1) - height * 0.4;
            p.tz = 0;
            break;
          case 8:
            const rTheta = t * Math.PI * 2;
            const rK = 6;
            const rR = Math.cos(rK * rTheta) * hLimit;
            p.tx = rR * Math.cos(rTheta);
            p.ty = rR * Math.sin(rTheta);
            p.tz = 0;
            break;
          case 9:
            const eTheta = t * Math.PI * 2;
            const eR = 150, er = 40;
            p.tx = (eR + er) * Math.cos(eTheta) - er * Math.cos((eR + er) * eTheta / er);
            p.ty = (eR + er) * Math.sin(eTheta) - er * Math.sin((eR + er) * eTheta / er);
            p.tz = 0;
            break;
          case 10:
            const sTheta = t * Math.PI * 20;
            const sR = 200, sr = 80, sd = 120;
            p.tx = (sR - sr) * Math.cos(sTheta) + sd * Math.cos((sR - sr) * sTheta / sr);
            p.ty = (sR - sr) * Math.sin(sTheta) - sd * Math.sin((sR - sr) * sTheta / sr);
            p.tz = 0;
            break;
          case 11:
            const su = t * Math.PI * 6;
            const sv = Math.random() * Math.PI * 2;
            const sa = 10, sb = 8, sc = 15, sA = 0.1;
            const sExp = Math.exp(sA * su);
            p.tx = (sa + sb * Math.cos(sv)) * Math.cos(su) * sExp * 5;
            p.ty = (sa + sb * Math.cos(sv)) * Math.sin(su) * sExp * 5;
            p.tz = sc * Math.sin(sv) * sExp * 5;
            break;
          case 12:
            const vertices = [];
            for(let x=-1;x<=1;x+=2)for(let y=-1;y<=1;y+=2)for(let z=-1;z<=1;z+=2)for(let w=-1;w<=1;w+=2) vertices.push({x,y,z,w});
            const v = vertices[i % 16];
            const tScale = 250;
            p.tx = v.x * tScale; p.ty = v.y * tScale; p.tz = v.z * tScale + v.w * 100;
            break;
          case 13:
            p.tx = 0; p.ty = 0; p.tz = 0;
            break;
        }
      });
    };

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      setShape(currentShapeIndex);
    };

    const render = () => {
      const now = Date.now();
      const elapsed = (now - startTime) % TOTAL_CYCLE;
      const isTransitioning = elapsed > HOLD_TIME;
      const progress = isTransitioning ? (elapsed - HOLD_TIME) / TRANSITION_TIME : 0;

      const newIndex = Math.floor((now - startTime) / TOTAL_CYCLE) % 14;
      if (newIndex !== currentShapeIndex) {
        currentShapeIndex = newIndex;
        setShape(currentShapeIndex);
      }

      ctx.fillStyle = "#050810";
      ctx.fillRect(0, 0, width, height);

      const rotX = now * 0.0002;
      const rotY = now * 0.0003;

      const projected = particles.map(p => {
        p.update(progress, isTransitioning);

        let rx = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        let rz = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        let ry = p.y * Math.cos(rotX) - rz * Math.sin(rotX);
        let rz2 = p.y * Math.sin(rotX) + rz * Math.cos(rotX);

        const scale = PERSPECTIVE / (PERSPECTIVE + rz2);
        return {
          x: Math.round(rx * scale + width / 2),
          y: Math.round(ry * scale + height / 2),
          scale: scale,
          color: p.color,
          flash: p.flash
        };
      });

      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DIST * CONNECTION_DIST) {
            const opacity = (1 - Math.sqrt(distSq) / CONNECTION_DIST) * 0.4;
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      projected.forEach(p => {
        const size = Math.max(0.5, p.scale * 4);
        const opacity = Math.min(1, p.scale + p.flash);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize);
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    handleResize();
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  const scrollToHowItWorks = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#0f172a] flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-[0.85]"
      />

      <div className="w-full h-full overflow-y-auto flex flex-col items-center custom-scrollbar relative z-10">
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center space-y-12 max-w-5xl relative px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20 animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-center">
              <span className="text-white">CodeMentor</span>{" "}
              <span className="text-[#3b82f6]">AI</span>
            </h1>
          </div>

          <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Button 
                size="lg" 
                className="h-20 text-md font-black gap-3 glow-primary flex flex-col items-center justify-center rounded-[1.5rem]"
                onClick={() => handleLogin('student')}
              >
                <UserCircle className="w-6 h-6" />
                Student Portal
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-20 text-md font-black gap-3 bg-background/50 backdrop-blur-md text-white border-white/20 hover:bg-white/10 flex flex-col items-center justify-center rounded-[1.5rem]"
                onClick={() => handleLogin('faculty')}
              >
                <GraduationCap className="w-6 h-6 text-primary" />
                Faculty Portal
              </Button>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400 gap-2"
              onClick={scrollToHowItWorks}
            >
              How it works <ArrowDown className="w-3 h-3" />
            </Button>
          </div>

          <div className="absolute bottom-10 animate-bounce">
            <ArrowDown className="w-6 h-6 text-slate-500" />
          </div>
        </section>

        <section id="how-it-works" className="py-24 w-full max-w-6xl relative px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">How It Works</h2>
            <p className="text-slate-400 text-lg">Master coding through the science of personalized recall.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-6 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl relative group hover:border-primary/50 transition-colors">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-8 h-8 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Practice Coding</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Solve algorithmic problems in 14+ languages. Submit your code for instant, deep-learning feedback.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-6 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl relative group hover:border-primary/50 transition-colors">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">2</div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">AI Remembers</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our Hindsight system captures every mistake, logic error, and hint request to build your personal learning profile.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-6 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl relative group hover:border-primary/50 transition-colors">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">3</div>
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Get Smarter</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Receive problems specifically generated to target your weaknesses, ensuring you never make the same mistake twice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-20 mb-20 opacity-70 hover:opacity-100 transition-opacity relative">
          <span className="text-sm uppercase tracking-widest font-bold text-slate-400">Infrastructure Partners</span>
          <div className="hidden sm:block h-px w-20 bg-white/10" />
          <span className="text-lg font-bold flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-primary" /> Vectorize Hindsight
          </span>
          <span className="text-lg font-bold flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-orange-500" /> Groq AI
          </span>
        </div>
      </div>
    </div>
  );
}
