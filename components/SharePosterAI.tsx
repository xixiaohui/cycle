/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import polyline from "polyline";
import dayjs from "dayjs";

/**
 * =========================================================
 * Premium AI Cycling Poster Renderer v4.1 — Stable Final
 * =========================================================
 * 新增：
 * • Tile timeout + 错误分类
 * • inflight 去重
 * • React/StrictMode 重复渲染保护
 * • AbortSignal 友好支持
 * • createImageBitmap 不可用时自动回退 Image
 */

// ========== 常量 ==========
export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1920;

const TILE_SIZE = 256;
const MEMORY_TILE_CACHE = 400;

const G = 8;
const SAFE = G * 8; // 64
const MARGIN = G * 10; // 80

// 地图区（海报上半部）
const MAP_TOP = 180;
const MAP_BOTTOM = 1180;
const INFO_TOP = MAP_BOTTOM + 40;

// ========== Tile Provider ==========
const TILE_PROVIDERS = {
  cartoDark: {
    subdomains: ["a", "b", "c", "d"],
    template: (s: string, z: number, x: number, y: number) =>
      `https://${s}.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png`,
    needsFilter: false,
    attribution: "© CARTO © OpenStreetMap contributors",
  },
  osm: {
    subdomains: ["a", "b", "c"],
    template: (s: string, z: number, x: number, y: number) =>
      `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`,
    needsFilter: true,
    attribution: "© OpenStreetMap contributors",
  },
} as const;

const PROVIDER = TILE_PROVIDERS.cartoDark;

// ========== 字体 ==========
const FONT_DISPLAY =
  '"Inter","Helvetica Neue","PingFang SC",system-ui,sans-serif';
const FONT_SANS = FONT_DISPLAY;
const FONT_MONO = '"JetBrains Mono","SF Mono","Roboto Mono","Menlo",monospace';

const F = {
  monoBold11: `700 11px ${FONT_MONO}`,
  monoBold12: `700 12px ${FONT_MONO}`,
  monoBold13: `700 13px ${FONT_MONO}`,
  monoBold14: `800 14px ${FONT_MONO}`,
  mono500_10: `500 10px ${FONT_MONO}`,
  mono500_11: `500 11px ${FONT_MONO}`,
  mono500_12: `500 12px ${FONT_MONO}`,
  mono500_13: `500 13px ${FONT_MONO}`,
  mono600_11: `600 11px ${FONT_MONO}`,
  mono600_12: `600 12px ${FONT_MONO}`,
  mono600_13: `600 13px ${FONT_MONO}`,
  sans400_18: `400 18px ${FONT_SANS}`,
  sans500_18: `500 18px ${FONT_SANS}`,
  display800_44: `800 44px ${FONT_DISPLAY}`,
  display800_46: `800 46px ${FONT_DISPLAY}`,
};

// ========== 类型 ==========
export interface RidingPlan {
  duration_min?: number;
  description?: string;
  climb?: number;
  start_time?: string;
  avg_speed?: number;
  max_speed?: number;
}

export interface PosterData {
  title: string;
  distance: string;
  encodedPolyline: string;
  ridingPlan?: RidingPlan;
  zoom?: number;
  location?: string;
  rideNo?: string;
  elevationProfile?: number[];
}

export type TileErrorKind =
  | "timeout"
  | "aborted"
  | "http"
  | "network"
  | "decode"
  | "unknown";

export interface TileErrorInfo {
  key?: string;
  url: string;
  kind: TileErrorKind;
  status?: number;
  message?: string;
  error?: unknown;
}

export interface RenderOptions {
  width?: number;
  height?: number;
  theme?: keyof typeof THEMES;
  onProgress?: (p: number) => void;
  noise?: boolean;
  tileTimeout?: number;
  /** 轨迹占地图区比例 0.7~0.95，默认 0.85 */
  fitPercent?: number;
  /** 额外世界空间留白 % */
  marginPercent?: number;
  /** 最多加载多少张瓦片，超出自动降 zoom */
  maxTiles?: number;
  /** 加载并发数 */
  concurrency?: number;

  /** React useEffect cleanup / 主动取消 */
  signal?: AbortSignal;

  /** 调试日志 */
  debug?: boolean;

  /** 瓦片错误回调 */
  onTileError?: (err: TileErrorInfo) => void;
}

interface Theme {
  bg: string;
  bgDeep: string;
  paper: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  subText: string;
  mutedText: string;
  hairline: string;
  glass: string;
  glassBorder: string;
  trackStart: string;
  trackMid: string;
  trackEnd: string;
  glow: string;
}

type TileDrawable = ImageBitmap | HTMLImageElement;

