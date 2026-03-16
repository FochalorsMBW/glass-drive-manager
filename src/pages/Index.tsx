import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrendingUp, Wrench, Car, AlertTriangle, ArrowUpRight, Plus, ShoppingCart, History, UserPlus } from "lucide-react";
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
  const { revenueData, serviceOrders, mechanics, inventory, activities } = useAppStore();
  const navigate = useNavigate();
  
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'short' });
  const dayLabel = today.charAt(0).toUpperCase() + today.slice(1);
  const todayRevenue = revenueData.find(d => d.date === dayLabel)?.revenue || 0;

  const activeOrders = serviceOrders.filter(o => o.status === "in_progress" || o.status === "queued").length;
  const completedToday = serviceOrders.filter(o => (o.status === "completed" || o.status === "paid") && o.createdAt.startsWith(new Date().toISOString().split('T')[0])).length;
  const lowStockCount = inventory.filter(i => i.stock <= i.minThreshold).length;

  const weeklyRevenueTotal = revenueData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Selamat pagi</h1>
          <p className="text-muted-foreground mt-1">Inilah yang terjadi di Bengkel UB hari ini.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/service-orders')}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Pendapatan Hari Ini" value={todayRevenue} prefix="Rp " icon={TrendingUp} change="+12.3% dari kemarin" />
        <KpiCard label="Pesanan Aktif" value={activeOrders} icon={Wrench} change={`${serviceOrders.filter(o => o.status === "queued").length} dalam antrean`} />
        <KpiCard label="Kendaraan Diservis" value={completedToday || 14} icon={Car} change="+3 hari ini" />
        <KpiCard label="Stok Menipis" value={lowStockCount} icon={AlertTriangle} change="Butuh perhatian" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Pendapatan Mingguan</p>
              <p className="text-2xl font-display">
                <AnimatedNumber value={weeklyRevenueTotal / 1000000} prefix="Rp " suffix="jt" decimals={1} className="font-display" />
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-[10px]" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(var(--secondary) / 0.8)", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--border) / 0.2)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), "Pendapatan"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Activity Log */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <History className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Aktivitas Terbaru</p>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {activities.slice(0, 5).map((activity, i) => {
                const config = activityIcons[activity.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3"
                  >
                    <div className={cn("w-8 h-8 shrink-0 rounded-lg flex items-center justify-center", config.bg)}>
                      <Icon className={cn("w-4 h-4", config.color)} />
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-tight">{activity.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
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
            <p className="text-sm font-semibold tracking-tight">Pesanan Layanan Terbaru</p>
          </div>
          <div className="space-y-3">
            {serviceOrders.slice(0, 3).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 py-3 px-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-snappy border border-transparent hover:border-border/30"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold font-mono text-primary">{order.id}</p>
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", statusColors[order.status])}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {order.vehicle.plateNumber} · {order.vehicle.make} {order.vehicle.model}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-bold">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">{order.mechanic.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Mechanic Load */}
        <GlassCard>
          <p className="text-sm font-semibold mb-4">Area Kerja Mekanik</p>
          <div className="space-y-4">
            {mechanics.map((m, i) => {
              const activeJobs = serviceOrders.filter(o => o.mechanic.id === m.id && o.status === "in_progress").length;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{m.specialization}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    activeJobs > 0 ? "bg-info/10 text-info" : "bg-success/10 text-success"
                  )}>
                    {activeJobs > 0 ? `${activeJobs} aktif` : "Free"}
                  </span>
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
