import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Plus, Trash2, Calendar, Tag, Wallet, Receipt, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ExpensesPage = () => {
  const { expenses, addExpense, deleteExpense } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("Operasional");

  const categories = ["Operasional", "Gaji", "Sewa", "Listrik & Air", "Alat & Perlengkapan", "Lain-lain"];

  const handleAdd = () => {
    if (!description.trim()) { toast.error("Deskripsi harus diisi"); return; }
    if (amount <= 0) { toast.error("Nominal harus lebih dari 0"); return; }

    addExpense({
      id: Math.random().toString(36).substr(2, 9),
      category,
      amount,
      description,
      date: new Date().toISOString()
    });

    toast.success("Pengeluaran berhasil dicatat");
    setDescription("");
    setAmount(0);
    setIsAdding(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Pengeluaran</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola biaya operasional harian bengkel.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-snappy"
        >
          <Plus className="w-5 h-5" /> Catat Pengeluaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <GlassCard className="md:col-span-1">
          <div className="p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Pengeluaran</p>
            <p className="text-3xl font-display text-primary">{formatCurrency(totalExpenses)}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
              <Calendar className="w-3 h-3" /> Periode ini
            </div>
          </div>
        </GlassCard>

        <div className="md:col-span-3">
          <GlassCard className="h-full overflow-hidden">
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/20">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tanggal</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategori</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deskripsi</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Nominal</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {expenses.length > 0 ? (
                    expenses.map((e, i) => (
                      <motion.tr 
                        key={e.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-secondary/10 transition-colors group"
                      >
                        <td className="p-4 text-xs font-mono text-muted-foreground">
                          {new Date(e.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-secondary text-[10px] font-bold uppercase tracking-tighter">
                            {e.category}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium">{e.description}</td>
                        <td className="p-4 text-sm font-mono font-bold text-right">{formatCurrency(e.amount)}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteExpense(e.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground italic text-sm">
                        Belum ada catatan pengeluaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border/30 bg-primary/5 flex items-center justify-between">
                <h2 className="text-xl font-display">Catat Pengeluaran</h2>
                <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1 block">Kategori</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1 block">Deskripsi</label>
                  <input 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Contoh: Bayar listrik Januari"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1 block">Nominal (Rp)</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono font-bold"
                  />
                </div>
                <button 
                  onClick={handleAdd}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4"
                >
                  Simpan Catatan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default ExpensesPage;
