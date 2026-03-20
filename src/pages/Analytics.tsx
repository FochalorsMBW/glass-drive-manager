import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { TrendingUp, Wrench, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
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
  const { inventory, serviceOrders, mechanics, transactions, expenses, settings } = useAppStore();
  const [timeRange, setTimeRange] = useState("30");

  const {
    totalRevenue, grossProfit, netProfit, totalCOGS, totalOpExpenses, totalCommissions,
    trendData, sourceData, topMovingParts, mechanicLeaderboard, maxMechRevenue,
    filteredOrders, filteredTransactions
  } = React.useMemo(() => {
    const getDaysAgo = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    };

    const rangeInDays = parseInt(timeRange);
    const startDate = getDaysAgo(rangeInDays);

    // --- Filtering Engine ---
    const fOrders = serviceOrders.filter(o => new Date(o.createdAt) >= startDate && o.status === 'paid');
    const fTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    const fExpenses = expenses.filter(e => new Date(e.date) >= startDate);

    // --- KPI Aggregators ---
    const revenueFromOrders = fOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueFromSales = fTransactions.reduce((sum, t) => sum + t.total, 0);
    const rev = revenueFromOrders + revenueFromSales;

    // COGS Calculation
    const calculateCOGS = (items: any[]) => items.reduce((sum, item) => {
      const inv = inventory.find(i => i.name === item.name);
      return sum + ((inv?.costPrice || (item.price * 0.7)) * item.qty);
    }, 0);

    const orderCOGS = fOrders.reduce((sum, o) => sum + calculateCOGS(o.items || []), 0);
    const salesCOGS = fTransactions.reduce((sum, t) => sum + calculateCOGS(t.items || []), 0);
    const cogs = orderCOGS + salesCOGS;

    // Commissions
    const commRate = settings.commissionRate || 20;
    const commissions = fOrders.reduce((sum, o) => sum + (o.laborCost * commRate) / 100, 0);

    // Operating Expenses
    const opExpenses = fExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Totals
    const gProfit = rev - cogs;
    const nProfit = gProfit - commissions - opExpenses;

    // --- Chart: Weekly/Monthly Evolution ---
    const getHistoricalPoints = (days: number) => {
      const points = [];
      const step = days <= 7 ? 1 : days <= 30 ? 3 : 7;
      
      for (let i = days; i >= 0; i -= step) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

        const dayOrders = serviceOrders.filter(o => o.createdAt.startsWith(dateStr) && o.status === 'paid');
        const daySales = transactions.filter(t => t.date.startsWith(dateStr));
        const dayRev = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0) + daySales.reduce((sum, t) => sum + t.total, 0);
        
        points.push({ date: label, revenue: dayRev });
      }
      return points;
    };

    const trend = getHistoricalPoints(rangeInDays);

    // --- Chart: Source Breakdown ---
    const totalLaborRevenue = fOrders.reduce((sum, o) => sum + o.laborCost, 0) + 
                             fTransactions.reduce((sum, t) => sum + (t.laborCost || 0), 0);
    
    const source = [
      { name: "Jasa Servis", value: totalLaborRevenue },
      { name: "Suku Cadang", value: Math.max(0, rev - totalLaborRevenue) }
    ];

    // --- Chart: Top Moving Parts ---
    const itemUsage: Record<string, number> = {};
    [...fOrders, ...fTransactions].forEach(record => {
      record.items?.forEach(item => {
        itemUsage[item.name] = (itemUsage[item.name] || 0) + item.qty;
      });
    });

    const topParts = Object.entries(itemUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // --- Mechanic Leaderboard ---
    const leaderboard = mechanics.map(m => {
      const mOrders = fOrders.filter(o => o.mechanic.id === m.id);
      const mRevenue = mOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return { ...m, revenue: mRevenue, jobs: mOrders.length };
    }).sort((a, b) => b.revenue - a.revenue);

    const maxRevenue = Math.max(...leaderboard.map(m => m.revenue), 1);

    return {
      totalRevenue: rev,
      grossProfit: gProfit,
      netProfit: nProfit,
      totalCOGS: cogs,
      totalOpExpenses: opExpenses,
      totalCommissions: commissions,
      trendData: trend,
      sourceData: source,
      topMovingParts: topParts,
      mechanicLeaderboard: leaderboard,
      maxMechRevenue: maxRevenue,
      filteredOrders: fOrders,
      filteredTransactions: fTransactions
    };
  }, [inventory, serviceOrders, mechanics, transactions, expenses, settings, timeRange]);


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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard className="relative overflow-hidden group border-primary/20 bg-primary/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Total Omzet</p>
          <p className="text-2xl font-display mt-2">{formatCurrency(totalRevenue)}</p>
          <div className="mt-4 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full" />
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Laba Kotor</p>
          <p className="text-2xl font-display mt-2">{formatCurrency(grossProfit)}</p>
          <div className="mt-4 h-1 w-full bg-success/10 rounded-full overflow-hidden">
            <div className="h-full bg-success" style={{ width: `${(grossProfit / totalRevenue) * 100}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Laba Bersih</p>
          <p className="text-2xl font-display mt-2 text-success">{formatCurrency(netProfit)}</p>
          <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase">Margin {( (netProfit/totalRevenue || 0) * 100).toFixed(1)}%</p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Biaya (COGS+Op)</p>
          <p className="text-2xl font-display mt-2 text-destructive">{formatCurrency(totalCOGS + totalOpExpenses + totalCommissions)}</p>
          <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase">{filteredOrders.length + filteredTransactions.length} Transaksi</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Revenue Timeline</p>
              <h3 className="text-xl font-display font-bold">Evolusi Pendapatan</h3>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-secondary/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Flow</span>
            </div>
          </div>
          <div className="-ml-4 -mr-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: "hsl(var(--secondary) / 0.8)", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--border) / 0.2)", borderRadius: 16, fontSize: 12, fontWeight: 'bold' }} 
                  formatter={(v: number) => [formatCurrency(v), "Pendapatan"]} 
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Market Share</p>
          <h3 className="text-xl font-display font-bold mb-8">Sumber Pendapatan Utama</h3>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2 aspect-square max-w-[200px] relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xl font-display leading-none">{((sourceData[0].value / totalRevenue || 0) * 100).toFixed(0)}%</p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Service</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8}>
                    {sourceData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} className="outline-none stroke-background stroke-[4px]" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {sourceData.map((d, i) => (
                <div key={d.name} className="flex flex-col gap-1 group">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                      <span className="truncate max-w-[120px] uppercase tracking-wider">{d.name}</span>
                    </div>
                    <span className="font-mono text-primary">{formatCurrency(d.value)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary/40 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.value / totalRevenue) * 100}%` }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <GlassCard className="lg:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Inventory Insights</p>
          <h3 className="text-xl font-display font-bold mb-6">Suku Cadang Terlaris</h3>
          <div className="space-y-4">
            {topMovingParts.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/10 group hover:bg-secondary/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">{item.value} Units Keluar</p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {topMovingParts.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground italic">
                Belum ada data suku cadang digunakan
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Mekanik Leaderboard</p>
              <h3 className="text-xl font-display font-bold">Produktivitas Mekanik</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative">
            {mechanicLeaderboard.map(m => (
              <div key={m.id} className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-base font-bold text-primary shadow-sm border border-primary/10 group-hover:scale-105 transition-transform">
                      {m.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none tracking-tight">{m.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-1.5 font-bold uppercase tracking-widest">{m.jobs} Jobs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-black text-primary">{formatCurrency(m.revenue)}</p>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary/30 overflow-hidden border border-border/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.revenue / maxMechRevenue) * 100}%` }}
                    className="h-full rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
