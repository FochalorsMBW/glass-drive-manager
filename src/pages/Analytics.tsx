import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { inventory, serviceOrders, formatCurrency, mechanics, revenueData, monthlyRevenue } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const partUsage = [
  { name: "Synthetic Oil", count: 42 },
  { name: "Brake Pads", count: 28 },
  { name: "Oil Filters", count: 35 },
  { name: "Spark Plugs", count: 18 },
  { name: "Timing Belts", count: 12 },
];

const pieColors = ["hsl(220 70% 50%)", "hsl(152 60% 42%)", "hsl(38 92% 50%)", "hsl(205 80% 56%)", "hsl(280 60% 55%)"];

const AnalyticsPage = () => (
  <AppLayout>
    <div className="mb-8">
      <h1 className="text-4xl font-display tracking-tight">Analytics</h1>
      <p className="text-muted-foreground mt-1">Performance insights & revenue tracking</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
      <GlassCard>
        <p className="text-sm text-muted-foreground">Monthly Revenue</p>
        <p className="text-3xl font-display mt-1">
          <AnimatedNumber value={51.2} prefix="Rp " suffix="M" decimals={1} className="font-display" />
        </p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-muted-foreground">Vehicles This Month</p>
        <p className="text-3xl font-display mt-1"><AnimatedNumber value={127} className="font-display" /></p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-muted-foreground">Avg. Ticket Value</p>
        <p className="text-3xl font-display mt-1">
          <AnimatedNumber value={403} prefix="Rp " suffix="K" className="font-display" />
        </p>
      </GlassCard>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <GlassCard>
        <p className="text-sm text-muted-foreground mb-4">Monthly Revenue Trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyRevenue}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220 10% 46%)', fontSize: 12 }} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "hsl(0 0% 100% / 0.8)", backdropFilter: "blur(12px)", border: "1px solid hsl(0 0% 100% / 0.2)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
            <Bar dataKey="revenue" fill="hsl(220 70% 50%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard>
        <p className="text-sm text-muted-foreground mb-4">Most Used Parts</p>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={partUsage} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {partUsage.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {partUsage.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i] }} />
                <span className="text-muted-foreground">{p.name}</span>
                <span className="font-mono font-medium ml-auto">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>

    <GlassCard>
      <p className="text-sm text-muted-foreground mb-4">Mechanic Productivity</p>
      <div className="space-y-4">
        {mechanics.map(m => (
          <div key={m.id} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{m.avatar}</div>
            <span className="text-sm font-medium w-32">{m.name}</span>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(m.completedJobs / 900) * 100}%` }} />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-16 text-right">{m.completedJobs} jobs</span>
          </div>
        ))}
      </div>
    </GlassCard>
  </AppLayout>
);

export default AnalyticsPage;
