/**
 * Nasalis Flow live renderer engine.
 *
 * Ported from reference/nasalis-flow-live.html — a deterministic hash → PRNG →
 * traits → animated canvas pipeline. The math, constants, and rendering steps
 * mirror the original file as closely as possible. The only departures are
 * for React/Next.js compatibility:
 *  - the original's single module-level RNG (`let R`) is instead created
 *    per call to `createEngine`, so multiple instances can safely render at
 *    once instead of sharing one global generator;
 *  - the animation loop returns a `stop()` handle (the original never
 *    stopped, since it only ever ran once on a static page).
 */

export const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Generates a fresh 51-character token hash, same shape as the original generator. */
export function generateHash(): string {
  let s = "oo";
  const a = new Uint32Array(49);
  crypto.getRandomValues(a);
  for (let i = 0; i < 49; i++) s += B58[a[i] % B58.length];
  return s;
}

type Rng = () => number;

function sfc32(a: number, b: number, c: number, d: number): Rng {
  return function random() {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = ((a + b) | 0) + d | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Deterministic hash → PRNG. The same hash always yields the same generator sequence. */
function rngFromHash(hash: string): Rng {
  const seeds = [0, 0, 0, 0];
  for (let i = 0; i < hash.length; i++) {
    const k = i % 4;
    seeds[k] = (seeds[k] * 31 + hash.charCodeAt(i)) | 0;
  }
  const r = sfc32(
    seeds[0] ^ 0x9e3779b9,
    seeds[1] ^ 0x85ebca6b,
    seeds[2] ^ 0xc2b2ae35,
    seeds[3] ^ 0x27d4eb2f,
  );
  for (let i = 0; i < 20; i++) r();
  return r;
}

interface RngHelpers {
  rnd: (a?: number, b?: number) => number;
  pick: <T>(arr: T[]) => T;
  chance: (p: number) => boolean;
  weighted: <T extends { w: number }>(arr: T[]) => T;
}

function makeHelpers(R: Rng): RngHelpers {
  const rnd = (a = 1, b = 0) => b + R() * (a - b);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(R() * arr.length)];
  const chance = (p: number) => R() < p;
  function weighted<T extends { w: number }>(arr: T[]): T {
    const pool: T[] = [];
    arr.forEach((x) => {
      for (let i = 0; i < x.w; i++) pool.push(x);
    });
    return pick(pool);
  }
  return { rnd, pick, chance, weighted };
}

/* ---------- Palette (English names, consistent with metadata) ---------- */

export interface PaletteDef {
  key: string;
  bgTop: string;
  bgBot: string;
  lines: { ear: string; wajah: string; badan: string; perut: string; hidung: string };
  trail: string;
  blend: GlobalCompositeOperation;
  alpha: number;
  w: number;
}

export const PALETTES: PaletteDef[] = [
  {
    key: "Copper Etching",
    bgTop: "#120c08",
    bgBot: "#050403",
    lines: { ear: "#b5763a", wajah: "#d99a52", badan: "#8a5a2c", perut: "#e9c07f", hidung: "#f2a55c" },
    trail: "18,12,8",
    blend: "source-over",
    alpha: 0.55,
    w: 3,
  },
  {
    key: "Neon Rainforest",
    bgTop: "#040a08",
    bgBot: "#010403",
    lines: { ear: "#2fe0c0", wajah: "#6ff0e8", badan: "#1f9e88", perut: "#a8fff0", hidung: "#ff6fae" },
    trail: "4,10,8",
    blend: "lighter",
    alpha: 0.4,
    w: 2,
  },
  {
    key: "Sepia Ink",
    bgTop: "#e8ddc2",
    bgBot: "#cdbd93",
    lines: { ear: "#5a3a20", wajah: "#3a2414", badan: "#6b4a2a", perut: "#8a6a3e", hidung: "#2a1808" },
    trail: "232,221,194",
    blend: "source-over",
    alpha: 0.45,
    w: 3,
  },
  {
    key: "Midnight Blue Mist",
    bgTop: "#0a1420",
    bgBot: "#04070c",
    lines: { ear: "#5b8bb0", wajah: "#a9c9de", badan: "#3c6485", perut: "#dbe9f2", hidung: "#f0c869" },
    trail: "10,20,32",
    blend: "source-over",
    alpha: 0.48,
    w: 2,
  },
];

/* ---------- Traits (same as the static generator) ---------- */

interface FlowStyleDef {
  key: string;
  flow: number;
  swirl: number;
}

interface DensityDef {
  key: string;
  n: number;
  w: number;
}

export interface Features {
  palet: PaletteDef;
  alur: FlowStyleDef;
  kepadatan: DensityDef;
  nose: string;
  noseLen: number;
  latar: string;
}

function buildFeatures(H: RngHelpers): Features {
  const { rnd, pick, weighted } = H;
  const noseRoll = rnd();
  let noseClass: string;
  let noseLen: number;
  if (noseRoll < 0.06) {
    noseClass = "Giant";
    noseLen = rnd(1.5, 1.38);
  } else if (noseRoll < 0.28) {
    noseClass = "Large";
    noseLen = rnd(1.36, 1.18);
  } else if (noseRoll < 0.72) {
    noseClass = "Medium";
    noseLen = rnd(1.16, 0.98);
  } else {
    noseClass = "Small";
    noseLen = rnd(0.96, 0.82);
  }

  const alurOpt: FlowStyleDef[] = [
    { key: "Tight Contour", flow: 0.8, swirl: 1.2 },
    { key: "Wavy", flow: 0.48, swirl: 2.2 },
    { key: "Turbulent", flow: 0.18, swirl: 3.4 },
  ];
  const kepadatanOpt: DensityDef[] = [
    { key: "Sparse", n: 70, w: 2 },
    { key: "Medium", n: 130, w: 3 },
    { key: "Dense", n: 210, w: 1 },
  ];

  return {
    palet: weighted(PALETTES),
    alur: pick(alurOpt),
    kepadatan: weighted(kepadatanOpt),
    nose: noseClass,
    noseLen,
    latar: pick(["Dark Void", "Starry", "Soft Mist"]),
  };
}

/* ---------- Noise ---------- */

type NoiseFn = (x: number, y: number) => number;

function makeNoise(K: number, rnd: RngHelpers["rnd"]): NoiseFn {
  const terms: { fx: number; fy: number; ph: number; amp: number }[] = [];
  let wsum = 0;
  for (let i = 0; i < K; i++) {
    const amp = 1 / (i + 1);
    terms.push({ fx: rnd(0.006, 0.0012), fy: rnd(0.006, 0.0012), ph: rnd(Math.PI * 2), amp });
    wsum += amp;
  }
  return function noise(x: number, y: number) {
    let s = 0;
    for (const t of terms) s += t.amp * Math.sin(x * t.fx + y * t.fy + t.ph);
    return s / wsum;
  };
}

/* ---------- Shape mask ---------- */

const M = 260;

function drawSilhouette(ctx2: CanvasRenderingContext2D, size: number, noseLen: number) {
  const t = (v: number) => size * v;
  ctx2.save();
  ctx2.translate(size / 2, size * 0.56);
  ctx2.fillStyle = "rgb(45,45,45)";
  for (const side of [-1, 1]) {
    ctx2.beginPath();
    ctx2.ellipse(side * t(0.245), -t(0.02), t(0.099), t(0.125), 0, 0, Math.PI * 2);
    ctx2.fill();
  }
  ctx2.fillStyle = "rgb(85,85,85)";
  ctx2.beginPath();
  ctx2.ellipse(0, 0, t(0.27), t(0.3), 0, 0, Math.PI * 2);
  ctx2.fill();
  ctx2.fillStyle = "rgb(125,125,125)";
  ctx2.beginPath();
  ctx2.ellipse(0, t(0.11), t(0.235), t(0.235), 0, 0, Math.PI * 2);
  ctx2.fill();
  ctx2.fillStyle = "rgb(165,165,165)";
  ctx2.beginPath();
  ctx2.ellipse(0, t(0.2), t(0.15), t(0.13), 0, 0, Math.PI * 2);
  ctx2.fill();

  const baseY = -t(0.02);
  const w = t(0.1);
  const len = t(0.3) * noseLen;
  ctx2.fillStyle = "rgb(210,210,210)";
  ctx2.beginPath();
  ctx2.moveTo(-w * 0.9, baseY - t(0.02));
  ctx2.quadraticCurveTo(-w * 0.2, baseY + len * 0.35, -w * 0.55, baseY + len * 0.62);
  ctx2.quadraticCurveTo(-w * 0.2, baseY + len * 0.92, 0, baseY + len);
  ctx2.quadraticCurveTo(w * 0.2, baseY + len * 0.92, w * 0.55, baseY + len * 0.62);
  ctx2.quadraticCurveTo(w * 0.2, baseY + len * 0.35, w * 0.9, baseY - t(0.02));
  ctx2.quadraticCurveTo(0, baseY - t(0.075), -w * 0.9, baseY - t(0.02));
  ctx2.closePath();
  ctx2.fill();
  ctx2.restore();
}

function boxBlurPass(src: Float32Array<ArrayBufferLike>, w: number, h: number): Float32Array<ArrayBuffer> {
  const tmp = new Float32Array(w * h);
  const dst = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let cnt = 0;
      for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= w) continue;
        sum += src[y * w + xx];
        cnt++;
      }
      tmp[y * w + x] = sum / cnt;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let cnt = 0;
      for (let dy = -2; dy <= 2; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        sum += tmp[yy * w + x];
        cnt++;
      }
      dst[y * w + x] = sum / cnt;
    }
  return dst;
}

