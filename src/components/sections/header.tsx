"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { getCookie } from "@/lib/cookies";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    const sessionCookie = getCookie('session');
    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie);
            if(session.user === 'admin') {
                setIsAdmin(true);
            }
        } catch (e) {
            setIsAdmin(false);
        }
    }


    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navItems = [
    { name: "Core Systems", href: "#tech-stack" },
    { name: "Deployments", href: "#projects" },
    { name: "Intel Request", href: "#contact" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-headline text-2xl font-bold text-glow">
            C/A
          </span>
          <span className="hidden sm:inline-block font-headline text-xl font-bold text-primary-foreground">
            Cyber Architect
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {item.name}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href={isAdmin ? "/admin" : "/login"}>{isAdmin ? "Go to Admin" : "Operator Login"}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
