import { useEffect, useRef, useState } from "react";
import { HireCircle, ParticleLogo } from "./particles";
import {
  FAQ,
  FEATURED_IDS,
  ITEMS,
  SERVICES,
  STEPS,
  TESTIMONIALS,
} from "../../data/site";
import { Cta, useEnquiry } from "./enquiry";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Minus, Plus, Star, WhatsApp } from "./icons";

function Stars({ small }: { small?: boolean }) {
  return (
    <span className={`stars${small ? " sm" : ""}`} role="img" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((k) => (
        <Star key={k} />
      ))}
    </span>
  );
}

export function Hero() {
  const { open } = useEnquiry();
  const secRef = useRef<HTMLElement>(null);

  return (
    <section className="hero" id="top" ref={secRef}>
      <div className="hero-art">
        <ParticleLogo />
      </div>
      <div className="hero-anchor" aria-hidden />
      <div className="c hero-in">
        <div className="hero-copy">
          <span className="eyebrow rise r1">Graphic, Brand &amp; Website Designer</span>
          <h1 className="rise r2">
            <span>Welcome to</span>
            <em>Nobbie's Gallery</em>
          </h1>
          <p className="hero-sub rise r3">Creative designs. Distinctive brands. Digital experiences.</p>
          <p className="hero-p rise r3">
            We bring ideas to life through thoughtful graphic design, memorable brand identities, and modern websites that help
            businesses stand out.
          </p>
          <div className="hero-btns rise r4">
            <button className="btn btn-white" onClick={() => open()}>
              Hire Me <ArrowUpRight />
            </button>
            <a className="btn-text" href="#work">
              View My Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="sec" id="about">
      <div className="c">
        <span className="eyebrow">About Me</span>
        <div className="about-grid">
          <img
            className="about-img"
            src="/assets/brand/portrait.webp"
            alt="Portrait of Nobleman Okosa"
            width={934}
            height={1279}
            loading="lazy"
          />
          <div>
            <h2 className="about-h">
              About Nobbie's <em>Gallery</em>
            </h2>
            <p className="about-p">
              I'm Nobleman Okosa, a graphic designer, brand designer, and website designer behind Nobbie's Gallery. I help businesses and
              individuals communicate their ideas through thoughtful designs, memorable brand identities, and modern websites.
            </p>
            <p className="about-p">
              My approach combines creativity, clarity, and attention to detail to create designs that communicate effectively and help
              brands establish a distinctive visual presence.
            </p>
            <div className="about-stats">
              {["Graphic", "Brand", "Website"].map((w) => (
                <div key={w}>
                  <strong>{w}</strong>
                  <span>Designer</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const [open, setOpen] = useState(0);
  return (
    <section className="sec" id="services">
      <div className="c">
        <div className="svc-head">
          <div>
            <span className="eyebrow">Services</span>
            <h2 className="h2">
              What I <em>do</em>
            </h2>
            <p className="lead">I offer creative solutions tailored to your brand, business, and project requirements.</p>
          </div>
          <Cta className="link-arrow">
            Hire Me <ArrowUpRight />
          </Cta>
        </div>
        <div className="svc-list">
          {SERVICES.map((s, i) => (
            <div key={s.a} className={`svc${open === i ? " open" : ""}`} onMouseEnter={() => setOpen(i)}>
              <button className="svc-row" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="svc-t">
                  {s.a} <span className="it">{s.b}</span>
                </span>
                <span className="svc-ic">
                  <ArrowUpRight />
                </span>
              </button>
              <div className="svc-body">
                <div>
                  <p>{s.d}</p>
                  <Cta service={`${s.a} ${s.b}`} className="link-arrow">
                    Enquire about {s.a} {s.b} <ArrowUpRight />
                  </Cta>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Banner() {
  const { open } = useEnquiry();
  return (
    <section className="banner">
      <div className="banner-bg" aria-hidden />
      <div className="c banner-in">
        <div>
          <h2 className="h2">
            Let's work on <em>something great</em>
          </h2>
          <p className="banner-p">
            Have a project in mind? Whether you need a logo, a complete brand identity, graphic designs, or a website, let's discuss your
            ideas and bring them to life.
          </p>
        </div>
        <HireCircle label="Hire Me" onClick={() => open()} />
      </div>
    </section>
  );
}

export function Results() {
  const feat = FEATURED_IDS.map((id) => ITEMS.find((i) => i.id === id)).filter(Boolean) as typeof ITEMS;
  const rowA = feat.slice(0, 6);
  const rowB = feat.slice(6, 12);
  const track = (arr: typeof ITEMS, rev?: boolean) => (
    <div className={`tiles${rev ? " rev" : ""}`}>
      {[...arr, ...arr, ...arr].map((it, k) => (
        <span className="tile" key={`${it.id}-${k}`}>
          <img src={`/assets/g/${it.id}-sm.webp`} alt="" width={it.w} height={it.h} loading="lazy" />
        </span>
      ))}
    </div>
  );
  return (
    <section className="sec" id="results">
      <div className="c">
        <div className="center">
          <span className="eyebrow">Highlights</span>
          <h2 className="h2">
            Design that makes an <em>impression</em>
          </h2>
          <p className="lead mx">A look at completed work from my portfolio.</p>
        </div>
        <div className="res-grid">
          <div className="card res-l">
            <h3>Selected projects</h3>
            <div className="res-rows" aria-hidden>
              {track(rowA)}
              {track(rowB, true)}
            </div>
          </div>
          <div className="card res-r">
            <h3>
              Have a project <br />
              in mind?
            </h3>
            <hr />
            <p className="res-p">Get in touch to discuss your requirements and receive a quote.</p>
            <ul className="checks">
              <li>
                <Check /> Estimated delivery: 24 hours to 7 days
              </li>
              <li>
                <Check /> Revisions within your selected package
              </li>
              <li>
                <Check /> Files via Google Drive, email, Dropbox or WeTransfer
              </li>
              <li>
                <Check /> Clients in Nigeria and worldwide
              </li>
            </ul>
            <Cta className="btn btn-blue">
              Request a Quote <WhatsApp />
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="sec" id="process">
      <div className="c">
        <span className="eyebrow">Process</span>
        <h2 className="h2">
          How we bring your <em>ideas</em> to life
        </h2>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="step" key={s.t}>
              <div className="step-obj">
                <img src={`/assets/fx/obj${i + 1}.webp`} alt="" width={720} height={720} loading="lazy" />
              </div>
              <small>{String(i + 1).padStart(2, "0")}</small>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
        <div className="delivery">
          <span className="eyebrow">Estimated Delivery Time</span>
          <p>
            Projects typically take between 24 hours and 7 days, depending on the project type, complexity, and requirements. Delivery
            time and revision terms are communicated before a project begins.
          </p>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  {
    a: "Graphic",
    service: "Graphic Design",
    price: "₦25,000–₦60,000",
    d: "For visual design projects tailored to your brand, business, organisation, or campaign.",
  },
  {
    a: "Website",
    service: "Website Design",
    price: "₦90,000–₦300,000",
    d: "For modern websites designed around your business goals, content, functionality, and requirements.",
  },
];

export function Pricing() {
  return (
    <section className="sec" id="pricing">
      <div className="c">
        <div className="center">
          <span className="eyebrow">Pricing</span>
          <h2 className="h2">
            Invest in good <em>design</em>
          </h2>
          <p className="lead mx">
            Every project is different. My pricing depends on the type of service, project requirements, complexity, and scope of work.
          </p>
        </div>
        <div className="plans">
          {PLANS.map((p) => (
            <div className="plan card" key={p.a}>
              <h3>
                {p.a} <em>Design</em>
              </h3>
              <p className="plan-d">{p.d}</p>
              <small className="plan-l">Price Range</small>
              <div className="price">{p.price}</div>
              <hr />
              <Cta service={p.service} className="btn btn-blue block">
                Request a Quote <ArrowUpRight />
              </Cta>
              <p className="plan-n">Graphic design and website design are priced separately.</p>
            </div>
          ))}
        </div>
        <p className="plans-cta">Have a project in mind? Get in touch to discuss your requirements and receive a quote.</p>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="sec" id="faq">
      <div className="c">
        <div className="center">
          <span className="eyebrow">FAQ</span>
          <h2 className="h2">
            Frequently asked <em>questions</em>
          </h2>
        </div>
        <div className="faq">
          {FAQ.map((f, i) => (
            <div key={f.q} className={`faq-i${open === i ? " open" : ""}`}>
              <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="faq-ic">{open === i ? <Minus /> : <Plus />}</span>
              </button>
              <div className="faq-a">
                <div>
                  {f.a.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = TESTIMONIALS[i];
  const n = TESTIMONIALS.length;
  return (
    <section className="sec" id="reviews">
      <div className="c">
        <span className="eyebrow">Feedback</span>
        <h2 className="h2">
          What clients <em>say</em>
        </h2>
        <div className="tgrid">
          <div className="tmono" key={t.name}>
            <span>{t.initials}</span>
            <small>{t.name}</small>
          </div>
          <div className="card tq">
            <small className="tq-l">Review</small>
            <Stars />
            <blockquote>“{t.q}”</blockquote>
            <div className="tq-foot">
              <h4>{t.name}</h4>
              <div className="tq-nav">
                <button aria-label="Previous review" onClick={() => setI((i + n - 1) % n)}>
                  <ArrowLeft />
                </button>
                <button aria-label="Next review" onClick={() => setI((i + 1) % n)}>
                  <ArrowRight />
                </button>
              </div>
            </div>
          </div>
          <div className="card tlist">
            <small className="tq-l">Clients</small>
            <ul>
              {TESTIMONIALS.map((x, k) => (
                <li key={x.name}>
                  <button className={k === i ? "on" : ""} onClick={() => setI(k)} aria-pressed={k === i}>
                    <span className="tl-n">
                      {x.name}
                      <Stars small />
                    </span>
                    <small>{String(k + 1).padStart(2, "0")}</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
