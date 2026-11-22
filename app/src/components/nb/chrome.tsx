import { useEffect, useState, type FormEvent } from "react";
import { EMAIL, PHONE_MAIN, PHONE_SECOND, SOCIAL, waLink } from "../../data/site";
import { Cta, useEnquiry } from "./enquiry";
import { ArrowRight, ArrowUp, ArrowUpRight, Facebook, Instagram, Pinterest, WhatsApp } from "./icons";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <a href="/" className={`logo ${size}`} aria-label="Nobbie's Gallery home">
      <span className="logo-sq">
        <img src="/assets/brand/logo-sq.webp" alt="Nobbie's Gallery logo" width={900} height={900} />
      </span>
      <span>
        Nobbie's <em>Gallery</em>
      </span>
    </a>
  );
}

const LINKS = [
  { l: "Work", h: "/#work" },
  { l: "Services", h: "/#services" },
  { l: "About", h: "/#about" },
  { l: "Contact", h: "/#contact" },
];

/** Mobile menu, in the order the sections appear on the page. */
const MENU = [
  { l: "Home", h: "/#top" },
  { l: "About", h: "/#about" },
  { l: "Services", h: "/#services" },
  { l: "Work", h: "/#work" },
  { l: "Highlights", h: "/#results" },
  { l: "Process", h: "/#process" },
  { l: "Pricing", h: "/#pricing" },
  { l: "FAQ", h: "/#faq" },
  { l: "Reviews", h: "/#reviews" },
  { l: "Contact", h: "/#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}${menu ? " menu-open" : ""}`}>
        <div className="c nav-in">
          <Logo />
          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((x) => (
              <a key={x.l} href={x.h}>
                {x.l}
              </a>
            ))}
          </nav>
          <Cta className="btn btn-blue nav-cta">
            Let's Talk <ArrowUpRight />
          </Cta>
          <button
            className={`burger${menu ? " is-open" : ""}`}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((m) => !m)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </header>
      <div id="mobile-menu" className={`menu${menu ? " open" : ""}`} aria-hidden={!menu} inert={!menu}>
        <nav className="c menu-links" aria-label="Menu">
          {MENU.map((x, i) => (
            <a key={x.l} href={x.h} style={{ ["--i" as string]: i }} onClick={() => setMenu(false)}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              {x.l}
            </a>
          ))}
          <Cta className="btn btn-blue menu-cta">
            Let's Talk <ArrowUpRight />
          </Cta>
        </nav>
      </div>
    </>
  );
}

export function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => {
      const gap = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setShow(window.scrollY > 600 && gap < 900);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => {
      window.removeEventListener("scroll", f);
      window.removeEventListener("resize", f);
    };
  }, []);
  return (
    <button
      className={`to-top${show ? " show" : ""}`}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp />
    </button>
  );
}

export function Marquee() {
  const unit = (k: string) => (
    <span className="mq-item" key={k} aria-hidden={k !== "a"}>
      Let's work <em>together</em>
      <span className="mq-mark">NG</span>
    </span>
  );
  return (
    <div className="mq" aria-label="Let's work together">
      <div className="mq-track">
        {["a", "b", "c", "d"].map((k) => unit(k))}
      </div>
    </div>
  );
}

const FOOT_LINKS = [
  { l: "Home", h: "/" },
  { l: "About", h: "/#about" },
  { l: "Services", h: "/#services" },
  { l: "Projects", h: "/work" },
  { l: "Contact", h: "/#contact" },
];

export function Footer() {
  const { open } = useEnquiry();
  const [name, setName] = useState("");
  const send = (e: FormEvent) => {
    e.preventDefault();
    window.open(waLink({ name }), "_blank", "noopener,noreferrer");
  };
  return (
    <footer className="footer" id="contact">
      <div className="c">
        <div className="foot-grid">
          <div className="foot-l">
            <Logo size="lg" />
            <h2>
              Let's work <em>together!</em>
            </h2>
            <a className="foot-mail" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <form className="pill" onSubmit={send}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
              <button type="submit" className="btn btn-blue sm">
                Send
              </button>
            </form>
            <div className="foot-actions">
              <button className="btn btn-white" onClick={() => open()}>
                Hire Me <ArrowUpRight />
              </button>
              <Cta className="wa-link">
                <WhatsApp /> Message Me on WhatsApp
              </Cta>
            </div>
          </div>
          <nav className="foot-links" aria-label="Footer">
            {FOOT_LINKS.map((x, i) => (
              <a key={x.l} href={x.h}>
                <span>
                  <ArrowRight /> {x.l}
                </span>
                <small>{String(i + 1).padStart(2, "0")}</small>
              </a>
            ))}
          </nav>
        </div>
        <div className="foot-bar">
          <p>
            © 2026 Nobbie's Gallery
            <br />
            Designed by Nobleman Okosa
          </p>
          <p className="foot-phones">
            WhatsApp <a href={`https://wa.me/2348142056679`}>{PHONE_MAIN}</a>
            <br />
            Call <a href={`tel:${PHONE_SECOND}`}>{PHONE_SECOND}</a>
          </p>
          <div className="socials">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram />
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook />
            </a>
            <a href={SOCIAL.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <Pinterest />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
