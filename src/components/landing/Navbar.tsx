import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <nav className="glass rounded-2xl flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center glow">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Nexora<span className="text-gradient"> AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#trends" className="hover:text-foreground transition">Trend Radar</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
            <Button size="sm" className="bg-gradient-brand border-0 hover:opacity-90">
              Start free
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}