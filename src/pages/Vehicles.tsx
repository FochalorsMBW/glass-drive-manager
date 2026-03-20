import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Car, Plus, X, History as HistoryIcon, Wrench, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency, type Vehicle } from "@/lib/mock-data";

const AddVehicleModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { customers, addVehicle } = useAppStore();
  const [plateNumber, setPlateNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2024);
  const [mileage, setMileage] = useState(0);
  const [engineNumber, setEngineNumber] = useState("");
  const [customerId, setCustomerId] = useState("");

  const handleSubmit = () => {
    if (!plateNumber || !make || !model || !customerId) {
      toast.error("Mohon lengkapi semua field wajib");
      return;
    }
    addVehicle({
      id: `v${Date.now()}`,
      plateNumber,
      make,
      model,
      year,
      mileage,
      engineNumber,
      customerId,
    });
    toast.success(`${make} ${model} (${plateNumber}) berhasil ditambahkan`);
    setPlateNumber(""); setMake(""); setModel(""); setYear(2024); setMileage(0); setEngineNumber(""); setCustomerId("");
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
          <h2 className="text-xl font-display">Tambah Kendaraan</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm text-muted-foreground mb-1.5 block">Pemilik</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Pilih pemilik...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Plat Nomor</label>
            <input value={plateNumber} onChange={e => setPlateNumber(e.target.value)} placeholder="B 1234 XY"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Merek</label>
            <input value={make} onChange={e => setMake(e.target.value)} placeholder="Honda"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Model</label>
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="Civic"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Tahun</label>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Kilometer</label>
            <input type="number" value={mileage} onChange={e => setMileage(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">No. Mesin</label>
            <input value={engineNumber} onChange={e => setEngineNumber(e.target.value)} placeholder="R18Z1-4521087"
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
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

const VehicleDetailsModal = ({ vehicle, open, onClose }: { vehicle: Vehicle | null; open: boolean; onClose: () => void }) => {
  const { serviceOrders, mechanics } = useAppStore();
  if (!vehicle || !open) return null;

  const history = serviceOrders
    .filter(o => o.vehicle.plateNumber === vehicle.plateNumber)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/30 flex items-center justify-between bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display">{vehicle.make} {vehicle.model}</h2>
              <p className="text-xs font-mono text-muted-foreground uppercase">{vehicle.plateNumber} · {vehicle.year}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/20">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Kilometer Terakhir</p>
              <p className="text-lg font-mono font-bold">{vehicle.mileage.toLocaleString()} KM</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/20">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">No. Mesin</p>
              <p className="text-lg font-mono font-bold">{vehicle.engineNumber || "—"}</p>
            </div>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            <HistoryIcon className="w-4 h-4" /> Riwayat Servis
          </h3>

          <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
            {history.map((order, i) => (
              <div key={order.id} className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
                  <Wrench className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-border/10 hover:border-primary/30 transition-snappy">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <h4 className="text-sm font-bold mt-0.5">{order.id}</h4>
                    </div>
                    <span className="text-sm font-mono font-bold text-success">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{order.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">{order.mechanic.avatar}</div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{order.mechanic.name}</span>
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-12 opacity-30">
                <HistoryIcon className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm">Belum ada riwayat servis untuk kendaraan ini.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const VehiclesPage = () => {
  const { vehicles, customers } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Kendaraan</h1>
          <p className="text-muted-foreground mt-1">{vehicles.length} kendaraan terdaftar</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
        >
          <Plus className="w-4 h-4" /> Tambah Kendaraan
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
        {vehicles.map((v, i) => {
          const owner = customers.find(c => c.id === v.customerId);
          return (
            <div key={v.id} onClick={() => setSelectedVehicle(v)} className="cursor-pointer">
              <GlassCard className="hover:ring-2 hover:ring-primary/20 transition-all duration-300">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-accent/50 group-hover:bg-primary/10 transition-colors">
                      <Car className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">{v.plateNumber}</span>
                  </div>
                  <h3 className="text-lg font-bold truncate">{v.make} {v.model}</h3>
                  <p className="text-[11px] text-muted-foreground uppercase font-medium tracking-wide">{v.year} · {v.mileage.toLocaleString()} km</p>
                  <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{owner?.name?.[0]}</div>
                      <p className="text-[11px] text-muted-foreground font-medium">{owner?.name}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
                  </div>
                </motion.div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <AddVehicleModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <VehicleDetailsModal vehicle={selectedVehicle} open={!!selectedVehicle} onClose={() => setSelectedVehicle(null)} />
    </AppLayout>
  );
};

export default VehiclesPage;
