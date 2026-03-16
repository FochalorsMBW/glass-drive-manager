import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Star, Wrench } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { motion } from "framer-motion";

const MechanicsPage = () => {
  const { mechanics, serviceOrders } = useAppStore();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display tracking-tight">Mekanik</h1>
        <p className="text-muted-foreground mt-1">Performa tim bengkel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mechanics.map((m, i) => {
          const actualActiveJobs = serviceOrders.filter(o => o.mechanic.id === m.id && o.status === "in_progress").length;
          
          return (
            <GlassCard key={m.id}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                    {m.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.specialization}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div>
                        <p className="text-2xl font-mono font-medium"><AnimatedNumber value={m.completedJobs} /></p>
                        <p className="text-xs text-muted-foreground">Pekerjaan selesai</p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div>
                        <p className="text-2xl font-mono font-medium">{actualActiveJobs}</p>
                        <p className="text-xs text-muted-foreground">Aktif</p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <p className="text-2xl font-mono font-medium">{m.rating}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${actualActiveJobs > 0 ? "bg-info/15 text-info" : "bg-success/15 text-success"}`}>
                    {actualActiveJobs > 0 ? "Sibuk" : "Tersedia"}
                  </span>
                </div>
              </motion.div>
            </GlassCard>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default MechanicsPage;
