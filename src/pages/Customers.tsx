import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { customers, vehicles } from "@/lib/mock-data";
import { Users, Star } from "lucide-react";
import { motion } from "framer-motion";

const CustomersPage = () => (
  <AppLayout>
    <div className="mb-8">
      <h1 className="text-4xl font-display tracking-tight">Customers</h1>
      <p className="text-muted-foreground mt-1">{customers.length} registered customers</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {customers.map((c, i) => {
        const ownedVehicles = vehicles.filter(v => v.customerId === c.id);
        return (
          <GlassCard key={c.id}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>{c.email}</p>
                <p>{ownedVehicles.length} vehicle{ownedVehicles.length !== 1 ? "s" : ""}: {ownedVehicles.map(v => `${v.make} ${v.model}`).join(", ")}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-mono font-medium">{c.loyaltyPoints} pts</span>
              </div>
            </motion.div>
          </GlassCard>
        );
      })}
    </div>
  </AppLayout>
);

export default CustomersPage;
