import { useEffect, useRef, useState } from "react";
import {
  Accessibility, X, Moon, Eye, Type, Link2, Pause, MousePointer2,
  RotateCcw, Minus, Plus,
} from "lucide-react";
import { links } from "../data/site";

const KEY = "hfq-a11y";

const toggles = [
  { key: "light", label: "Light Mode", icon: Moon },
  { key: "contrast", label: "High Contrast", icon: Eye },
  { key: "dyslexia", label: "Dyslexia-Friendly Font", icon: Type },
  { key: "links", label: "Highlight Links", icon: Link2 },
  { key: "pause", label: "Pause Animations", icon: Pause },
  { key: "cursor", label: "Bigger Cursor", icon: MousePointer2 },
] as const;

type Key = (typeof toggles)[number]["key"];
type Opts = Record<Key, boolean>;

const DEFAULTS: Opts = {
  light: false, contrast: false, dyslexia: false, links: false,
  pause: false, cursor: false,
};

function load(): { opts: Opts; size: number } {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw) {
      const opts = { ...DEFAULTS };
      (Object.keys(DEFAULTS) as Key[]).forEach((k) => { opts[k] = !!raw.opts?.[k]; });
      return { opts, size: raw.size || 100 };
    }
  } catch { /* ignore */ }
  return { opts: DEFAULTS, size: 100 };
}

export default function AccessibilityDock() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Opts>(() => load().opts);
  const [size, setSize] = useState<number>(() => load().size);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const close = () => {
    if (!open) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 160);
  };
  const toggle = () => {
    if (open && !closing) return close();
    window.clearTimeout(closeTimer.current);
    setClosing(false);
    setOpen(true);
  };

  // apply settings to the page + save them
  useEffect(() => {
    const root = document.documentElement;
    toggles.forEach(({ key }) => root.classList.toggle(`a11y-${key}`, opts[key]));
    root.style.fontSize = size === 100 ? "" : `${size}%`;
    try { localStorage.setItem(KEY, JSON.stringify({ opts, size })); } catch { /* ignore */ }
  }, [opts, size]);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) close();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const active = Object.values(opts).filter(Boolean).length + (size !== 100 ? 1 : 0);
  const reset = () => { setOpts(DEFAULTS); setSize(100); };

  return (
    <>
      <div className="a11y-dock" ref={boxRef}>
        {open && (
          <div className={`a11y-panel ${closing ? "is-closing" : ""}`} role="dialog" aria-label="Accessibility settings">
            <div className="a11y-head">
              <span className="a11y-head-icon"><Accessibility size={20} /></span>
              <div>
                <h2>Accessibility</h2>
                <p>{active} active</p>
              </div>
              <button className="a11y-x" onClick={close} aria-label="Close accessibility panel">
                <X size={18} />
              </button>
            </div>

            <div
              className="a11y-body"
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="a11y-size">
                <span>Text Size</span><b>{size}%</b>
              </div>
              <div className="a11y-size-btns">
                <button onClick={() => setSize((s) => Math.max(80, s - 10))} aria-label="Smaller text"><Minus size={14} /> A</button>
                <button onClick={() => setSize(100)} aria-label="Reset text size"><RotateCcw size={15} /></button>
                <button onClick={() => setSize((s) => Math.min(150, s + 10))} aria-label="Larger text"><Plus size={14} /> A</button>
              </div>

              <ul className="a11y-list">
                {toggles.map(({ key, label, icon: Icon }) => (
                  <li key={key} className={opts[key] ? "is-on" : ""}>
                    <span className="a11y-ico"><Icon size={17} /></span>
                    <span className="a11y-label">{label}</span>
                    <button
                      role="switch"
                      aria-checked={opts[key]}
                      aria-label={label}
                      className="a11y-switch"
                      onClick={() => setOpts((o) => ({ ...o, [key]: !o[key] }))}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <button className="a11y-reset" onClick={reset}>
              <RotateCcw size={16} /> Reset all settings
            </button>
          </div>
        )}

        <div className="a11y-btns">
          <a className="a11y-fab a11y-aurex" href={links.aurex} target="_blank" rel="noreferrer" aria-label="Go to aurex.lk">
            <img src="/images/aurex.png" alt="" />
            <span className="a11y-tip">aurex.lk</span>
          </a>
          <button
            className="a11y-fab a11y-toggle"
            onClick={toggle}
            aria-expanded={open}
            aria-label="Open accessibility settings"
          >
            <Accessibility size={24} />
            {active > 0 && <i className="a11y-dot">{active}</i>}
            <span className="a11y-tip">Accessibility</span>
          </button>
        </div>
      </div>
    </>
  );
}