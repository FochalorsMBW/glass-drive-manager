import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, Wrench, Car, Package, Users, BarChart3, DollarSign, Receipt, Bell, Settings, ShoppingCart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/hooks/useAppStore";

const navItems = [
  { label: "Beranda", path: "/", icon: LayoutDashboard, keywords: "dashboard home beranda" },
  { label: "Pesanan Layanan", path: "/orders", icon: Wrench, keywords: "order service servis pesanan" },
  { label: "Paket Servis", path: "/packages", icon: Package, keywords: "paket servis package" },
  { label: "Kendaraan", path: "/vehicles", icon: Car, keywords: "kendaraan vehicle mobil motor" },
  { label: "Inventaris", path: "/inventory", icon: Package, keywords: "inventaris inventory stok barang" },
  { label: "Pelanggan", path: "/customers", icon: Users, keywords: "pelanggan customer" },
  { label: "Mekanik", path: "/mechanics", icon: Wrench, keywords: "mekanik mechanic teknisi" },
  { label: "Kasir POS", path: "/pos", icon: ShoppingCart, keywords: "kasir pos penjualan" },
  { label: "Analitik", path: "/analytics", icon: BarChart3, keywords: "analitik analytics grafik" },
  { label: "Keuangan", path: "/finance", icon: DollarSign, keywords: "keuangan finance laba rugi" },
  { label: "Pengeluaran", path: "/expenses", icon: Receipt, keywords: "pengeluaran expense biaya" },
  { label: "Notifikasi", path: "/notifications", icon: Bell, keywords: "notifikasi notification whatsapp" },
  { label: "Pengaturan", path: "/settings", icon: Settings, keywords: "pengaturan settings konfigurasi" },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { customers, vehicles, serviceOrders } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { pages: navItems, customers: [], vehicles: [], orders: [] };

    const q = query.toLowerCase();

    const pages = navItems.filter(n =>
      n.label.toLowerCase().includes(q) || n.keywords.includes(q)
    );

    const matchedCustomers = customers
      .filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 3);

    const matchedVehicles = vehicles
      .filter(v => v.plateNumber.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedOrders = serviceOrders
      .filter(o => o.id.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q))
      .slice(0, 3);

    return { pages, customers: matchedCustomers, vehicles: matchedVehicles, orders: matchedOrders };
  }, [query, customers, vehicles, serviceOrders]);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari halaman, pelanggan, kendaraan..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
            />
            <kbd className="text-[10px] font-mono font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/30">ESC</kbd>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {/* Pages */}
            {results.pages.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1.5">Halaman</p>
                {results.pages.map(item => (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-sm transition-colors group"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium group-hover:text-primary transition-colors">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Customers */}
            {results.customers.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1.5">Pelanggan</p>
                {results.customers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => go("/customers")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-sm transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{c.name.charAt(0)}</div>
                    <div className="text-left">
                      <span className="font-medium group-hover:text-primary block">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{c.phone}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Vehicles */}
            {results.vehicles.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1.5">Kendaraan</p>
                {results.vehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => go("/vehicles")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-sm transition-colors group"
                  >
                    <Car className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    <span className="font-medium group-hover:text-primary">{v.plateNumber} — {v.make} {v.model}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Orders */}
            {results.orders.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1.5">Pesanan</p>
                {results.orders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => go("/orders")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-sm transition-colors group"
                  >
                    <Wrench className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    <span className="font-medium group-hover:text-primary">{o.id} — {o.description || 'Order'}</span>
                  </button>
                ))}
              </div>
            )}

            {query && results.pages.length === 0 && results.customers.length === 0 && results.vehicles.length === 0 && results.orders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Tidak ditemukan hasil untuk "{query}"</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export { CommandPalette };
