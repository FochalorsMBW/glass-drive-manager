import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { Package, AlertTriangle, Plus, X, History, ArrowDown, ArrowUp, Pencil, Trash2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { cn, formatNumberWithDots, parseNumberFromDots } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { exportCSV } from "@/lib/exportCSV";

const RestockModal = ({ open, onClose, item }: { open: boolean; onClose: () => void; item: any }) => {
  const { restockItem } = useAppStore();
  const [amount, setAmount] = useState(1);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    restockItem(item.id, amount, notes);
    toast.success(`Stok ${item.name} berhasil ditambah ${amount} unit`);
    onClose();
    setAmount(1);
    setNotes("");
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
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Catatan (Pilihan)</label>
            <input 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Restock bulanan dari supplier"
              className="w-full px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm"
            />
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
  const [costPrice, setCostPrice] = useState(0);
  const [supplier, setSupplier] = useState("");

  const handleSubmit = () => {
    // Basic validations
    if (!name.trim()) { toast.error("Nama suku cadang harus diisi"); return; }
    if (!sku.trim()) { toast.error("SKU harus diisi"); return; }
    if (!category.trim()) { toast.error("Kategori harus diisi"); return; }
    if (!supplier.trim()) { toast.error("Supplier harus diisi"); return; }
    if (price <= 0) { toast.error("Harga jual harus lebih dari 0"); return; }
    if (costPrice <= 0) { toast.error("Harga modal harus lebih dari 0"); return; }
    if (stock < 0) { toast.error("Stok awal tidak bisa negatif"); return; }

    addInventoryItem({
      id: `i${Date.now()}`,
      sku: sku.toUpperCase(),
      name,
      category,
      stock,
      minThreshold,
      price,
      costPrice,
      supplier,
    });
    toast.success(`${name} berhasil ditambahkan ke inventaris`);
    setName(""); setSku(""); setCategory(""); setStock(0); setMinThreshold(5); setPrice(0); setCostPrice(0); setSupplier("");
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Harga Modal (HPP)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">Rp</span>
                <input 
                  type="text" 
                  value={formatNumberWithDots(costPrice)} 
                  onChange={e => setCostPrice(parseNumberFromDots(e.target.value))}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Harga Jual (Retail)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">Rp</span>
                <input 
                  type="text" 
                  value={formatNumberWithDots(price)} 
                  onChange={e => setPrice(parseNumberFromDots(e.target.value))}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
            </div>
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
  const { inventory, inventoryLogs, updateInventoryItem, deleteInventoryItem } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(12);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [editMinThreshold, setEditMinThreshold] = useState(5);
  const [editSupplier, setEditSupplier] = useState("");

  const startEdit = (item: any) => {
    setEditName(item.name); setEditSku(item.sku); setEditCategory(item.category);
    setEditPrice(item.price); setEditCostPrice(item.costPrice || 0);
    setEditMinThreshold(item.minThreshold); setEditSupplier(item.supplier || '');
    setEditingItem(item);
  };

  const saveEdit = () => {
    if (!editName.trim()) { toast.error("Nama harus diisi"); return; }
    updateInventoryItem({ ...editingItem, name: editName, sku: editSku, category: editCategory, price: editPrice, costPrice: editCostPrice, minThreshold: editMinThreshold, supplier: editSupplier });
    toast.success("Item berhasil diubah");
    setEditingItem(null);
  };

  const handleExportCSV = () => {
    exportCSV('inventaris', ['SKU', 'Nama', 'Kategori', 'Stok', 'Min', 'Harga Jual', 'HPP', 'Supplier'],
      inventory.map(i => [i.sku, i.name, i.category, i.stock, i.minThreshold, i.price, i.costPrice || 0, i.supplier || ''])
    );
    toast.success('CSV inventaris berhasil diunduh');
  };
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const displayedInventory = filteredInventory.slice(0, displayLimit);
  const hasMore = filteredInventory.length > displayLimit;

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Inventaris</h1>
          <p className="text-muted-foreground mt-1">{filteredInventory.length} suku cadang ditemukan</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-64">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Cari suku cadang/SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium border border-border/30 hover:bg-secondary/80 transition-snappy"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
          >
            <Plus className="w-4 h-4" /> Tambah Suku Cadang
          </button>
        </div>
      </div>

      {/* FAB Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all outline-none ring-4 ring-background"
      >
        <Plus className="w-7 h-7" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedInventory.map((item, i) => {
              const isLow = item.stock <= item.minThreshold;
              const isOut = item.stock <= 0;
              const isNegative = item.stock < 0;
              return (
                <GlassCard key={item.id} className={cn(
                  "relative group transition-all duration-300",
                  isNegative ? "ring-2 ring-destructive/20 bg-destructive/5" : (isLow ? "ring-2 ring-warning/20 bg-warning/5" : "")
                )}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        isLow ? "bg-destructive/10" : "bg-accent/50"
                      )}>
                        <Package className={cn("w-4 h-4", isLow ? "text-destructive" : "text-muted-foreground")} />
                      </div>
                      <div className="flex items-center gap-1">
                        {isNegative ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive text-white text-[10px] font-black uppercase tracking-wider animate-bounce shadow-lg shadow-destructive/40">
                            <AlertTriangle className="w-3 h-3" /> STOK NEGATIF!
                          </div>
                        ) : isOut ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> HABIS
                          </div>
                        ) : isLow ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </div>
                        ) : null}
                        <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all" title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all" title="Hapus">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
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

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setDisplayLimit(prev => prev + 12)}
                className="px-8 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-bold uppercase tracking-widest hover:bg-secondary/80 transition-all"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <History className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-bold uppercase tracking-wider">Logs Suku Cadang</p>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {inventoryLogs.slice(0, 10).map((log) => {
                  const item = inventory.find(i => i.id === log.itemId);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                    >
                      <div className={cn(
                        "w-6 h-6 shrink-0 rounded flex items-center justify-center",
                        log.type === 'restock' ? "bg-success/10 text-success" : 
                        log.type === 'usage' ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
                      )}>
                        {log.type === 'restock' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold text-foreground line-clamp-1">{item?.name || 'Suku Cadang'}</p>
                          <p className="text-[10px] font-mono font-bold text-success">+{log.quantity}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 italic">{log.notes || 'Pembaruan stok'}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-tighter">
                          {new Date(log.date).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
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

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingItem(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-display mb-4">Edit Suku Cadang</h2>
            <div className="space-y-3">
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nama" className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <div className="grid grid-cols-2 gap-3">
                <input value={editSku} onChange={e => setEditSku(e.target.value)} placeholder="SKU" className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Kategori" className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">HPP</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatNumberWithDots(editCostPrice)} 
                      onChange={e => setEditCostPrice(parseNumberFromDots(e.target.value))} 
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatNumberWithDots(editPrice)} 
                      onChange={e => setEditPrice(parseNumberFromDots(e.target.value))} 
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Min. Stok</label>
                  <input type="number" value={editMinThreshold} onChange={e => setEditMinThreshold(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Supplier</label>
                  <input value={editSupplier} onChange={e => setEditSupplier(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingItem(null)} className="flex-1 py-2.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-snappy">Batal</button>
              <button onClick={saveEdit} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy">Simpan</button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteInventoryItem(deleteTarget.id);
          toast.success(`${deleteTarget.name} berhasil dihapus`);
          setDeleteTarget(null);
        }}
        title="Hapus Suku Cadang"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Stok dan data harga akan hilang secara permanen.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </AppLayout>
  );
};

export default InventoryPage;
