import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, ArrowUpRight, ArrowDownRight, Package, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const FinancePage = () => {
  const { serviceOrders, inventory, expenses, settings, transactions } = useAppStore();

  const completedOrders = serviceOrders.filter(o => o.status === 'completed' || o.status === 'paid');
  
  // 1. Total Revenue (Service Orders + POS Direct Sales)
  const serviceRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  // POS transactions that are NOT linked to a service order (standalone retail)
  const posRevenue = transactions.filter(t => !t.linkedOrderId).reduce((sum, t) => sum + t.total, 0);
  const totalRevenue = serviceRevenue + posRevenue;

  // 2. Cost of Goods Sold (COGS)
  const totalCOGS = completedOrders.reduce((sum, o) => {
    const itemsCost = (o.items || []).reduce((itemSum, orderItem) => {
      const invItem = inventory.find(i => i.name === orderItem.name);
      const cost = invItem ? (invItem.costPrice || 0) : ((orderItem.price || 0) * 0.7); 
      return itemSum + (cost * (orderItem.qty || 0));
    }, 0);
    return sum + itemsCost;
  }, 0);

  // 3. Commissions
  const commissionRate = settings.commissionRate || 20;
  const { payouts } = useAppStore();
  
  const totalCommissions = completedOrders.reduce((sum, o) => sum + (o.laborCost * commissionRate) / 100, 0);
  const paidCommissions = payouts.reduce((sum, p) => sum + p.amount, 0);
  const outstandingCommissions = totalCommissions - paidCommissions;

  // 4. Operational Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 5. Net Profit
  const totalOutflow = totalCOGS + totalCommissions + totalExpenses;
  const netProfit = totalRevenue - totalOutflow;

  const data = [
    { name: 'Modal Barang (COGS)', value: totalCOGS, color: '#94a3b8' },
    { name: 'Komisi Terbayar', value: paidCommissions, color: '#f59e0b' },
    { name: 'Hutang Komisi', value: outstandingCommissions, color: '#ea580c' },
    { name: 'Pengeluaran Ops', value: totalExpenses, color: '#ef4444' },
    { name: 'Laba Bersih', value: Math.max(0, netProfit), color: '#10b981' },
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display tracking-tight">Laporan Keuangan</h1>
        <p className="text-muted-foreground mt-1">Analisis mendalam laba rugi dan kesehatan finansial Bengkel UB.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Omzet</p>
            <p className="text-2xl font-display">{formatCurrency(totalRevenue)}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> 8.4%
              </span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Laba Bersih (Net Profit)</p>
            <p className="text-2xl font-display text-success">{formatCurrency(netProfit)}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-destructive flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full">
                <ArrowDownRight className="w-3 h-3" /> 2.1%
              </span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Biaya & Beban</p>
            <p className="text-2xl font-display text-destructive">{formatCurrency(totalCOGS + totalCommissions + totalExpenses)}</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="p-6 h-full">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> Alokasi Pendapatan
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReChartsPie>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </ReChartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Rincian Laba Rugi
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-secondary/20 border border-border/10">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border/10">
                  <span className="text-sm font-medium">Total Omzet</span>
                  <span className="font-mono font-bold text-lg">{formatCurrency(totalRevenue)}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Package className="w-3 h-3" /> HPP Barang</span>
                    <span className="font-mono text-destructive">-{formatCurrency(Math.abs(totalCOGS))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground p-2 rounded-lg bg-warning/5 border border-warning/10">
                    <span className="flex items-center gap-2 text-warning font-bold"><Wrench className="w-3 h-3" /> Hutang Komisi</span>
                    <span className="font-mono text-warning font-bold">{formatCurrency(outstandingCommissions)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><ArrowDownRight className="w-3 h-3 text-destructive" /> Biaya Operasional</span>
                    <span className="font-mono text-destructive">-{formatCurrency(Math.abs(totalExpenses))}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-primary/30 flex justify-between items-center text-success">
                  <span className="font-bold">Laba Bersih Akhir</span>
                  <span className="font-mono font-bold text-2xl">{formatCurrency(netProfit)}</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-info/5 border border-info/20">
                <p className="text-xs text-info leading-relaxed">
                  <strong>Analisis Pro:</strong> Margin laba bersih Anda saat ini adalah <strong>{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%</strong>. Standar industri bengkel biasanya berkisar antara 10-20%.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default FinancePage;
