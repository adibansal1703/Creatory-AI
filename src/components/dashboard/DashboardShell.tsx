import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  Home,
  LayoutDashboard,
  Link2,
  Send,
  Settings,
} from "lucide-react";
import logo from "@/assets/creatory-logo.png";
import { UserAccountMenu } from "@/components/layout/UserAccountMenu";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/publishing", label: "Multi-Platform Publishing", icon: Send, exact: false },
  { to: "/dashboard/scheduler", label: "Smart Scheduler", icon: CalendarClock, exact: false },
  { to: "/dashboard/accounts", label: "Connected Accounts", icon: Link2, exact: false },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none opacity-50" />
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_80%)] pointer-events-none" />

      <div className="relative flex min-h-screen">
        <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 glass shrink-0">
          <div className="p-5 border-b border-border/60 space-y-3">
            <Link to="/dashboard">
              <img src={logo} alt="Creatory AI" className="h-8 w-auto" />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" />
              Back to home page
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary/15 text-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border/60">
            <UserAccountMenu className="w-full justify-start" />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden border-b border-border/60 glass sticky top-0 z-40 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <Link to="/dashboard">
                <img src={logo} alt="Creatory AI" className="h-7 w-auto" />
              </Link>
              <div className="flex items-center gap-1">
                <Link
                  to="/"
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                >
                  Home
                </Link>
                <UserAccountMenu compact />
              </div>
            </div>
            <nav className="flex gap-1 mt-3 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors",
                      active ? "bg-primary/15 text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
