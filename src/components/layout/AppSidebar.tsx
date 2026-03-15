import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Wrench, Car, Package, Users, UserCog,
  ShoppingCart, BarChart3, Settings, ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/orders", icon: Wrench, label: "Service Orders" },
  { to: "/vehicles", icon: Car, label: "Vehicles" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/mechanics", icon: UserCog, label: "Mechanics" },
  { to: "/pos", icon: ShoppingCart, label: "Cashier POS" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="fixed left-0 top-0 h-screen z-50 glass border-r border-border/50 flex flex-col"
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-center gap-3 p-4 border-b border-border/30">
        <div className="w-9 h-9 rounded-glass-inner bg-primary flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
              <h1 className="font-display text-xl tracking-tight">Velocity OS</h1>
              <p className="text-[11px] text-muted-foreground">Workshop Management</p>
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-glass-inner text-sm font-medium transition-snappy",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
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

      <div className="p-3 border-t border-border/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-glass-inner text-sm text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-snappy"
        >
          <ChevronLeft className={cn("w-[18px] h-[18px] shrink-0 transition-transform", collapsed && "rotate-180")} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Collapse</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};
