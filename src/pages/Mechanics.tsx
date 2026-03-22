import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Star, Wrench, History, Wallet, CheckCircle2, X } from "lucide-react";
import { formatCurrency, type Mechanic, type ServiceOrder, type Payout } from "@/lib/mock-data";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

const MechanicHistoryModal = ({ 
  mechanic, 
  orders, 
  payouts,
  open, 
  onClose,
  onPayout 
}: { 
  mechanic: Mechanic; 
  orders: ServiceOrder[]; 
  payouts: Payout[];
  open: boolean; 
  onClose: () => void;
  onPayout: (amount: number, orderIds: string[]) => void;
}) => {
  const { settings } = useAppStore();
  if (!open) return null;

  const commissionRate = settings.commissionRate || 20;

  // Filter orders where commission hasn't been paid out
  // We determine this by checking if the orderId is NOT in any payout log
  const paidOrderIds = new Set(payouts.flatMap(p => p.orderIds));
  const pendingOrders = orders.filter(o => (o.status === 'completed' || o.status === 'paid') && !paidOrderIds.has(o.id));
  const completedHistory = orders.filter(o => paidOrderIds.has(o.id));

  const totalOwed = pendingOrders.reduce((sum, o) => sum + (o.laborCost * commissionRate) / 100, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/30 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
              {mechanic.avatar}
            </div>
            <div>
              <h2 className="text-xl font-display">Riwayat {mechanic.name}</h2>
              <p className="text-xs text-muted-foreground">{mechanic.specialization}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Pekerjaan Belum Dibayar</h3>
            {pendingOrders.length > 0 ? (
              <div className="space-y-2">
                {pendingOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/10 text-sm">
                    <div>
                      <p className="font-mono font-bold text-xs">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.vehicle.plateNumber} · {o.description.slice(0, 30)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-primary">{formatCurrency((o.laborCost * commissionRate) / 100)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Komisi {commissionRate}%</p>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Hutang Komisi</p>
                    <p className="text-2xl font-mono font-bold text-primary">{formatCurrency(totalOwed)}</p>
                  </div>
                  <button 
                    onClick={() => onPayout(totalOwed, pendingOrders.map(o => o.id))}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-snappy"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground py-4 text-center">Semua komisi sudah terbayar.</p>
            )}
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Riwayat Terbayar</h3>
            <div className="space-y-2 opacity-60">
              {completedHistory.length > 0 ? (
                completedHistory.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border border-border/10 text-sm grayscale">
                    <div>
                      <p className="font-mono font-medium text-xs">{o.id}</p>
                      <p className="text-[10px] text-muted-foreground italic">Komisi terbayar</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-muted-foreground">{formatCurrency((o.laborCost * commissionRate) / 100)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm italic text-muted-foreground py-4 text-center">Belum ada riwayat pembayaran.</p>
              )}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

const MechanicFormModal = ({
  open,
  onClose,
  mechanic,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  mechanic?: Mechanic;
  onSave: (data: Partial<Mechanic>) => void;
}) => {
  const [name, setName] = useState(mechanic?.name || "");
  const [specialization, setSpecialization] = useState(mechanic?.specialization || "Mesin");
  const [avatar, setAvatar] = useState(mechanic?.avatar || "");

  if (!open) return null;

  const specializations = ["Mesin", "Rem & Suspensi", "Kelistrikan", "Transmisi", "Body & Paint", "AC", "Accessories"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialization) {
      toast.error("Nama dan spesialisasi harus diisi");
      return;
    }
    
    onSave({
      name,
      specialization,
      avatar: avatar || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/30 flex items-center justify-between">
          <h2 className="text-xl font-display">{mechanic ? "Edit Mekanik" : "Tambah Mekanik Baru"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Nama Lengkap</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Contoh: Alex Wibowo"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Spesialisasi</label>
            <select 
              value={specialization} 
              onChange={e => setSpecialization(e.target.value)}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Initials/Avatar (Opsional)</label>
            <input 
              value={avatar} 
              onChange={e => setAvatar(e.target.value)}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Contoh: AW"
              maxLength={2}
            />
          </div>
          <button className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all mt-4">
            {mechanic ? "Simpan Perubahan" : "Simpan Mekanik"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// F3: Mechanic Efficiency Leaderboard calculation
function MechanicLeaderboard({ mechanics, orders }: { mechanics: Mechanic[], orders: ServiceOrder[] }) {
  const stats = mechanics.map(m => {
    const mOrders = orders.filter(o => o.mechanic.id === m.id && (o.status === 'completed' || o.status === 'paid') && o.startedAt && o.completedAt);
    if (mOrders.length === 0) return { ...m, avgTimeMs: Infinity, jobsCount: 0 };
    
    let totalMs = 0;
    mOrders.forEach(o => {
      totalMs += (new Date(o.completedAt!).getTime() - new Date(o.startedAt!).getTime());
    });
    
    return { ...m, avgTimeMs: totalMs / mOrders.length, jobsCount: mOrders.length };
  }).filter(m => m.jobsCount > 0).sort((a, b) => a.avgTimeMs - b.avgTimeMs);

  if (stats.length === 0) return null;

  return (
    <GlassCard className="mb-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display flex items-center gap-2">
            <span className="text-2xl">⚡</span> Leaderboard Efisiensi SLA
          </h2>
          <p className="text-xs text-muted-foreground mt-1 tracking-tight">Rata-rata kecepatan penyelesaian servis mekanik berdasarkan waktu asli.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.slice(0, 3).map((stat, idx) => {
          const mins = Math.floor(stat.avgTimeMs / 60000);
          const secs = Math.floor((stat.avgTimeMs % 60000) / 1000);
          const hrs = Math.floor(mins / 60);
          const remMins = mins % 60;
          const timeStr = hrs > 0 ? `${hrs}j ${remMins}m ${secs}s` : `${mins}m ${secs}s`;
          
          return (
            <div key={stat.id} className={cn(
              "p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-all hover:scale-[1.02]",
              idx === 0 ? "bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" :
              idx === 1 ? "bg-slate-300/10 border border-slate-400/30" :
              "bg-amber-700/10 border border-amber-700/30"
            )}>
              {idx === 0 && <div className="absolute -right-4 -top-4 text-7xl opacity-10">👑</div>}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-black text-xl z-10",
                idx === 0 ? "bg-amber-500 text-amber-50" :
                idx === 1 ? "bg-slate-300 text-slate-800" :
                "bg-amber-700 text-amber-50"
              )}>
                #{idx + 1}
              </div>
              <div className="z-10 flex-1">
                <p className="font-bold text-sm tracking-tight line-clamp-1">{stat.name}</p>
                <div className="flex flex-col mt-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{stat.jobsCount} Pekerjaan</span>
                  <span className="font-mono text-sm font-black text-primary mt-1">{timeStr} <span className="text-[10px] text-muted-foreground font-sans font-medium">/ order</span></span>
                </div>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-3xl opacity-20">
                {stat.avatar}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const MechanicsPage = () => {
  const { mechanics, serviceOrders, settings, payouts, processPayout, addMechanic, updateMechanic, deleteMechanic } = useAppStore();
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);

  const [deletingMechanic, setDeletingMechanic] = useState<Mechanic | null>(null);

  const commissionRate = settings.commissionRate || 20;

  const handlePayout = (mechanicId: string, amount: number, orderIds: string[]) => {
    if (amount <= 0) return;
    
    processPayout({
      id: `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      mechanicId,
      amount,
      orderIds,
      date: new Date().toISOString()
    });
    
    toast.success(`Berhasil membayar komisi ${formatCurrency(amount)}`);
    setSelectedMechanic(null);
  };

  const handleCreateMechanic = (data: Partial<Mechanic>) => {
    const newMechanic: Mechanic = {
      id: `m${Date.now()}`,
      name: data.name!,
      specialization: data.specialization!,
      avatar: data.avatar!,
      activeJobs: 0,
      completedJobs: 0,
      rating: 5.0,
      totalCommissionPaid: 0,
    };
    addMechanic(newMechanic);
    toast.success(`${newMechanic.name} berhasil ditambahkan`);
  };

  const handleUpdateMechanic = (data: Partial<Mechanic>) => {
    if (!editingMechanic) return;
    updateMechanic({
      ...editingMechanic,
      ...data
    });
    toast.success("Profil mekanik diperbarui");
    setEditingMechanic(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingMechanic) {
      deleteMechanic(deletingMechanic.id);
      toast.success(`${deletingMechanic.name} telah dihapus`);
      setDeletingMechanic(null);
    }
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Mekanik</h1>
          <p className="text-muted-foreground mt-1">Pantau performa dan manajemen komisi tim bengkel.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Tambah Mekanik
        </button>
      </div>

      {mechanics.length > 0 && <MechanicLeaderboard mechanics={mechanics} orders={serviceOrders} />}

      {mechanics.length === 0 ? (
        <GlassCard className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
            <Wrench className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-xl font-display mb-2">Belum ada mekanik terdaftar</h3>
          <p className="text-muted-foreground max-w-xs mb-8 text-sm">Tambahkan mekanik pertama Anda untuk mulai mengelola pesanan layanan dan komisi.</p>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
          >
            Daftarkan Mekanik Sekarang
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mechanics.map((m, i) => {
          const mechanicOrders = serviceOrders.filter(o => o.mechanic.id === m.id);
          const activeJobsCount = mechanicOrders.filter(o => o.status === "in_progress").length;
          
          const mechanicPayouts = payouts.filter(p => p.mechanicId === m.id);
          const totalPaidOut = mechanicPayouts.reduce((sum, p) => sum + p.amount, 0);
          
          const paidOrderIds = new Set(mechanicPayouts.flatMap(p => p.orderIds));
          const totalOwed = mechanicOrders
            .filter(o => (o.status === "completed" || o.status === "paid") && !paidOrderIds.has(o.id))
            .reduce((sum, o) => sum + (o.laborCost * commissionRate) / 100, 0);

          const potentialCommission = mechanicOrders
            .filter(o => o.status === "in_progress")
            .reduce((sum, o) => sum + (o.laborCost * commissionRate) / 100, 0);
          
          return (
            <GlassCard key={m.id}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shadow-inner">
                    {m.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <h3 className="text-xl font-display leading-none">{m.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5 focus:outline-none">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 rounded bg-primary/5 border border-primary/10">{m.specialization}</p>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border shadow-sm",
                              activeJobsCount > 0 ? "bg-info/5 text-info border-info/10" : "bg-success/5 text-success border-success/10"
                            )}>
                              {activeJobsCount > 0 ? "Sibuk" : "Tersedia"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setEditingMechanic(m)}
                          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-all"
                          title="Edit Profile"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingMechanic(m)}
                          className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                          title="Hapus Mekanik"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/10 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedMechanic(m)}>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Wallet className="w-3 h-3 text-warning" /> Hutang Komisi
                        </p>
                        <p className="text-xl font-mono font-bold text-primary">{formatCurrency(totalOwed)}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/10 border border-border/10 grayscale opacity-70">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Total Terbayar
                        </p>
                        <p className="text-xl font-mono font-bold">{formatCurrency(totalPaidOut)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border/20">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">Potensi Aktif</p>
                        <p className="text-sm font-mono font-bold text-muted-foreground">{formatCurrency(potentialCommission)}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warning/10 border border-warning/20">
                          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                          <p className="text-sm font-bold text-warning">{m.rating}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedMechanic(m)}
                          className="p-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
                          title="Lihat Detail & Riwayat"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </GlassCard>
          );
        })}
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <MechanicFormModal 
            open={isAdding} 
            onClose={() => setIsAdding(false)} 
            onSave={handleCreateMechanic}
          />
        )}
        {editingMechanic && (
          <MechanicFormModal 
            open={!!editingMechanic} 
            onClose={() => setEditingMechanic(null)} 
            mechanic={editingMechanic}
            onSave={handleUpdateMechanic}
          />
        )}
        {selectedMechanic && (
          <MechanicHistoryModal 
            mechanic={selectedMechanic}
            orders={serviceOrders.filter(o => o.mechanic.id === selectedMechanic.id)}
            payouts={payouts.filter(p => p.mechanicId === selectedMechanic.id)}
            open={!!selectedMechanic}
            onClose={() => setSelectedMechanic(null)}
            onPayout={(amt, ids) => handlePayout(selectedMechanic.id, amt, ids)}
          />
        )}
        {deletingMechanic && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4" onClick={() => setDeletingMechanic(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-display mb-2">Hapus Mekanik?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Apakah Anda yakin ingin menghapus <span className="font-bold text-foreground">{deletingMechanic.name}</span>? 
                  Semua riwayat performa akan dihapus permanen.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeletingMechanic(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 font-bold transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold shadow-lg shadow-destructive/20 hover:opacity-90 transition-all"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default MechanicsPage;
