import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency, type InventoryItem } from "@/lib/mock-data";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, CheckCircle2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem extends InventoryItem {
  qty: number;
}

const ReceiptModal = ({ open, onClose, items, total, customerId }: { 
  open: boolean; 
  onClose: () => void; 
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  customerId: string;
}) => {
  const { customers, settings } = useAppStore();
  const customer = customers.find(c => c.id === customerId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Menghasilkan struk PDF...',
        success: 'Struk berhasil diunduh ke folder Downloads!',
        error: 'Gagal mengunduh struk.',
      }
    );
    setTimeout(() => setIsDownloading(false), 2200);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 bg-primary/10 text-center border-b border-border/10">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-display">Pembayaran Berhasil</h2>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Selesai pada {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
          <div className="text-center">
            <h3 className="text-3xl font-mono font-bold tracking-tighter">{formatCurrency(total)}</h3>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Total Pembayaran</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed border-border/30">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{item.quantity} x {formatCurrency(item.price)}</span>
                </div>
                <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>PPN {settings.taxRate}%</span>
                <span className="font-mono">{formatCurrency(total * (settings.taxRate / (100 + settings.taxRate)))}</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl space-y-2 border border-border/10">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pelanggan:</span>
              <span className="font-bold">{customer?.name || "Pelanggan Umum"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Lokasi:</span>
              <span className="font-medium">{settings.address.split(',')[0]}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-secondary/10 flex gap-3">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-bold border border-border/50 hover:bg-secondary/80 transition-snappy disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "..." : "Simpan PDF"}
          </button>
          <button 
            onClick={onClose}
            className="flex-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-snappy"
          >
            Selesai
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const POSPage = () => {
  const { inventory, customers, updateInventoryStock, addTransaction, serviceOrders } = useAppStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [laborCost, setLaborCost] = useState(200000);
  const [discount, setDiscount] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{ total: number; method: string }>({ total: 0, method: "" });

  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) {
      toast.error(`Stok ${item.name} habis!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock) {
          toast.error("Tidak bisa menambah lebih banyak dari stok tersedia");
          return prev;
        }
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.id === id) {
          const newQty = c.qty + delta;
          const originalItem = inventory.find(i => i.id === id);
          if (originalItem && newQty > originalItem.stock) {
            toast.error("Stok tidak mencukupi");
            return c;
          }
          return { ...c, qty: Math.max(0, newQty) };
        }
        return c;
      }).filter(c => c.qty > 0);
    });
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0) + laborCost;
  const tax = subtotal * 0.11;
  const total = subtotal + tax - discount;

  const handleCheckout = (method: string) => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    
    // Update live state
    addTransaction(total);
    cart.forEach(item => {
      updateInventoryStock(item.id, -item.qty);
    });

    setReceiptData({ total, method });
    setShowReceipt(true);
    toast.success(`Pembayaran ${method} berhasil!`);
  };

  const handleFinish = () => {
    setShowReceipt(false);
    setCart([]);
    setSelectedCustomerId("");
  };

  const completedOrders = serviceOrders.filter(o => o.status === 'completed');

  const importOrder = (orderId: string) => {
    const order = serviceOrders.find(o => o.id === orderId);
    if (!order) return;
    setLaborCost(order.laborCost);
    setSelectedCustomerId(order.vehicle.customerId);
    toast.info(`Berhasil menarik tagihan ${orderId}`);
  };

  return (
    <AppLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Kasir POS</h1>
          <p className="text-muted-foreground mt-1">Pembayaran cepat untuk pesanan layanan</p>
        </div>
        
        {completedOrders.length > 0 && (
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Tarik Tagihan Layanan</span>
            <div className="flex gap-2">
              {completedOrders.slice(0, 3).map(o => (
                <button
                  key={o.id}
                  onClick={() => importOrder(o.id)}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-snappy"
                >
                  {o.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">Data Pelanggan</p>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/40 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">Pelanggan Umum (Tanpa Nama)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </GlassCard>

          <GlassCard>
            <p className="text-sm font-semibold mb-4">Tambah Suku Cadang Cepat</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-left transition-snappy border border-border/20 group relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{item.sku}</p>
                  <p className="text-sm font-medium mt-1 truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-mono font-medium">{formatCurrency(item.price)}</p>
                    <p className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      item.stock < 5 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    )}>
                      Stok: {item.stock}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="h-full sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Ringkasan Tagihan</p>
                <p className="text-[10px] text-muted-foreground uppercase font-mono">{cart.length} item unik</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl bg-secondary/20 border border-border/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary hover:bg-accent transition-snappy transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary hover:bg-accent transition-snappy transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-mono font-medium w-20 text-right">{formatCurrency(item.price * item.qty)}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {cart.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 text-muted-foreground opacity-20" />
                  </div>
                  <p className="text-xs text-muted-foreground">Pilih suku cadang untuk memulai</p>
                </div>
              )}
            </div>

            <div className="border-t border-border/30 pt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Jasa Layanan</span>
                <span className="font-mono">{formatCurrency(laborCost)}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>PPN (11%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <span className="text-lg font-bold">Total Akhir</span>
                <span className="text-2xl font-display text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-8">
              <button 
                onClick={() => handleCheckout("Tunai")}
                disabled={cart.length === 0}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-snappy disabled:opacity-50"
              >
                <Banknote className="w-5 h-5" /> TUNAI
              </button>
              <button 
                onClick={() => handleCheckout("Kartu")}
                disabled={cart.length === 0}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-snappy disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" /> KARTU
              </button>
              <button 
                onClick={() => handleCheckout("QRIS")}
                disabled={cart.length === 0}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-snappy disabled:opacity-50"
              >
                <QrCode className="w-5 h-5" /> QRIS
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      <ReceiptModal 
        open={showReceipt} 
        onClose={handleFinish} 
        cart={cart}
        total={receiptData.total}
        method={receiptData.method}
        customerName={customers.find(c => c.id === selectedCustomerId)?.name || "Pelanggan Umum"}
      />
    </AppLayout>
  );
};

export default POSPage;
