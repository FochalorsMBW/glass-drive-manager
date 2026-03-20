import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-secondary/50 border border-border/50" />;
  }

  const isDark = theme === "dark";

  const toggleTheme = (e: React.MouseEvent) => {
    const nextTheme = isDark ? "light" : "dark";
    
    // Check for View Transitions API support
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Calculate position for circular expansion
    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty("--transition-x", `${x}px`);
    document.documentElement.style.setProperty("--transition-y", `${y}px`);

    // Mark direction for CSS
    if (isDark) {
      document.documentElement.dataset.themeTransition = "back";
    } else {
      document.documentElement.dataset.themeTransition = "forward";
    }

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.finished.finally(() => {
      // Small delay to ensure pseudo-elements are cleared
      setTimeout(() => {
        delete document.documentElement.dataset.themeTransition;
      }, 300);
    });
  };

  return (
    <button 
      onClick={(e) => toggleTheme(e)}
      className="p-2 rounded-xl hover:bg-accent transition-all duration-300 flex items-center justify-center shrink-0 border border-border/30 bg-secondary/30 w-10 h-10 overflow-hidden relative group"
      title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {isDark ? (
            <Sun className="w-[18px] h-[18px] text-warning" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-primary" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};
