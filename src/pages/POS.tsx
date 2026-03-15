import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { inventory, formatCurrency, type InventoryItem } from "@/lib/mock-data";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem extends InventoryItem {
  qty: number;
}

const POSPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [laborCost, setLaborCost] = useState(200000);
  const [discount, setDiscount] = useState(0);

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0) + laborCost;
  const tax = subtotal * 0.11;
  const total = subtotal + tax - discount;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display tracking-tight">Cashier POS</h1>
        <p className="text-muted-foreground mt-1">Fast checkout for service orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Parts Grid */}
        <div className="lg:col-span-3">
          <GlassCard>
            <p className="text-sm text-muted-foreground mb-4">Quick Add Parts</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {inventory.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="p-3 rounded-glass-inner bg-secondary/30 hover:bg-secondary/60 text-left transition-snappy border border-border/20"
                >
                  <p className="text-xs font-mono text-muted-foreground">{item.sku}</p>
                  <p className="text-sm font-medium mt-0.5 truncate">{item.name}</p>
                  <p className="text-sm font-mono mt-1">{formatCurrency(item.price)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Stock: {item.stock}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Invoice</p>
              <span className="ml-auto text-xs font-mono text-muted-foreground">{cart.length} items</span>
            </div>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-glass-inner bg-secondary/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded hover:bg-accent transition-snappy">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-mono w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded hover:bg-accent transition-snappy">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-mono w-24 text-right">{formatCurrency(item.price * item.qty)}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {cart.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8">No items added yet</p>
              )}
            </div>

            <div className="border-t border-border/30 pt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Labor</span>
                <span className="font-mono">{formatCurrency(laborCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax (11%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-mono text-success">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="font-medium">Total</span>
                <span className="text-xl font-mono font-medium">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <button className="flex flex-col items-center gap-1 py-3 rounded-glass-inner bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-snappy">
                <Banknote className="w-5 h-5" /> Cash
              </button>
              <button className="flex flex-col items-center gap-1 py-3 rounded-glass-inner bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-snappy">
                <CreditCard className="w-5 h-5" /> Card
              </button>
              <button className="flex flex-col items-center gap-1 py-3 rounded-glass-inner bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-snappy">
                <QrCode className="w-5 h-5" /> QRIS
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default POSPage;
