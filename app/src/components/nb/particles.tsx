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

    /* sphere: a fine, dense lattice of tiny dots that spins, ripples and scatters */
    const anchor = wrap.closest(".hero")?.querySelector<HTMLElement>(".hero-anchor") ?? null;
    const er = (anchor ?? wrap).getBoundingClientRect();
    const R0 = 0.22 * Math.min(er.width || 360, er.height || 360) * 1.3;
    const gap = small ? 2.4 : 2.1;
    const nS = clamp(Math.round((4 * Math.PI * R0 * R0) / (gap * gap)), 5500, small ? 9500 : 16000);
    const nH = small ? 650 : 1200;
    const ux = new Float32Array(nS);
    const uy = new Float32Array(nS);
    const uz = new Float32Array(nS);
    const ox = new Float32Array(nS);
    const oy = new Float32Array(nS);
    const ovx = new Float32Array(nS);
    const ovy = new Float32Array(nS);
    const rx = new Float32Array(nS);
    const ry = new Float32Array(nS);
    const osx = new Float32Array(nS);
    const osy = new Float32Array(nS);
    const sdl = new Float32Array(nS);
    const ssz = new Float32Array(nS);
    const spx = new Float32Array(nS);
    const spy = new Float32Array(nS);
    const sdz = new Float32Array(nS);
    const sps = new Float32Array(nS);
    const slv = new Uint8Array(nS);
    const order = new Uint16Array(nS);
    for (let j = 0; j < nS; j++) {
      const yy = 1 - (2 * (j + 0.5)) / nS;
      const r = Math.sqrt(1 - yy * yy);
      const th = j * 2.399963;
      ux[j] = Math.cos(th) * r;
      uy[j] = yy;
      uz[j] = Math.sin(th) * r;
      rx[j] = Math.random() * 2 - 1;
      ry[j] = Math.random() * 2 - 1;
      osx[j] = (Math.random() - 0.5) * 1.4;
      osy[j] = (Math.random() - 0.5) * 1.4;
      sdl[j] = Math.random() * 0.9 * 4;
      ssz[j] = 0.78 + Math.random() * 0.4;
    }

    /* halo: sparse dust drifting around the sphere */
    const hux = new Float32Array(nH);
    const huy = new Float32Array(nH);
    const huz = new Float32Array(nH);
    const hr = new Float32Array(nH);
    const hph = new Float32Array(nH);
    const hsz = new Float32Array(nH);
    for (let k = 0; k < nH; k++) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * 6.283;
      const s = Math.sqrt(1 - u * u);
      hux[k] = Math.cos(a) * s;
      huy[k] = u;
      huz[k] = Math.sin(a) * s;
      hr[k] = 1.06 + Math.pow(Math.random(), 1.7) * 0.5;
      hph[k] = Math.random() * 6.283;
      hsz[k] = 0.7 + Math.random() * 0.5;
    }

    /* brightness ramp: deep blue core, light-blue mid, white rim glow */
    const LV = 9;
    const stops: number[][] = [
      [14, 38, 112],
      [34, 82, 214],
      [61, 123, 255],
      [110, 166, 255],
      [170, 205, 255],
      [238, 245, 255],
    ];
    const SCOL: string[] = [];
    const SALP: number[] = [];
    for (let i = 0; i < LV; i++) {
      const f = (i / (LV - 1)) * (stops.length - 1);
      const a = Math.floor(f);
      const b = Math.min(stops.length - 1, a + 1);
      const m = f - a;
      const c = stops[a].map((v, k) => Math.round(v + (stops[b][k] - v) * m));
      SCOL.push(`rgb(${c[0]},${c[1]},${c[2]})`);
      SALP.push(0.55 + 0.45 * (i / (LV - 1)));
    }
    const cnt = new Int32Array(LV);
    const off = new Int32Array(LV + 1);
    const LX = -0.45;
    const LY = -0.5;
    const LZ = 0.74;

    /* ripples: waves that travel over the sphere, bounce off the far side and fade */
    const MAXR = 6;
    const WAVE_V = 2.3;
    const ripX = new Float32Array(MAXR);
    const ripY = new Float32Array(MAXR);
    const ripZ = new Float32Array(MAXR);
    const ripT = new Float32Array(MAXR);
    const ripA = new Float32Array(MAXR);
    let nRip = 0;
    const liveF = new Float32Array(MAXR);
    const liveA = new Float32Array(MAXR);
    const liveI = new Int32Array(MAXR);
    let nLive = 0;

    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let S = 1;
    let AW = 1;
    let AH = 1;
    let R = 1;
    let t = 0;
    let formAt = reduce ? -10 : Infinity;
    let rotY = 0.6;
    let tilt = 0.18;
    let spin = 0.2;
    let dvx = 0;
    let dvy = 0;
    let first = true;

    const drag = { down: false, id: -1, lx: 0, ly: 0, dx: 0, dy: 0 };
    let lastTap = 0;
    let combo = 0;

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

    /** Height of the surface at a view-space direction, from all live ripples. */
    const waveAt = (x: number, y: number, z: number) => {
      let h = 0;
      for (let k = 0; k < nLive; k++) {
        const i = liveI[k];
        const c = x * ripX[i] + y * ripY[i] + z * ripZ[i];
        const a = Math.acos(c > 1 ? 1 : c < -1 ? -1 : c);
        const d = a - liveF[k];
        if (d > 0.85 || d < -0.85) continue;
        const e = d * 3.6;
        h += liveA[k] * Math.exp(-e * e) * Math.cos(e * 3);
      }
      return h;
    };

    const addRipple = (qx: number, qy: number, amp: number) => {
      let n = Math.hypot(qx, qy);
      let z = 0;
      if (n < 1) z = Math.sqrt(1 - n * n);
      else {
        qx /= n;
        qy /= n;
        n = 1;
      }
      if (nRip >= MAXR) {
        // drop the oldest
        for (let k = 1; k < MAXR; k++) {
          ripX[k - 1] = ripX[k];
          ripY[k - 1] = ripY[k];
          ripZ[k - 1] = ripZ[k];
          ripT[k - 1] = ripT[k];
          ripA[k - 1] = ripA[k];
        }
        nRip = MAXR - 1;
      }
      ripX[nRip] = qx;
      ripY[nRip] = qy;
      ripZ[nRip] = z;
      ripT[nRip] = t;
      ripA[nRip] = amp;
      nRip++;
    };

    const project = (dt: number, px = -1e5, py = -1e5, dragging = false) => {
      // refresh live ripples (and forget the ones that have faded out)
      nLive = 0;
      let w = 0;
      for (let k = 0; k < nRip; k++) {
        const age = t - ripT[k];
        if (age > 5) continue;
        if (w !== k) {
          ripX[w] = ripX[k];
          ripY[w] = ripY[k];
          ripZ[w] = ripZ[k];
          ripT[w] = ripT[k];
          ripA[w] = ripA[k];
        }
        const f = age * WAVE_V;
        const fr = f <= Math.PI ? f : 2 * Math.PI - f;
        if (fr > 0.02) {
          liveI[nLive] = w;
          liveF[nLive] = fr;
          liveA[nLive] = ripA[w] * Math.exp(-age * 0.72);
          nLive++;
        }
        w++;
      }
      nRip = w;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const Rp = clamp(R * 0.5, 58, 200);
      const Rp2 = Rp * Rp;
      const dm0 = 1 / (R * 0.22);
      cnt.fill(0);
      for (let j = 0; j < nS; j++) {
        const x1 = ux[j] * cosY + uz[j] * sinY;
        const z1 = -ux[j] * sinY + uz[j] * cosY;
        const y2 = uy[j] * cosT - z1 * sinT;
        const z2 = uy[j] * sinT + z1 * cosT;
        const h = nLive ? waveAt(x1, y2, z2) : 0;
        const r1 = 1 + h;
        const pp = 1 / (1 - 0.3 * z2 * r1);
        const bx = cx + x1 * r1 * R * pp;
        const by = cy + y2 * r1 * R * pp;
        const act = t >= formAt + sdl[j];
        if (dt > 0) {
          const otx = act ? 0 : osx[j] * W;
          const oty = act ? 0 : osy[j] * H;
          let ax = (otx - ox[j]) * 15 - ovx[j] * 7.2;
          let ay = (oty - oy[j]) * 15 - ovy[j] * 7.2;
          if (act && px > -1e4) {
            const dx = bx + ox[j] - px;
            const dy = by + oy[j] - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < Rp2 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const q = 1 - d / Rp;
              const wq = q * q * (3 - 2 * q) * (z2 > -0.3 ? 1 : 0.25);
              if (dragging) {
                // swipe: carry the dots along the finger and rough them up into a band
                const k = 0.32 * (0.6 + 0.8 * (rx[j] * 0.5 + 0.5)) * wq;
                ax += dvx * k + rx[j] * wq * 130;
                ay += dvy * k + ry[j] * wq * 130;
              } else {
                const f = wq * R * 2.6;
                ax += (dx / d) * f - (dy / d) * f * 0.4;
                ay += (dy / d) * f + (dx / d) * f * 0.4;
              }
            }
          }
          ovx[j] += ax * dt;
          ovy[j] += ay * dt;
          const sp = ovx[j] * ovx[j] + ovy[j] * ovy[j];
          if (sp > 250000) {
            const c = 500 / Math.sqrt(sp);
            ovx[j] *= c;
            ovy[j] *= c;
          }
          ox[j] += ovx[j] * dt;
          oy[j] += ovy[j] * dt;
          const om = Math.abs(ox[j]) + Math.abs(oy[j]);
          if (act && om > R * 0.9) {
            ox[j] *= (R * 0.9) / om;
            oy[j] *= (R * 0.9) / om;
          }
        }
        spx[j] = bx + ox[j];
        spy[j] = by + oy[j];
        sdz[j] = z2;
        // brightness: rim glow + soft key light, boosted where dots are displaced
        const rim = 1 - Math.abs(z2);
        let lit = x1 * LX + y2 * LY + z2 * LZ;
        lit = lit > 0 ? lit : 0;
        let dm = act ? (Math.abs(ox[j]) + Math.abs(oy[j])) * dm0 : 0;
        if (dm > 1) dm = 1;
        let b = 0.1 + 0.55 * rim * rim * (0.6 + 0.4 * rim) + 0.32 * lit * lit * (z2 > 0 ? 1 : 0.4);
        b += dm * 0.5 + Math.abs(h) * 1.8;
        const lv = b <= 0 ? 0 : b >= 1 ? LV - 1 : (b * (LV - 1) + 0.5) | 0;
        slv[j] = lv;
        cnt[lv]++;
        sps[j] = ssz[j] * (0.85 + 0.4 * pp) * (1 + dm * 0.7);
      }
      off[0] = 0;
      for (let l = 0; l < LV; l++) off[l + 1] = off[l] + cnt[l];
      for (let l = 0; l < LV; l++) cnt[l] = off[l];
      for (let j = 0; j < nS; j++) order[cnt[slv[j]]++] = j;
    };

    const burst = (px: number, py: number, power: number) => {
      const Rt = clamp(R * 0.62, 56, 190);
      const Rt2 = Rt * Rt;
      const ks = clamp(R / 110, 0.6, 1.8) * power;
      for (let j = 0; j < nS; j++) {
        if (sdz[j] < -0.2) continue;
        const dx = spx[j] - px;
        const dy = spy[j] - py;
        const d2 = dx * dx + dy * dy;
        if (d2 > Rt2) continue;
        const d = Math.sqrt(d2) + 0.001;
        const q = 1 - d / Rt;
        const wq = q * q * (3 - 2 * q);
        const kick = wq * ks * (60 + 140 * Math.random());
        ovx[j] += (dx / d) * kick * 0.3 + rx[j] * kick * 0.55;
        ovy[j] += (dy / d) * kick * 0.3 + ry[j] * kick * 0.55;
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // halo dust
      const ease = clamp((t - formAt) / 2.4, 0, 1);
      if (ease > 0) {
        const rotH = rotY * 0.5 + 1.3;
        const cH = Math.cos(rotH);
        const sH = Math.sin(rotH);
        const cT = Math.cos(tilt * 0.8);
        const sT = Math.sin(tilt * 0.8);
        for (let pass = 0; pass < 2; pass++) {
          ctx.fillStyle = pass ? "#a9c9ff" : "#4d86ff";
          ctx.globalAlpha = (pass ? 0.62 : 0.34) * ease;
          for (let k = 0; k < nH; k++) {
            const x1 = hux[k] * cH + huz[k] * sH;
            const z1 = -hux[k] * sH + huz[k] * cH;
            const y2 = huy[k] * cT - z1 * sT;
            const z2 = huy[k] * sT + z1 * cT;
            if ((z2 >= 0 ? 1 : 0) !== pass) continue;
            const hh = nLive ? waveAt(x1, y2, z2) * 1.6 : 0;
            const rad = (0.7 + 0.3 * ease) * hr[k] * (1 + hh + 0.025 * Math.sin(t * 0.7 + hph[k]));
            const pp = 1 / (1 - 0.3 * z2 * rad);
            const s = hsz[k] * (0.8 + 0.4 * pp);
            ctx.fillRect(cx + x1 * R * rad * pp - s / 2, cy + y2 * R * rad * pp - s / 2, s, s);
          }
        }
      }

      // sphere
      for (let lv = 0; lv < LV; lv++) {
        const a = off[lv];
        const b = off[lv + 1];
        if (a === b) continue;
        ctx.fillStyle = SCOL[lv];
        ctx.globalAlpha = SALP[lv];
        for (let k = a; k < b; k++) {
          const j = order[k];
          const s = sps[j];
          ctx.fillRect(spx[j] - s / 2, spy[j] - s / 2, s, s);
        }
      }

      // logo
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

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (t < formAt + 1.2) return;
      const [px, py] = local(e);
      if (Math.hypot(px - cx, py - cy) > R * 1.35) return;
      drag.down = true;
      drag.id = e.pointerId;
      drag.lx = px;
      drag.ly = py;
      drag.dx = 0;
      drag.dy = 0;
      const now = performance.now();
      combo = now - lastTap < 380 ? Math.min(combo + 1, 6) : 0;
      lastTap = now;
      const power = 1 + combo * 0.28;
      addRipple((px - cx) / R, (py - cy) / R, 0.06 * power);
      burst(px, py, power);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.down || e.pointerId !== drag.id) return;
      const [px, py] = local(e);
      drag.dx += px - drag.lx;
      drag.dy += py - drag.ly;
      drag.lx = px;
      drag.ly = py;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId === drag.id) drag.down = false;
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

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

      // spin: follow the finger while dragging, keep gliding after release, then settle
      const dragging = drag.down && hasP;
      if (drag.down) {
        const k = 1.1 / R;
        rotY += drag.dx * k;
        tilt = clamp(tilt + (drag.dy * 0.8) / R, -0.7, 0.7);
        spin += (clamp((drag.dx * k) / dt, -7, 7) - spin) * Math.min(1, dt * 10);
        dvx += (drag.dx / dt - dvx) * Math.min(1, dt * 12);
        dvy += (drag.dy / dt - dvy) * Math.min(1, dt * 12);
        drag.dx = 0;
        drag.dy = 0;
      } else {
        const base = 0.2 + (hasP ? clamp((px - cx) / AW, -0.5, 0.5) * 0.5 : 0);
        spin += (base - spin) * Math.min(1, dt * 1.4);
        rotY += spin * dt;
        const dec = Math.exp(-dt * 10);
        dvx *= dec;
        dvy *= dec;
        const tt = hasP ? clamp((py - cy) / AH, -0.5, 0.5) * 0.7 : 0.18;
        tilt += (tt - tilt) * Math.min(1, dt * 2.5);
      }
      project(dt, ppx, ppy, dragging);
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
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
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
