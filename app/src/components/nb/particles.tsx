import { useEffect, useRef } from "react";
import marks from "../../data/mark-points.json";

declare global {
  interface Window {
    __nbReady?: boolean;
  }
}

const MARK = marks as { aspect: number; p: number[][] };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function whenReady(fn: () => void): () => void {
  let done = false;
  const go = () => {
    if (!done) {
      done = true;
      fn();
    }
  };
  if (window.__nbReady) {
    go();
    return () => {};
  }
  window.addEventListener("nb:ready", go, { once: true });
  const t = window.setTimeout(go, 6500);
  return () => {
    done = true;
    window.removeEventListener("nb:ready", go);
    window.clearTimeout(t);
  };
}

/** Shared pointer in client coordinates; far away when the pointer is gone. */
function trackPointer() {
  const ptr = { x: -1e5, y: -1e5 };
  const move = (e: PointerEvent) => {
    ptr.x = e.clientX;
    ptr.y = e.clientY;
  };
  const gone = () => {
    ptr.x = -1e5;
    ptr.y = -1e5;
  };
  const touchEnd = (e: PointerEvent) => {
    if (e.pointerType === "touch") gone();
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", move, { passive: true });
  window.addEventListener("pointerup", touchEnd, { passive: true });
  window.addEventListener("pointercancel", touchEnd, { passive: true });
  window.addEventListener("blur", gone);
  document.documentElement.addEventListener("mouseleave", gone);
  return {
    ptr,
    stop() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerup", touchEnd);
      window.removeEventListener("pointercancel", touchEnd);
      window.removeEventListener("blur", gone);
      document.documentElement.removeEventListener("mouseleave", gone);
    },
  };
}

/** Runs `frame` on rAF only while the element is on screen and the tab is visible. */
function visibleLoop(el: Element, frame: (dt: number) => void) {
  let raf = 0;
  let last = 0;
  let onScreen = true;
  const tick = (now: number) => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;
    frame(dt);
    raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf && onScreen && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const io = new IntersectionObserver((es) => {
    onScreen = es[0]?.isIntersecting ?? true;
    kick();
  });
  io.observe(el);
  document.addEventListener("visibilitychange", kick);
  kick();
  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", kick);
    if (raf) cancelAnimationFrame(raf);
  };
}

/* ------------------------------------------------------------------ */
/* Hero: blue particles form the NG mark and pen, with a sphere around */
/* ------------------------------------------------------------------ */