// ========== 主题 ==========
const THEMES: Record<string, Theme> = {
  electric: {
    bg: "#0A0F1C",
    bgDeep: "#03060D",
    paper: "#0E1524",
    primary: "#00E5FF",
    secondary: "#7A6BFF",
    accent: "#FFC93C",
    text: "#F5F7FA",
    subText: "rgba(245,247,250,0.72)",
    mutedText: "rgba(245,247,250,0.38)",
    hairline: "rgba(245,247,250,0.10)",
    glass: "rgba(255,255,255,0.04)",
    glassBorder: "rgba(255,255,255,0.10)",
    trackStart: "#00E5FF",
    trackMid: "#A8F0FF",
    trackEnd: "#FFC93C",
    glow: "rgba(0,229,255,0.55)",
  },
  race_red: {
    bg: "#140707",
    bgDeep: "#070202",
    paper: "#1A0A0A",
    primary: "#FF3B30",
    secondary: "#FF9F0A",
    accent: "#FFD60A",
    text: "#F8F5F2",
    subText: "rgba(248,245,242,0.74)",
    mutedText: "rgba(248,245,242,0.38)",
    hairline: "rgba(248,245,242,0.10)",
    glass: "rgba(255,255,255,0.04)",
    glassBorder: "rgba(255,255,255,0.10)",
    trackStart: "#FF3B30",
    trackMid: "#FF9F0A",
    trackEnd: "#FFD60A",
    glow: "rgba(255,59,48,0.55)",
  },
  forest: {
    bg: "#06140E",
    bgDeep: "#020806",
    paper: "#0A1A12",
    primary: "#34D399",
    secondary: "#60A5FA",
    accent: "#FBBF24",
    text: "#F0FFF4",
    subText: "rgba(240,255,244,0.74)",
    mutedText: "rgba(240,255,244,0.38)",
    hairline: "rgba(240,255,244,0.10)",
    glass: "rgba(255,255,255,0.04)",
    glassBorder: "rgba(255,255,255,0.10)",
    trackStart: "#34D399",
    trackMid: "#A7F3D0",
    trackEnd: "#FBBF24",
    glow: "rgba(52,211,153,0.55)",
  },
  monochrome: {
    bg: "#0F0F0F",
    bgDeep: "#000000",
    paper: "#161616",
    primary: "#FFFFFF",
    secondary: "#A0A0A0",
    accent: "#FFC93C",
    text: "#FFFFFF",
    subText: "rgba(255,255,255,0.72)",
    mutedText: "rgba(255,255,255,0.40)",
    hairline: "rgba(255,255,255,0.12)",
    glass: "rgba(255,255,255,0.03)",
    glassBorder: "rgba(255,255,255,0.10)",
    trackStart: "#FFFFFF",
    trackMid: "#FFFFFF",
    trackEnd: "#FFC93C",
    glow: "rgba(255,255,255,0.40)",
  },
};

// ========== 稳定性状态 ==========
const inflightTileLoads = new Map<string, Promise<TileDrawable | null>>();
const activeRenderTokens = new WeakMap<CanvasRenderingContext2D, symbol>();

// ========== 工具 ==========
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function latLngToWorldPixel(lat: number, lng: number, zoom: number) {
  const tile = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * tile * TILE_SIZE;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    tile *
    TILE_SIZE;
  return { x, y };
}

function computeBounds(points: { x: number; y: number }[]) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    w: maxX - minX || 1,
    h: maxY - minY || 1,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

const SUPPORT_LETTER_SPACING = (() => {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas").getContext("2d") as any;
    return c && "letterSpacing" in c;
  } catch {
    return false;
  }
})();

function fillTextSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: "left" | "right" | "center" = "left"
) {
  if (SUPPORT_LETTER_SPACING) {
    const c = ctx as any;
    const old = c.letterSpacing;
    const oldAlign = ctx.textAlign;
    c.letterSpacing = `${spacing}px`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.textAlign = oldAlign;
    c.letterSpacing = old || "0px";
    return;
  }

  const chars = [...text];
  const widths: number[] = [];
  let total = 0;

  for (const ch of chars) {
    const w = ctx.measureText(ch).width;
    widths.push(w);
    total += w;
  }

  total += spacing * (chars.length - 1);

  let cursor = x;
  if (align === "right") cursor = x - total;
  else if (align === "center") cursor = x - total / 2;

  const oldAlign = ctx.textAlign;
  ctx.textAlign = "left";

  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cursor, y);
    cursor += widths[i] + spacing;
  }

  ctx.textAlign = oldAlign;
}

function makeAbortError(message = "Poster render aborted") {
  return new DOMException(message, "AbortError");
}

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

function isRenderAlive(
  ctx: CanvasRenderingContext2D,
  renderToken: symbol,
  signal?: AbortSignal
) {
  return activeRenderTokens.get(ctx) === renderToken && !signal?.aborted;
}

function throwIfRenderCancelled(
  ctx: CanvasRenderingContext2D,
  renderToken: symbol,
  signal?: AbortSignal
) {
  if (!isRenderAlive(ctx, renderToken, signal)) {
    throw makeAbortError();
  }
}

function classifyFetchError(err: unknown, didTimeout: boolean): TileErrorKind {
  if (didTimeout) return "timeout";
  if (isAbortError(err)) return "aborted";
  if (err instanceof TypeError) return "network";
  return "unknown";
}

function reportTileError(
  err: TileErrorInfo,
  opts?: { debug?: boolean; onTileError?: (err: TileErrorInfo) => void }
) {
  opts?.onTileError?.(err);
  if (opts?.debug) {
    const prefix = `[tile:${err.kind}]`;
    if (err.kind === "http") {
      console.warn(prefix, err.status, err.url, err.message || "");
    } else {
      console.warn(prefix, err.url, err.message || "", err.error || "");
    }
  }
}

function formatLat(lat: number) {
  return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"}`;
}

function formatLng(lng: number) {
  return `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`;
}

async function blobToDrawable(blob: Blob): Promise<TileDrawable> {
  if (typeof createImageBitmap === "function") {
    return await createImageBitmap(blob);
  }

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error("image decode failed"));
    };

    img.src = objUrl;
  });
}

// ========== LRU + IDB ==========
class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private max: number) {}

  get(k: K) {
    const v = this.cache.get(k);
    if (v !== undefined) {
      this.cache.delete(k);
      this.cache.set(k, v);
    }
    return v;
  }

  set(k: K, v: V) {
    if (this.cache.has(k)) {
      this.cache.delete(k);
    } else if (this.cache.size >= this.max) {
      const first = this.cache.keys().next().value;
      if (first !== undefined) this.cache.delete(first);
    }
    this.cache.set(k, v);
  }
}

const tileCache = new LRUCache<string, TileDrawable>(MEMORY_TILE_CACHE);

