"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Info, 
  Layers, 
  HelpCircle, 
  Smartphone,
  Shield,
  CreditCard,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

/**
 * Navigation Items Configuration
 */
const navItems = [
  { name: "Início", icon: Home, href: "/" },
  { name: "Sobre", icon: Info, href: "/sobre" },
  { name: "Serviços", icon: Layers, href: "/servicos" },
  { name: "Planos", icon: CreditCard, href: "/planos", label: "Planos Web" },
  { name: "Perguntas Frequentes", icon: HelpCircle, href: "/perguntas-frequentes" },
  { name: "Privacidade", icon: Shield, href: "/privacidade", label: "Privacidade de Dados" },
  { name: "App", icon: Smartphone, href: "/baixar", label: "Baixar App" },
];


/**
 * Dock Component - Apple Inspired Design
 * Implements a cinematic, glassmorphic navigation bar with magnification effects.
 */
export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center z-100 pointer-events-none px-4 pb-4 md:pb-6">
      <motion.div
        onMouseMove={(e) => !isMobile && mouseX.set(e.pageX)}
        onMouseLeave={() => !isMobile && mouseX.set(Infinity)}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.5 
        }}
        className={cn(
          "pointer-events-auto flex items-end gap-2 md:gap-4 px-3 md:px-4 py-3 rounded-4xl",
          "glass shadow-[0_20px_50px_rgba(0,0,0,0.22)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
          "backdrop-blur-3xl",
          "relative overflow-visible"
        )}
      >
        {/* Glow Effect behind the dock */}
        <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-transparent to-primary/20 blur-2xl -z-10 opacity-50" />

        {navItems.map((item) => (
          <DockItem
            key={item.href}
            mouseX={mouseX}
            item={item}
            isActive={pathname === item.href}
            isMobile={isMobile}
          />
        ))}
        <DockThemeToggle mouseX={mouseX} isMobile={isMobile} />
      </motion.div>
    </nav>
  );
}

interface DockItemProps {
  mouseX: MotionValue<number>;
  item: typeof navItems[0];
  isActive: boolean;
  isMobile: boolean;
}

function DockItem({ mouseX, item, isActive, isMobile }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Distance from mouse to center of item
  const distance = useTransform(mouseX, (val: number) => {
    if (isMobile) return 0;
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Magnification logic (Desktop) - Buttery smoothness for fluid motion
  const widthSync = useTransform(
    distance, 
    [-200, 0, 200], 
    [isMobile ? 48 : 56, isMobile ? 48 : 110, isMobile ? 48 : 56]
  );
  
  const width = useSpring(widthSync, {
    mass: 0.4,
    stiffness: 200,
    damping: 25,
  });

  const iconSizeSync = useTransform(
    distance, 
    [-200, 0, 200], 
    [24, 54, 24]
  );
  
  const iconSize = useSpring(iconSizeSync, {
    mass: 0.4,
    stiffness: 200,
    damping: 25,
  });

  // Vertical offset on magnification
  const yOffsetSync = useTransform(distance, [-200, 0, 200], [0, -24, 0]);
  const yOffset = useSpring(yOffsetSync, {
    mass: 0.4,
    stiffness: 200,
    damping: 25,
  });

  const isDownload = item.href === "/baixar";

  return (
    <Link 
      href={item.href} 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        ref={ref}
        style={{ 
          width: isMobile ? 48 : width, 
          height: isMobile ? 48 : width,
          y: isMobile ? 0 : yOffset 
        }}
        whileTap={{ scale: 0.8, y: 0 }}
        className={cn(
          "aspect-square rounded-[1.6rem] flex items-center justify-center transition-colors duration-500",
          "relative overflow-hidden group/item",
          isActive 
            ? "bg-primary text-primary-foreground shadow-[0_25px_60px_-10px_rgba(32,201,151,0.8)] border-t border-white/50" 
            : isDownload 
              ? "bg-white/10 text-primary border border-primary/50 shadow-[0_15px_40px_-5px_rgba(32,201,151,0.3)]"
              : "bg-foreground/5 hover:bg-foreground/10 text-foreground/55 hover:text-foreground border border-border/60 hover:border-primary/30 shadow-2xl"
        )}
      >
        {/* Intense cinematic glass highlight */}
        <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-black/30 pointer-events-none" />
        
        <motion.div 
          style={{ 
            width: isMobile ? 24 : iconSize, 
            height: isMobile ? 24 : iconSize 
          }}
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <item.icon className="w-full h-full" strokeWidth={isActive ? 2.5 : 1.5} />
        </motion.div>

        {/* Hyper-gloss overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
      
      {/* Tooltip / Label */}
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className="absolute -top-14 left-1/2 px-3 py-1.5 rounded-xl bg-black/80 text-white text-[10px] font-bold tracking-widest uppercase border border-white/10 backdrop-blur-xl whitespace-nowrap shadow-2xl z-50"
          >
            {item.label || item.name}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Indicator Dot */}
      {isActive && (
        <motion.div
          layoutId="active-dot"
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.705_0.15_155)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      )}
    </Link>
  );
}

