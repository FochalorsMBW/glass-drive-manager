import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrendingUp, Wrench, Car, AlertTriangle, ArrowUpRight, Plus, ShoppingCart, History, UserPlus, DollarSign, Package } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  queued: "bg-warning/15 text-warning",
  in_progress: "bg-info/15 text-info",
  completed: "bg-success/15 text-success",
  paid: "bg-muted text-muted-foreground",
};

const activityIcons = {
  order: { icon: Wrench, color: "text-info", bg: "bg-info/10" },
  inventory: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  customer: { icon: UserPlus, color: "text-success", bg: "bg-success/10" },
  payment: { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
};

const KpiCard = ({ label, value, prefix, icon: Icon, change }: {
  label: string; value: number; prefix?: string; icon: React.ElementType; change: string;
}) => (
  <GlassCard>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-display tracking-tight">
          <AnimatedNumber value={value} prefix={prefix} className="font-display" />
        </p>
        <p className="text-xs text-success mt-2 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />{change}
        </p>
      </div>
      <div className="p-2.5 rounded-glass-inner bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
  </GlassCard>
);

const statusLabels: Record<string, string> = {
  queued: "Antrean",
  in_progress: "Diproses",
  completed: "Selesai",
  paid: "Lunas",
};

const Dashboard = () => {
  const { revenueData, serviceOrders, mechanics, inventory, activities, expenses, settings } = useAppStore();
  const navigate = useNavigate();
  
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'short' });
  const dayLabel = today.charAt(0).toUpperCase() + today.slice(1);
  const todayRevenue = revenueData.find(d => d.date === dayLabel)?.revenue || 0;
  
  const lowStockItems = inventory.filter(item => item.stock <= item.minThreshold);
  const pendingOrders = serviceOrders.filter(o => o.status === 'queued');
  
  // Job Aging: Orders > 24h
  const agingOrders = pendingOrders.filter(o => {
    const hours = (new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
    return hours > 24;
  });

  const activeOrders = serviceOrders.filter(o => o.status === "in_progress" || o.status === "queued").length;
  const completedToday = serviceOrders.filter(o => (o.status === "completed" || o.status === "paid") && o.createdAt.startsWith(new Date().toISOString().split('T')[0])).length;
  const lowStockCount = inventory.filter(i => i.stock <= i.minThreshold).length;

  const weeklyRevenueTotal = revenueData.reduce((sum, d) => sum + d.revenue, 0);

  // Financial Summary for Dashboard
  const completedOrders = serviceOrders.filter(o => o.status === 'completed' || o.status === 'paid');
  const totalCOGS = completedOrders.reduce((sum, o) => {
    return sum + (o.items?.reduce((itemSum, oi) => {
      const inv = inventory.find(i => i.name === oi.name);
      const cost = inv ? (inv.costPrice || 0) : ((oi.price || 0) * 0.7);
      return itemSum + (cost * (oi.qty || 0));
    }, 0) || 0);
  }, 0);
  const commissionRate = settings.commissionRate || 20;
  const totalCommissions = completedOrders.reduce((sum, o) => sum + (o.laborCost * commissionRate) / 100, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfitTotal = (revenueData.reduce((s,d) => s + d.revenue, 0)) - totalCOGS - totalCommissions - totalExpenses;
  
  // Calculate actual Today's Net Profit based on real margins
  const profitMargin = weeklyRevenueTotal > 0 ? netProfitTotal / weeklyRevenueTotal : 0.3;
  const todayNetProfit = todayRevenue * Math.max(0, profitMargin);

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Selamat pagi</h1>
          <p className="text-muted-foreground mt-1">Inilah yang terjadi di Bengkel UB hari ini.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
          >
            <Plus className="w-4 h-4" /> Layanan Baru
          </button>
          <button 
            onClick={() => navigate('/pos')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-snappy"
          >
            <ShoppingCart className="w-4 h-4" /> Kasir POS
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-8">
        <KpiCard label="Omzet Hari Ini" value={todayRevenue} prefix="Rp " icon={TrendingUp} change="+12.3%" />
        <KpiCard label="Laba Bersih Est." value={todayNetProfit} prefix="Rp " icon={DollarSign} change="Setelah Biaya" />
        <KpiCard label="Servis Selesai" value={completedToday || 0} icon={Car} change="Hari Ini" />
        <KpiCard label="Stok Menipis" value={lowStockCount} icon={AlertTriangle} change="Segera Re-stock" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Alerts & Performance */}
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-display tracking-tight">Peringatan & Performa</h3>
                <p className="text-sm text-muted-foreground">Status kritis yang butuh perhatian.</p>
              </div>
              <div className="flex gap-2">
                {agingOrders.length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-widest border border-destructive/20 animate-pulse">
                    {agingOrders.length} Order Menua (&gt;24j)
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-warning" /> Stok Menipis
                </p>
                <div className="space-y-2">
                  {lowStockItems.length > 0 ? lowStockItems.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20 group hover:bg-secondary/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">Sisa {item.stock} {item.unit}</p>
                        </div>
                      </div>
                      <button onClick={() => navigate('/inventory')} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="py-8 text-center bg-success/5 rounded-xl border border-dashed border-success/20 text-success text-xs">
                      Semua stok aman
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-primary" /> Performa Mekanik
                </p>
                <div className="space-y-2">
                  {mechanics.slice(0, 4).map((m, i) => {
                    const mOrders = serviceOrders.filter(o => o.mechanic.id === m.id && o.status === 'paid');
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {m.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{m.specialization}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{mOrders.length} Selesai</p>
                          <p className="text-[9px] text-muted-foreground">Rating 4.9</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassCard>

        {/* Activity Log */}
        <GlassCard className="lg:h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-bold tracking-tight">Aktivitas Terbaru</p>
            </div>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {activities.slice(0, 5).map((activity, i) => {
                const config = activityIcons[activity.type] || activityIcons.payment;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 p-2 rounded-xl hover:bg-secondary/50 transition-snappy group"
                  >
                    <div className={cn("w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm", config.bg)}>
                      <Icon className={cn("w-4 h-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">{activity.message}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">
                        {new Date(activity.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold tracking-tight">Pesanan Layanan Terbaru</p>
          </div>
          <div className="space-y-3">
            {serviceOrders.slice(0, 3).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 md:gap-4 py-3 px-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-transparent hover:border-border/30 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Wrench className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{order.id}</p>
                    <span className={cn("text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider", statusColors[order.status])}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="text-sm font-bold truncate">
                    {order.vehicle.make} {order.vehicle.model}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
                    {order.vehicle.plateNumber}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-display font-medium">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">{order.mechanic.name.split(' ')[0]}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Mechanic Load */}
        <GlassCard>
          <p className="text-sm font-bold tracking-tight mb-5">Area Kerja Mekanik</p>
          <div className="space-y-5">
            {mechanics.map((m, i) => {
              const activeJobs = serviceOrders.filter(o => o.mechanic.id === m.id && o.status === "in_progress").length;
              return (
                <div key={m.id} className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">{m.avatar}</div>
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                      activeJobs > 0 ? "bg-info" : "bg-success"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate transition-colors group-hover:text-primary">{m.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-wider",
                      activeJobs > 0 ? "text-info" : "text-success"
                    )}>
                      {activeJobs > 0 ? `${activeJobs} Aktif` : "Tersedia"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