let idbDB: IDBDatabase | null = null;
let idbReady: Promise<IDBDatabase | null> | null = null;

function openIDB(): Promise<IDBDatabase | null> {
  if (idbReady) return idbReady;

  idbReady = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);

      const req = indexedDB.open("poster_tiles_v1", 1);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("tiles")) {
          db.createObjectStore("tiles");
        }
      };

      req.onsuccess = () => {
        idbDB = req.result;
        resolve(idbDB);
      };

      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return idbReady;
}

async function idbGet(key: string): Promise<Blob | null> {
  const db = await openIDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("tiles", "readonly");
      const r = tx.objectStore("tiles").get(key);
      r.onsuccess = () => resolve((r.result as Blob) || null);
      r.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(key: string, blob: Blob) {
  const db = await openIDB();
  if (!db) return;

  try {
    const tx = db.transaction("tiles", "readwrite");
    tx.objectStore("tiles").put(blob, key);
  } catch {
    // ignore
  }
}

async function idbDelete(key: string) {
  const db = await openIDB();
  if (!db) return;

  try {
    const tx = db.transaction("tiles", "readwrite");
    tx.objectStore("tiles").delete(key);
  } catch {
    // ignore
  }
}

// ========== 预连接 ==========
let preconnectInjected = false;

function injectPreconnect() {
  if (preconnectInjected || typeof document === "undefined") return;
  preconnectInjected = true;

  for (const sub of PROVIDER.subdomains) {
    const l = document.createElement("link");
    l.rel = "preconnect";
    l.href = `https://${sub}.basemaps.cartocdn.com`;
    l.crossOrigin = "anonymous";
    document.head.appendChild(l);
  }
}

// ========== Tile 加载 ==========
async function fetchTileBlob(
  url: string,
  timeout: number
): Promise<{ blob: Blob | null; error?: TileErrorInfo }> {
  const ctrl = new AbortController();
  let didTimeout = false;

  const timer = globalThis.setTimeout(() => {
    didTimeout = true;
    ctrl.abort(makeAbortError("Tile request timeout"));
  }, timeout);

  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      credentials: "omit",
      cache: "force-cache",
    });

    if (!res.ok) {
      return {
        blob: null,
        error: {
          url,
          kind: "http",
          status: res.status,
          message: `HTTP ${res.status}`,
        },
      };
    }

    const blob = await res.blob();
    return { blob };
  } catch (err) {
    return {
      blob: null,
      error: {
        url,
        kind: classifyFetchError(err, didTimeout),
        message: err instanceof Error ? err.message : String(err),
        error: err,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

async function loadTile(
  key: string,
  url: string,
  timeout: number,
  options?: {
    signal?: AbortSignal;
    debug?: boolean;
    onTileError?: (err: TileErrorInfo) => void;
  }
): Promise<TileDrawable | null> {
  if (options?.signal?.aborted) return null;

  const mem = tileCache.get(key);
  if (mem) return mem;

  const pending = inflightTileLoads.get(key);
  if (pending) {
    const shared = await pending;
    if (options?.signal?.aborted) return null;
    return shared;
  }

  const task = (async () => {
    const cachedBlob = await idbGet(key);

    if (cachedBlob) {
      try {
        const drawable = await blobToDrawable(cachedBlob);
        tileCache.set(key, drawable);
        return drawable;
      } catch (err) {
        await idbDelete(key);
        reportTileError(
          {
            key,
            url,
            kind: "decode",
            message: "IndexedDB cached tile decode failed",
            error: err,
          },
          options
        );
      }
    }

    const { blob, error } = await fetchTileBlob(url, timeout);

    if (!blob) {
      if (error) reportTileError({ ...error, key }, options);
      return null;
    }

    void idbPut(key, blob);

    try {
      const drawable = await blobToDrawable(blob);
      tileCache.set(key, drawable);
      return drawable;
    } catch (err) {
      reportTileError(
        {
          key,
          url,
          kind: "decode",
          message: "Fetched tile decode failed",
          error: err,
        },
        options
      );
      return null;
    }
  })().finally(() => {
    inflightTileLoads.delete(key);
  });

  inflightTileLoads.set(key, task);

  const result = await task;
  if (options?.signal?.aborted) return null;
  return result;
}

// ========== Douglas-Peucker 抽稀 ==========
function simplifyTrack(pts: { x: number; y: number }[], eps: number) {
  if (pts.length < 200) return pts;
  return douglasPeucker(pts, eps);
}

function douglasPeucker(
  pts: { x: number; y: number }[],
  eps: number
): { x: number; y: number }[] {
  if (pts.length < 3) return pts;

  let max = 0;
  let idx = 0;

  const end = pts.length - 1;
  const a = pts[0];
  const b = pts[end];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const mag = Math.hypot(dx, dy) || 1;
  const c = b.x * a.y - b.y * a.x;

  for (let i = 1; i < end; i++) {
    const p = pts[i];
    const d = Math.abs((dy * p.x - dx * p.y + c) / mag);
    if (d > max) {
      max = d;
      idx = i;
    }
  }

  if (max > eps) {
    const L = douglasPeucker(pts.slice(0, idx + 1), eps);
    const R = douglasPeucker(pts.slice(idx), eps);
    return [...L.slice(0, -1), ...R];
  }

  return [a, b];
}

// ========== 地图渲染 ==========
async function renderMap(
  ctx: CanvasRenderingContext2D,
  trackLatLng: number[][],
  initialZoom: number,
  theme: Theme,
  opts: {
    fitPercent: number;
    marginPercent: number;
    maxTiles: number;
    concurrency: number;
    tileTimeout: number;
    onProgress?: (p: number) => void;
    signal?: AbortSignal;
    renderToken: symbol;
    debug?: boolean;
    onTileError?: (err: TileErrorInfo) => void;
  }
) {
  injectPreconnect();
  throwIfRenderCancelled(ctx, opts.renderToken, opts.signal);

  const box = {
    x: SAFE,
    y: MAP_TOP,
    w: POSTER_WIDTH - SAFE * 2,
    h: MAP_BOTTOM - MAP_TOP,
  };

  let zoom = initialZoom;
  let tilePixels = trackLatLng.map(([la, ln]) =>
    latLngToWorldPixel(la, ln, zoom)
  );
  let bounds = computeBounds(tilePixels);

  const marginFactor = 1 + opts.marginPercent / 100;
  let trackW = bounds.w * marginFactor;
  let trackH = bounds.h * marginFactor;

  let desiredScale =
    Math.min(box.w / trackW, box.h / trackH) * opts.fitPercent;
  let centerWorldX = bounds.cx;
  let centerWorldY = bounds.cy;

  const computeTileRange = (cx: number, cy: number, scale: number) => {
    const viewWorldW = box.w / scale;
    const viewWorldH = box.h / scale;
    const viewMinX = cx - viewWorldW / 2;
    const viewMinY = cy - viewWorldH / 2;
    const viewMaxX = cx + viewWorldW / 2;
    const viewMaxY = cy + viewWorldH / 2;

    const xMinTile = Math.floor(viewMinX / TILE_SIZE);
    const xMaxTile = Math.floor(viewMaxX / TILE_SIZE);
    const yMinTile = Math.floor(viewMinY / TILE_SIZE);
    const yMaxTile = Math.floor(viewMaxY / TILE_SIZE);

    return {
      xMinTile,
      xMaxTile,
      yMinTile,
      yMaxTile,
      cols: xMaxTile - xMinTile + 1,
      rows: yMaxTile - yMinTile + 1,
      count: (xMaxTile - xMinTile + 1) * (yMaxTile - yMinTile + 1),
      viewMinX,
      viewMinY,
    };
  };

  let range = computeTileRange(centerWorldX, centerWorldY, desiredScale);

  while (range.count > opts.maxTiles && zoom > 1) {
    zoom -= 1;
    tilePixels = trackLatLng.map(([la, ln]) =>
      latLngToWorldPixel(la, ln, zoom)
    );
    bounds = computeBounds(tilePixels);
    trackW = bounds.w * marginFactor;
    trackH = bounds.h * marginFactor;
    desiredScale = Math.min(box.w / trackW, box.h / trackH) * opts.fitPercent;
    centerWorldX = bounds.cx;
    centerWorldY = bounds.cy;
    range = computeTileRange(centerWorldX, centerWorldY, desiredScale);
  }

  const { xMinTile, xMaxTile, yMinTile, yMaxTile, viewMinX, viewMinY } = range;
  const total = range.count;

  const cxTile = (xMinTile + xMaxTile) / 2;
  const cyTile = (yMinTile + yMaxTile) / 2;

  type Job = {
    tx: number;
    ty: number;
    key: string;
    url: string;
    dist: number;
  };

  const jobs: Job[] = [];
  let subIdx = 0;

  for (let ty = yMinTile; ty <= yMaxTile; ty++) {
    for (let tx = xMinTile; tx <= xMaxTile; tx++) {
      const sub = PROVIDER.subdomains[subIdx++ % PROVIDER.subdomains.length];
      jobs.push({
        tx,
        ty,
        key: `${zoom}/${tx}/${ty}`,
        url: PROVIDER.template(sub, zoom, tx, ty),
        dist: (tx - cxTile) ** 2 + (ty - cyTile) ** 2,
      });
    }
  }

  jobs.sort((a, b) => a.dist - b.dist);

  ctx.save();
  roundedRect(ctx, box.x, box.y, box.w, box.h, 16);
  ctx.clip();
  ctx.fillStyle = theme.bgDeep;
  ctx.fillRect(box.x, box.y, box.w, box.h);

  const TILE_FILTER = PROVIDER.needsFilter
    ? "grayscale(1) brightness(0.30) contrast(1.45) saturate(0)"
    : "none";

  let cursor = 0;
  let loaded = 0;

  const workerCount = Math.max(1, opts.concurrency);

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      throwIfRenderCancelled(ctx, opts.renderToken, opts.signal);

      const job = jobs[cursor++];
      if (!job) return;

      const img = await loadTile(job.key, job.url, opts.tileTimeout, {
        signal: opts.signal,
        debug: opts.debug,
        onTileError: opts.onTileError,
      });

      throwIfRenderCancelled(ctx, opts.renderToken, opts.signal);

      loaded += 1;
      opts.onProgress?.(Math.round((loaded / Math.max(total, 1)) * 70));

      if (!img) continue;

      const tileWorldX = job.tx * TILE_SIZE;
      const tileWorldY = job.ty * TILE_SIZE;
      const dx = (tileWorldX - viewMinX) * desiredScale + box.x;
      const dy = (tileWorldY - viewMinY) * desiredScale + box.y;
      const dSize = TILE_SIZE * desiredScale + 1;

      if (TILE_FILTER !== "none") {
        ctx.save();
        ctx.filter = TILE_FILTER;
        ctx.drawImage(img, dx, dy, dSize, dSize);
        ctx.restore();
      } else {
        ctx.drawImage(img, dx, dy, dSize, dSize);
      }
    }
  });

  try {
    await Promise.all(workers);
  } finally {
    ctx.restore();
  }

  throwIfRenderCancelled(ctx, opts.renderToken, opts.signal);

  ctx.globalCompositeOperation = "screen";
  const tint = ctx.createRadialGradient(
    box.x + box.w / 2,
    box.y + box.h * 0.45,
    100,
    box.x + box.w / 2,
    box.y + box.h * 0.45,
    box.w * 0.7
  );
  tint.addColorStop(0, theme.primary + "22");
  tint.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = tint;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.globalCompositeOperation = "source-over";

  return {
    box,
    tilePixels,
    scale: desiredScale,
    viewMinX,
    viewMinY,
    zoom,
  };
}

