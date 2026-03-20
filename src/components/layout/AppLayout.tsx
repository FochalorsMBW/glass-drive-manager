import { useState, useEffect, useRef, type ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Menu, User, Car, Receipt, Package, Settings as SettingsIcon } from "lucide-react";
import { useAppStore } from "@/hooks/useAppStore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { searchQuery, setSearchQuery, customers, vehicles, serviceOrders, inventory, settings, notifications } = useAppStore();
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { label: string; sub: string; route: string; icon: any }[] = [];

    customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 3).forEach(c => results.push({ label: c.name, sub: `Pelanggan · ${c.phone}`, route: "/customers", icon: User }));

    vehicles.filter(v => v.plateNumber.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q))
      .slice(0, 3).forEach(v => results.push({ label: `${v.make} ${v.model}`, sub: `Kendaraan · ${v.plateNumber}`, route: "/vehicles", icon: Car }));

    serviceOrders.filter(o => o.id.toLowerCase().includes(q) || o.description.toLowerCase().includes(q))
      .slice(0, 3).forEach(o => results.push({ label: o.id, sub: `Pesanan · ${o.description.slice(0, 30)}...`, route: "/orders", icon: Receipt }));

    inventory.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      .slice(0, 3).forEach(i => results.push({ label: i.name, sub: `Inventaris · ${i.sku}`, route: "/inventory", icon: Package }));

    return results;
  };

  const results = getSearchResults();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar 
        open={isSidebarOpen} 
        onOpenChange={setIsSidebarOpen} 
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      
      <div className={cn(
        "transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
      )}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-3 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-3 lg:gap-0" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-accent transition-snappy lg:hidden shrink-0"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className={cn(
              "relative w-full transition-all duration-300 group",
              showResults ? "max-w-xl" : "max-w-md"
            )}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Cari (Ctrl+K)..."
                className="w-full pl-9 md:pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all focus:bg-background"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 select-none pointer-events-none hidden md:flex">
                <kbd className="px-1.5 py-0.5 rounded border border-border text-[9px] font-mono leading-none">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 rounded border border-border text-[9px] font-mono leading-none">K</kbd>
              </div>
              
              {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-2 max-h-[70vh] overflow-y-auto">
                    {results.map((r, i) => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={i}
                          onMouseDown={() => { navigate(r.route); setSearchQuery(""); setShowResults(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-snappy rounded-xl flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate">{r.label}</p>
                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest truncate">{r.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
            <button 
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-xl hover:bg-accent transition-snappy md:block hidden"
              title="Notifikasi & Hub Pesan"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notifications.some(n => n.status === 'failed') && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full border border-background shadow-sm" />
              )}
            </button>
            <div className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l border-border/30">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden ring-2 ring-background">
                {(settings.workshopLogo || "/IconUB.png") ? (
                  <img src={settings.workshopLogo || "/IconUB.png"} alt={settings.workshopName} className="w-full h-full object-cover" />
                ) : (
                  (settings.workshopName || 'UB').split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div className="text-xs hidden md:block">
                <p className="font-bold leading-tight truncate max-w-[100px]">{settings.workshopName}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
