import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency, monthlyRevenue } from "@/lib/mock-data";
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
      <div className="mb-8">
        <h1 className="text-4xl font-display tracking-tight">Analitik</h1>
        <p className="text-muted-foreground mt-1">Wawasan performa & pelacakan pendapatan real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Total Pendapatan</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-3xl font-display">
              <AnimatedNumber value={totalRevenue / 1000000} prefix="Rp " suffix="jt" decimals={1} className="font-display" />
            </p>
            <span className="text-[10px] text-success font-bold">+15.4%</span>
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Total Pesanan</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-3xl font-display"><AnimatedNumber value={totalOrders} className="font-display" /></p>
            <span className="text-[10px] text-info font-bold">+8 aktif</span>
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Rata-rata Order</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-3xl font-display">
              <AnimatedNumber value={avgOrderValue / 1000} prefix="Rp " suffix="rb" className="font-display" />
            </p>
            <span className="text-[10px] text-muted-foreground">Statis</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <GlassCard>
          <p className="text-sm font-semibold mb-6">Tren Pendapatan Harian</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: "hsl(var(--secondary) / 0.8)", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--border) / 0.2)", borderRadius: 12, fontSize: 12 }} 
                formatter={(v: number) => [formatCurrency(v), "Pendapatan"]} 
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-semibold mb-6">Distribusi Jenis Layanan</p>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 aspect-square max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {distributionData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              {distributionData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="text-xs font-medium truncate flex-1">{d.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-semibold">Performa & Kontribusi Mekanik</p>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Revenue</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-secondary" /> Jobs</span>
          </div>
        </div>
        <div className="space-y-8">
          {mechanicData.map(m => (
            <div key={m.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{m.avatar}</div>
                  <div>
                    <p className="text-sm font-bold leading-none">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase">{m.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">{formatCurrency(m.revenue)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{m.jobCount} Pekerjaan</p>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                  className="h-full bg-primary transition-all duration-1000"
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