// ========== 轨迹 ==========
function drawTrack(
  ctx: CanvasRenderingContext2D,
  tilePixels: { x: number; y: number }[],
  scale: number,
  viewMinX: number,
  viewMinY: number,
  box: { x: number; y: number; w: number; h: number },
  theme: Theme
) {
  if (tilePixels.length < 2) return;

  ctx.save();
  roundedRect(ctx, box.x, box.y, box.w, box.h, 16);
  ctx.clip();

  const path = new Path2D();
  path.moveTo(
    (tilePixels[0].x - viewMinX) * scale + box.x,
    (tilePixels[0].y - viewMinY) * scale + box.y
  );

  for (let i = 1; i < tilePixels.length; i++) {
    path.lineTo(
      (tilePixels[i].x - viewMinX) * scale + box.x,
      (tilePixels[i].y - viewMinY) * scale + box.y
    );
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 28;
  ctx.strokeStyle = theme.glow;
  ctx.lineWidth = 12;
  ctx.stroke(path);
  ctx.shadowBlur = 0;

  const first = tilePixels[0];
  const last = tilePixels[tilePixels.length - 1];
  const x0 = (first.x - viewMinX) * scale + box.x;
  const y0 = (first.y - viewMinY) * scale + box.y;
  const x1 = (last.x - viewMinX) * scale + box.x;
  const y1 = (last.y - viewMinY) * scale + box.y;

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, theme.trackStart);
  grad.addColorStop(0.55, theme.trackMid);
  grad.addColorStop(1, theme.trackEnd);

  ctx.strokeStyle = grad;
  ctx.lineWidth = 7;
  ctx.stroke(path);

  ctx.restore();

  drawWaypoint(ctx, x0, y0, theme.trackStart, "START");
  drawWaypoint(ctx, x1, y1, theme.accent, "FINISH");
}

function drawWaypoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string
) {
  ctx.save();

  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = F.monoBold11;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const tw = ctx.measureText(label).width + 12;
  ctx.fillStyle = "rgba(0,0,0,0.78)";
  roundedRect(ctx, x - tw / 2, y + 18, tw, 16, 3);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(label, x, y + 26);
  ctx.restore();
}

// ========== 蒙版 ==========
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: Theme
) {
  const top = ctx.createLinearGradient(0, 0, 0, MAP_TOP);
  top.addColorStop(0, theme.bgDeep);
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, width, MAP_TOP);

  const mid = ctx.createLinearGradient(0, MAP_BOTTOM - 120, 0, MAP_BOTTOM + 80);
  mid.addColorStop(0, "rgba(0,0,0,0)");
  mid.addColorStop(1, theme.bg);
  ctx.fillStyle = mid;
  ctx.fillRect(0, MAP_BOTTOM - 120, width, 200);

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, MAP_BOTTOM + 40, width, height - MAP_BOTTOM - 40);
}

// ========== Crop Marks ==========
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: Theme
) {
  ctx.save();
  ctx.strokeStyle = theme.mutedText;
  ctx.lineWidth = 1;
  const len = 16;
  const off = 24;

  ctx.beginPath();
  ctx.moveTo(off, off);
  ctx.lineTo(off + len, off);
  ctx.moveTo(off, off);
  ctx.lineTo(off, off + len);

  ctx.moveTo(width - off, off);
  ctx.lineTo(width - off - len, off);
  ctx.moveTo(width - off, off);
  ctx.lineTo(width - off, off + len);

  ctx.moveTo(off, height - off);
  ctx.lineTo(off + len, height - off);
  ctx.moveTo(off, height - off);
  ctx.lineTo(off, height - off - len);

  ctx.moveTo(width - off, height - off);
  ctx.lineTo(width - off - len, height - off);
  ctx.moveTo(width - off, height - off);
  ctx.lineTo(width - off, height - off - len);
  ctx.stroke();
  ctx.restore();
}

// ========== 罗盘 ==========
function drawCompass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  theme: Theme
) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = theme.primary;
  ctx.beginPath();
  ctx.moveTo(0, -r + 10);
  ctx.lineTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.text;
  ctx.font = F.monoBold11;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -r + 18);

  ctx.restore();
}

// ========== Header ==========
function drawHeader(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  theme: Theme
) {
  ctx.save();

  ctx.fillStyle = theme.primary;
  ctx.fillRect(MARGIN, 88, 36, 3);

  ctx.fillStyle = theme.text;
  ctx.font = F.monoBold14;
  ctx.textBaseline = "alphabetic";
  fillTextSpaced(
    ctx,
    `CHAOHU CYCLING CLUB · ${data.rideNo || "N°024"}`,
    MARGIN,
    116,
    1.2
  );

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, 138);
  ctx.lineTo(POSTER_WIDTH - MARGIN, 138);
  ctx.stroke();

  ctx.fillStyle = theme.mutedText;
  ctx.font = F.mono500_13;
  ctx.textAlign = "right";
  ctx.fillText(
    dayjs().format("YYYY · MM · DD · ddd").toUpperCase(),
    POSTER_WIDTH - MARGIN,
    116
  );

  drawCompass(ctx, POSTER_WIDTH - MARGIN - 24, 94, 22, theme);
  ctx.restore();
}