interface Mask {
  regionGrid: Uint8Array;
  field: Float32Array;
}

function buildMask(F: Features): Mask {
  const mc = document.createElement("canvas");
  mc.width = M;
  mc.height = M;
  const mctx = mc.getContext("2d");
  if (!mctx) throw new Error("2D canvas context is not available");
  mctx.fillStyle = "rgb(0,0,0)";
  mctx.fillRect(0, 0, M, M);
  drawSilhouette(mctx, M, F.noseLen);
  const img = mctx.getImageData(0, 0, M, M).data;
  const regionGrid = new Uint8Array(M * M);
  let field = new Float32Array(M * M);
  for (let i = 0; i < M * M; i++) {
    const v = img[i * 4];
    let rid: number;
    if (v < 20) rid = 0;
    else if (v < 65) rid = 1;
    else if (v < 105) rid = 2;
    else if (v < 145) rid = 3;
    else if (v < 190) rid = 4;
    else rid = 5;
    regionGrid[i] = rid;
    field[i] = rid > 0 ? 1 : 0;
  }
  field = boxBlurPass(field, M, M);
  field = boxBlurPass(field, M, M);
  field = boxBlurPass(field, M, M);
  return { regionGrid, field };
}

function regionAt(grid: Uint8Array, x: number, y: number, size: number, k: number): number {
  const mx = Math.min(M - 1, Math.max(0, Math.round(x * k)));
  const my = Math.min(M - 1, Math.max(0, Math.round(y * k)));
  return grid[my * M + mx];
}

