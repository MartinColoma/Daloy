import { useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav         from "../components/layout/BottomNav";
import FAB               from "../components/layout/FAB";
import BottomSheet       from "../components/layout/BottomSheet";
import QuickActionsSheet from "../components/layout/QuickActionsSheet";
import { useLayout }     from "./LayoutContext";
import ModalManager      from "../components/modals/ModalManager";

const SWIPE_PAGES = ["/home", "/wallet", "/history", "/profile"];
const SWIPE_THRESHOLD = 60;

export default function MobileLayout() {
  const { quickActionsOpen, closeQuickActions } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = SWIPE_PAGES.indexOf(location.pathname);
  const directionRef = useRef(0); // +1 = going forward, -1 = going back
  const [dragX, setDragX] = useState(0);
  const isDragging = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lockedAxis = useRef<"horizontal" | "vertical" | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    lockedAxis.current = null;
    isDragging.current = false;
    setDragX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const target = e.target as HTMLElement;
    if (target.closest("[data-no-swipe]")) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Lock axis on first significant movement
    if (!lockedAxis.current && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
      lockedAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    if (lockedAxis.current !== "horizontal") return;

    // Rubber-band at edges
    const atStart = currentIndex === 0 && deltaX > 0;
    const atEnd = currentIndex === SWIPE_PAGES.length - 1 && deltaX < 0;
    const resistance = atStart || atEnd ? 0.18 : 1;

    isDragging.current = true;
    setDragX(deltaX * resistance);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      setDragX(0);
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    if (deltaX < -SWIPE_THRESHOLD && currentIndex < SWIPE_PAGES.length - 1) {
      directionRef.current = 1;
      navigate(SWIPE_PAGES[currentIndex + 1]);
    } else if (deltaX > SWIPE_THRESHOLD && currentIndex > 0) {
      directionRef.current = -1;
      navigate(SWIPE_PAGES[currentIndex - 1]);
    }

    setDragX(0);
    isDragging.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    lockedAxis.current = null;
  };

  return (
    <div
      className="flex flex-col h-dvh overflow-hidden"
      style={{ background: "var(--bg)" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={directionRef.current}>
          <motion.div
            key={location.pathname}
            custom={directionRef.current}
            initial={{ x: `${directionRef.current * 100}%`, opacity: 0.6 }}
            animate={{
              x: dragX,
              opacity: 1,
              transition: isDragging.current
                ? { type: "tween", duration: 0 }
                : { type: "spring", stiffness: 380, damping: 36, mass: 0.8 },
            }}
            exit={{
              x: `${directionRef.current * -100}%`,
              opacity: 0.6,
              transition: { type: "spring", stiffness: 380, damping: 36, mass: 0.8 },
            }}
            className="absolute inset-0 overflow-y-auto px-4 pt-5 pb-4"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="relative shrink-0">
        <FAB />
        <BottomNav />
      </div>

      <ModalManager />

      <BottomSheet isOpen={quickActionsOpen} onClose={closeQuickActions}>
        <QuickActionsSheet />
      </BottomSheet>
    </div>
  );
}