// ========== GPS Bar ==========
function drawGpsBar(
  ctx: CanvasRenderingContext2D,
  rawTrack: number[][],
  data: PosterData,
  theme: Theme
) {
  if (rawTrack.length === 0) return;

  const start = rawTrack[0];
  const end = rawTrack[rawTrack.length - 1];

  ctx.save();
  const y = MAP_BOTTOM - 56;

  const grad = ctx.createLinearGradient(0, y - 8, 0, y + 36);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y - 8, POSTER_WIDTH, 60);

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SAFE, y);
  ctx.lineTo(POSTER_WIDTH - SAFE, y);
  ctx.stroke();

  ctx.font = F.mono500_12;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.mutedText;
  ctx.fillText("START", SAFE, y + 18);

  ctx.fillStyle = theme.text;
  ctx.font = F.mono600_13;
  ctx.fillText(`${formatLat(start[0])}  ${formatLng(start[1])}`, SAFE, y + 36);

  ctx.textAlign = "center";
  ctx.fillStyle = theme.primary;
  ctx.font = F.monoBold12;
  fillTextSpaced(
    ctx,
    data.location || "CHAOHU · ANHUI · CN",
    POSTER_WIDTH / 2,
    y + 18,
    2,
    "center"
  );

  ctx.fillStyle = theme.subText;
  ctx.font = F.mono500_11;
  fillTextSpaced(
    ctx,
    "ROUTE RECORDED VIA GPS",
    POSTER_WIDTH / 2,
    y + 36,
    1.5,
    "center"
  );

  ctx.textAlign = "right";
  ctx.fillStyle = theme.mutedText;
  ctx.font = F.mono500_12;
  ctx.fillText("FINISH", POSTER_WIDTH - SAFE, y + 18);

  ctx.fillStyle = theme.text;
  ctx.font = F.mono600_13;
  ctx.fillText(
    `${formatLat(end[0])}  ${formatLng(end[1])}`,
    POSTER_WIDTH - SAFE,
    y + 36
  );

  ctx.restore();
}

// ========== Hero ==========
function drawHero(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  theme: Theme
) {
  ctx.save();

  ctx.fillStyle = theme.primary;
  ctx.font = F.monoBold13;
  ctx.textBaseline = "alphabetic";
  fillTextSpaced(ctx, "— TOTAL DISTANCE TRAVELED", MARGIN, INFO_TOP + 30, 1.5);

  ctx.fillStyle = theme.text;

  const maxDistW = POSTER_WIDTH - MARGIN * 2 - 130;
  let fontSize = 240;

  ctx.font = `900 ${fontSize}px ${FONT_DISPLAY}`;
  const w240 = ctx.measureText(data.distance).width;

  if (w240 > maxDistW) {
    fontSize = Math.max(140, Math.floor(240 * (maxDistW / w240)));
    ctx.font = `900 ${fontSize}px ${FONT_DISPLAY}`;
  }

  const baseY = INFO_TOP + 30 + fontSize * 0.95;
  ctx.fillText(data.distance, MARGIN, baseY);

  const numW = ctx.measureText(data.distance).width;

  ctx.fillStyle = theme.primary;
  ctx.font = F.display800_44;
  ctx.fillText("KM", MARGIN + numW + 16, baseY);

  ctx.fillStyle = theme.mutedText;
  ctx.font = F.mono500_12;
  fillTextSpaced(ctx, "KILOMETERS", MARGIN + numW + 24, baseY + 22, 1.5);

  const titleY = baseY + 70;
  ctx.fillStyle = theme.text;

  let titleSize = 54;
  const upperTitle = data.title.toUpperCase();
  ctx.font = `800 ${titleSize}px ${FONT_DISPLAY}`;

  const tw54 = ctx.measureText(upperTitle).width;
  const titleMax = POSTER_WIDTH - MARGIN * 2;

  if (tw54 > titleMax) {
    titleSize = Math.max(32, Math.floor(54 * (titleMax / tw54)));
    ctx.font = `800 ${titleSize}px ${FONT_DISPLAY}`;
  }

  fillTextSpaced(ctx, upperTitle, MARGIN, titleY, 1);

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGIN, titleY + 14);
  ctx.lineTo(MARGIN + 60, titleY + 14);
  ctx.stroke();

  ctx.fillStyle = theme.subText;
  ctx.font = F.sans500_18;
  ctx.fillText(
    "A document of one ride · Recorded and rendered.",
    MARGIN + 80,
    titleY + 18
  );

  ctx.restore();
}

