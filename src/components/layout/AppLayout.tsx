import { useState, useEffect, useRef, type ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Menu, User, Car, Receipt, Package, Settings as SettingsIcon } from "lucide-react";
import { useAppStore } from "@/hooks/useAppStore";
import { useNavigate } from "react-router-dom";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { searchQuery, setSearchQuery, customers, vehicles, serviceOrders, inventory, settings } = useAppStore();
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
      <AppSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      
      <div className="lg:ml-[260px] transition-all duration-300">
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 lg:px-8 py-4 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-2 lg:gap-4 truncate mr-2 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-accent transition-snappy lg:hidden shrink-0"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Cari (Ctrl+K)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all focus:bg-background"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-30 select-none pointer-events-none hidden md:flex">
                <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono leading-none">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono leading-none">K</kbd>
              </div>
              
              {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {results.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={i}
                        onMouseDown={() => { navigate(r.route); setSearchQuery(""); setShowResults(false); }}
                        className="w-full text-left px-5 py-4 hover:bg-secondary/50 transition-snappy border-b border-border/10 last:border-0 flex items-center gap-4"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{r.label}</p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{r.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            <button className="relative p-2 rounded-xl hover:bg-accent transition-snappy">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            </button>
            <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-border/30">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden">
                {(settings.logo || "/IconUB.png") ? (
                  <img src={settings.logo || "/IconUB.png"} alt={settings.name} className="w-full h-full object-cover" />
                ) : (
                  settings.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div className="text-sm hidden lg:block">
                <p className="font-bold leading-tight">{settings.name}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
