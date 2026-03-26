import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency, type InventoryItem, type Transaction } from "@/lib/mock-data";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, CheckCircle2, Download, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatNumberWithDots, parseNumberFromDots } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem extends InventoryItem {
  qty: number;
}

const ReceiptModal = ({ open, onClose, cart, transaction, method, customerName }: { 
  open: boolean; 
  onClose: () => void; 
  cart: CartItem[];
  transaction: Transaction | null;
  method: string;
  customerName: string;
}) => {
  const { settings } = useAppStore();

  const handlePrint = () => {
    window.print();
  };

  if (!open || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-background border border-border/50 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 bg-primary/10 text-center border-b border-dashed border-border/30 relative">
          <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-display">Pembayaran Berhasil</h2>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Metode: {method}</p>
          
          {/* Decorative receipt cuts */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-background -mb-2" />
            ))}
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[50vh]">
          <div className="text-center">
            <h3 className="text-3xl font-mono font-bold tracking-tighter text-primary">{formatCurrency(transaction.total)}</h3>
            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mt-1 opacity-60">Total Bayar (PPN {transaction.taxRate}%)</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed border-border/30">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div className="flex flex-col flex-1 min-w-0 pr-4">
                  <span className="font-bold truncate">{item.name}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">{item.qty} x {formatCurrency(item.price)}</span>
                </div>
                <span className="font-mono font-bold text-right shrink-0">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="bg-secondary/30 p-4 rounded-2xl space-y-2.5 border border-border/20">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground font-bold uppercase tracking-widest">No. Struk</span>
              <span className="font-bold font-mono">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground font-bold uppercase tracking-widest">Pelanggan</span>
              <span className="font-bold">{customerName}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground font-bold uppercase tracking-widest">Waktu</span>
              <span className="font-bold">{new Date(transaction.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {method === "Tunai" && transaction.amountPaid > 0 && (
              <>
                <div className="border-t border-dashed border-border/20 pt-2 mt-2" />
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Dibayar</span>
                  <span className="font-bold font-mono">{formatCurrency(transaction.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-success">
                  <span className="font-bold uppercase tracking-widest">Kembalian</span>
                  <span className="font-bold font-mono">{formatCurrency(transaction.change)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6 pt-2 bg-secondary/10 flex flex-col gap-2">
          <button 
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-background text-foreground text-xs font-black uppercase tracking-widest border border-border/50 hover:bg-secondary/50 transition-all"
          >
            <Download className="w-4 h-4" />
            Cetak Struk
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            Selesai
          </button>
        </div>

        {/* Hidden Thermal Receipt Print Content */}
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-mono text-[10px] z-[9999] w-[80mm] mx-auto">
          <div className="text-center mb-6 pt-4">
            <h2 className="text-lg font-bold">{settings.workshopName || 'UB SERVICE'}</h2>
            <p>{settings.workshopAddress || 'Jl. Veteran No. 1, Malang'}</p>
            <p>Telp: {settings.workshopPhone || '0341-5550192'}</p>
            <div className="border-b border-dashed border-black my-4" />
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex justify-between">
              <span>No. Struk:</span>
              <span>{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(transaction.date).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{customerName}</span>
            </div>
            {transaction.linkedOrderId && (
              <div className="flex justify-between">
                <span>Ref. Order:</span>
                <span>{transaction.linkedOrderId}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-black my-4" />

          <div className="space-y-2 mb-6">
            {transaction.laborCost > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">Biaya Jasa</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>1 x {formatCurrency(transaction.laborCost)}</span>
                  <span>{formatCurrency(transaction.laborCost)}</span>
                </div>
              </div>
            )}
            {cart.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">{item.name}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>{item.qty} x {formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.price * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-black my-4" />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>PPN ({transaction.taxRate}%):</span>
                <span>{formatCurrency(transaction.taxAmount)}</span>
              </div>
            )}
            {transaction.discount > 0 && (
              <div className="flex justify-between">
                <span>Diskon:</span>
                <span>-{formatCurrency(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs pt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode Bayar:</span>
              <span className="uppercase">{method}</span>
            </div>
            {method === "Tunai" && transaction.amountPaid > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Uang Diterima:</span>
                  <span>{formatCurrency(transaction.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(transaction.change)}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-12 border-t border-dashed border-black pt-6">
            <p className="font-bold">TERIMA KASIH</p>
            <p>Silakan berkunjung kembali!</p>
            <p className="text-[8px] mt-2 opacity-50">{settings.workshopName} • {transaction.receiptNumber}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Checkout Confirmation Modal (for Cash with Change) ---
const CheckoutModal = ({ open, onClose, onConfirm, total, method }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (amountPaid: number) => void;
  total: number;
  method: string;
}) => {
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const change = Math.max(0, amountPaid - total);
  const canConfirm = method !== "Tunai" || amountPaid >= total;

  if (!open) return null;

  const quickAmounts = [
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/30 bg-primary/5">
          <h2 className="text-xl font-display">Konfirmasi Pembayaran</h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Metode: {method}</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center py-4 bg-secondary/20 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Tagihan</p>
            <p className="text-3xl font-display text-primary">{formatCurrency(total)}</p>
          </div>

          {method === "Tunai" && (
            <>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 block">Uang Diterima</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground/30">Rp</span>
                  <input 
                    type="text"
                    value={formatNumberWithDots(amountPaid)}
                    onChange={e => setAmountPaid(parseNumberFromDots(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-2xl font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmountPaid(amt)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition-all",
                      amountPaid === amt 
                        ? "bg-primary/20 border-primary/30 text-primary" 
                        : "bg-secondary/30 border-border/30 hover:bg-secondary/50"
                    )}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>

              {amountPaid >= total && (
                <div className="text-center py-4 bg-success/10 rounded-xl border border-success/20">
                  <p className="text-[10px] uppercase font-bold text-success tracking-widest mb-1">Kembalian</p>
                  <p className="text-3xl font-mono font-bold text-success">{formatCurrency(change)}</p>
                </div>
              )}
              {amountPaid > 0 && amountPaid < total && (
                <div className="text-center py-3 bg-destructive/10 rounded-xl border border-destructive/20">
                  <p className="text-xs text-destructive font-bold">Uang kurang {formatCurrency(total - amountPaid)}</p>
                </div>
              )}
            </>
          )}

          {method !== "Tunai" && (
            <div className="text-center py-4 bg-info/10 rounded-xl border border-info/20">
              <p className="text-xs text-info font-medium">Pembayaran {method} akan diproses secara otomatis.</p>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-secondary text-sm font-bold hover:bg-secondary/80 transition-snappy">
            Batal
          </button>
          <button 
            onClick={() => onConfirm(method === "Tunai" ? amountPaid : total)}
            disabled={!canConfirm}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-snappy disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {method === "Tunai" ? "Terima & Cetak" : "Proses Pembayaran"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const POSPage = () => {
  const { inventory, customers, settings, updateInventoryStock, addTransaction, addSaleTransaction, addLoyaltyPoints, updateServiceOrderStatus, serviceOrders, servicePackages, receiptCounter } = useAppStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [useTax, setUseTax] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [linkedOrderId, setLinkedOrderId] = useState<string | null>(null);

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

  const updatePrice = (id: string, newPrice: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, price: newPrice } : c));
  };

  const taxRate = settings.taxRate || 0;
  const itemsSubtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const subtotal = itemsSubtotal + laborCost;
  const tax = useTax ? subtotal * (taxRate / 100) : 0;
  const total = Math.max(0, subtotal + tax - discount);

  const initiateCheckout = (method: string) => {
    if (cart.length === 0 && laborCost <= 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    setCheckoutMethod(method);
    setShowCheckout(true);
  };

  const handleConfirmCheckout = (amountPaid: number) => {
    const receiptNum = `TRX-${String(receiptCounter + 1).padStart(5, '0')}`;
    const change = Math.max(0, amountPaid - total);

    const trx: Transaction = {
      id: `trx-${Date.now()}`,
      receiptNumber: receiptNum,
      items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
      laborCost,
      subtotal,
      taxAmount: tax,
      taxRate: useTax ? taxRate : 0,
      discount,
      total,
      amountPaid,
      change,
      method: checkoutMethod,
      customerName: customers.find(c => c.id === selectedCustomerId)?.name || "Pelanggan Umum",
      customerId: selectedCustomerId || undefined,
      linkedOrderId: linkedOrderId || undefined,
      date: new Date().toISOString(),
    };

    // 1. Save transaction to store
    addSaleTransaction(trx);

    // 2. Update revenue chart
    addTransaction(total);

    // 3. Update linked order status to 'paid'
    if (linkedOrderId) {
      updateServiceOrderStatus(linkedOrderId, 'paid');
    }

    // 5. Add loyalty points (1 point per Rp 10,000)
    if (selectedCustomerId) {
      const earnedPoints = Math.floor(total / 10000);
      if (earnedPoints > 0) {
        addLoyaltyPoints(selectedCustomerId, earnedPoints);
      }
    }

    setLastTransaction(trx);
    setShowCheckout(false);
    setShowReceipt(true);
    toast.success(`Pembayaran ${checkoutMethod} berhasil!`);
  };

  const handleFinish = () => {
    setShowReceipt(false);
    setLastTransaction(null);
    setCart([]);
    setSelectedCustomerId("");
    setDiscount(0);
    setLaborCost(0);
    setUseTax(true);
    setLinkedOrderId(null);
  };

  const completedOrders = serviceOrders.filter(o => o.status === 'completed');

  const importOrder = (orderId: string) => {
    const order = serviceOrders.find(o => o.id === orderId);
    if (!order) return;
    setLaborCost(order.laborCost);
    setSelectedCustomerId(order.vehicle.customerId);
    setLinkedOrderId(orderId);

    // If order has a package, auto-add its items
    if (order.packageId) {
      const pkg = servicePackages.find(p => p.id === order.packageId);
      if (pkg) {
        setCart(prev => {
          let newCart = [...prev];
          pkg.items.forEach(pkgItem => {
            const invItem = inventory.find(i => i.name === pkgItem.name);
            if (invItem) {
              const existing = newCart.find(c => c.id === invItem.id);
              if (existing) {
                newCart = newCart.map(c => c.id === invItem.id ? { ...c, qty: c.qty + pkgItem.qty } : c);
              } else {
                newCart.push({ ...invItem, qty: pkgItem.qty });
              }
            } else {
              toast.warning(`Item paket "${pkgItem.name}" tidak ditemukan di inventaris`);
            }
          });
          return newCart;
        });
      }
    }
    
    toast.info(`Berhasil menarik tagihan ${orderId}`);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

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
                <option key={c.id} value={c.id}>{c.name} — {c.phone} {c.points > 1000 ? '⭐ PREMIUM' : ''}</option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                <Coins className="w-4 h-4 text-warning" />
                <span className="text-xs font-bold text-muted-foreground">Loyalty: <span className="text-warning font-mono">{selectedCustomer.points?.toLocaleString() || 0}</span> poin</span>
                <span className="text-[9px] text-muted-foreground opacity-50 ml-auto">+1 poin / Rp 10.000</span>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <p className="text-sm font-semibold mb-4">Tambah Suku Cadang Cepat</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.map(item => (
                <button
                  key={item.id}
                  disabled={item.stock <= 0}
                  onClick={() => addToCart(item)}
                  className={cn(
                    "p-4 rounded-xl text-left transition-snappy border group relative overflow-hidden",
                    item.stock <= 0 
                      ? "bg-secondary/10 border-border/20 opacity-60 cursor-not-allowed" 
                      : "bg-secondary/30 hover:bg-secondary/60 border-border/20"
                  )}
                >
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{item.sku}</p>
                  <p className="text-sm font-medium mt-1 truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-mono font-medium">{formatCurrency(item.price)}</p>
                    <p className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      item.stock <= 0 
                        ? "bg-destructive/10 text-destructive" 
                        : item.stock < 5 
                          ? "bg-warning/10 text-warning" 
                          : "bg-primary/10 text-primary"
                    )}>
                      {item.stock <= 0 ? "Habis" : `Stok: ${item.stock}`}
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

            <div className="space-y-3 mb-6 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
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
                      {selectedCustomer?.isWorkshop ? (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] font-bold text-primary">Rp</span>
                          <input 
                            type="text"
                            value={formatNumberWithDots(item.price)}
                            onChange={e => updatePrice(item.id, parseNumberFromDots(e.target.value))}
                            className="w-24 bg-primary/10 border-b border-primary/30 text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary px-1"
                          />
                          <span className="text-[9px] text-muted-foreground uppercase font-bold ml-1">(Harga Bengkel)</span>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-muted-foreground">{formatCurrency(item.price)}</p>
                      )}
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
              {cart.length === 0 && laborCost <= 0 && (
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
                <span>Biaya Jasa</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">Rp</span>
                  <input 
                    type="text"
                    value={formatNumberWithDots(laborCost)}
                    onChange={e => setLaborCost(parseNumberFromDots(e.target.value))}
                    className="w-32 text-right bg-secondary/30 border border-border/50 rounded-lg pl-7 pr-2 py-1.5 font-mono text-xs focus:ring-1 focus:ring-primary/30 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <div className="flex items-center gap-2">
                  <span>PPN ({taxRate}%)</span>
                  <button 
                    onClick={() => setUseTax(!useTax)}
                    className={cn(
                      "text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold tracking-tighter transition-all",
                      useTax ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {useTax ? "Aktif" : "Nonaktif"}
                  </button>
                </div>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Diskon (Rp)</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">Rp</span>
                    <input 
                      type="text" 
                      value={formatNumberWithDots(discount)} 
                      onChange={e => setDiscount(parseNumberFromDots(e.target.value))}
                      className="w-32 text-right bg-secondary/30 border border-border/50 rounded-lg pl-7 pr-2 py-1 font-mono text-xs focus:ring-1 focus:ring-primary/30 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <span className="text-lg font-bold">Total Akhir</span>
                <div className="text-right">
                  <span className="text-2xl font-display text-primary">{formatCurrency(total)}</span>
                  {discount > 0 && <p className="text-[10px] text-success font-bold uppercase tracking-widest mt-0.5">- Hemat {formatCurrency(discount)}</p>}
                  {selectedCustomerId && total > 0 && (
                    <p className="text-[9px] text-warning font-bold mt-0.5">+{Math.floor(total / 10000)} poin loyalty</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-8">
              <button 
                onClick={() => initiateCheckout("Tunai")}
                disabled={cart.length === 0 && laborCost <= 0}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold hover:opacity-90 transition-snappy disabled:opacity-50"
              >
                <Banknote className="w-5 h-5" /> TUNAI
              </button>
              <button 
                onClick={() => initiateCheckout("Kartu")}
                disabled={cart.length === 0 && laborCost <= 0}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-secondary text-secondary-foreground text-[10px] font-bold hover:bg-secondary/80 transition-snappy disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" /> KARTU
              </button>
              <button 
                onClick={() => initiateCheckout("QRIS")}
                disabled={cart.length === 0 && laborCost <= 0}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-secondary text-secondary-foreground text-[10px] font-bold hover:bg-secondary/80 transition-snappy disabled:opacity-50"
              >
                <QrCode className="w-5 h-5" /> QRIS
              </button>
              <button 
                onClick={() => { setCart([]); setLaborCost(0); setDiscount(0); setUseTax(true); setSelectedCustomerId(""); setLinkedOrderId(null); }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-destructive/10 text-destructive text-[10px] font-bold hover:bg-destructive/20 transition-snappy"
                title="Reset/Hapus Keranjang"
              >
                <Trash2 className="w-5 h-5" /> RESET
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      <CheckoutModal 
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        onConfirm={handleConfirmCheckout}
        total={total}
        method={checkoutMethod}
      />

      <ReceiptModal 
        open={showReceipt} 
        onClose={handleFinish} 
        cart={cart}
        transaction={lastTransaction}
        method={lastTransaction?.method || ""}
        customerName={lastTransaction?.customerName || "Pelanggan Umum"}
      />
    </AppLayout>
  );
};

export default POSPage;