// ========== 海拔剖面 ==========
function drawElevationProfile(
  ctx: CanvasRenderingContext2D,
  rawTrack: number[][],
  external: number[] | undefined,
  theme: Theme,
  x: number,
  y: number,
  w: number,
  h: number
) {
  let profile: number[];

  if (external && external.length > 4) {
    profile = external;
  } else {
    const targetN = 80;
    const step = Math.max(1, Math.floor(rawTrack.length / targetN));
    profile = [];
    let prev = 0;

    for (let i = 0; i < rawTrack.length; i += step) {
      const lat = rawTrack[i][0];
      const seed =
        Math.sin(lat * 1000) * 0.5 + Math.cos(lat * 333) * 0.5;
      const v = (seed + 1) * 0.5;
      prev = prev * 0.6 + v * 0.4;
      profile.push(prev);
    }
  }

  let mn = Infinity;
  let mx = -Infinity;

  for (let i = 0; i < profile.length; i++) {
    if (profile[i] < mn) mn = profile[i];
    if (profile[i] > mx) mx = profile[i];
  }

  const range = mx - mn || 1;

  ctx.save();

  ctx.fillStyle = theme.mutedText;
  ctx.font = F.mono600_11;
  ctx.textBaseline = "alphabetic";
  fillTextSpaced(ctx, "ELEVATION PROFILE", x, y - 14, 1.5);

  ctx.textAlign = "right";
  ctx.font = F.mono500_10;
  ctx.fillText(`${Math.round(mx)}M`, x + w, y - 14);
  ctx.textAlign = "left";

  ctx.fillStyle = theme.glass;
  roundedRect(ctx, x, y, w, h, 6);
  ctx.fill();

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 1; i < 3; i++) {
    const gy = y + (h / 3) * i;
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
  }

  ctx.stroke();

  const fillPath = new Path2D();
  fillPath.moveTo(x, y + h);

  for (let i = 0; i < profile.length; i++) {
    const px = x + (i / (profile.length - 1)) * w;
    const py = y + h - ((profile[i] - mn) / range) * (h - 6) - 3;
    fillPath.lineTo(px, py);
  }

  fillPath.lineTo(x + w, y + h);
  fillPath.closePath();

  const fillGrad = ctx.createLinearGradient(x, y, x, y + h);
  fillGrad.addColorStop(0, theme.primary + "55");
  fillGrad.addColorStop(1, theme.primary + "08");
  ctx.fillStyle = fillGrad;
  ctx.fill(fillPath);

  const linePath = new Path2D();

  for (let i = 0; i < profile.length; i++) {
    const px = x + (i / (profile.length - 1)) * w;
    const py = y + h - ((profile[i] - mn) / range) * (h - 6) - 3;
    if (i === 0) linePath.moveTo(px, py);
    else linePath.lineTo(px, py);
  }

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 1.5;
  ctx.stroke(linePath);

  ctx.fillStyle = theme.mutedText;
  ctx.font = F.mono500_10;
  ctx.fillText("0KM", x, y + h + 14);

  ctx.textAlign = "right";
  ctx.fillText("DIST", x + w, y + h + 14);

  ctx.restore();
}

// ========== Stats Row ==========
function drawStatsRow(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  theme: Theme
) {
  const y = 1620;
  const x = MARGIN;
  const w = POSTER_WIDTH - MARGIN * 2;
  const h = 160;

  ctx.save();

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);

  const hour = Math.floor((data.ridingPlan?.duration_min || 0) / 60);
  const min = (data.ridingPlan?.duration_min || 0) % 60;

  const startStr = data.ridingPlan?.start_time
    ? dayjs(data.ridingPlan.start_time).format("HH:mm")
    : "06:30";

  const dateStr = data.ridingPlan?.start_time
    ? dayjs(data.ridingPlan.start_time).format("MMM DD").toUpperCase()
    : dayjs().format("MMM DD").toUpperCase();

  const avgSpeed = data.ridingPlan?.avg_speed
    ? data.ridingPlan.avg_speed.toFixed(1)
    : (
        parseFloat(data.distance) /
        Math.max((data.ridingPlan?.duration_min || 60) / 60, 0.5)
      ).toFixed(1);

  const stats = [
    {
      label: "DURATION",
      value: `${hour}:${String(min).padStart(2, "0")}`,
      unit: "H : M",
      hint: dateStr,
    },
    {
      label: "ELEVATION",
      value: `${data.ridingPlan?.climb || 0}`,
      unit: "METERS",
      hint: "TOTAL CLIMB",
    },
    {
      label: "AVG SPEED",
      value: avgSpeed,
      unit: "KM / H",
      hint: "MOVING AVG",
    },
    {
      label: "DEPARTURE",
      value: startStr,
      unit: "LOCAL TIME",
      hint: "GMT+08",
    },
  ];

  const colW = w / stats.length;

  for (let i = 1; i < stats.length; i++) {
    ctx.moveTo(x + colW * i, y + 16);
    ctx.lineTo(x + colW * i, y + h - 16);
  }

  ctx.stroke();

  for (let i = 0; i < stats.length; i++) {
    const s = stats[i];
    const cx = x + colW * i + 20;

    ctx.fillStyle = theme.mutedText;
    ctx.font = F.mono600_11;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(`0${i + 1}`, cx, y + 26);

    ctx.fillStyle = theme.primary;
    ctx.font = F.monoBold12;
    fillTextSpaced(ctx, s.label, cx + 32, y + 26, 1.2);

    ctx.fillStyle = theme.text;
    ctx.font = F.display800_46;
    ctx.fillText(s.value, cx, y + 86);

    ctx.fillStyle = theme.subText;
    ctx.font = F.mono600_11;
    fillTextSpaced(ctx, s.unit, cx, y + 110, 1);

    ctx.fillStyle = theme.mutedText;
    ctx.font = F.mono500_11;
    fillTextSpaced(ctx, s.hint, cx, y + 130, 1);
  }

  ctx.restore();
}

// ========== Field Note ==========
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  if (!text) return [];

  const lines: string[] = [];
  const words = text.split(/(\s+|(?=[\u4e00-\u9fa5]))/);
  let cur = "";

  for (const w of words) {
    const t = cur + w;
    if (ctx.measureText(t).width > maxWidth && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = t;
    }
  }

  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

function drawNote(
  ctx: CanvasRenderingContext2D,
  text: string,
  theme: Theme
) {
  if (!text) return;

  ctx.save();
  const x = MARGIN;
  const y = 1810;
  const maxW = POSTER_WIDTH - MARGIN * 2 - 200;

  ctx.fillStyle = theme.accent;
  ctx.font = F.monoBold11;
  ctx.textBaseline = "alphabetic";
  fillTextSpaced(ctx, "— FIELD NOTE", x, y, 1.5);

  ctx.fillStyle = theme.subText;
  ctx.font = F.sans400_18;
  const lines = wrapText(ctx, text, maxW);

  for (let i = 0; i < Math.min(2, lines.length); i++) {
    ctx.fillText(lines[i], x, y + 28 + i * 26);
  }

  ctx.restore();
}

