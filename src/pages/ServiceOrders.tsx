import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency, type ServiceOrder, type ServiceStatus, defaultSettings } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Wrench, CheckCircle2, CreditCard, X, ChevronRight, Download, MessageSquare, History, Search, MapPin, Phone, Calendar, User, AlertCircle, TrendingUp } from "lucide-react";
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

const generateWALink = (order: ServiceOrder) => {
  const phone = order.customer.phone.replace(/\D/g, '');
  const formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
  
  const message = `Halo ${order.customer.name}, ini dari UB Service.\n\n` +
    `Kendaraan Anda ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.plateNumber}) sudah selesai dikerjakan dan siap diambil.\n\n` +
    `Total tagihan: ${formatCurrency(order.totalAmount)}\n\n` +
    `Terima kasih!`;
    
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

const sendGatewayNotification = async (order: ServiceOrder, settings: any) => {
  if (!settings.waGatewayUrl) return false;

  const phone = order.customer.phone.replace(/\D/g, '');
  const formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;

  const message = `Halo ${order.customer.name}, ini dari UB Service.\n\n` +
    `Kendaraan Anda ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.plateNumber}) sudah selesai dikerjakan dan siap diambil.\n\n` +
    `Total tagihan: ${formatCurrency(order.totalAmount)}\n\n` +
    `Terima kasih!`;

  try {
    const response = await fetch(settings.waGatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.waApiKey}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message
      })
    });
    return response.ok;
  } catch (err) {
    console.error("WA Gateway Error:", err);
    return false;
  }
};

