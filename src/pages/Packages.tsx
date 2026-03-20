import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/useAppStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { Package, Star, ShoppingCart, CheckCircle2, Plus, Trash2, Edit2, X } from "lucide-react";
import { useState } from "react";
import { formatCurrency, type ServicePackage, type ServicePackageItem } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NewPackageModal = ({ open, onClose, editingPackage }: { open: boolean; onClose: () => void; editingPackage?: ServicePackage | null }) => {
  const { addServicePackage, updateServicePackage, inventory } = useAppStore();
  const [name, setName] = useState(editingPackage?.name || "");
  const [description, setDescription] = useState(editingPackage?.description || "");
  const [laborCost, setLaborCost] = useState(editingPackage?.laborCost || 0);
  const [selectedItems, setSelectedItems] = useState<ServicePackageItem[]>(editingPackage?.items || []);

  const totalPrice = laborCost + selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleSubmit = () => {
    if (!name || !description) {
      toast.error("Mohon isi nama dan deskripsi paket");
      return;
    }

    const pkg: ServicePackage = {
      id: editingPackage?.id || `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      description,
      laborCost,
      items: selectedItems,
      totalPrice
    };

    if (editingPackage) {
      updateServicePackage(pkg);
      toast.success("Paket servis berhasil diperbarui!");
    } else {
      addServicePackage(pkg);
      toast.success("Paket servis baru ditambahkan!");
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/30 flex items-center justify-between bg-primary/5">
          <h2 className="text-xl font-display">{editingPackage ? "Edit Paket" : "Tambah Paket Servis Baru"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Nama Paket</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Paket Tune Up Pro" className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Deskripsi Singkat</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Apa saja yang dikerjakan?" rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Biaya Jasa Mekanik (Rp)</label>
              <input type="number" value={laborCost} onChange={e => setLaborCost(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border/50 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <ShoppingCart className="w-3 h-3" /> Pilih Suku Cadang (Otomatis ditagih)
              </label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {inventory.map(item => {
                  const selectedIdx = selectedItems.findIndex(si => si.name === item.name);
                  const isSelected = selectedIdx !== -1;
                  return (
                    <div key={item.id} className={cn("flex items-center justify-between p-2 rounded-lg border transition-all", isSelected ? "bg-primary/10 border-primary/30" : "bg-secondary/20 border-border/20")}>
                      <span className="text-xs font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                           <div className="flex items-center gap-1">
                             <button onClick={() => {
                               const newItems = [...selectedItems];
                               if (newItems[selectedIdx].qty > 1) {
                                 newItems[selectedIdx].qty--;
                                 setSelectedItems(newItems);
                               } else {
                                 setSelectedItems(newItems.filter(i => i.name !== item.name));
                               }
                             }} className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center text-xs">-</button>
                             <span className="text-xs font-bold w-4 text-center">{selectedItems[selectedIdx].qty}</span>
                             <button onClick={() => {
                               const newItems = [...selectedItems];
                               newItems[selectedIdx].qty++;
                               setSelectedItems(newItems);
                             }} className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center text-xs">+</button>
                           </div>
                        ) : (
                          <button 
                            onClick={() => setSelectedItems([...selectedItems, { name: item.name, price: item.price, qty: 1 }])}
                            className="p-1 rounded bg-secondary text-[10px] font-bold uppercase"
                          >
                            Tambah
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-muted-foreground">Subtotal Suku Cadang</span>
                <span className="font-mono">{formatCurrency(totalPrice - laborCost)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-sm pt-2 border-t border-primary/20">
                <span>Estimasi Harga Paket</span>
                <span className="text-primary font-mono">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-secondary/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-secondary font-medium text-sm">Batal</button>
          <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">{editingPackage ? "Simpan Perubahan" : "Buat Paket"}</button>
        </div>
      </motion.div>
    </div>
  );
};

const PackagesPage = () => {
  const { servicePackages, deleteServicePackage } = useAppStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight text-foreground">Paket Servis</h1>
          <p className="text-muted-foreground mt-1">Daftar paket layanan standar untuk mempercepat operasional bengkel.</p>
        </div>
        <button 
          onClick={() => { setEditingPackage(null); setShowNewModal(true); }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4" /> Tambah Paket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicePackages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="h-full flex flex-col group hover:border-primary/50 transition-all duration-500 relative">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                <button 
                  onClick={() => { setEditingPackage(pkg); setShowNewModal(true); }}
                  className="p-2 rounded-lg bg-background/80 border border-border/50 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Hapus paket ${pkg.name}?`)) {
                      deleteServicePackage(pkg.id);
                      toast.success("Paket dihapus");
                    }
                  }}
                  className="p-2 rounded-lg bg-background/80 border border-border/50 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Total Paket</p>
                  <p className="text-xl font-display text-primary">{formatCurrency(pkg.totalPrice)}</p>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{pkg.description}</p>
                
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                      <Star className="w-3 h-3 text-warning" /> Jasa Mekanik
                    </p>
                    <p className="text-sm font-mono font-bold">{formatCurrency(pkg.laborCost)}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-3 h-3" /> Suku Cadang & Bahan
                    </p>
                    <div className="space-y-1.5">
                      {pkg.items.length > 0 ? (
                        pkg.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px]">
                            <span className="font-medium text-foreground/80">{item.name}</span>
                            <span className="font-mono text-muted-foreground">x{item.qty}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic">Hanya Jasa (Tanpa Part)</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-success uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /> Tersedia untuk Order & POS
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <NewPackageModal 
        open={showNewModal} 
        onClose={() => setShowNewModal(false)} 
        editingPackage={editingPackage} 
        key={editingPackage ? editingPackage.id : 'new'} 
      />
    </AppLayout>
  );
};

export default PackagesPage;
