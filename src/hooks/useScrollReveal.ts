import { useEffect } from "react";

/* Everything that should animate when it scrolls into view.
   Add more class names here. The hero and the cards already wrapped in Reveal/FlyIn are left out. */
const SELECTOR = [
  ".news-head", ".news-featured", ".news-small",
  ".jobs-head", ".job-card", ".jobs-steps-title", ".job-step",
  ".store-head", ".store-tabs",
  ".page-content",
  ".footer-grid > *", ".footer-bottom",
].join(",");

export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);

          // direction: wide blocks rise, left-side items come from the left, right-side from the right
          const r = el.getBoundingClientRect();
          const vw = window.innerWidth;
          el.dataset.srDir = r.width > vw * 0.7 ? "up" : r.left + r.width / 2 < vw / 2 ? "left" : "right";

          // stagger items that share a row/list
          const idx = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
          el.style.setProperty("--sr-d", `${(idx % 4) * 80}ms`);

          el.classList.add("sr-in");
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (seen.has(el) || el.hasAttribute("data-no-sr")) return;
        seen.add(el);
        el.classList.add("sr");
        io.observe(el);
      });
    };

    // run now, and again whenever React renders new content (page changes, tab switches)
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    scan();
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}