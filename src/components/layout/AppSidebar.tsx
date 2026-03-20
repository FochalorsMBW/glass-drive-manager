import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/useAppStore";
import {
  LayoutDashboard, Wrench, Car, Package, Users, UserCog,
  ShoppingCart, BarChart3, Settings, ChevronLeft, Bell, Receipt, Wallet, Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ui/ThemeToggle";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Beranda" },
  { to: "/orders", icon: Wrench, label: "Pesanan Layanan" },
  { to: "/packages", icon: Layers, label: "Paket Servis" },
  { to: "/vehicles", icon: Car, label: "Kendaraan" },
  { to: "/inventory", icon: Package, label: "Inventaris" },
  { to: "/customers", icon: Users, label: "Pelanggan" },
  { to: "/mechanics", icon: UserCog, label: "Mekanik" },
  { to: "/pos", icon: ShoppingCart, label: "Kasir POS" },
  { to: "/analytics", icon: BarChart3, label: "Analitik" },
  { to: "/finance", icon: Receipt, label: "Keuangan" },
  { to: "/expenses", icon: Wallet, label: "Pengeluaran" },
  { to: "/settings", icon: Settings, label: "Pengaturan" },
  { to: "/notifications", icon: Bell, label: "Notifikasi" },
];

interface AppSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const AppSidebar = ({ open, onOpenChange, className }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { settings } = useAppStore();
  
  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024 && open) {
      onOpenChange?.(false);
    }
  }, [location.pathname]);

  const sidebarContent = (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "fixed left-0 top-0 h-screen z-50 glass border-r border-border/50 flex flex-col",
        "transition-transform lg:translate-x-0",
        !open && "-translate-x-full lg:translate-x-0",
        className
      )}
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-center gap-3 p-4 border-b border-border/30 overflow-hidden h-[72px]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3" // Added gap-3 for spacing
            >
              {/* Dynamic full logo/branding */}
              <div className="flex flex-col">
                <img src="/IconUB.png" alt={settings.workshopName} className="h-7 w-auto object-contain self-start" />
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">Management System</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-9 h-9 flex items-center justify-center mx-auto"
            >
              <img src="/logo.png" alt="V" className="w-full h-full object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => onOpenChange?.(false)}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-glass-inner text-sm font-medium transition-snappy",
                active
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 w-1 h-5 bg-primary rounded-full"
                />
              )}
              <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110", active && "text-primary")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/30 space-y-2">
        <div className={cn("flex items-center px-3 py-2", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <span className="text-xs font-medium text-muted-foreground">Mode</span>}
          <ThemeToggle />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-glass-inner text-sm text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-snappy lg:flex hidden"
        >
          <ChevronLeft className={cn("w-[18px] h-[18px] shrink-0 transition-transform", collapsed && "rotate-180")} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Tutup</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange?.(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      {sidebarContent}
    </>
  );
};
