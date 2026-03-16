import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency, type ServiceOrder, type ServiceStatus } from "@/lib/mock-data";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Wrench, CheckCircle2, CreditCard, X, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const columns: { status: ServiceStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: "queued", label: "Antrean", icon: Clock, color: "text-warning" },
  { status: "in_progress", label: "Diproses", icon: Wrench, color: "text-info" },
  { status: "completed", label: "Selesai", icon: CheckCircle2, color: "text-success" },
  { status: "paid", label: "Lunas", icon: CreditCard, color: "text-muted-foreground" },
];

const statusFlowLabels: Record<ServiceStatus, string | null> = {
  queued: "Proses →",
  in_progress: "Selesai →",
  completed: "Lunas →",
  paid: null
};

const OrderDetailsModal = ({ order, open, onClose }: { order: ServiceOrder | null; open: boolean; onClose: () => void }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  if (!order || !open) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Menghasilkan Invoice PDF...',
        success: 'Invoice berhasil diunduh ke folder Downloads!',
        error: 'Gagal mengunduh invoice.',
      }
    );
    setTimeout(() => setIsDownloading(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/30 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display">Detail Pesanan {order.id}</h2>
              <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                Informasi Kendaraan
              </h3>
              <div className="space-y-2 p-4 rounded-xl bg-secondary/20 border border-border/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plat Nomor</span>
                  <span className="font-mono font-bold uppercase text-primary">{order.vehicle.plateNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Merk/Model</span>
                  <span className="font-medium">{order.vehicle.make} {order.vehicle.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kilometer</span>
                  <span className="font-mono">{order.vehicle.mileage.toLocaleString()} KM</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Deskripsi & Mekanik</h3>
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-secondary-foreground">{order.description}</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {order.mechanic.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.mechanic.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{order.mechanic.specialization}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Rincian Biaya</h3>
              <div className="space-y-3 p-4 rounded-xl bg-secondary/10 border border-border/10">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Jasa</span>
                  <span className="font-mono">{formatCurrency(order.laborCost)}</span>
                </div>
                <div className="flex justify-between text-sm pb-2 border-b border-border/20">
                  <span className="text-muted-foreground">Layanan Tambahan</span>
                  <span className="font-mono text-success">Dilengkapi di POS</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Total Tagihan</span>
                  <span className="text-primary font-mono">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-2 pt-4">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-bold border border-border/50 hover:bg-secondary/80 transition-snappy disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Menyiapkan..." : "Unduh Invoice"}
              </button>
              {order.status !== 'paid' && (
                <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-snappy">
                  Cetak Struk POS
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const NewOrderModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { vehicles, mechanics, addServiceOrder } = useAppStore();
  const [vehicleId, setVehicleId] = useState("");
  const [mechanicId, setMechanicId] = useState("");
  const [description, setDescription] = useState("");
  const [laborCost, setLaborCost] = useState(200000);

  const handleSubmit = () => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const mechanic = mechanics.find(m => m.id === mechanicId);

    if (!vehicle || !mechanic || !description) {
      toast.error("Mohon lengkapi data pesanan");
      return;
    }

    const newOrder: ServiceOrder = {
      id: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "queued",
      vehicle,
      mechanic,
      description,
      laborCost,
      totalAmount: laborCost, // Initially just labor, parts added later in POS
      createdAt: new Date().toISOString(),
      items: []
    };

    addServiceOrder(newOrder);
    toast.success("Pesanan layanan berhasil dibuat!");
    onClose();
    setVehicleId(""); setMechanicId(""); setDescription("");
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
          <h2 className="text-xl font-display">Layanan Baru</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent transition-snappy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Pilih Kendaraan</label>
            <select 
              value={vehicleId} 
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">-- Pilih Kendaraan Pelanggan --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Pilih Mekanik</label>
            <select 
              value={mechanicId} 
              onChange={e => setMechanicId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">-- Pilih Mekanik Bertugas --</option>
              {mechanics.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Keluhan / Deskripsi Layanan</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: Ganti oli mesin dan cek kampas rem depan"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Estimasi Biaya Jasa (Rp)</label>
            <input 
              type="number" 
              value={laborCost} 
              onChange={e => setLaborCost(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-snappy">
            Batal
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy">
            Buat Pesanan
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ServiceOrdersPage = () => {
  const { serviceOrders: orders } = useAppStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const OrderCard = ({ order }: { order: ServiceOrder }) => {
    const { updateServiceOrderStatus } = useAppStore();
  
    const handleNextStatus = (e: React.MouseEvent) => {
      e.stopPropagation();
      const statusFlow: Record<ServiceStatus, ServiceStatus | null> = {
        queued: "in_progress",
        in_progress: "completed",
        completed: "paid",
        paid: null,
      };
      const next = statusFlow[order.status];
      if (next) {
        updateServiceOrderStatus(order.id, next);
        toast.success(`${order.id} dipindahkan ke ${columns.find(c => c.status === next)?.label}`);
      }
    };
  
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={() => setSelectedOrder(order)}
        className="p-4 rounded-glass-inner bg-secondary/30 hover:bg-secondary/50 transition-snappy border border-border/30 group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors">{order.id}</span>
          <span className="text-xs font-mono font-medium">{formatCurrency(order.totalAmount)}</span>
        </div>
        <p className="text-sm font-medium mb-1">{order.vehicle.make} {order.vehicle.model}</p>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{order.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
              {order.mechanic.avatar}
            </div>
            <span className="text-xs text-muted-foreground">{order.mechanic.name}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{order.vehicle.plateNumber}</span>
        </div>
        {statusFlowLabels[order.status] && (
          <button
            onClick={handleNextStatus}
            className="w-full flex items-center justify-center gap-1 py-1.5 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-snappy"
          >
            {statusFlowLabels[order.status]} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display tracking-tight">Papan Layanan</h1>
          <p className="text-muted-foreground mt-1">Status langsung dari semua pesanan layanan.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-glass-inner bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
        >
          <Plus className="w-4 h-4" /> Layanan Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(({ status, label, icon: Icon, color }) => {
          const colOrders = orders.filter(o => o.status === status);
          const bgClassName = {
            queued: "bg-warning/5",
            in_progress: "bg-info/5",
            completed: "bg-success/5",
            paid: "bg-muted/30",
          }[status];

          return (
            <div key={status} className={cn("flex flex-col rounded-glass p-3 h-full min-h-[500px]", bgClassName)}>
              <div className="flex items-center gap-2 mb-4 px-2">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="text-sm font-semibold tracking-tight">{label}</span>
                <span className="ml-auto text-xs font-mono text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-full">{colOrders.length}</span>
              </div>
              <div className="space-y-3 flex-1">
                <AnimatePresence mode="popLayout">
                  {colOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
                {colOrders.length === 0 && (
                  <div className="py-12 px-4 text-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-glass-inner bg-background/20">
                    Tidak ada pesanan di {label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NewOrderModal open={showNewModal} onClose={() => setShowNewModal(false)} />
      <OrderDetailsModal order={selectedOrder} open={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
    </AppLayout>
  );
};

export default ServiceOrdersPage;
