import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency } from "@/lib/mock-data";
import { MessageSquare, CheckCircle2, AlertCircle, Clock, RefreshCcw, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NotificationsPage = () => {
  const { notifications, settings } = useAppStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const statusLabels: Record<string, string> = {
    sent: "Terkirim",
    failed: "Gagal",
    pending: "Menunggu"
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display tracking-tight">Log Notifikasi</h1>
        <p className="text-muted-foreground mt-1">Pantau status pengiriman pesan otomatis ke pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Riwayat Pesan
              </h2>
              <div className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-secondary/50 border border-border/30">
                {notifications.length} Total Log
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Waktu</th>
                    <th className="pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pelanggan</th>
                    <th className="pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</th>
                    <th className="pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pesan</th>
                    <th className="pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence mode="popLayout">
                    {notifications.length > 0 ? (
                      notifications.map((log) => (
                        <motion.tr 
                          key={log.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="border-b border-border/10 group hover:bg-secondary/20 transition-colors"
                        >
                          <td className="py-4 text-muted-foreground tabular-nums">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4 font-medium">{log.customerName}</td>
                          <td className="py-4 font-mono text-xs">{log.orderId}</td>
                          <td className="py-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(log.status)}
                              <span className={cn(
                                log.status === 'sent' ? "text-success" : 
                                log.status === 'failed' ? "text-destructive" : "text-warning"
                              )}>
                                {statusLabels[log.status]}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground truncate max-w-[200px]" title={decodeURIComponent(log.message)}>
                            {decodeURIComponent(log.message).substring(0, 40)}...
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => toast.info("Fitur kirim ulang akan segera hadir!")}
                              className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all shadow-sm"
                              title="Kirim Ulang"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-muted-foreground italic">
                          Belum ada log pengiriman pesan.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {!settings.waGatewayUrl && (
          <div className="p-6 rounded-2xl bg-warning/5 border border-warning/20 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-bold text-warning">Mode Manual Aktif</h3>
              <p className="text-sm text-warning/80 mt-1 leading-relaxed">
                Anda belum mengatur **WhatsApp Gateway**. Notifikasi akan masuk ke log ini sebagai "Menunggu" dan harus dikirim secara manual melalui tombol WhatsApp di Papan Layanan.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
