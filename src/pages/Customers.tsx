import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Star, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const AddCustomerModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { addCustomer } = useAppStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!name || !phone) {
      toast.error("Mohon lengkapi nama dan nomor telepon");
      return;
    }
    addCustomer({
      id: `c${Date.now()}`,
      name,
      phone,
      email,
      loyaltyPoints: 0,
    });
    toast.success(`Pelanggan ${name} berhasil ditambahkan`);
    setName(""); setPhone(""); setEmail("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display">Tambah Pelanggan</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Nama Lengkap</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ahmad Rizki"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">No. Telepon</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+62 812-3456-7890"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ahmad@email.com"
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

const CustomersPage = () => {
  const { customers, vehicles } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Pelanggan</h1>
          <p className="text-muted-foreground mt-1">{customers.length} pelanggan terdaftar</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-glass-inner bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
        >
          <Plus className="w-4 h-4" /> Tambah Pelanggan
        </button>
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
                  <p>{ownedVehicles.length} kendaraan: {ownedVehicles.map(v => `${v.make} ${v.model}`).join(", ") || "—"}</p>
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

      <AddCustomerModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </AppLayout>
  );
};

export default CustomersPage;
