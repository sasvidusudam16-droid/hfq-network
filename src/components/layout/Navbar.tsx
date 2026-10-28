import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Gamepad2, Check } from "lucide-react";
import { links, navLinks, site } from "../../data/site";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import DiscordIcon from "../ui/DiscordIcon";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-shell ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner">
        {/* Left */}
        <NavLink to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <img src="/images/logo.png" alt="HFQ" className="nav-logo" />
          <span>
            HFQ <span className="nav-brand-accent">Network</span>
          </span>
        </NavLink>

        {/* Center */}
        <nav className="nav-pill">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right */}
        <div className="nav-right">
          <a
            href={links.discord}
            target="_blank"
            rel="noreferrer"
            className="nav-icon-btn"
            aria-label="Discord"
          >
            <DiscordIcon />
          </a>

          <button onClick={() => copy(site.ip)} className="nav-cta">
            {copied ? <Check size={16} /> : <Gamepad2 size={16} />}
            {copied ? "Copied" : "Copy IP"}
          </button>

          <button
            className="nav-burger"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="nav-mobile-links"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="nav-mobile" id="nav-mobile-links" aria-label="Mobile navigation">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
          <button onClick={() => copy(site.ip)} className="nav-cta">
            {copied ? <Check size={16} /> : <Gamepad2 size={16} />}
            {copied ? "Copied" : "Copy IP"}
          </button>
        </nav>
      )}
    </header>
  );
}
