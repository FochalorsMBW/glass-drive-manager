import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { useState } from "react";
import { TrendingUp, Wrench, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const pieColors = [
  "hsl(var(--primary))", 
  "hsl(var(--secondary))", 
  "hsl(var(--accent))", 
  "hsl(var(--muted))", 
  "hsl(var(--info))"
];

const AnalyticsPage = () => {
  const { inventory, serviceOrders, mechanics, revenueData } = useAppStore();
  const [timeRange, setTimeRange] = useState("30");

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = serviceOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Calculate service distribution
  const distributionMap = serviceOrders.reduce((acc, order) => {
    const type = order.description.length > 20 ? "Lainnya" : order.description;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distributionData = Object.entries(distributionMap).map(([name, value]) => ({ name, value })).slice(0, 5);

  // Calculate mechanic performance
  const mechanicData = mechanics.map(m => {
    const jobs = serviceOrders.filter(o => o.mechanic.id === m.id);
    const revenue = jobs.reduce((sum, o) => sum + o.totalAmount, 0);
    return { ...m, jobCount: jobs.length, revenue };
  });

  const maxRevenue = Math.max(...mechanicData.map(m => m.revenue), 1);

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display tracking-tight text-foreground">Analitik</h1>
          <p className="text-muted-foreground mt-1">Wawasan performa & pelacakan pendapatan real-time</p>
        </div>
        
        <div className="flex items-center p-1 bg-secondary/50 rounded-2xl border border-border/30 backdrop-blur-md">
          {["7", "30", "90"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                timeRange === range 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Last {range} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-5">
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Total Pendapatan</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl md:text-3xl font-display leading-none">
              <AnimatedNumber value={totalRevenue / 1000000} prefix="Rp " suffix="jt" decimals={1} className="font-display" />
            </p>
            <span className="text-[10px] text-success font-black uppercase tracking-widest">+15%</span>
          </div>
        </GlassCard>
        
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wrench className="w-12 h-12" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Pesanan</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl md:text-3xl font-display leading-none"><AnimatedNumber value={totalOrders} className="font-display" /></p>
            <span className="text-[10px] text-info font-black uppercase tracking-widest">Global</span>
          </div>
        </GlassCard>

        <GlassCard className="lg:block hidden relative overflow-hidden group col-span-2 md:col-span-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Rata-rata Tiket</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl md:text-3xl font-display leading-none">
              <AnimatedNumber value={avgOrderValue / 1000} prefix="Rp " suffix="rb" className="font-display" />
            </p>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Normal</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm font-bold tracking-tight">Evolusi Pendapatan</p>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-secondary/30">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue Flow</span>
            </div>
          </div>
          <div className="-ml-4 -mr-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: "hsl(var(--secondary) / 0.8)", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--border) / 0.2)", borderRadius: 16, fontSize: 12, fontWeight: 'bold' }} 
                  formatter={(v: number) => [formatCurrency(v), "Pendapatan"]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 3, r: 6 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-bold tracking-tight mb-8">Segmentasi Layanan Utama</p>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2 aspect-square max-w-[200px] relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-display leading-none">{totalOrders}</p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} minAngle={15}>
                    {distributionData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} className="outline-none stroke-background stroke-[4px]" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {distributionData.map((d, i) => (
                <div key={d.name} className="flex flex-col gap-1 group">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                      <span className="truncate max-w-[120px] uppercase tracking-wider">{d.name}</span>
                    </div>
                    <span className="font-mono text-primary">{Math.round((d.value / totalOrders) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary/40 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.value / totalOrders) * 100}%` }}
                      className="h-full rounded-full transition-all duration-700"
                      style={{ background: pieColors[i % pieColors.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-10 relative">
          <div>
            <p className="text-sm font-bold tracking-tight">Kinerja & Produktivitas Mekanik</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Kontribusi Pendapatan Langsung</p>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Net Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary shadow-sm" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Free Capacity</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative">
          {mechanicData.map(m => (
            <div key={m.id} className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary group-hover:scale-110 transition-transform shadow-sm border border-primary/10">
                    {m.avatar}
                  </div>
                  <div>
                    <p className="text-base font-bold leading-none tracking-tight group-hover:text-primary transition-colors">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-black uppercase tracking-widest">{m.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-black text-primary">{formatCurrency(m.revenue)}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-1 text-[10px] font-bold text-muted-foreground">
                    <Wrench className="w-3 h-3" />
                    <span className="uppercase tracking-tighter">{m.jobCount} Jobs Selesai</span>
                  </div>
                </div>
              </div>
              <div className="h-3 w-full rounded-2xl bg-secondary/30 overflow-hidden p-0.5 border border-border/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                  className="h-full rounded-2xl bg-gradient-to-r from-primary/80 to-primary shadow-lg"
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppLayout>
  );
};

export default AnalyticsPage;
