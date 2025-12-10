// poster.ts
// 单文件骑行海报模板引擎（TypeScript）
// Usage: await renderPoster(canvas.getContext('2d')!, ridingPlan, options)

type Point = [number, number]; // [lng, lat] or [x, y] depending on use
type Theme = {
  name: string;
  bgColor: string;
  titleColor: string;
  subtitleColor: string;
  infoColor: string;
  maskColor?: string;
  accent?: string;
};

type RidingPlan = {
  title?: string;
  route_name?: string;
  distance_km?: number | string;
  duration_min?: number | string;
  avg_speed?: number | string;
  date?: string;
  encodedPolyline?: string; // polyline 或者可以传 decoded polyline 数组到 drawRouteMap
  decodedPolyline?: Point[]; // optional pre-decoded
  logoImg?: HTMLImageElement | string;
  avatarImg?: HTMLImageElement | string;
  qrImg?: HTMLImageElement | string;
};

type DrawRouteMapOptions = {
  tileUrl?: (z: number, x: number, y: number) => string;
  tileZoom?: number;
  strokeStyle?: string;
  lineWidth?: number;
  onProgress?: (p: number) => void;
  mapBox?: { x: number; y: number; w: number; h: number };
  backgroundBlur?: boolean;
  tileConcurrency?: number;
};

type RenderOptions = {
  width?: number;
  height?: number;
  theme?: string;
  showQr?: boolean;
  showLogo?: boolean;
  showAvatar?: boolean;
  bottomGradient?: boolean;
  drawRouteOptions?: DrawRouteMapOptions;
};

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;

export const themes: Record<string, Theme> = {
  default: {
    name: 'default',
    bgColor: '#f3ebd3',
    titleColor: '#0f172a',
    subtitleColor: '#334155',
    infoColor: '#0f172a',
    maskColor: '0.28',
    accent: '#1f7ed0',
  },
  sport_blue: {
    name: 'sport_blue',
    bgColor: '#0b2545',
    titleColor: '#ffffff',
    subtitleColor: '#e6eefc',
    infoColor: '#ffffff',
    maskColor: '0.32',
    accent: '#2db4ff',
  },
  dark_gold: {
    name: 'dark_gold',
    bgColor: '#070707',
    titleColor: '#ffd57a',
    subtitleColor: '#ffd57a',
    infoColor: '#f3e6c9',
    maskColor: '0.45',
    accent: '#f6c85f',
  },
  fresh_green: {
    name: 'fresh_green',
    bgColor: '#e9f8f0',
    titleColor: '#0b3d2e',
    subtitleColor: '#0b3d2e',
    infoColor: '#0b3d2e',
    maskColor: '0.18',
    accent: '#2aa876',
  },
};

// --- Utilities ---
function clamp(v: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function ensureCanvas(w = DEFAULT_WIDTH, h = DEFAULT_HEIGHT) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

async function loadImageMaybe(srcOrImg?: string | HTMLImageElement | undefined): Promise<HTMLImageElement | undefined> {
  if (!srcOrImg) return undefined;
  if (typeof srcOrImg !== 'string') return srcOrImg;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = srcOrImg;
  });
}

// decode polyline (Google polyline algorithm)
function decodePolyline(str: string): Point[] {
  if (!str) return [];
  let index = 0, lat = 0, lng = 0;
  const coordinates: Point[] = [];

  while (index < str.length) {
    let b, shift = 0, result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }
  return coordinates;
}

// measureText wrapper height guess (approx)
export function textHeightFromFont(font: string) {
  // common: "bold 64px Inter" -> extract px
  const m = font.match(/(\d+)px/);
  return m ? parseInt(m[1], 10) : 16;
}

// wrap text into lines by maxWidth
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line ? (line + ' ' + words[n]) : words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = words[n];
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// lat/lng to WebMercator tile conversions
function lng2tilex(lng: number, z: number) {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z));
}
function lat2tiley(lat: number, z: number) {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, z)
  );
}
function tile2bounds(x: number, y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const lon1 = (x / Math.pow(2, z)) * 360 - 180;
  const lat1 = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  const lon2 = ((x + 1) / Math.pow(2, z)) * 360 - 180;
  const n2 = Math.PI - (2 * Math.PI * (y + 1)) / Math.pow(2, z);
  const lat2 = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n2) - Math.exp(-n2)));
  return { minLon: lon1, minLat: lat2, maxLon: lon2, maxLat: lat1 };
}