interface DockThemeToggleProps {
  mouseX: MotionValue<number>;
  isMobile: boolean;
}

function DockThemeToggle({ mouseX, isMobile }: DockThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Distance from mouse to center of item
  const distance = useTransform(mouseX, (val: number) => {
    if (isMobile) return 0;
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Magnification logic (Desktop) - Buttery smoothness for fluid motion
  const widthSync = useTransform(
    distance, 
    [-200, 0, 200], 
    [isMobile ? 48 : 56, isMobile ? 48 : 110, isMobile ? 48 : 56]
  );
  
  const width = useSpring(widthSync, {
    mass: 0.4,
    stiffness: 200,
    damping: 25,
  });

  const iconSizeSync = useTransform(
    distance, 
    [-200, 0, 200], 
    [24, 54, 24]
  );
  
  const iconSize = useSpring(iconSizeSync, {
    mass: 0.4,
    stiffness: 200,
    damping: 25,
  });

  // Vertical offset on magnification
  const yOffsetSync = useTransform(distance, [-200, 0, 200], [0, -24, 0]);
  const yOffset = useSpring(yOffsetSync, {
    mass: 0.4,
    stiffness: 200,
    damping: 25,
  });

  const label = isDark ? "Modo Claro" : "Modo Escuro";

  return (
    <button 
      type="button"
      onClick={toggleTheme}
      className="relative focus:outline-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={label}
    >
      <motion.div
        ref={ref}
        style={{ 
          width: isMobile ? 48 : width, 
          height: isMobile ? 48 : width,
          y: isMobile ? 0 : yOffset 
        }}
        whileTap={{ scale: 0.8, y: 0 }}
        className={cn(
          "aspect-square rounded-[1.6rem] flex items-center justify-center transition-colors duration-500",
          "relative overflow-hidden group/item",
          "bg-foreground/5 hover:bg-foreground/10 text-foreground/55 hover:text-foreground border border-border/60 hover:border-primary/30 shadow-2xl"
        )}
      >
        {/* Intense cinematic glass highlight */}
        <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-black/30 pointer-events-none" />
        
        <motion.div 
          style={{ 
            width: isMobile ? 24 : iconSize, 
            height: isMobile ? 24 : iconSize 
          }}
        >
          {isDark ? (
            <Sun className="w-full h-full" strokeWidth={1.5} />
          ) : (
            <Moon className="w-full h-full" strokeWidth={1.5} />
          )}
        </motion.div>

        {/* Hyper-gloss overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
      
      {/* Tooltip / Label */}
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className="absolute -top-14 left-1/2 px-3 py-1.5 rounded-xl bg-black/80 text-white text-[10px] font-bold tracking-widest uppercase border border-white/10 backdrop-blur-xl whitespace-nowrap shadow-2xl z-50"
          >
            {label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
