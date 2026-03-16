import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

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

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    
    // Check for View Transitions API support
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Mark direction for CSS
    if (isDark) {
      document.documentElement.dataset.themeTransition = "back";
    } else {
      document.documentElement.dataset.themeTransition = "forward";
    }

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    // Cleanup after transition
    transition.finished.finally(() => {
      // Small delay to ensure pseudo-elements are cleared before selectors change
      setTimeout(() => {
        delete document.documentElement.dataset.themeTransition;
      }, 500);
    });
  };

  return (
    <div 
      className="flex items-center gap-2 p-1.5 rounded-full bg-secondary/50 border border-border/50 cursor-pointer relative w-[72px] h-9"
      onClick={toggleTheme}
    >
      <motion.div
        className="absolute top-1 bottom-1 w-8 rounded-full bg-background shadow-sm border border-border/30 z-10"
        initial={false}
        animate={{
          left: isDark ? "36px" : "4px",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      <div className="flex-1 flex justify-center items-center z-20">
        <Sun className={`w-3.5 h-3.5 transition-colors ${!isDark ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 flex justify-center items-center z-20">
        <Moon className={`w-3.5 h-3.5 transition-colors ${isDark ? "text-primary" : "text-muted-foreground"}`} />
      </div>
    </div>
  );
};
