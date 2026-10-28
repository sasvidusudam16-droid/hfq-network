import { useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "../ui/BackToTop";
import PixelWipe from "../ui/PixelWipe";

type LenisWindow = { lenis?: Lenis };

const pageVariants = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function Layout() {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -80 },
    });
    lenisRef.current = lenis;

    const extendedWindow = window as unknown as LenisWindow;
    extendedWindow.lenis = lenis;

    let id = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      delete extendedWindow.lenis;
    };
  }, []);

  // Jump to top while the screen is covered by the pixels
  const resetScroll = () => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  };

  return (
    <>
      <Navbar />

      <AnimatePresence mode="wait" onExitComplete={resetScroll}>
        <motion.main
          key={location.pathname}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <PixelWipe />
          <motion.div variants={pageVariants}>{outlet}</motion.div>
        </motion.main>
      </AnimatePresence>

      <Footer />
      <BackToTop />
    </>
  );
}