export function ParticleLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 860;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const stride = small ? 2 : 1;

    /* logo particles */
    const pts = MARK.p.filter((_, i) => i % stride === 0);
    const nL = pts.length;
    const nx = new Float32Array(nL);
    const ny = new Float32Array(nL);
    const lx = new Float32Array(nL);
    const ly = new Float32Array(nL);
    const lvx = new Float32Array(nL);
    const lvy = new Float32Array(nL);
    const fx = new Float32Array(nL);
    const fy = new Float32Array(nL);
    const dl = new Float32Array(nL);
    const ph = new Float32Array(nL);
    const bucketLists: number[][] = [[], [], []];
    for (let i = 0; i < nL; i++) {
      const [px, py, kind] = pts[i];
      nx[i] = px / 500;
      ny[i] = py / 500;
      fx[i] = (small ? 0 : 0.3) + Math.random() * (small ? 1 : 0.72);
      fy[i] = Math.random();
      dl[i] = (Math.hypot(nx[i], ny[i] * 2.2) * 0.55 + Math.random() * 0.5) * 4;
      ph[i] = Math.random() * 6.283;
      bucketLists[kind === 1 ? 2 : Math.random() < 0.55 ? 0 : 1].push(i);
    }
    const buckets = bucketLists.map((l) => Int32Array.from(l));
    const LCOL = ["#3d7bff", "#6aa0ff", "#a9c9ff"];

    /* sphere particles */
    const nS = small ? 800 : 1700;
    const ux = new Float32Array(nS);
    const uy = new Float32Array(nS);
    const uz = new Float32Array(nS);
    const ox = new Float32Array(nS);
    const oy = new Float32Array(nS);
    const ovx = new Float32Array(nS);
    const ovy = new Float32Array(nS);
    const osx = new Float32Array(nS);
    const osy = new Float32Array(nS);
    const sdl = new Float32Array(nS);
    const ssz = new Float32Array(nS);
    const spx = new Float32Array(nS);
    const spy = new Float32Array(nS);
    const sdp = new Float32Array(nS);
    const slv = new Uint8Array(nS);
    for (let j = 0; j < nS; j++) {
      const yy = 1 - (2 * (j + 0.5)) / nS;
      const r = Math.sqrt(1 - yy * yy);
      const th = j * 2.399963;
      ux[j] = Math.cos(th) * r;
      uy[j] = yy;
      uz[j] = Math.sin(th) * r;
      osx[j] = (Math.random() - 0.5) * 1.4;
      osy[j] = (Math.random() - 0.5) * 1.4;
      sdl[j] = Math.random() * 0.9 * 4;
      ssz[j] = 0.8 + Math.random() * 0.9;
    }
    const SCOL = ["#1f46c9", "#3d7bff", "#9cc0ff"];
    const SALP = [0.4, 0.75, 1];

    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let S = 1;
    let AW = 1;
    let AH = 1;
    const anchor = wrap.closest(".hero")?.querySelector<HTMLElement>(".hero-anchor") ?? null;
    let R = 1;
    let t = 0;
    let formAt = reduce ? -10 : Infinity;
    let rotY = 0.6;
    let tilt = 0.18;
    let first = true;

    const layout = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      const wr = wrap.getBoundingClientRect();
      const ar = anchor ? anchor.getBoundingClientRect() : wr;
      AW = ar.width || W;
      AH = ar.height || H;
      cx = ar.left - wr.left + AW / 2;
      cy = ar.top - wr.top + AH / 2;
      // Phones: sit midway between the header line and the first line of text.
      const copy = wrap.closest(".hero")?.querySelector<HTMLElement>(".hero-copy") ?? null;
      const navEl = document.querySelector<HTMLElement>(".nav");
      if (window.innerWidth < 860 && copy && navEl) {
        const top = navEl.offsetHeight;
        const textTop = copy.getBoundingClientRect().top - wr.top;
        if (textTop > top) cy = (top + textTop) / 2;
      }
      S = 0.22 * Math.min(AW, AH);
      R = S * 1.3;
      if (first) {
        first = false;
        for (let i = 0; i < nL; i++) {
          lx[i] = fx[i] * W;
          ly[i] = fy[i] * H;
        }
      }
      if (reduce) {
        for (let i = 0; i < nL; i++) {
          lx[i] = cx + nx[i] * S;
          ly[i] = cy + ny[i] * S;
        }
        for (let j = 0; j < nS; j++) {
          ox[j] = 0;
          oy[j] = 0;
        }
        project(0);
        draw();
      }
    };

    const project = (dt: number, px = -1e5, py = -1e5) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const Rp = clamp(S * 0.64, 96, 260);
      const Rp2 = Rp * Rp;
      for (let j = 0; j < nS; j++) {
        const x1 = ux[j] * cosY + uz[j] * sinY;
        const z1 = -ux[j] * sinY + uz[j] * cosY;
        const y2 = uy[j] * cosT - z1 * sinT;
        const z2 = uy[j] * sinT + z1 * cosT;
        const pp = 1 / (1 - 0.3 * z2);
        const bx = cx + x1 * R * pp;
        const by = cy + y2 * R * pp;
        if (dt > 0) {
          const act = t >= formAt + sdl[j];
          const otx = act ? 0 : osx[j] * W;
          const oty = act ? 0 : osy[j] * H;
          let ax = (otx - ox[j]) * 1.6 - ovx[j] * 1.6;
          let ay = (oty - oy[j]) * 1.6 - ovy[j] * 1.6;
          const dx = bx + ox[j] - px;
          const dy = by + oy[j] - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < Rp2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const q = 1 - d / Rp;
            const f = q * q * 900;
            ax += (dx / d) * f - (dy / d) * f * 0.45;
            ay += (dy / d) * f + (dx / d) * f * 0.45;
          }
          ovx[j] += ax * dt;
          ovy[j] += ay * dt;
          ox[j] += ovx[j] * dt;
          oy[j] += ovy[j] * dt;
        }
        spx[j] = bx + ox[j];
        spy[j] = by + oy[j];
        sdp[j] = pp;
        slv[j] = z2 < -0.35 ? 0 : z2 < 0.35 ? 1 : 2;
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let lv = 0; lv < 3; lv++) {
        ctx.fillStyle = SCOL[lv];
        ctx.globalAlpha = SALP[lv];
        for (let j = 0; j < nS; j++) {
          if (slv[j] !== lv) continue;
          const s = ssz[j] * (0.75 + 0.55 * sdp[j]);
          ctx.fillRect(spx[j] - s / 2, spy[j] - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 0.95;
      const ds = small ? 2 : 2.3;
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = LCOL[b];
        const list = buckets[b];
        for (let k = 0; k < list.length; k++) {
          const i = list[k];
          ctx.fillRect(lx[i] - ds / 2, ly[i] - ds / 2, ds, ds);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tracker = trackPointer();
    const frame = (dt: number) => {
      t += dt;
      const r = canvas.getBoundingClientRect();
      const px = tracker.ptr.x - r.left;
      const py = tracker.ptr.y - r.top;
      const hasP = px > -220 && px < W + 220 && py > -220 && py < H + 220;
      const ppx = hasP ? px : -1e5;
      const ppy = hasP ? py : -1e5;

      const Rp = clamp(S * 0.55, 88, 240);
      const Rp2 = Rp * Rp;
      for (let i = 0; i < nL; i++) {
        const act = t >= formAt + dl[i];
        let tx: number;
        let ty: number;
        if (act) {
          tx = cx + nx[i] * S + Math.sin(t * 0.9 + ph[i]) * 1.1;
          ty = cy + ny[i] * S + Math.cos(t * 0.8 + ph[i]) * 1.1;
        } else {
          tx = fx[i] * W + Math.sin(t * 0.4 + ph[i] * 3) * 34;
          ty = fy[i] * H + Math.cos(t * 0.35 + ph[i] * 2) * 34;
        }
        let ax = (tx - lx[i]) * 3.4 - lvx[i] * 2.2;
        let ay = (ty - ly[i]) * 3.4 - lvy[i] * 2.2;
        if (hasP) {
          const dx = lx[i] - ppx;
          const dy = ly[i] - ppy;
          const d2 = dx * dx + dy * dy;
          if (d2 < Rp2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const q = 1 - d / Rp;
            const f = q * q * 1100;
            ax += (dx / d) * f - (dy / d) * f * 0.7;
            ay += (dy / d) * f + (dx / d) * f * 0.7;
          }
        }
        lvx[i] += ax * dt;
        lvy[i] += ay * dt;
        lx[i] += lvx[i] * dt;
        ly[i] += lvy[i] * dt;
      }

      rotY += dt * (0.16 + (hasP ? clamp((px - cx) / AW, -0.5, 0.5) * 0.9 : 0));
      const tt = hasP ? clamp((py - cy) / AH, -0.5, 0.5) * 0.7 : 0.18;
      tilt += (tt - tilt) * Math.min(1, dt * 3);
      project(dt, ppx, ppy);
      draw();
    };

    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    if (anchor) ro.observe(anchor);
    layout();

    let stopLoop = () => {};
    let stopReady = () => {};
    if (!reduce) {
      stopReady = whenReady(() => {
        formAt = t;
      });
      stopLoop = visibleLoop(wrap, frame);
    }

    return () => {
      ro.disconnect();
      stopLoop();
      stopReady();
      tracker.stop();
    };
  }, []);

  return (
    <div ref={wrapRef} className="pl-wrap">
      <canvas ref={canvasRef} role="img" aria-label="The NG logo and pen of Nobbie's Gallery, formed from blue particles" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hire Me circle: ring + text particles that wake up near the cursor  */
/* ------------------------------------------------------------------ */

const SIZE = 214;
const PAD = 60;
const TOT = SIZE + PAD * 2;

export function HireCircle({ onClick, label }: { onClick: () => void; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const lab = labelRef.current;
    if (!wrap || !canvas || !lab) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = TOT * dpr;
    canvas.height = TOT * dpr;
    const C = TOT / 2;
    const Rr = SIZE / 2;

    const NR = 230;
    const NS = 70;
    let NT = 0;
    let n = NR + NS;
    let hx = new Float32Array(n);
    let hy = new Float32Array(n);
    let x = new Float32Array(n);
    let y = new Float32Array(n);
    let vx = new Float32Array(n);
    let vy = new Float32Array(n);
    let ph = new Float32Array(n);
    let sp = new Float32Array(n);
    let ro = new Float32Array(n);
    let kind = new Uint8Array(n); // 0 ring, 1 text, 2 satellite

    const build = () => {
      const off = document.createElement("canvas");
      const oc = off.getContext("2d");
      const tp: number[] = [];
      if (oc) {
        const sc = 2;
        off.width = 140 * sc;
        off.height = 40 * sc;
        oc.scale(sc, sc);
        oc.fillStyle = "#fff";
        oc.font = '400 16px "Inter Tight", system-ui, sans-serif';
        oc.textAlign = "center";
        oc.textBaseline = "middle";
        oc.fillText(label, 70, 20);
        const d = oc.getImageData(0, 0, off.width, off.height).data;
        for (let py = 0; py < off.height; py += 2) {
          for (let px = 0; px < off.width; px += 2) {
            if (d[(py * off.width + px) * 4 + 3] > 150) tp.push(C + (px / sc - 70), C + (py / sc - 20));
          }
        }
      }
      NT = tp.length / 2;
      n = NR + NT + NS;
      hx = new Float32Array(n);
      hy = new Float32Array(n);
      x = new Float32Array(n);
      y = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      ph = new Float32Array(n);
      sp = new Float32Array(n);
      ro = new Float32Array(n);
      kind = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        ph[i] = Math.random() * 6.283;
        if (i < NR) {
          const a = (i / NR) * Math.PI * 2;
          hx[i] = C + Math.cos(a) * Rr;
          hy[i] = C + Math.sin(a) * Rr;
          sp[i] = a;
          kind[i] = 0;
        } else if (i < NR + NT) {
          const k = i - NR;
          hx[i] = tp[k * 2];
          hy[i] = tp[k * 2 + 1];
          kind[i] = 1;
        } else {
          const k = i - NR - NT;
          sp[i] = Math.random() * 6.283;
          ro[i] = Rr + 12 + (k % 7) * 9 + Math.random() * 8;
          kind[i] = 2;
          hx[i] = C + Math.cos(sp[i]) * ro[i];
          hy[i] = C + Math.sin(sp[i]) * ro[i];
        }
        x[i] = hx[i];
        y[i] = hy[i];
      }
    };
    build();
    let fontsStop = false;
    document.fonts?.ready.then(() => {
      if (!fontsStop) build();
    });

    const draw = (pS: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, TOT, TOT);
      ctx.globalCompositeOperation = "lighter";
      // ring
      ctx.fillStyle = "#4d86ff";
      ctx.globalAlpha = 0.6 + 0.4 * pS;
      for (let i = 0; i < NR; i++) ctx.fillRect(x[i] - 0.85, y[i] - 0.85, 1.7, 1.7);
      // text
      if (pS > 0.02) {
        ctx.fillStyle = "#e4eeff";
        ctx.globalAlpha = Math.min(1, pS * 1.05);
        for (let i = NR; i < NR + NT; i++) ctx.fillRect(x[i] - 0.7, y[i] - 0.7, 1.4, 1.4);
        ctx.fillStyle = "#6fa2ff";
        ctx.globalAlpha = Math.min(1, pS * 0.95);
        for (let i = NR + NT; i < n; i++) ctx.fillRect(x[i] - 1, y[i] - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
    };

    if (reduce) {
      draw(0);
      return () => {
        fontsStop = true;
      };
    }

    const tracker = trackPointer();
    let pS = 0;
    let t = 0;
    let lastOp = 1;
    const frame = (dt: number) => {
      t += dt;
      const r = canvas.getBoundingClientRect();
      const px = tracker.ptr.x - r.left;
      const py = tracker.ptr.y - r.top;
      const d = Math.hypot(px - C, py - C);
      const p = clamp(1 - (d - Rr) / (Rr * 1.5), 0, 1);
      pS += (p - pS) * Math.min(1, dt * 6);
      const near = pS > 0.02;
      const op = 1 - 0.75 * pS;
      if (Math.abs(op - lastOp) > 0.01) {
        lab.style.opacity = op.toFixed(2);
        lastOp = op;
      }
      for (let i = 0; i < n; i++) {
        let tx = hx[i];
        let ty = hy[i];
        const k = kind[i];
        if (k === 0) {
          const rad = Rr + pS * (4 + 12 * Math.sin(t * 2.2 + ph[i] * 5) * Math.sin(t * 0.9 + ph[i]));
          const a = sp[i] + pS * 0.04 * Math.sin(t + ph[i]);
          tx = C + Math.cos(a) * rad;
          ty = C + Math.sin(a) * rad;
        } else if (k === 2) {
          sp[i] += dt * (0.35 + pS * 1.1) * (i % 2 ? 1 : -1);
          tx = C + Math.cos(sp[i]) * ro[i];
          ty = C + Math.sin(sp[i]) * ro[i];
          if (near && px > -PAD * 3) {
            tx += (px - tx) * 0.3 * pS;
            ty += (py - ty) * 0.3 * pS;
          }
        }
        let ax = (tx - x[i]) * 45 - vx[i] * 7.5;
        let ay = (ty - y[i]) * 45 - vy[i] * 7.5;
        if (near) {
          const dx = x[i] - px;
          const dy = y[i] - py;
          const d2 = dx * dx + dy * dy;
          if (k !== 2 && d2 < 8100 && d2 > 0.01) {
            const dd = Math.sqrt(d2);
            const q = 1 - dd / 90;
            const f = q * q * 2800 * pS;
            ax += (dx / dd) * f - (dy / dd) * f * 0.5;
            ay += (dy / dd) * f + (dx / dd) * f * 0.5;
          }
          if (k !== 2) {
            ax += (Math.random() - 0.5) * pS * (k === 0 ? 1500 : 700);
            ay += (Math.random() - 0.5) * pS * (k === 0 ? 1500 : 700);
          }
        }
        vx[i] += ax * dt;
        vy[i] += ay * dt;
        x[i] += vx[i] * dt;
        y[i] += vy[i] * dt;
      }
      draw(pS);
    };
    const stopLoop = visibleLoop(wrap, frame);
    return () => {
      fontsStop = true;
      stopLoop();
      tracker.stop();
    };
  }, [label]);

  return (
    <div ref={wrapRef} className="pc">
      <button className="btn-circle" onClick={onClick}>
        <span ref={labelRef}>{label}</span>
      </button>
      <canvas ref={canvasRef} aria-hidden style={{ width: TOT, height: TOT }} />
    </div>
  );
}
