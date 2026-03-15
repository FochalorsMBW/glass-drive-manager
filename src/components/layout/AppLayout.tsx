import { type ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search } from "lucide-react";

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <AppSidebar />
    <div className="ml-[260px] transition-all duration-300">
      <header className="sticky top-0 z-40 glass border-b border-border/30 px-8 py-4 flex items-center justify-between" style={{ borderRadius: 0 }}>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search orders, vehicles, parts..."
            className="w-full pl-10 pr-4 py-2 rounded-glass-inner bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-snappy"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-glass-inner hover:bg-accent transition-snappy">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">VO</div>
            <div className="text-sm">
              <p className="font-medium">Velocity HQ</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </header>
      <main className="p-8">{children}</main>
    </div>
  </div>
);
