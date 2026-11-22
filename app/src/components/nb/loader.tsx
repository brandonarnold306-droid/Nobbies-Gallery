import { useEffect, useState } from "react";

const MIN_MS = 2800;

export function Loader() {
  const [phase, setPhase] = useState<"show" | "out" | "gone">("show");

  useEffect(() => {
    const start = performance.now();
    let finished = false;
    document.documentElement.style.overflow = "hidden";
    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      window.setTimeout(() => {
        window.__nbReady = true;
        window.dispatchEvent(new Event("nb:ready"));
        document.documentElement.style.overflow = "";
        setPhase("out");
        window.setTimeout(() => setPhase("gone"), 800);
      }, wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const safety = window.setTimeout(finish, 6000);
    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className={`ld${phase === "out" ? " out" : ""}`} role="status" aria-live="polite" aria-label="Loading Nobbie's Gallery">
      <div className="ld-mark">
        <div className="ld-base" />
        <div className="ld-fill">
          <div className="ld-liq" />
        </div>
        <div className="ld-gloss" />
      </div>
      <p className="ld-name">
        Nobbie's <em>Gallery</em>
      </p>
    </div>
  );
}
