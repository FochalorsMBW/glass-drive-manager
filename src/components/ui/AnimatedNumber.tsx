import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedNumber = React.memo(({ value, prefix = "", suffix = "", decimals = 0, className }: AnimatedNumberProps) => {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  
  // Use Intl.NumberFormat for better localization (thousands separators)
  const formatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  const display = useTransform(spring, (v) => `${prefix}${formatter.format(v)}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(`${prefix}${formatter.format(0)}${suffix}`);

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [value, spring, display]);

  return <motion.span ref={ref} className={className}>{text}</motion.span>;
});

