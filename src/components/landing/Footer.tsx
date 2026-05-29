import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-brand grid place-items-center">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <span className="font-semibold">Nexora<span className="text-gradient"> AI</span></span>
          <span className="text-xs text-muted-foreground ml-2">© 2026 — All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Contact</a>
          <a href="#" className="hover:text-foreground transition">Twitter</a>
        </div>
      </div>
    </footer>
  );
}