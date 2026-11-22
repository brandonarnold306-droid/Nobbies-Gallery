import { useEffect, useMemo, useState } from "react";
import { ITEMS, SUB_LABEL, type Item } from "../../data/site";
import { ArrowLeft, ArrowRight, ArrowUpRight, Close } from "./icons";

export type Main = "all" | "logo" | "design";
export type SubF = "all" | "business" | "church" | "social";

export function useGalleryFilter() {
  const [main, setMainState] = useState<Main>("all");
  const [sub, setSub] = useState<SubF>("all");
  const items = useMemo(
    () =>
      ITEMS.filter((i) => {
        if (main === "all") return true;
        if (main === "logo") return i.cat === "logo";
        return i.cat === "design" && (sub === "all" || i.sub === sub);
      }),
    [main, sub],
  );
  const setMain = (m: Main) => {
    setMainState(m);
    setSub("all");
  };
  return { main, sub, setMain, setSub, items };
}
type G = ReturnType<typeof useGalleryFilter>;

const count = (f: (i: Item) => boolean) => ITEMS.filter(f).length;

export function Filters({ g }: { g: G }) {
  const mains: { k: Main; l: string; n: number }[] = [
    { k: "all", l: "All", n: ITEMS.length },
    { k: "logo", l: "Logo", n: count((i) => i.cat === "logo") },
    { k: "design", l: "Design", n: count((i) => i.cat === "design") },
  ];
  const subs: { k: SubF; l: string; n: number }[] = [
    { k: "all", l: "All Designs", n: count((i) => i.cat === "design") },
    { k: "business", l: "Business", n: count((i) => i.sub === "business") },
    { k: "church", l: "Church", n: count((i) => i.sub === "church") },
    { k: "social", l: "Social Media", n: count((i) => i.sub === "social") },
  ];
  return (
    <div className="filters-wrap">
      <div className="filters" role="group" aria-label="Filter by category">
        {mains.map((m) => (
          <button key={m.k} className={`chip${g.main === m.k ? " on" : ""}`} aria-pressed={g.main === m.k} onClick={() => g.setMain(m.k)}>
            {m.l} <small>{m.n}</small>
          </button>
        ))}
      </div>
      {g.main === "design" ? (
        <div className="filters sub" role="group" aria-label="Filter designs">
          {subs.map((m) => (
            <button key={m.k} className={`chip${g.sub === m.k ? " on" : ""}`} aria-pressed={g.sub === m.k} onClick={() => g.setSub(m.k)}>
              {m.l} <small>{m.n}</small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const describe = (it: Item) =>
  it.cat === "logo"
    ? `${it.title}: ${it.kind.toLowerCase()} from my logo design collection.`
    : `A graphic design from my ${SUB_LABEL[it.sub].toLowerCase()} collection.`;

export function WorkCarousel() {
  const g = useGalleryFilter();
  const [i, setI] = useState(0);
  const [lb, setLb] = useState<number | null>(null);
  const n = g.items.length;

  useEffect(() => setI(0), [g.main, g.sub]);
  const idx = Math.min(i, n - 1);
  const it = g.items[idx];
  const next = g.items[(idx + 1) % n];

  useEffect(() => {
    if (!next) return;
    const im = new Image();
    im.src = `/assets/g/${next.id}.webp`;
  }, [next]);

  return (
    <section className="sec" id="work">
      <div className="c">
        <div className="center">
          <span className="eyebrow">Work</span>
          <h2 className="h2">
            Selected <em>Work</em>
          </h2>
          <p className="lead mx">Explore a selection of projects that showcase my creativity, design approach, and attention to detail.</p>
        </div>
        <Filters g={g} />
        {it ? (
          <div className="wcard" key={it.id}>
            <button className="wimg" onClick={() => setLb(idx)} aria-label={`View ${it.title} full size`}>
              <img src={`/assets/g/${it.id}.webp`} alt={`${it.title}: ${it.kind}`} width={it.w} height={it.h} />
            </button>
            <div className="wtxt">
              <h3>{it.title}</h3>
              <p>{describe(it)}</p>
              <div className="wmeta">
                <div>
                  <small>Category</small>
                  <span>{SUB_LABEL[it.sub]}</span>
                </div>
                <div>
                  <small>Type</small>
                  <span>{it.kind}</span>
                </div>
              </div>
              <div className="wnav">
                <button className="rbtn" aria-label="Previous project" onClick={() => setI((idx + n - 1) % n)}>
                  <ArrowLeft />
                </button>
                <button className="rbtn" aria-label="Next project" onClick={() => setI((idx + 1) % n)}>
                  <ArrowRight />
                </button>
                <span className="wcount">
                  {pad(idx + 1)} / {pad(n)}
                </span>
                <button className="link-arrow" onClick={() => setLb(idx)}>
                  View Full Size <ArrowUpRight />
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="center all-link">
          <a className="link-arrow" href="/work">
            View all work <ArrowUpRight />
          </a>
        </div>
      </div>
      {lb !== null ? <Lightbox items={g.items} index={lb} setIndex={setLb} onClose={() => setLb(null)} /> : null}
    </section>
  );
}

export function WorkGrid() {
  const g = useGalleryFilter();
  const [lb, setLb] = useState<number | null>(null);
  return (
    <>
      <Filters g={g} />
      <p className="gcount">
        Showing {g.items.length} {g.items.length === 1 ? "project" : "projects"}
      </p>
      <div className="mason">
        {g.items.map((it, k) => (
          <button className="m-item" key={it.id} onClick={() => setLb(k)} aria-label={`View ${it.title} full size`}>
            <img src={`/assets/g/${it.id}-sm.webp`} alt={`${it.title}: ${it.kind}`} width={it.w} height={it.h} loading="lazy" />
            <span className="m-cap">
              <b>{it.title}</b>
              <small>{SUB_LABEL[it.sub]}</small>
            </span>
          </button>
        ))}
      </div>
      {lb !== null ? <Lightbox items={g.items} index={lb} setIndex={setLb} onClose={() => setLb(null)} /> : null}
    </>
  );
}

function Lightbox({
  items,
  index,
  setIndex,
  onClose,
}: {
  items: Item[];
  index: number;
  setIndex: (n: number) => void;
  onClose: () => void;
}) {
  const n = items.length;
  const it = items[index];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((index + n - 1) % n);
      if (e.key === "ArrowRight") setIndex((index + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, n, onClose, setIndex]);
  if (!it) return null;
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={it.title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button className="lb-x" onClick={onClose} aria-label="Close">
        <Close />
      </button>
      <button className="lb-a l" onClick={() => setIndex((index + n - 1) % n)} aria-label="Previous">
        <ArrowLeft />
      </button>
      <img src={`/assets/g/${it.id}.webp`} alt={`${it.title}: ${it.kind}`} />
      <button className="lb-a r" onClick={() => setIndex((index + 1) % n)} aria-label="Next">
        <ArrowRight />
      </button>
      <div className="lb-cap">
        <b>{it.title}</b>
        <span>
          {SUB_LABEL[it.sub]} · {pad(index + 1)} / {pad(n)}
        </span>
      </div>
    </div>
  );
}
