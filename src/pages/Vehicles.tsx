import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { vehicles, customers, formatCurrency } from "@/lib/mock-data";
import { Car, Search } from "lucide-react";
import { motion } from "framer-motion";

const VehiclesPage = () => (
  <AppLayout>
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-display tracking-tight">Vehicles</h1>
        <p className="text-muted-foreground mt-1">{vehicles.length} registered vehicles</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {vehicles.map((v, i) => {
        const owner = customers.find(c => c.id === v.customerId);
        return (
          <GlassCard key={v.id}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-glass-inner bg-accent">
                  <Car className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-xs font-mono font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{v.plateNumber}</span>
              </div>
              <h3 className="text-lg font-medium">{v.make} {v.model}</h3>
              <p className="text-sm text-muted-foreground">{v.year} · {v.mileage.toLocaleString()} km</p>
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Owner: {owner?.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{v.engineNumber.slice(0, 8)}…</p>
              </div>
            </motion.div>
          </GlassCard>
        );
      })}
    </div>
  </AppLayout>
);

export default VehiclesPage;