const OrderDetailsModal = ({ order, open, onClose }: { order: ServiceOrder | null; open: boolean; onClose: () => void }) => {
  const { serviceOrders, settings } = useAppStore();
  const [isDownloading, setIsDownloading] = useState(false);
  if (!order || !open) return null;

  const history = serviceOrders
    .filter(o => o.vehicleId === order.vehicleId && o.id !== order.id && o.status === 'paid')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{order.mechanic.name}</p>
                      {order.mechanic.completedJobs > 500 && (
                        <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter border border-primary/20">
                          MASTER
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase">{order.mechanic.specialization}</p>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                Riwayat Servis Kendaraan
              </h3>
              <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/30">
                {history.length > 0 ? (
                  history.slice(0, 3).map((prev, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background ring-2 ring-border/20" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(prev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs font-medium line-clamp-1">{prev.description}</p>
                      <p className="text-[10px] text-primary/70 font-mono">{formatCurrency(prev.totalAmount)}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center bg-secondary/10 rounded-xl border border-dashed border-border/40">
                    <History className="w-5 h-5 text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] text-muted-foreground">Belum ada riwayat servis sebelumnya</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-secondary/20 rounded-xl border border-border/30 overflow-hidden">
              <div className="px-4 py-2 border-b border-border/20 bg-secondary/30 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Checklist Mekanik</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">Standar</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6">
                {[
                  { key: 'engineOil', label: 'Oli Mesin' },
                  { key: 'brakes', label: 'Sistem Rem' },
                  { key: 'tires', label: 'Kondisi Ban' },
                  { key: 'battery', label: 'Aki & Tegangan' },
                  { key: 'lights', label: 'Lampu & Sinyal' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={order.checklist?.[item.key as keyof typeof order.checklist] || false}
                      onChange={(e) => {
                        const newChecklist = { 
                          engineOil: false, brakes: false, tires: false, battery: false, lights: false,
                          ...(order.checklist || {}),
                          [item.key]: e.target.checked 
                        };
                        useAppStore.getState().updateServiceChecklist(order.id, newChecklist);
                      }}
                      className="w-4 h-4 rounded border-border/50 bg-secondary/50 text-primary focus:ring-primary/20"
                    />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ringkasan Biaya</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} x{item.qty}</span>
                    <span className="font-mono">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Jasa</span>
                  <span className="font-mono">{formatCurrency(order.laborCost)}</span>
                </div>
                <div className="flex justify-between font-bold pt-3 border-t border-border/30">
                  <span>Total Tagihan</span>
                  <span className="text-primary font-mono">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-2 pt-4">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-bold border border-border/50 hover:bg-secondary/80 transition-snappy"
              >
                <Download className="w-4 h-4" />
                Cetak Invoice
              </button>
              {order.status !== 'paid' && (
                <div className="flex flex-col gap-2">
                  <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-snappy">
                    Cetak Struk POS
                  </button>
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      const { settings } = useAppStore.getState();
                      if (settings.waGatewayUrl) {
                        toast.loading("Mengirim pesan otomatis...");
                        const success = await sendGatewayNotification(order, settings);
                        toast.dismiss();
                        if (success) {
                          toast.success("Pesan otomatis terkirim melalui Gateway!");
                          return;
                        } else {
                          toast.error("Gateway gagal, beralih ke manual...");
                        }
                      }
                      window.open(generateWALink(order), '_blank');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-success/15 text-success text-sm font-bold border border-success/20 hover:bg-success/25 transition-snappy"
                  >
                    <MessageSquare className="w-4 h-4" /> Kirim Notifikasi WA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* professional A4 Print Layout */}
        <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[9999] font-sans">
          <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-primary">
            <div className="flex items-center gap-6">
              {settings.workshopLogo ? (
                <img src={settings.workshopLogo} className="w-16 h-16 rounded-xl object-contain" alt="Logo" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl">
                  {settings.workshopName?.charAt(0) || 'UB'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-display font-black text-primary tracking-tighter uppercase">{settings.workshopName || 'Bengkel UB'}</h1>
                <p className="text-xs text-gray-500 mt-1 max-w-[250px]">{settings.workshopAddress}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{settings.workshopPhone}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-display font-black text-gray-200 uppercase tracking-tighter">Invoice</h2>
              <p className="font-mono text-sm mt-2 font-bold">#{order.id}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mb-12">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Informasi Pelanggan</p>
              <p className="font-black text-lg">{order.customer.name}</p>
              <p className="text-sm text-gray-600 mt-1">{order.customer.phone}</p>
              <p className="text-xs text-gray-500 mt-2">{order.customer.address}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Detail Kendaraan</p>
              <p className="font-black text-lg">{order.vehicle.make} {order.vehicle.model}</p>
              <p className="text-sm font-mono font-bold mt-1 text-primary">{order.vehicle.plateNumber}</p>
              <p className="text-xs text-gray-600 mt-2 italic">Mekanik: {order.mechanic.name}</p>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="text-left py-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Deskripsi Layanan & Suku Cadang</th>
                <th className="text-center py-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Qty</th>
                <th className="text-right py-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Harga Satuan</th>
                <th className="text-right py-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100/50">
                <td className="py-4">
                  <p className="font-bold text-sm">Biaya Jasa Mekanik</p>
                  <p className="text-xs text-gray-500 italic mt-0.5">{order.description}</p>
                </td>
                <td className="py-4 text-center text-sm font-mono">1</td>
                <td className="py-4 text-right text-sm font-mono">{formatCurrency(order.laborCost)}</td>
                <td className="py-4 text-right text-sm font-mono font-bold">{formatCurrency(order.laborCost)}</td>
              </tr>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100/50">
                  <td className="py-4 text-sm font-bold">{item.name}</td>
                  <td className="py-4 text-center text-sm font-mono">{item.qty}</td>
                  <td className="py-4 text-right text-sm font-mono">{formatCurrency(item.price)}</td>
                  <td className="py-4 text-right text-sm font-mono font-bold">{formatCurrency(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-start">
            <div className="max-w-[400px]">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Syarat & Ketentuan</p>
              <div className="text-[10px] text-gray-500 whitespace-pre-line leading-relaxed italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                {settings.invoiceTerms || (typeof defaultSettings !== 'undefined' ? defaultSettings.invoiceTerms : '')}
              </div>
              <div className="mt-8 flex gap-12">
                <div className="text-center">
                  <div className="w-32 h-16 border-b border-gray-300 mb-2"></div>
                  <p className="text-[9px] uppercase font-bold text-gray-400">Pelanggan</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-16 border-b border-gray-300 mb-2"></div>
                  <p className="text-[9px] uppercase font-bold text-gray-400">Manajemen Bengkel</p>
                </div>
              </div>
            </div>
            
            <div className="w-64">
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pajak (PPN 0%)</span>
                  <span className="font-mono">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-primary">
                  <span className="font-black uppercase text-sm tracking-tighter">Total Akhir</span>
                  <span className="text-2xl font-display font-black text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary text-white text-center rounded-xl font-black text-[10px] uppercase tracking-widest">
                Lunas - Terima Kasih!
              </div>
            </div>
          </div>

          <div className="fixed bottom-12 left-12 right-12 text-center text-[8px] text-gray-300 uppercase tracking-widest font-black">
            Generated by {settings.workshopName || 'UB Service'} Management System · Smart & Fast
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const NewOrderModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { vehicles, mechanics, customers, addServiceOrder, servicePackages } = useAppStore();
  const [vehicleId, setVehicleId] = useState("");
  const [mechanicId, setMechanicId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [description, setDescription] = useState("");
  const [laborCost, setLaborCost] = useState(0);

  const handlePackageChange = (id: string) => {
    setPackageId(id);
    const pkg = servicePackages.find(p => p.id === id);
    if (pkg) {
      setDescription(pkg.description);
      setLaborCost(pkg.laborCost);
    } else {
      setDescription("");
      setLaborCost(0);
    }
  };

  const handleSubmit = () => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const mechanic = mechanics.find(m => m.id === mechanicId);

    if (!vehicle || !mechanic || !description) {
      toast.error("Mohon lengkapi data pesanan");
      return;
    }

    const pkg = servicePackages.find(p => p.id === packageId);
    
    const newOrder: ServiceOrder = {
      id: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "queued",
      vehicleId: vehicle.id,
      vehicle,
      customer: customers.find(c => c.id === vehicle.customerId)!,
      mechanicId: mechanic.id,
      mechanic,
      description,
      laborCost,
      totalAmount: laborCost + (pkg?.items.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0),
      createdAt: new Date().toISOString(),
      items: pkg ? pkg.items : [],
      notes: "",
      packageId: packageId || undefined
    };

    addServiceOrder(newOrder);
    toast.success("Pesanan layanan berhasil dibuat!");
    onClose();
    setVehicleId(""); setMechanicId(""); setPackageId(""); setDescription(""); setLaborCost(0);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Pilih Kendaraan</label>
              <select 
                value={vehicleId} 
                onChange={e => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="">-- Pilih --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber} — {v.make}</option>
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
                <option value="">-- Pilih --</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-1.5 block">Pilih Paket Servis (Opsional)</label>
            <select 
              value={packageId} 
              onChange={e => handlePackageChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236366f1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right:12px_center] bg-no-repeat pr-10"
            >
              <option value="">-- Custom (Tanpa Paket) --</option>
              {servicePackages.map(p => (
                <option key={p.id} value={p.id}>{p.name} — Rp {p.totalPrice.toLocaleString()}</option>
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

        // Automated Notification Trigger
        if (next === 'completed') {
          const { settings, addNotificationLog } = useAppStore.getState();
          
          const triggerNotification = async () => {
            if (settings.waGatewayUrl) {
              const success = await sendGatewayNotification(order, settings);
              addNotificationLog({
                id: Math.random().toString(36).substr(2, 9),
                orderId: order.id,
                customerName: order.customer.name,
                type: 'status_update',
                status: success ? 'sent' : 'failed',
                message: generateWALink(order).split('text=')[1], // Simple way to get the message
                timestamp: new Date().toISOString()
              });
              
              if (success) {
                toast.success("Notifikasi otomatis terkirim!");
              } else {
                toast.error("Gagal mengirim notifikasi otomatis.");
              }
            } else {
              // Log as pending if no gateway but manually notified
              addNotificationLog({
                id: Math.random().toString(36).substr(2, 9),
                orderId: order.id,
                customerName: order.customer.name,
                type: 'status_update',
                status: 'pending',
                message: "Butuh pengiriman manual (Gateway tidak aktif)",
                timestamp: new Date().toISOString()
              });
            }
          };
          
          triggerNotification();
        }
      }
    };

    const { notifications } = useAppStore();
    const orderNotification = notifications.find(n => n.orderId === order.id);
  
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors">{order.id}</span>
            {orderNotification && (
              <div 
                className={cn(
                  "w-2 h-2 rounded-full",
                  orderNotification.status === 'sent' ? "bg-success" : 
                  orderNotification.status === 'failed' ? "bg-destructive" : "bg-warning"
                )} 
                title={`Status WA: ${orderNotification.status}`}
              />
            )}
          </div>
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
          <div className="flex gap-2">
            <button
              onClick={handleNextStatus}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-snappy"
            >
              {statusFlowLabels[order.status]} <ChevronRight className="w-3 h-3" />
            </button>
            {order.status === 'completed' && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const { settings } = useAppStore.getState();
                  if (settings.waGatewayUrl) {
                    toast.loading("Gowa: Mengirim...");
                    const success = await sendGatewayNotification(order, settings);
                    toast.dismiss();
                    if (success) {
                      toast.success("Terkirim otomatis!");
                      return;
                    }
                  }
                  window.open(generateWALink(order), '_blank');
                }}
                className="w-10 flex items-center justify-center rounded bg-success/10 text-success hover:bg-success/20 transition-snappy"
                title="Kirim Notifikasi WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
          </div>
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
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-glass-inner bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-snappy"
        >
          <Plus className="w-4 h-4" /> Layanan Baru
        </button>
      </div>

      {/* FAB Mobile */}
      <button
        onClick={() => setShowNewModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all outline-none ring-4 ring-background"
      >
        <Plus className="w-7 h-7" />
      </button>

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
