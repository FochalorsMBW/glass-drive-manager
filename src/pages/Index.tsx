import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { revenueData, serviceOrders, mechanics, inventory, formatCurrency } from "@/lib/mock-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrendingUp, Wrench, Car, AlertTriangle, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  queued: "bg-warning/15 text-warning",
  in_progress: "bg-info/15 text-info",
  completed: "bg-success/15 text-success",
  paid: "bg-muted text-muted-foreground",
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

const Index = () => {
  const todayRevenue = revenueData[revenueData.length - 2].revenue;
  const activeOrders = serviceOrders.filter(o => o.status === "in_progress" || o.status === "queued").length;
  const lowStockCount = inventory.filter(i => i.stock <= i.minThreshold).length;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display tracking-tight">Good morning</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at Velocity HQ today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Today's Revenue" value={todayRevenue / 1000} prefix="Rp " icon={TrendingUp} change="+12.3% from yesterday" />
        <KpiCard label="Active Orders" value={activeOrders} icon={Wrench} change="2 queued" />
        <KpiCard label="Vehicles Serviced" value={14} icon={Car} change="+3 today" />
        <KpiCard label="Low Stock Alerts" value={lowStockCount} icon={AlertTriangle} change="Needs attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Revenue</p>
              <p className="text-2xl font-display">
                <AnimatedNumber value={23590000 / 1000000} prefix="Rp " suffix="M" decimals={1} className="font-display" />
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(220 70% 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(220 70% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs" tick={{ fill: 'hsl(220 10% 46%)' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(0 0% 100% / 0.8)", backdropFilter: "blur(12px)", border: "1px solid hsl(0 0% 100% / 0.2)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(220 70% 50%)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Active Bays */}
        <GlassCard>
          <p className="text-sm text-muted-foreground mb-4">Mechanic Bays</p>
          <div className="space-y-4">
            {mechanics.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.specialization}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.activeJobs > 0 ? "bg-info/15 text-info" : "bg-success/15 text-success"}`}>
                  {m.activeJobs > 0 ? `${m.activeJobs} active` : "Available"}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Orders */}
      <GlassCard className="mt-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">Recent Service Orders</p>
        </div>
        <div className="space-y-3">
          {serviceOrders.slice(0, 4).map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 py-4 px-4 rounded-glass-inner bg-secondary/30 hover:bg-secondary/50 transition-snappy"
            >
              <div className="w-10 h-10 rounded-glass-inner bg-accent flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{order.id}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {order.vehicle.plateNumber} · {order.vehicle.make} {order.vehicle.model} · {order.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono font-medium">{formatCurrency(order.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">{order.mechanic.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </AppLayout>
  );
};

export default Index;
