import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { Package, AlertTriangle, Plus, X, History, ArrowDown, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RestockModal = ({ open, onClose, item }: { open: boolean; onClose: () => void; item: any }) => {
  const { updateInventoryStock } = useAppStore();
  const [amount, setAmount] = useState(1);

  const handleSubmit = () => {
    updateInventoryStock(item.id, amount);
    toast.success(`Stok ${item.name} berhasil ditambah ${amount} unit`);
    onClose();
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-display mb-2">Restock Suku Cadang</h2>
        <p className="text-sm text-muted-foreground mb-6">{item.name}</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Jumlah Tambahan</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 text-center py-2 bg-secondary/50 border border-border/50 rounded-lg font-mono"
              />
              <button 
                onClick={() => setAmount(amount + 1)}
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-snappy">
            Batal
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy">
            Konfirmasi
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AddPartModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { addInventoryItem } = useAppStore();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);
  const [minThreshold, setMinThreshold] = useState(5);
  const [price, setPrice] = useState(0);
  const [supplier, setSupplier] = useState("");

  const handleSubmit = () => {
    if (!name || !sku || !category || !supplier || price <= 0) {
      toast.error("Mohon lengkapi semua field");
      return;
    }
    addInventoryItem({
      id: `i${Date.now()}`,
      sku,
      name,
      category,
      stock,
      minThreshold,
      price,
      supplier,
    });
    toast.success(`${name} berhasil ditambahkan ke inventaris`);
    setName(""); setSku(""); setCategory(""); setStock(0); setMinThreshold(5); setPrice(0); setSupplier("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display">Tambah Suku Cadang</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm text-muted-foreground mb-1.5 block">Nama Suku Cadang</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Oli Sintetis 5W-30"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">SKU</label>
            <input value={sku} onChange={e => setSku(e.target.value)} placeholder="OIL-5W30-SYN"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Kategori</label>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Cairan"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Stok Awal</label>
            <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Batas Minimum</label>
            <input type="number" value={minThreshold} onChange={e => setMinThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Harga (Rp)</label>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Supplier</label>
            <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Shell Indonesia"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-snappy">
            Batal
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy">
            Simpan
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const InventoryPage = () => {
  const { inventory, activities } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<any>(null);

  const inventoryLogs = activities.filter(a => a.type === 'inventory');

  return (
    <AppLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Inventaris</h1>
          <p className="text-muted-foreground mt-1">{inventory.length} suku cadang dalam katalog</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
        >
          <Plus className="w-4 h-4" /> Tambah Suku Cadang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inventory.map((item, i) => {
              const isLow = item.stock <= item.minThreshold;
              return (
                <GlassCard key={item.id} className={cn(
                  "relative group transition-all duration-300",
                  isLow ? "ring-2 ring-destructive/20 bg-destructive/5" : ""
                )}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        isLow ? "bg-destructive/10" : "bg-accent/50"
                      )}>
                        <Package className={cn("w-4 h-4", isLow ? "text-destructive" : "text-muted-foreground")} />
                      </div>
                      {isLow && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-tight">{item.sku}</p>
                    <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-[11px] text-muted-foreground mb-4 uppercase tracking-wider">{item.category} · {item.supplier}</p>
                    
                    <div className="flex items-end justify-between p-3 rounded-xl bg-secondary/20">
                      <div>
                        <p className="text-2xl font-mono font-bold leading-none">{item.stock}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium mt-1">Available Units</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <p className="text-sm font-mono font-bold">{formatCurrency(item.price)}</p>
                        <button 
                          onClick={() => setSelectedRestockItem(item)}
                          className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-snappy"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <History className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-bold uppercase tracking-wider">Logs Suku Cadang</p>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {inventoryLogs.slice(0, 8).map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                  >
                    <div className={cn(
                      "w-6 h-6 shrink-0 rounded flex items-center justify-center",
                      log.message.includes('bertambah') ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    )}>
                      {log.message.includes('bertambah') ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-relaxed">{log.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {inventoryLogs.length === 0 && (
                <div className="text-center py-8 opacity-20">
                  <History className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No movements logged yet</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="bg-primary/5 border-primary/20">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Tips Inventaris</h4>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Pastikan stok minimum disetel dengan benar untuk mendapatkan peringatan tepat waktu sebelum suku cadang habis.
            </p>
          </GlassCard>
        </div>
      </div>

      <AddPartModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <RestockModal 
        open={!!selectedRestockItem} 
        onClose={() => setSelectedRestockItem(null)} 
        item={selectedRestockItem} 
      />
    </AppLayout>
  );
};

export default InventoryPage;