// ========== Footer ==========
function drawFooter(ctx: CanvasRenderingContext2D, theme: Theme) {
  ctx.save();

  const y = POSTER_HEIGHT - 60;

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y - 22);
  ctx.lineTo(POSTER_WIDTH - MARGIN, y - 22);
  ctx.stroke();

  ctx.fillStyle = theme.primary;
  ctx.fillRect(MARGIN, y, 24, 2);

  ctx.fillStyle = theme.subText;
  ctx.font = F.monoBold12;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  fillTextSpaced(ctx, "RIDE · EXPLORE · REPEAT", MARGIN + 36, y + 7, 1.5);

  ctx.fillStyle = theme.mutedText;
  ctx.font = F.mono600_11;
  ctx.textAlign = "center";
  fillTextSpaced(ctx, PROVIDER.attribution, POSTER_WIDTH / 2, y + 7, 1, "center");

  ctx.textAlign = "right";
  ctx.font = F.mono500_11;
  ctx.fillText("GENERATED BY AI · v4.1", POSTER_WIDTH - MARGIN, y + 7);

  ctx.restore();
}

// ========== 噪点 ==========
let noisePattern: CanvasPattern | null = null;
let noiseCanvas: HTMLCanvasElement | null = null;

function buildNoise(): HTMLCanvasElement {
  if (noiseCanvas) return noiseCanvas;

  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 96;

  const n = c.getContext("2d")!;
  const img = n.createImageData(96, 96);

  for (let i = 0; i < img.data.length; i += 4) {
    const v = 100 + Math.random() * 155;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = Math.random() * 12;
  }

  n.putImageData(img, 0, 0);
  noiseCanvas = c;
  return c;
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  if (!noisePattern) {
    noisePattern = ctx.createPattern(buildNoise(), "repeat");
  }
  if (!noisePattern) return;

  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = noisePattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// ========== 主渲染 ==========
export async function renderPosterFast(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  options?: RenderOptions
) {
  const t0 = performance.now();

  const width = options?.width || POSTER_WIDTH;
  const height = options?.height || POSTER_HEIGHT;
  const theme = THEMES[options?.theme || "electric"];
  const enableNoise = options?.noise !== false;

  const renderToken = Symbol("poster-render");
  activeRenderTokens.set(ctx, renderToken);

  try {
    options?.onProgress?.(0);
    throwIfRenderCancelled(ctx, renderToken, options?.signal);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    const rawTrack = polyline.decode(data.encodedPolyline || "");
    throwIfRenderCancelled(ctx, renderToken, options?.signal);

    if (rawTrack.length === 0) {
      drawHeader(ctx, data, theme);
      drawHero(ctx, data, theme);
      drawStatsRow(ctx, data, theme);
      drawNote(ctx, data.ridingPlan?.description || "", theme);
      drawFooter(ctx, theme);
      drawCropMarks(ctx, width, height, theme);
      if (enableNoise) drawNoise(ctx, width, height);
      options?.onProgress?.(100);
      return;
    }

    const map = await renderMap(ctx, rawTrack, data.zoom || 14, theme, {
      fitPercent: options?.fitPercent ?? 0.85,
      marginPercent: options?.marginPercent ?? 10,
      maxTiles: options?.maxTiles ?? 64,
      concurrency: options?.concurrency ?? 4,
      tileTimeout: options?.tileTimeout ?? 10000,
      onProgress: options?.onProgress,
      signal: options?.signal,
      renderToken,
      debug: options?.debug,
      onTileError: options?.onTileError,
    });

    throwIfRenderCancelled(ctx, renderToken, options?.signal);

    const simplified = simplifyTrack(map.tilePixels, 1.0);

    drawTrack(
      ctx,
      simplified,
      map.scale,
      map.viewMinX,
      map.viewMinY,
      map.box,
      theme
    );

    drawOverlay(ctx, width, height, theme);
    options?.onProgress?.(82);

    throwIfRenderCancelled(ctx, renderToken, options?.signal);

    drawGpsBar(ctx, rawTrack, data, theme);
    drawHeader(ctx, data, theme);
    drawHero(ctx, data, theme);
    drawElevationProfile(
      ctx,
      rawTrack,
      data.elevationProfile,
      theme,
      MARGIN,
      1540,
      POSTER_WIDTH - MARGIN * 2,
      56
    );
    drawStatsRow(ctx, data, theme);
    drawNote(ctx, data.ridingPlan?.description || "", theme);
    drawFooter(ctx, theme);
    drawCropMarks(ctx, width, height, theme);
    if (enableNoise) drawNoise(ctx, width, height);

    options?.onProgress?.(100);

    if (options?.debug) {
      console.log(
        `[Poster] rendered in ${(performance.now() - t0).toFixed(0)}ms (zoom=${map.zoom})`
      );
    }
  } catch (err) {
    if (isAbortError(err)) {
      if (options?.debug) console.log("[Poster] render aborted");
      return;
    }
    throw err;
  } finally {
    if (activeRenderTokens.get(ctx) === renderToken) {
      activeRenderTokens.delete(ctx);
    }
  }
}

// ========== 预热 ==========
export async function warmUp(signal?: AbortSignal) {
  if (signal?.aborted) return;
  injectPreconnect();
  await openIDB();
}

// ========== 导出 ==========
export async function exportPosterBlob(
  canvas: HTMLCanvasElement,
  quality = 0.94
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("export failed"))),
      "image/jpeg",
      quality
    );
  });
}

export async function exportPosterPNG(
  canvas: HTMLCanvasElement
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("export failed"))),
      "image/png"
    );
  });
}
