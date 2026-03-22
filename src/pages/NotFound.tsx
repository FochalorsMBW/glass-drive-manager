import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-32 h-32 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto shadow-2xl shadow-primary/10"
          >
            <span className="text-6xl font-display font-black text-primary/30 tracking-tighter">404</span>
          </motion.div>
        </div>

        <h1 className="text-3xl font-display font-bold tracking-tight mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Maaf, alamat <code className="px-2 py-0.5 rounded-lg bg-secondary text-xs font-mono font-bold">{location.pathname}</code> tidak tersedia di sistem ini.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-8">Pastikan URL sudah benar atau kembali ke beranda.</p>

        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-bold border border-border/50 hover:bg-secondary/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Home className="w-4 h-4" /> Beranda
          </button>
        </div>

        <p className="mt-12 text-[10px] text-muted-foreground/30 uppercase tracking-widest font-bold">
          UB Service Management System
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
