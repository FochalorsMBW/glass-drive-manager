import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrendingUp, Wrench, Car, AlertTriangle, ArrowUpRight, Plus, ShoppingCart, History, UserPlus, DollarSign, Package, CheckCircle2, Activity } from "lucide-react";
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
  const { serviceOrders, mechanics, inventory, activities, expenses, settings, transactions } = useAppStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Performance Optimized Engine ---
  const dashboardData = React.useMemo(() => {
    const isToday = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        const today = new Date();
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      } catch {
        return false;
      }
    };

    const isNthDayAgo = (dateStr: string | undefined, n: number) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        const target = new Date();
        target.setDate(target.getDate() - n);
        return (
          d.getDate() === target.getDate() &&
          d.getMonth() === target.getMonth() &&
          d.getFullYear() === target.getFullYear()
        );
      } catch {
        return false;
      }
    };

    // 1. Calculate Actual Revenue (Orders + POS)
    const paidOrdersToday = serviceOrders.filter(o => o.status === 'paid' && isToday(o.createdAt));
    const posTransactionsToday = transactions.filter(t => isToday(t.date));
    
    const revenue = 
      paidOrdersToday.reduce((sum, o) => sum + o.totalAmount, 0) + 
      posTransactionsToday.reduce((sum, t) => sum + t.total, 0);

    // 2. Calculate Actual COGS (Modal Barang)
    const calculateOrderCOGS = (order: any) => {
      return order.items?.reduce((sum: number, oi: any) => {
        const inv = inventory.find(i => i.name === oi.name);
        const cost = inv?.costPrice || (oi.price * 0.7);
        return sum + (cost * oi.qty);
      }, 0) || 0;
    };

    const calculateTrxCOGS = (trx: any) => {
      return trx.items?.reduce((sum: number, ti: any) => {
        const inv = inventory.find(i => i.name === ti.name);
        const cost = inv?.costPrice || (ti.price * 0.7);
        return sum + (cost * ti.qty);
      }, 0) || 0;
    };

    const cogs = 
      paidOrdersToday.reduce((sum, o) => sum + calculateOrderCOGS(o), 0) + 
      posTransactionsToday.reduce((sum, t) => sum + calculateTrxCOGS(t), 0);

    // 3. Calculate Actual Commissions
    const commissionRate = settings.commissionRate || 20;
    const commissions = paidOrdersToday.reduce((sum, o) => sum + (o.laborCost * commissionRate) / 100, 0);

    // 4. Calculate Actual Expenses
    const todayExp = expenses.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0);

    // 5. Final Net Profit
    const netProfit = Math.max(0, revenue - cogs - commissions - todayExp);

    // Weekly Trend
    const trend = [6, 5, 4, 3, 2, 1, 0].map(offset => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayOrders = serviceOrders.filter(o => o.status === 'paid' && isNthDayAgo(o.createdAt, offset));
      const dayTrx = transactions.filter(t => isNthDayAgo(t.date, offset));
      const r = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0) + dayTrx.reduce((sum, t) => sum + t.total, 0);
      return { date: dayLabel, revenue: r };
    });

    const lowStockItems = inventory.filter(item => item.stock <= item.minThreshold);
    const lowStockCount = lowStockItems.length;
    const pendingOrders = serviceOrders.filter(o => o.status === "queued");
    const activeOrders = serviceOrders.filter(o => o.status === "in_progress" || o.status === "queued").length;
    const completedToday = serviceOrders.filter(o => (o.status === "completed" || o.status === "paid") && isToday(o.createdAt)).length;

    const agingOrders = pendingOrders.filter(o => {
      const hours = (new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
      return hours > 24;
    });

    return {
      todayRevenue: revenue,
      todayNetProfit: netProfit,
      last7Days: trend,
      weeklyRevenueTotal: trend.reduce((sum, d) => sum + d.revenue, 0),
      lowStockCount,
      lowStockItems,
      activeOrders,
      completedToday,
      agingOrders
    };
  }, [serviceOrders, transactions, inventory, expenses, settings]);

  const { todayRevenue, todayNetProfit, last7Days, weeklyRevenueTotal, lowStockCount, lowStockItems, activeOrders, completedToday, agingOrders } = dashboardData;

  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="mb-0 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              Workshop UB Online
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-success uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live System
            </span>
          </div>
          <h1 className="text-5xl font-display tracking-tighter leading-none">
            Selamat {currentTime.getHours() < 12 ? 'Pagi' : currentTime.getHours() < 16 ? 'Siang' : currentTime.getHours() < 19 ? 'Sore' : 'Malam'}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">{dateStr}</p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <p className="text-4xl font-mono font-bold tracking-tighter text-primary/80">{timeStr}</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus className="w-4.5 h-4.5" /> Layanan Baru
            </button>
            <button 
              onClick={() => navigate('/pos')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold border border-border/50 hover:bg-secondary/80 hover:scale-105 transition-all"
            >
              <ShoppingCart className="w-4.5 h-4.5" /> Kasir POS
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Overview Section */}
      <div className="mt-8 mb-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <GlassCard className="lg:col-span-8 overflow-hidden !p-0 border-primary/20 bg-primary/5">
          <div className="p-6 pb-0 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Weekly Performance</p>
              <h3 className="text-2xl font-display font-bold tracking-tight">Tren Omzet Mingguan</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{formatCurrency(weeklyRevenueTotal)}</p>
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Total 7 Hari Terakhir</p>
            </div>
          </div>
          <div className="h-[120px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="lg:col-span-4 grid grid-cols-1 gap-5">
          <KpiCard label="Omzet Hari Ini" value={todayRevenue} prefix="Rp " icon={TrendingUp} change="+12.3%" />
          <KpiCard label="Laba Bersih Est." value={todayNetProfit} prefix="Rp " icon={DollarSign} change="Setelah Pajak/Biaya" />
        </div>
      </div>

      {/* Stats Summary Mobile/Tab optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 lg:hidden">
        <div className="p-4 rounded-3xl bg-secondary/30 border border-border/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Servis Selesai</p>
          <p className="text-xl font-bold">{completedToday}</p>
        </div>
        <div className="p-4 rounded-3xl bg-secondary/30 border border-border/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Stok Menipis</p>
          <p className="text-xl font-bold text-warning">{lowStockCount}</p>
        </div>
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
                          <p className="text-[10px] text-muted-foreground">Sisa {item.stock} {item.unit || 'Unit'}</p>
                        </div>
                      </div>
                      <button onClick={() => navigate('/inventory')} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="py-10 text-center bg-success/5 rounded-2xl border border-dashed border-success/20 group hover:bg-success/10 transition-all">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <p className="text-xs font-bold text-success uppercase tracking-wider">Semua Stok Aman</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Belum ada barang di bawah batas minimum.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-primary" /> Performa Mekanik
                </p>
                <div className="space-y-2">
                  {mechanics.length > 0 ? mechanics.slice(0, 4).map((m, i) => {
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
                          <p className="text-[9px] text-muted-foreground">Rating {m.rating || '5.0'}</p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-10 text-center bg-secondary/10 rounded-2xl border border-dashed border-border/30">
                      <UserPlus className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-20" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Belum Ada Mekanik</p>
                      <button 
                        onClick={() => navigate('/mechanics')}
                        className="mt-3 text-[10px] font-black uppercase text-primary hover:underline"
                      >
                        Tambah Mekanik Baru
                      </button>
                    </div>
                  )}
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
              {activities.length > 0 ? activities.slice(0, 5).map((activity, i) => {
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
              }) : (
                <div className="py-20 text-center opacity-20">
                  <Activity className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs uppercase font-black tracking-widest">Belum Ada Aktivitas</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        {/* Workshop Health Stats */}
        <GlassCard className="lg:col-span-1 border-info/20 bg-info/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-info mb-4">Efisiensi Bengkel</p>
          <div className="space-y-4">
            <div className="flex items-end justify-between pb-4 border-b border-info/10">
              <div>
                <p className="text-2xl font-display font-bold text-info">{activeOrders}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Antrean Aktif</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <History className="w-5 h-5 text-info" />
              </div>
            </div>
            <div className="flex items-end justify-between pb-4 border-b border-info/10">
              <div>
                <p className="text-2xl font-display font-bold text-success">{completedToday}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Servis Selesai Hari Ini</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-display font-bold text-warning">{lowStockCount}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Stok Perlu Re-order</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-warning" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Recent Orders */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold tracking-tight">Pesanan Layanan Terbaru</p>
            <button onClick={() => navigate('/orders')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Semua Pesanan</button>
          </div>
          <div className="space-y-3">
            {serviceOrders.slice(0, 4).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 md:gap-4 py-3 px-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-transparent hover:border-border/30 group cursor-pointer"
                onClick={() => navigate('/orders')}
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
                  <p className="text-sm font-bold truncate transition-colors group-hover:text-primary">
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
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold tracking-tight">Kapasitas Kerja Mekanik</p>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Live load</span>
          </div>
          <div className="space-y-6">
            {mechanics.map((m, i) => {
              const activeJobs = serviceOrders.filter(o => o.mechanic.id === m.id && o.status === "in_progress").length;
              const loadPercentage = Math.min(100, (activeJobs / 3) * 100); // 3 jobs is full load
              return (
                <div key={m.id} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                        {m.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{m.name.split(' ')[0]}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{m.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        activeJobs >= 3 ? "text-destructive" : activeJobs > 0 ? "text-info" : "text-success"
                      )}>
                        {activeJobs >= 3 ? "Full Load" : activeJobs > 0 ? `${activeJobs} Job` : "Standby"}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${loadPercentage}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        activeJobs >= 3 ? "bg-destructive" : activeJobs > 0 ? "bg-info" : "bg-success"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 pt-6 border-t border-border/30">
            <button 
              onClick={() => navigate('/mechanics')}
              className="w-full py-2 rounded-xl bg-secondary/50 hover:bg-secondary text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Lihat Semua Mekanik
            </button>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