function gradAt(field: Float32Array, x: number, y: number, k: number) {
  const mx = Math.min(M - 2, Math.max(1, Math.round(x * k)));
  const my = Math.min(M - 2, Math.max(1, Math.round(y * k)));
  const fL = field[my * M + (mx - 1)];
  const fR = field[my * M + (mx + 1)];
  const fU = field[(my - 1) * M + mx];
  const fD = field[(my + 1) * M + mx];
  return { gx: fR - fL, gy: fD - fU };
}

function colorFor(rid: number, F: Features): string {
  const map: Record<number, keyof PaletteDef["lines"]> = { 1: "ear", 2: "wajah", 3: "badan", 4: "perut", 5: "hidung" };
  return F.palet.lines[map[rid]] || F.palet.lines.wajah;
}

/* ---------- Animation engine ---------- */

interface Particle {
  x: number;
  y: number;
  rid: number;
  color: string;
  vx: number;
  vy: number;
  age: number;
  life: number;
  outside: number;
  w: number;
}

export interface EngineHandle {
  features: Features;
  stop: () => void;
}

export interface EngineOptions {
  size: number;
}

/** Starts the deterministic animated render for `hash` onto `canvas`. Returns the resolved traits and a stop handle. */
export function createEngine(canvas: HTMLCanvasElement, hash: string, opts: EngineOptions): EngineHandle {
  const size = opts.size;
  canvas.width = size;
  canvas.height = size;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) throw new Error("2D canvas context is not available");
  const ctx = ctx2d;
  const trail = document.createElement("canvas");
  trail.width = size;
  trail.height = size;
  const tctx2d = trail.getContext("2d");
  if (!tctx2d) throw new Error("2D canvas context is not available");
  const tctx = tctx2d;

  const R = rngFromHash(hash);
  const H = makeHelpers(R);
  const { rnd } = H;
  const F = buildFeatures(H);
  const mask = buildMask(F);
  const noiseA = makeNoise(5, rnd);
  const noiseB = makeNoise(5, rnd);
  const k = M / size;
  const flowWeight = F.alur.flow;
  const swirl = F.alur.swirl;
  const targetCount = F.kepadatan.n;

  function makeParticle(): Particle {
    for (let tries = 0; tries < 40; tries++) {
      const x = size * 0.5 + rnd(size * 0.36, -size * 0.36);
      const y = size * 0.56 + rnd(size * 0.34, -size * 0.3);
      const rid = regionAt(mask.regionGrid, x, y, size, k);
      if (rid > 0)
        return {
          x,
          y,
          rid,
          color: colorFor(rid, F),
          vx: Math.cos(rnd(Math.PI * 2)),
          vy: Math.sin(rnd(Math.PI * 2)),
          age: 0,
          life: rnd(240, 90),
          outside: 0,
          w: rnd(1.6, 0.6),
        };
    }
    return { x: size * 0.5, y: size * 0.56, rid: 2, color: colorFor(2, F), vx: 1, vy: 0, age: 0, life: 120, outside: 0, w: 1 };
  }

  const particles: Particle[] = [];
  for (let i = 0; i < targetCount; i++) particles.push(makeParticle());

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, F.palet.bgTop);
    g.addColorStop(1, F.palet.bgBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    if (F.latar === "Starry") {
      ctx.fillStyle = F.palet.lines.wajah;
      for (let i = 0; i < 90; i++) {
        ctx.globalAlpha = 0.15 + 0.15 * Math.sin(performance.now() * 0.0005 + i);
        ctx.beginPath();
        ctx.arc((i * 97) % size, (i * 53) % (size * 0.7), 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  let rafId = 0;
  let stopped = false;

  function frame() {
    if (stopped) return;

    tctx.globalCompositeOperation = "source-over";
    tctx.fillStyle = `rgba(${F.palet.trail},0.09)`;
    tctx.fillRect(0, 0, size, size);

    for (const p of particles) {
      const na = Math.atan2(noiseB(p.x, p.y), noiseA(p.x, p.y)) * swirl * 0.5;
      const { gx, gy } = gradAt(mask.field, p.x, p.y, k);
      const tlen = Math.hypot(gx, gy) || 1;
      const tx = -gy / tlen;
      const ty = gx / tlen;
      let dx = Math.cos(na) * (1 - flowWeight) + tx * flowWeight;
      let dy = Math.sin(na) * (1 - flowWeight) + ty * flowWeight;

      const curRid = regionAt(mask.regionGrid, p.x, p.y, size, k);
      if (curRid === 0) {
        p.outside++;
        dx += gx * 0.9;
        dy += gy * 0.9;
      } else p.outside = 0;

      p.vx = p.vx * 0.55 + dx * 0.45;
      p.vy = p.vy * 0.55 + dy * 0.45;
      const vlen = Math.hypot(p.vx, p.vy) || 1;
      p.vx /= vlen;
      p.vy /= vlen;

      const px = p.x;
      const py = p.y;
      p.x += p.vx * (size * 0.0022);
      p.y += p.vy * (size * 0.0022);
      p.age++;

      tctx.globalCompositeOperation = F.palet.blend;
      tctx.strokeStyle = p.color;
      tctx.globalAlpha = F.palet.alpha;
      tctx.lineWidth = p.w;
      tctx.beginPath();
      tctx.moveTo(px, py);
      tctx.lineTo(p.x, p.y);
      tctx.stroke();
      tctx.globalCompositeOperation = "source-over";
      tctx.globalAlpha = 1;

      if (p.age > p.life || p.outside > 10) {
        Object.assign(p, makeParticle());
      }
    }

    drawBackground();
    ctx.drawImage(trail, 0, 0);
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  return {
    features: F,
    stop() {
      stopped = true;
      cancelAnimationFrame(rafId);
    },
  };
}
