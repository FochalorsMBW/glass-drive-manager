import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Building2, MapPin, Percent, CircleDollarSign, Save, Globe, Key, Phone, Download, Plus, Upload, HardDrive, Trash2, Archive } from "lucide-react";
import { exportCSV } from "@/lib/exportCSV";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const SettingsPage = () => {
  const { settings, updateSettings, resetData, loadBackup, pruneArchivedData } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingBackupData, setPendingBackupData] = useState<any>(null);

  const handleSave = () => {
    toast.success("Pengaturan bengkel berhasil diperbarui!");
  };

  const handleBackup = () => {
    const data = localStorage.getItem('workshop-storage');
    if (!data) { toast.error('Tidak ada data untuk di-backup'); return; }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${settings.workshopName || 'UB-Service'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup berhasil diunduh!');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const stateData = parsed.state || parsed;
        if (!stateData.serviceOrders && !stateData.customers) {
          toast.error('File backup tidak valid');
          return;
        }
        if (stateData) {
          setPendingBackupData(stateData);
          setShowRestoreConfirm(true);
        }
      } catch {
        toast.error('File backup tidak valid atau rusak');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola identitas dan konfigurasi operasional Bengkel UB</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Identitas Bengkel
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6 mb-6 p-5 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-md">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-xl shadow-primary/20 overflow-hidden relative group border border-white/10">
                  {settings.workshopLogo ? (
                    <img src={settings.workshopLogo} alt={settings.workshopName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="uppercase">{settings.workshopName?.split(' ').map(n => n[0]).join('')}</span>
                  )}
                  <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Plus className="w-6 h-6 text-white scale-75 group-hover:scale-100 transition-transform" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold">Logo Bengkel</h3>
                  <p className="text-xs text-muted-foreground mt-1">Logo akan muncul di sidebar, header, dan struk fisik.</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Nama Bengkel</label>
                <input 
                  value={settings.workshopName} 
                  onChange={e => updateSettings({ workshopName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Alamat Lengkap</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea 
                    value={settings.workshopAddress} 
                    onChange={e => updateSettings({ workshopAddress: e.target.value })}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    value={settings.workshopPhone} 
                    onChange={e => updateSettings({ workshopPhone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" /> Format Invoice & Dokumen
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Syarat & Ketentuan (T&C)</label>
                <textarea 
                  value={settings.invoiceTerms} 
                  onChange={e => updateSettings({ invoiceTerms: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono"
                  placeholder="Masukkan persyaratan garansi, pengembalian barang, dll."
                />
                <p className="text-[10px] text-muted-foreground mt-2 italic">Teks ini akan muncul di bagian bawah Invoice A4 fisik.</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" /> Finansial & Pajak
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Mata Uang</label>
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    value={settings.currency} 
                    onChange={e => updateSettings({ currency: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Pajak (PPN %)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="number"
                    value={settings.taxRate} 
                    onChange={e => updateSettings({ taxRate: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-muted-foreground mb-1.5 block">Komisi Mekanik (%)</label>
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="number"
                    value={settings.commissionRate} 
                    onChange={e => updateSettings({ commissionRate: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic px-1">Persentase dari biaya jasa yang akan dihitung sebagai pendapatan mekanik.</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-success" /> Integrasi WhatsApp Gateway
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Endpoint URL Gateway</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    placeholder="https://api.gateway.com/send"
                    value={settings.waGatewayUrl || ""} 
                    onChange={e => updateSettings({ waGatewayUrl: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">API Key / Token</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="password"
                    placeholder="Masukkan token API..."
                    value={settings.waApiKey || ""} 
                    onChange={e => updateSettings({ waApiKey: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic px-1">Token ini digunakan untuk otorisasi pengiriman pesan ke server gateway.</p>
              </div>

              <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  <strong>Info:</strong> Kosongkan field di atas jika Anda ingin tetap menggunakan <strong>WhatsApp Web (wa.me)</strong> secara manual. Jika diisi, sistem akan mencoba mengirim pesan di latar belakang.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" /> Backup & Restore Data
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Data disimpan di browser. Gunakan fitur backup untuk menjaga keamanan data Anda.</p>
            <div className="flex gap-3">
              <button onClick={handleBackup} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-success/10 text-success font-bold border border-success/20 hover:bg-success/20 transition-all">
                <Download className="w-4 h-4" /> Download Backup
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-info/10 text-info font-bold border border-info/20 hover:bg-info/20 transition-all">
                <Upload className="w-4 h-4" /> Restore dari File
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Archive className="w-5 h-5 text-warning" /> Archiving & Pruning (Performa)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Pemangkasan data historis (&gt; 1 tahun) sangat disarankan untuk menjaga antarmuka tetap instan dan anti-lag. Data akan diekspor mandiri ke CSV sebelum dihapus dari memori aktif.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowArchiveConfirm(true)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-warning/10 text-warning font-bold border border-warning/20 hover:bg-warning hover:text-white transition-all shadow-lg shadow-warning/5">
                <Archive className="w-4 h-4" /> Arsipkan Data Lama (&gt; 1 Tahun)
              </button>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-border/30">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              <Save className="w-5 h-5" /> Simpan Perubahan
            </motion.button>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 hover:bg-destructive hover:text-white transition-all shadow-lg shadow-destructive/5"
            >
              <Trash2 className="w-4 h-4" /> Hapus Semua Data
            </button>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" />

      <ConfirmDialog
        open={showRestoreConfirm}
        onClose={() => { setShowRestoreConfirm(false); setPendingBackupData(null); }}
        onConfirm={() => {
          if (pendingBackupData) {
            loadBackup(pendingBackupData);
            toast.success('Data berhasil dipulihkan dari backup!');
            setShowRestoreConfirm(false);
            setPendingBackupData(null);
          }
        }}
        title="Pulihkan Data Backup"
        message="Semua data (pelanggan, transaksi, stok) saat ini akan diganti dengan data dari file backup. Lanjutkan?"
        confirmText="Ya, Pulihkan"
        variant="warning"
      />

      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetData();
          toast.success("Semua data berhasil dibersihkan");
          setShowResetConfirm(false);
        }}
        title="Reset Seluruh Data"
        message="Tindakan ini akan menghapus seluruh data transaksi, pelanggan, dan riwayat secara PERMANEN. Anda tidak dapat membatalkan ini."
        confirmText="Ya, Hapus Semua"
        variant="danger"
      />

      <ConfirmDialog
        open={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={() => {
          // Calculate date 1 year ago
          const cutoffDate = new Date();
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          
          const { archivedOrders, archivedTransactions } = pruneArchivedData(cutoffDate);
          
          if (archivedOrders.length === 0 && archivedTransactions.length === 0) {
            toast.error("Tidak ada data usang (> 1 Tahun) yang perlu diarsipkan.");
            setShowArchiveConfirm(false);
            return;
          }

          // Export Orders
          if (archivedOrders.length > 0) {
            exportCSV('arsip_service_orders', ['ID', 'Tanggal', 'Pelanggan', 'Kendaraan', 'Total'],
              archivedOrders.map(o => [o.id, new Date(o.createdAt).toISOString().split('T')[0], o.customer.name, `${o.vehicle.make} ${o.vehicle.model}`, o.totalAmount])
            );
          }
          // Export Transactions
          if (archivedTransactions.length > 0) {
            exportCSV('arsip_transaksi_kasir', ['ID', 'Tanggal', 'Metode', 'Total'],
              archivedTransactions.map(t => [t.id, new Date(t.date).toISOString().split('T')[0], t.method, t.total])
            );
          }

          toast.success(`${archivedOrders.length + archivedTransactions.length} baris data historis berhasil diarsipkan & dihapus dari DB Aktif.`);
          setShowArchiveConfirm(false);
        }}
        title="Arsip Kinerja Data"
        message="Ini akan mendeteksi seluruh transaksi Keuangan & Servis yang melebihi usia 1 Tahun. Data tersebut akan otomatis didownload sebagai CSV dan dihapus dari RAM aktif. Lanjutkan?"
        confirmText="Ya, Arsipkan Sekarang"
        variant="warning"
      />
    </AppLayout>
  );
};

export default SettingsPage;
