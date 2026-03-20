import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/hooks/useAppStore";
import { Building2, MapPin, Percent, CircleDollarSign, Save, Globe, Key, Phone, Download, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const SettingsPage = () => {
  const { settings, updateSettings } = useAppStore();

  const handleSave = () => {
    toast.success("Pengaturan bengkel berhasil diperbarui!");
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
              <div className="flex items-center gap-6 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-xl shadow-primary/10 overflow-hidden relative group">
                  {settings.workshopLogo ? (
                    <img src={settings.workshopLogo} alt={settings.workshopName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="uppercase">{settings.workshopName?.split(' ').map(n => n[0]).join('')}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Plus className="w-6 h-6 text-white" />
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

              <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  <strong>Info:</strong> Kosongkan field di atas jika Anda ingin tetap menggunakan <strong>WhatsApp Web (wa.me)</strong> secara manual. Jika diisi, sistem akan mencoba mengirim pesan di latar belakang.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-snappy shadow-lg shadow-primary/20"
          >
            <Save className="w-5 h-5" /> Simpan Perubahan
          </motion.button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