// compute bounding box for polyline (lng, lat)
function computeBounds(points: Point[]) {
  if (!points || points.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// convert lng/lat to pixel in tile coordinate at zoom z
function lngLatToPixel(lng: number, lat: number, z: number) {
  const scale = 256 * Math.pow(2, z);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = ((0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale);
  return { x, y };
}

// --- drawRouteMap : draw tiles + polyline centered in mapBox ---
async function drawRouteMap(
  ctx: CanvasRenderingContext2D,
  decodedPolyline: Point[] | undefined,
  mapBox: { x: number; y: number; w: number; h: number },
  options: DrawRouteMapOptions = {}
) {
  const {
    tileUrl,
    tileZoom = 12,
    strokeStyle = '#ff6b00',
    lineWidth = 6,
    onProgress,
    backgroundBlur = false,
    tileConcurrency = 6,
  } = options;

  // if no tileUrl, we just draw a neutral background
  if (!tileUrl) {
    ctx.save();
    ctx.fillStyle = '#e6eefc';
    ctx.fillRect(mapBox.x, mapBox.y, mapBox.w, mapBox.h);
    ctx.restore();
  }

  // decode if needed
  const points = decodedPolyline || [];
  // compute bounds in lng/lat
  const bounds = computeBounds(points);
  // choose zoom that fits bounding box; attempt a sensible zoom if bounds exist
  let z = tileZoom;
  if (bounds) {
    // approximate: increase zoom until route box occupies ~50-70% of mapBox
    for (let testZ = 18; testZ >= 3; testZ--) {
      const p1 = lngLatToPixel(bounds.minX, bounds.maxY, testZ);
      const p2 = lngLatToPixel(bounds.maxX, bounds.minY, testZ);
      const dx = Math.abs(p2.x - p1.x);
      const dy = Math.abs(p2.y - p1.y);
      if (dx < mapBox.w * 0.9 && dy < mapBox.h * 0.9) {
        z = testZ;
        break;
      }
    }
  }

  // if we have bounds, compute center in pixel coords & offset to mapBox center
  let globalOffsetX = 0, globalOffsetY = 0;
  let mapScale = 1;
  if (bounds && points.length) {
    const p1 = lngLatToPixel(bounds.minX, bounds.maxY, z);
    const p2 = lngLatToPixel(bounds.maxX, bounds.minY, z);
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);

    // scale to fit into mapBox with margins
    const margin = 40;
    const scaleX = (mapBox.w - margin * 2) / dx;
    const scaleY = (mapBox.h - margin * 2) / dy;
    mapScale = Math.min(scaleX, scaleY, 1.0);

    // center pixel
    const centerPx = lngLatToPixel((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2, z);
    const targetCenterX = mapBox.x + mapBox.w / 2;
    const targetCenterY = mapBox.y + mapBox.h / 2;
    globalOffsetX = targetCenterX - centerPx.x * mapScale;
    globalOffsetY = targetCenterY - centerPx.y * mapScale;
  }

  // tiles to draw: compute tile range by covering mapBox bounds in lat/lng
  // We'll approximate: compute pixel coords of the four corners in world pixels and find tile indexes
  const corners = [
    { x: mapBox.x, y: mapBox.y },
    { x: mapBox.x + mapBox.w, y: mapBox.y + mapBox.h },
  ];
  // compute world pixel ranges at zoom z by inverse mapping: px -> lng/lat approx
  // Instead easier: derive tile indexes covering a buffer around route bounds if available
 const tilesToFetch: { x: number; y: number; z: number }[] = [];
  if (bounds && tileUrl) {
    // expand bounds slightly
    const pad = 0.05 * Math.max(bounds.width, bounds.height);
    const minLon = bounds.minX - pad;
    const maxLon = bounds.maxX + pad;
    const minLat = bounds.minY - pad;
    const maxLat = bounds.maxY + pad;

    const txMin = lng2tilex(minLon, z);
    const txMax = lng2tilex(maxLon, z);
    const tyMin = lat2tiley(maxLat, z);
    const tyMax = lat2tiley(minLat, z);

    for (let tx = txMin; tx <= txMax; tx++) {
      for (let ty = tyMin; ty <= tyMax; ty++) {
        tilesToFetch.push({ x: tx, y: ty, z });
      }
    }
  } else if (tileUrl) {
    // fallback: fill a small grid centered on world center
    const cx = Math.pow(2, z) / 2;
    const cy = Math.pow(2, z) / 2;
    const range = 2;
    for (let tx = cx - range; tx <= cx + range; tx++) {
      for (let ty = cy - range; ty <= cy + range; ty++) {
        tilesToFetch.push({ x: tx, y: ty, z });
      }
    }
  }

  // fetch tiles with limited concurrency
  const loadTile = async (tile: { x: number; y: number; z: number }) => {
    const url = tileUrl ? tileUrl(tile.z, tile.x, tile.y) : '';
    if (!url) return null;
    try {
      const img = await loadImageMaybe(url);
      return { tile, img };
    } catch {
      return null;
    }
  };

  // concurrency queue
  const results: Array<{ tile: { x: number; y: number; z: number }; img: HTMLImageElement } | null> = [];
  let completed = 0;
  const batch = async (items: typeof tilesToFetch) => {
    const tasks: Promise<unknown>[] = [];
    for (const t of items) tasks.push(loadTile(t).then((r) => { results.push(); completed++; onProgress?.(clamp(completed / tilesToFetch.length)); }));
    await Promise.all(tasks);
  };

  // split into concurrency groups
  for (let i = 0; i < tilesToFetch.length; i += tileConcurrency) {
    const slice = tilesToFetch.slice(i, i + tileConcurrency);
    // eslint-disable-next-line no-await-in-loop
    await batch(slice);
  }

  // draw tiles
  ctx.save();
  ctx.fillStyle = '#ddd';
  ctx.fillRect(mapBox.x, mapBox.y, mapBox.w, mapBox.h);

  for (const r of results) {
    if (!r || !r.img) continue;
    const { x: tx, y: ty, z: tz } = r.tile;
    // tile top-left pixel in world coordinates
    const tilePx = { x: tx * 256, y: ty * 256 };
    const drawX = tilePx.x * mapScale + globalOffsetX;
    const drawY = tilePx.y * mapScale + globalOffsetY;
    const drawW = 256 * mapScale;
    const drawH = 256 * mapScale;
    ctx.drawImage(r.img, drawX, drawY, drawW, drawH);
  }

  // optional blur mask (cheap way: draw translucent rect)
  if (backgroundBlur) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(mapBox.x, mapBox.y, mapBox.w, mapBox.h);
  }

  // draw polyline
  if (points && points.length > 0) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const [lng, lat] = points[i];
      const px = lngLatToPixel(lng, lat, z);
      const dx = px.x * mapScale + globalOffsetX;
      const dy = px.y * mapScale + globalOffsetY;
      if (i === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    }
    ctx.stroke();

    // optional route head dot
    ctx.fillStyle = strokeStyle;
    ctx.beginPath();
    const last = points[points.length - 1];
    const lastPx = lngLatToPixel(last[0], last[1], z);
    ctx.arc(lastPx.x * mapScale + globalOffsetX, lastPx.y * mapScale + globalOffsetY, Math.max(4, lineWidth * 1.2), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
  onProgress?.(1);
}

// --- drawPosterText ---
function drawPosterText(ctx: CanvasRenderingContext2D, rp: RidingPlan, width: number, height: number, opts: RenderOptions = {}) {
  const theme = themes[opts.theme || 'default'] || themes.default;
  ctx.save();

  // TOP TITLE AREA
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title background mask for readability
  if (opts.bottomGradient !== undefined && opts.bottomGradient) {
    // If they asked bottomGradient we will draw bottom later. Here draw subtle top mask:
    ctx.fillStyle = theme.maskColor || 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, width, 320);
  }

  ctx.fillStyle = theme.titleColor;
  ctx.font = 'bold 72px Inter, sans-serif';
  const title = rp.title || '骑行记录';
  // handle long title -> wrap into max width
  const maxTitleW = width * 0.9;
  const titleLines = wrapText(ctx, title, maxTitleW);
  const titleYStart = 140;
  const lineH = textHeightFromFont(ctx.font) + 8;
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], width / 2, titleYStart + i * lineH);
  }

  // subtitle
  if (rp.route_name) {
    ctx.font = '36px Inter, sans-serif';
    ctx.fillStyle = theme.subtitleColor;
    ctx.fillText(rp.route_name, width / 2, titleYStart + titleLines.length * lineH + 46);
  }

  // BOTTOM INFO AREA
  const baseY = height - 260;
  const leftX = width * 0.08;
  const rightX = width * 0.92;
  ctx.font = '36px Inter, sans-serif';
  ctx.fillStyle = theme.infoColor;
  ctx.textAlign = 'left';
  ctx.fillText(`距离：${rp.distance_km ?? ''} km`, leftX, baseY);
  ctx.textAlign = 'right';
  ctx.fillText(`用时：${rp.duration_min ?? ''} 分钟`, rightX, baseY);

  ctx.textAlign = 'left';
  ctx.fillText(`平均速度：${rp.avg_speed ?? ''} km/h`, leftX, baseY + 64);
  ctx.textAlign = 'right';
  ctx.fillText(`日期：${rp.date ?? ''}`, rightX, baseY + 64);

  // watermark small
  ctx.font = '20px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = theme.subtitleColor;
  ctx.fillText('Powered by YourAppName', width / 2, height - 36);

  ctx.restore();
}

