import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { serviceOrders, formatCurrency, type ServiceOrder, type ServiceStatus } from "@/lib/mock-data";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Wrench, CheckCircle2, CreditCard } from "lucide-react";

const columns: { status: ServiceStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: "queued", label: "Queued", icon: Clock, color: "text-warning" },
  { status: "in_progress", label: "In Progress", icon: Wrench, color: "text-info" },
  { status: "completed", label: "Completed", icon: CheckCircle2, color: "text-success" },
  { status: "paid", label: "Paid", icon: CreditCard, color: "text-muted-foreground" },
];

const OrderCard = ({ order }: { order: ServiceOrder }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="p-4 rounded-glass-inner bg-secondary/30 hover:bg-secondary/50 transition-snappy cursor-pointer border border-border/30"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-mono font-medium text-muted-foreground">{order.id}</span>
      <span className="text-xs font-mono font-medium">{formatCurrency(order.totalAmount)}</span>
    </div>
    <p className="text-sm font-medium mb-1">{order.vehicle.make} {order.vehicle.model}</p>
    <p className="text-xs text-muted-foreground mb-3">{order.description}</p>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
          {order.mechanic.avatar}
        </div>
        <span className="text-xs text-muted-foreground">{order.mechanic.name}</span>
      </div>
      <span className="text-[11px] text-muted-foreground">{order.vehicle.plateNumber}</span>
    </div>
  </motion.div>
);

const ServiceOrdersPage = () => {
  const [orders] = useState(serviceOrders);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Service Board</h1>
          <p className="text-muted-foreground mt-1">Live status of all service orders.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-glass-inner bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy">
          <Plus className="w-4 h-4" /> New Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map(({ status, label, icon: Icon, color }) => {
          const colOrders = orders.filter(o => o.status === status);
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-medium">{label}</span>
                <span className="ml-auto text-xs font-mono text-muted-foreground">{colOrders.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {colOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
                {colOrders.length === 0 && (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-glass-inner">
                    No orders
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default ServiceOrdersPage;
