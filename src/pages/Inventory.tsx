import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { inventory, formatCurrency } from "@/lib/mock-data";
import { Package, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const InventoryPage = () => (
  <AppLayout>
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-display tracking-tight">Inventory</h1>
        <p className="text-muted-foreground mt-1">{inventory.length} parts in catalog</p>
      </div>
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-glass-inner bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy">
        + Add Part
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {inventory.map((item, i) => {
        const isLow = item.stock <= item.minThreshold;
        return (
          <GlassCard key={item.id} className={isLow ? "pulse-alert" : ""}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-glass-inner bg-accent">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
                {isLow && <AlertTriangle className="w-4 h-4 text-destructive" />}
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-1">{item.sku}</p>
              <h3 className="text-sm font-medium mb-1">{item.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{item.category} · {item.supplier}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-mono font-medium">{item.stock}</p>
                  <p className="text-[11px] text-muted-foreground">in stock</p>
                </div>
                <p className="text-sm font-mono">{formatCurrency(item.price)}</p>
              </div>
            </motion.div>
          </GlassCard>
        );
      })}
    </div>
  </AppLayout>
);

export default InventoryPage;