// --- helper to draw logo/avatar/qr if provided ---
async function drawExtras(ctx: CanvasRenderingContext2D, rp: RidingPlan, width: number, height: number, opts: RenderOptions) {
  const padding = 28;
  ctx.save();

  if (opts.showLogo && rp.logoImg) {
    const logo = await loadImageMaybe(rp.logoImg);
    if (logo) {
      const w = 120, h = 120;
      ctx.drawImage(logo, padding, padding, w, h);
    }
  }

  if (opts.showAvatar && rp.avatarImg) {
    const avatar = await loadImageMaybe(rp.avatarImg);
    if (avatar) {
      const size = 96;
      const x = width - padding - size;
      const y = padding;
      // circle clip
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, x, y, size, size);
      ctx.restore();
      ctx.save();
    }
  }

  if (opts.showQr && rp.qrImg) {
    const qr = await loadImageMaybe(rp.qrImg);
    if (qr) {
      const size = 160;
      const x = width - padding - size;
      const y = height - padding - size;
      ctx.drawImage(qr, x, y, size, size);
    }
  }

  ctx.restore();
}

// --- main renderer ---
export async function renderPoster(
  ctx: CanvasRenderingContext2D,
  ridingPlan: RidingPlan,
  options: RenderOptions = {}
) {
  // defaults
  const width = options.width || DEFAULT_WIDTH;
  const height = options.height || DEFAULT_HEIGHT;
  const theme = themes[options.theme || 'default'] || themes.default;

  // ensure canvas size matches (caller MUST set canvas.width/height accordingly)
  // but we'll adapt if not:
  try {
    const canvas = ctx.canvas;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  } catch (e) {
    // ignore
  }

  // Ensure fonts loaded externally if you rely on custom fonts
  // await document.fonts.load('72px Inter'); // caller should do this if needed

  // background
  ctx.save();
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // mapBox defaults (reserve top 300, bottom 500)
  const mapBox = options.drawRouteOptions?.mapBox ?? { x: 0, y: 300, w: width, h: height - 500 };

  // decode polyline if needed
  let decoded = ridingPlan.decodedPolyline;
  if (!decoded && ridingPlan.encodedPolyline) {
    decoded = decodePolyline(ridingPlan.encodedPolyline);
  }

  // If OffscreenCanvas available, draw map there to avoid blocking UI for heavy tiles
  const onProgress = options.drawRouteOptions?.onProgress;
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      // create offscreen, draw map there, then blit to main ctx
      const off = new OffscreenCanvas(mapBox.w, mapBox.h);
      const offCtx = off.getContext('2d') as unknown as CanvasRenderingContext2D;
      if (offCtx) {
        // adjust drawRouteMap call to write into offCtx with adjusted mapBox (0,0,w,h)
        await drawRouteMap(offCtx, decoded, { x: 0, y: 0, w: mapBox.w, h: mapBox.h }, {
          ...options.drawRouteOptions,
          onProgress: (p) => onProgress?.(p * 0.6), // map part uses 0..0.6 of total progress
        });
        // blit
        ctx.drawImage(off, mapBox.x, mapBox.y, mapBox.w, mapBox.h);
      } else {
        // fallback to main ctx
        await drawRouteMap(ctx, decoded, mapBox, options.drawRouteOptions);
      }
    } catch {
      // if Offscreen not allowed, fallback
      await drawRouteMap(ctx, decoded, mapBox, options.drawRouteOptions);
    }
  } else {
    await drawRouteMap(ctx, decoded, mapBox, options.drawRouteOptions);
  }

  // draw top mask for readability (optional)
  if (options.bottomGradient ?? true) {
    ctx.save();
    const grd = ctx.createLinearGradient(0, 0, 0, 320);
    grd.addColorStop(0, (theme.maskColor || 'rgba(0,0,0,0.2)'));
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, 320);
    ctx.restore();
  }

  // draw extras: logo, avatar, qr
  await drawExtras(ctx, ridingPlan, width, height, options);

  // draw texts
  drawPosterText(ctx, ridingPlan, width, height, options);

  // optional bottom gradient overlay for readability
  if (options.bottomGradient ?? true) {
    ctx.save();
    const g = ctx.createLinearGradient(0, height - 420, 0, height);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, height - 420, width, 420);
    ctx.restore();
  }

  // final progress callback => done
  options.drawRouteOptions?.onProgress?.(1);
  return ctx.canvas;
}

// Example usage:
//
// const canvas = document.getElementById('poster') as HTMLCanvasElement;
// canvas.width = 1080; canvas.height = 1920;
// await document.fonts.load('72px Inter'); // ensure font loaded
// const ctx = canvas.getContext('2d');
// await renderPoster(ctx!, ridingPlan, {
//   width: 1080, height: 1920, theme: 'default', showLogo: true, showQr: true,
//   drawRouteOptions: {
//     tileUrl: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
//     tileZoom: 13,
//     onProgress: (p) => console.log('map progress', p)
//   }
// });
