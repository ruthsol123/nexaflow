"use client";

import { Menu, X, ArrowUpRight, Layers3, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { usePathname } from "next/navigation";

const links = ["Features", "Solutions", "Pricing", "Resources"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";
  
  useEffect(() => {
    if (!isPublicPage) return;
    
    const handleScroll = () => {
      const sections = links.map(link => document.getElementById(link.toLowerCase()));
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(links[i].toLowerCase());
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPublicPage]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-[#070b13]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight nav-brand transition-opacity hover:opacity-80" aria-label="NexaFlow home">
          <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-300 text-[#07101d]"><Layers3 size={17} strokeWidth={2.5} /></span>
          <span className="hidden sm:inline">NexaFlow</span>
          <span className="sm:hidden">NexaFlow</span>
        </Link>
        {isPublicPage && (
          <>
            <div className="hidden items-center gap-6 text-sm text-slate-400 lg:flex xl:gap-8">
              {links.map((link) => (
                <a 
                  className={`transition-colors hover:text-white ${activeSection === link.toLowerCase() ? 'text-white font-medium' : ''}`} 
                  href={`#${link.toLowerCase()}`} 
                  key={link}
                >
                  {link}
                </a>
              ))}
            </div>
            <div className="hidden items-center gap-4 md:flex lg:gap-5">
              <Link className="text-sm text-slate-300 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-2 focus:ring-offset-[#070b13] rounded px-2 py-1" href="/login">Log in</Link>
              <button className="rounded-md p-2 text-slate-300 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-2 focus:ring-offset-[#070b13]" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
              <Link className="flex items-center gap-1.5 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#07101d] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-2 focus:ring-offset-[#070b13]" href="/signup">Get Started <ArrowUpRight size={15} /></Link>
            </div>
          </>
        )}
        {!isPublicPage && (
          <div className="hidden items-center gap-4 md:flex">
            <button className="rounded-md p-2 text-slate-300 transition-colors hover:text-white" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          </div>
        )}
        <button className="rounded-md p-2 text-slate-200 md:hidden focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-2 focus:ring-offset-[#070b13]" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && isPublicPage && (
        <div className="border-t border-white/8 bg-[#0a101b] px-4 py-5 sm:px-6 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-slate-300">
            {links.map((link) => (
              <a 
                className={`transition-colors hover:text-white py-2 ${activeSection === link.toLowerCase() ? 'text-white font-medium' : ''}`} 
                href={`#${link.toLowerCase()}`} 
                onClick={() => setOpen(false)} 
                key={link}
              >
                {link}
              </a>
            ))}
            <Link 
              className="transition-colors hover:text-white py-2" 
              href="/login" 
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link 
              className="w-fit rounded-lg bg-cyan-300 px-4 py-2.5 font-semibold text-[#07101d]" 
              href="/signup" 
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
            <button 
              className="flex w-fit items-center gap-2 text-left transition-colors hover:text-white py-2" 
              onClick={toggleTheme} 
              aria-label={themeLabel}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              {themeLabel}
            </button>
          </div>
        </div>
      )}
      {open && !isPublicPage && (
        <div className="border-t border-white/8 bg-[#0a101b] px-4 py-5 sm:px-6 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-slate-300">
            <Link 
              className="transition-colors hover:text-white py-2" 
              href="/" 
              onClick={() => setOpen(false)}
            >
              Back to Home
            </Link>
            <button 
              className="flex w-fit items-center gap-2 text-left transition-colors hover:text-white py-2" 
              onClick={toggleTheme} 
              aria-label={themeLabel}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              {themeLabel}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}