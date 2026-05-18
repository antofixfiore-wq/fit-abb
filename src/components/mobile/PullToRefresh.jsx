import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function PullToRefresh({ onRefresh, children, threshold = 100 }) {
  const [refreshing, setRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const scale = useTransform(y, [0, threshold], [0.8, 1]);
  const contentRef = useRef(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (contentRef.current && contentRef.current.scrollTop === 0) {
        isPulling.current = true;
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      if (diff > 0) {
        e.preventDefault();
        y.set(diff * 0.5);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      const currentValue = y.get();
      
      if (currentValue >= threshold) {
        setRefreshing(true);
        await onRefresh();
        animate(y, [currentValue, 0], { duration: 0.3 });
      } else {
        animate(y, [currentValue, 0], { duration: 0.2 });
      }
      
      setRefreshing(false);
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      container.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [y, onRefresh, threshold]);

  return (
    <div ref={contentRef} className="h-full overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, scale, y: useTransform(y, v => v - 60) }}
        className="flex items-center justify-center h-0"
      >
        {refreshing ? (
          <div className="w-6 h-6 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-6 h-6 text-[#E8FF00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        )}
      </motion.div>
      
      {/* Content */}
      {children}
    </div>
  );
}