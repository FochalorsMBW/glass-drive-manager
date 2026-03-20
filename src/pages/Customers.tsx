import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Star, Plus, X, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AddCustomerModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { addCustomer } = useAppStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("Nama pelanggan harus diisi"); return; }
    if (!phone.trim()) { toast.error("Nomor telepon harus diisi"); return; }
    
    // Basic email format validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Format email tidak valid");
      return;
    }

    addCustomer({
      id: `c${Date.now()}`,
      name,
      phone: `+62 ${phone}`,
      email,
      address,
      points: 0,
    });
    toast.success(`Pelanggan ${name} berhasil ditambahkan`);
    setName(""); setPhone(""); setEmail(""); setAddress("");
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">+62</span>
              <input 
                value={phone} 
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.startsWith("0")) val = val.substring(1);
                  if (val.length > 13) val = val.substring(0, 13);
                  
                  // Format: XXX-XXXX-XXXXX
                  if (val.length > 3 && val.length <= 7) {
                    val = `${val.slice(0, 3)}-${val.slice(3)}`;
                  } else if (val.length > 7) {
                    val = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`;
                  }
                  setPhone(val);
                }} 
                placeholder="812-3456-7890"
                className="w-full pl-12 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" 
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ahmad@email.com"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Alamat</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Jl. Merdeka No. 10, Jakarta"
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

const CustomerDetailsModal = ({ open, onClose, customer }: { open: boolean; onClose: () => void; customer: any }) => {
  const { vehicles, serviceOrders } = useAppStore();
  if (!open || !customer) return null;

  const ownedVehicles = vehicles.filter(v => v.customerId === customer.id);
  const history = serviceOrders.filter(o => o.customer?.id === customer.id || o.vehicle.customerId === customer.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-background border border-border/50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/30 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
              {customer.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-2xl font-display">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-sm font-mono font-bold text-warning">{customer.points || customer.loyaltyPoints || 0} Points</span>
                <span className="text-xs text-muted-foreground ml-2">ID: {customer.id}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-background/80 transition-snappy border border-border/20 shadow-sm">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kontak</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30">
                  <div className="text-primary text-xs font-bold uppercase tracking-widest w-12 text-right">Telp</div>
                  <div className="font-medium text-sm">{customer.phone}</div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30">
                  <div className="text-primary text-xs font-bold uppercase tracking-widest w-12 text-right">Email</div>
                  <div className="font-medium text-sm">{customer.email || "—"}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kendaraan Terdaftar ({ownedVehicles.length})</p>
              <div className="space-y-2">
                {ownedVehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-2xl border border-border/50 bg-secondary/10">
                    <div>
                      <p className="text-sm font-bold">{v.make} {v.model}</p>
                      <p className="text-[10px] font-mono font-bold text-muted-foreground">{v.plateNumber}</p>
                    </div>
                    <span className="text-[10px] uppercase font-black text-primary px-2 py-1 rounded-lg bg-primary/5">{v.year}</span>
                  </div>
                ))}
                {ownedVehicles.length === 0 && <p className="text-sm text-muted-foreground italic">Belum ada kendaraan</p>}
              </div>
            </div>
          </div>

          {/* Service History */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Riwayat Layanan & Transaksi</p>
            <div className="space-y-3">
              {history.map(o => (
                <div key={o.id} className="p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-snappy group bg-secondary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">{o.id}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider ${o.status === 'paid' ? 'bg-success/15 text-success' : 'bg-info/15 text-info'}`}>
                      {o.status === 'paid' ? 'Lunas' : o.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{o.description}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{o.vehicle.make} {o.vehicle.model}</p>
                    </div>
                    <p className="text-sm font-display font-medium">Rp {o.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-8 rounded-3xl border-2 border-dashed border-border/30">
                  <p className="text-sm text-muted-foreground">Belum ada riwayat transaksi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/30 bg-secondary/5 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-snappy">
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const CustomersPage = () => {
  const { customers, vehicles } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Pelanggan</h1>
          <p className="text-muted-foreground mt-1">{customers.length} pelanggan terdaftar</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-glass-inner bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
        >
          <Plus className="w-4 h-4" /> Tambah Pelanggan
        </button>
      </div>

      {/* FAB Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all outline-none ring-4 ring-background"
      >
        <Plus className="w-7 h-7" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.map((c, i) => {
          const ownedVehicles = vehicles.filter(v => v.customerId === c.id);
          return (
            <GlassCard key={c.id} className="group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <div className="flex items-center justify-between group-hover:bg-primary/5 p-4 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-display text-primary font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-lg flex items-center gap-2">
                            {c.name}
                            {(c.points || 0) > 1000 && (
                              <span className="text-[8px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter border border-warning/30">
                                PREMIUM
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{c.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Loyalty Points</p>
                        <p className="text-lg font-display text-primary">{(c.points || 0).toLocaleString()}</p>
                      </div>
                    </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/30">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Kendaraan</span>
                  <span className="text-[10px] font-mono font-bold text-foreground">{ownedVehicles.length} Unit</span>
                </div>
                
                {c.nextServiceDate && (
                  <div className={cn(
                    "flex flex-col gap-1 p-2 rounded-xl border",
                    new Date(c.nextServiceDate) < new Date() 
                      ? "bg-destructive/10 border-destructive/20 text-destructive" 
                      : "bg-primary/5 border-primary/10 text-primary"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Servis Berikutnya</span>
                      {new Date(c.nextServiceDate) < new Date() ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    </div>
                    <div className="text-[10px] font-bold">
                      {new Date(c.nextServiceDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      <span className="ml-1 opacity-70 font-medium">
                        ({Math.ceil((new Date(c.nextServiceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} hari lagi)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-[10px] font-mono font-bold">{c.points || 0}</span>
                  </div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Detail →</p>
                </div>
            </GlassCard>
          );
        })}
      </div>

      <AddCustomerModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <CustomerDetailsModal 
        open={!!selectedCustomer} 
        onClose={() => setSelectedCustomer(null)} 
        customer={selectedCustomer} 
      />
    </AppLayout>
  );
};

export default CustomersPage;
