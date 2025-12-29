import { RidingPlanPro } from "@/types/ridingPlan";
import dayjs from "dayjs";
import polyline from "polyline";

export const CYCLE_TEXT: string[] = [
  `以骑行之名，与巢湖（漅湖）相伴\n沿着湖走，遇见风，遇见自己\n因为热爱，所以同行`,

  `巢湖位于中国安徽省中部的合肥市境内，涉及1区（包河区）、1县级市（巢湖市）及3县（肥东、肥西、庐江）的20个乡镇，地处长江淮河之间。总面积约775km²，东西长61km，南北均宽12km，是安徽省最大的湖泊，位列传统中国五大淡水湖之一。巢湖夜月为昔日庐阳八景之第七景。`,

  `巢湖之名始于先秦，因其位于古巢国之地而得名，其源头可追溯至有巢氏。后世又有以湖似巢状或因居巢县而得名的说法。古时为区别于地名“巢”、城名“鄛”，又叫漅湖（“漅”，拼音：jiǎo，南京官话：ziao3，子小切），民间误写做焦湖。`,

  `巢湖位于中新生代形成的巢湖断陷盆地南部，形成与更新世发育的河谷平原上，距今约一万年，属于河成型湖泊，当时面积约有2000km²。湖区属北亚热带季风气候，年均气温16.1℃。四周分布着银屏山、凤凰山、冶父山、大别山、防虎山等，流域总面积13130km²，其中巢湖闸上面积9130km²，闸下面积4000km²。流域内河流共33条，分别属杭埠河-丰乐河、派河、南淝河-店埠河、柘皋河、白石山河、兆河、裕溪河7大水系，其主要出入河流有9条，分别为合肥市巢湖市、庐江县境内的南淝河、十五里河、派河、柘皋河、双桥河、兆河、白石天河（白石天河后汇引入杭蚌河）、裕溪河等河，以及流经六安市舒城县与合肥市肥西县的杭埠河，其中入湖水量最大的是杭埠河，约占总入湖水量的60％左右。裕溪河是巢湖唯一的出水通道，同时最后经由裕溪口汇入长江。`,

  `湖泊类型:	淡水湖\n
  主要流入:	杭埠河、南淝河、十五里河、派河、柘皋河、双桥河、兆河、白石天河、烔炀河等\n
  主要流出:	裕溪河\n
  集水面积:	12938 km2\n
  所在国家:	中国\n
  最大长度:	61 千米\n
  最大宽度:	12 千米\n
  表面积:	775 平方千米\n
  平均深度:	2.69 米\n
  最大深度:	3.77 米\n
  水体体积:	20.7×108 m3\n
  岸长:	181 千米\n
  岛屿:	姥山岛、孤山岛\n
  定居点:	合肥市、长临河镇、严店乡、三河镇、盛桥镇、同大镇、白山镇、巢湖市、中庙街道、黄麓镇、烔炀镇、中垾镇、散兵镇、槐林镇`,
];


export const SHARE_IAMGE_WIDTH = 1280;
export const SHARE_IAMGE_HEIGHT = 1707;


export const formatDateSmart = (dateString: string) => {
  if (!dateString) return "";

  // 判断是否为 ISO 格式
  const isISO =
    dateString.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateString);

  if (!isISO) return dateString;

  const date = new Date(dateString);

  // 强制转为上海时间
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  const h = parts.find((p) => p.type === "hour")?.value;
  const mm = parts.find((p) => p.type === "minute")?.value;

  return `${y}年${m}月${d}日 ${h}:${mm}`;
};

export const formatDayjs = (str: string) => {
  // const isoString = "2025-12-05T05:46:50.776423+00:00";
  const formatted = dayjs(str).format("YYYY-MM-DD HH:mm");
  // console.log(formatted);
  return formatted;
};

// Google Polyline 解码函数
function decodePolyline(str: string): [number, number][] {
  let index = 0,
    lat = 0,
    lng = 0;
  const coordinates: [number, number][] = [];

  while (index < str.length) {
    let result = 1,
      shift = 0,
      b: number;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push([lat * 1e-5, lng * 1e-5] as [number, number]);
  }
  return coordinates;
}

// 工具函数
// function loadImage(src: string): Promise<HTMLImageElement> {
//   return new Promise((res) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => res(img);
//     img.src = src;
//   });
// }

function loadImage(src: string, timeout = 2500): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      reject(new Error("Image load timeout: " + src));
    }, timeout);

    img.crossOrigin = "anonymous";

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Image failed: " + src));
    };

    img.src = src;
  });
}

async function emojiToImage(emoji: string, size = 32) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.font = `${size * 0.9}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2);

  return await new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = c.toDataURL();
  });
}

function latLngToTilePixel(lat: number, lng: number, zoom: number) {
  const tile = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * tile * 256;
  const y =
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    tile *
    256;
  return { x, y };
}

/**
 * 在 canvas 上同步绘制地图瓦片和 Google encoded 轨迹
 * @param ctx CanvasRenderingContext2D
 * @param encodedPolyline Google Polyline 编码
 * @param width 海报宽度
 * @param height 海报高度
 * @param zoom 地图缩放级别
 * @param options 可选参数
 */
export async function drawMapWithTrack(
  ctx: CanvasRenderingContext2D,
  encodedPolyline: string,
  width: number,
  height: number,
  zoom: number = 15,
  options?: {
    lineWidth?: number;
    strokeStyle?: string;
    marginPercent?: number;
    tileUrl?: (z: number, x: number, y: number) => string;
  }
) {
  const lineWidth = options?.lineWidth ?? 6;
  const strokeStyle = options?.strokeStyle ?? "#ff3b30";
  const marginPercent = options?.marginPercent ?? 5;
  const tileUrl =
    options?.tileUrl ??
    ((z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`);

  // -------------------------
  // 1. 解码 polyline → 经纬度
  const track: [number, number][] = decodePolyline(encodedPolyline);
  if (!track || track.length < 2) return;

  // -------------------------
  // 2. 经纬度 → Mercator 坐标
  const mercatorPoints = track.map(([lat, lng]) => {
    const x = lng;
    const y =
      (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI;
    return { x, y };
  });

  const minX = Math.min(...mercatorPoints.map((p) => p.x));
  const maxX = Math.max(...mercatorPoints.map((p) => p.x));
  const minY = Math.min(...mercatorPoints.map((p) => p.y));
  const maxY = Math.max(...mercatorPoints.map((p) => p.y));

  // -------------------------
  // 3. 计算缩放比例，使轨迹在画布居中
  const scale =
    Math.min(width / (maxX - minX), height / (maxY - minY)) *
    (1 - marginPercent / 100);
  const xOffset = (width - (maxX - minX) * scale) / 2 - minX * scale;
  const yOffset = (height - (maxY - minY) * scale) / 2 - minY * scale;

  // -------------------------
  // 4. 计算覆盖的瓦片范围
  const lng2tile = (lng: number, z: number) =>
    Math.floor(((lng + 180) / 360) * Math.pow(2, z));
  const lat2tile = (lat: number, z: number) =>
    Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, z)
    );

  const xMinTile = lng2tile(minX, zoom);
  const xMaxTile = lng2tile(maxX, zoom);
  const yMinTile = lat2tile(maxY, zoom);
  const yMaxTile = lat2tile(minY, zoom);

  // -------------------------
  // 5. 绘制瓦片 & 同步绘制轨迹
  for (let x = xMinTile; x <= xMaxTile; x++) {
    for (let y = yMinTile; y <= yMaxTile; y++) {
      const img = await loadImage(tileUrl(zoom, x, y));
      const tileSize = 256;
      const tileX = xOffset + (x * tileSize - minX * scale);
      const tileY = yOffset + (y * tileSize - minY * scale);
      ctx.drawImage(img, tileX, tileY, tileSize * scale, tileSize * scale);
    }
  }

  // -------------------------
  // 6. 绘制轨迹
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255,59,48,0.3)";
  ctx.shadowBlur = 10;

  mercatorPoints.forEach((p, i) => {
    const x = p.x * scale + xOffset;
    const y = p.y * scale + yOffset;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.restore();
}

/**
 * 在指定 box 内绘制 Google encoded 轨迹，居中显示
 * @param ctx CanvasRenderingContext2D
 * @param encodedPolyline Google Polyline 编码
 * @param box 绘制区域 { x, y, w, h }
 * @param options 可选参数 lineWidth、strokeStyle、marginPercent
 */
export function drawPolylineBox(
  ctx: CanvasRenderingContext2D,
  encodedPolyline: string,
  box: { x: number; y: number; w: number; h: number },
  options?: { lineWidth?: number; strokeStyle?: string; marginPercent?: number }
) {
  const lineWidth = options?.lineWidth ?? 6;
  const strokeStyle = options?.strokeStyle ?? "#ff3b30";
  const marginPercent = options?.marginPercent ?? 5;

  const track: [number, number][] = decodePolyline(encodedPolyline);
  if (!track || track.length < 2) return;

  // 经纬度 → Web Mercator y 投影，x 使用经度
  const mercatorPoints = track.map(([lat, lng]) => {
    const x = lng;
    const y =
      (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI;
    return { x, y };
  });

  // 计算 Mercator 边界
  const minX = Math.min(...mercatorPoints.map((p) => p.x));
  const maxX = Math.max(...mercatorPoints.map((p) => p.x));
  const minY = Math.min(...mercatorPoints.map((p) => p.y));
  const maxY = Math.max(...mercatorPoints.map((p) => p.y));

  // 缩放比例，保持纵横比
  const scale =
    Math.min(box.w / (maxX - minX), box.h / (maxY - minY)) *
    (1 - marginPercent / 100);

  // 偏移量，使轨迹在 box 内居中
  const xOffset = box.x + (box.w - (maxX - minX) * scale) / 2 - minX * scale;
  const yOffset = box.y + (box.h - (maxY - minY) * scale) / 2 - minY * scale;

  // 绘制轨迹
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255,59,48,0.3)";
  ctx.shadowBlur = 10;

  mercatorPoints.forEach((p, i) => {
    const x = p.x * scale + xOffset;
    const y = box.y + box.h / 2 + (maxY - p.y - (maxY - minY) / 2) * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.restore();
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

// export interface RenderOptions {
//   ctx: CanvasRenderingContext2D;
//   box: Box;
//   encodedPolyline: string;
//   tileUrl: (z: number, x: number, y: number) => string;
//   minPadding?: number;
//   zoom?: number; // 可强制指定
//   startIcon?: HTMLImageElement;
//   endIcon?: HTMLImageElement;
//   marginPercent?: number;
//   onProgress?: (percent: number) => void; // 渲染进度回调，可选
// }
//在一个1080*1920的竖屏上绘制瓦片地图和轨迹
//
//
//
export type RenderOptions = {
  ctx: CanvasRenderingContext2D;
  box: { x: number; y: number; w: number; h: number };
  encodedPolyline: string;
  tileUrl: (z: number, x: number, y: number) => string;
  startIcon?: HTMLImageElement;
  endIcon?: HTMLImageElement;
  zoom?: number;
  marginPercent?: number; // 用于轨迹周围额外留白
  onProgress?: (percent: number) => void;
  maxTiles?: number; // safety cap, default 120
  concurrency?: number; // tile load concurrency, default 6
  fitPercent?: number; // how much of box the track should occupy (0..1) default 0.85
};

// ---------- helper: mercator projection -> world pixels ----------
function latLngToWorldPixel(lat: number, lng: number, zoom: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  // WebMercator Y
  const y =
    ((1 - Math.log((1 + sinLat) / (1 - sinLat)) / (2 * Math.PI)) / 2) * scale;
  return { x, y };
}

// ---------- helper: promise image loader ----------
const _tileCache = new Map<string, HTMLImageElement>();
function loadImageWithCache(url: string): Promise<HTMLImageElement> {
  if (_tileCache.has(url)) return Promise.resolve(_tileCache.get(url)!);
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      _tileCache.set(url, img);
      res(img);
    };
    img.onerror = (e) => rej(e);
    img.src = url;
  });
}

// ---------- concurrency queue ----------
async function loadTilesConcurrently(
  urls: string[],
  concurrency: number,
  onProgress?: (loaded: number, total: number) => void
) {
  const results: (HTMLImageElement | Error)[] = new Array(urls.length);
  let idx = 0;
  let loaded = 0;

  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= urls.length) break;
      try {
        const img = await loadImageWithCache(urls[i]);
        results[i] = img;
      } catch (e) {
        results[i] = e as Error;
      }
      loaded++;
      onProgress?.(loaded, urls.length);
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, urls.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

// ---------- 主函数 ----------
export async function renderRouteMapOptimized({
  ctx,
  box,
  encodedPolyline,
  tileUrl,
  startIcon,
  endIcon,
  zoom = 15,
  marginPercent = 10,
  onProgress,
  maxTiles = 120,
  concurrency = 6,
  fitPercent = 0.85,
}: RenderOptions) {
  // 1) decode polyline -> [[lat,lng], ...]
  // 你在项目里应该有 polyline.decode；否则请引入 polyline 库
  const trackLatLng = polyline.decode(encodedPolyline);

  if (!trackLatLng || trackLatLng.length === 0) return;

  // 2) convert to world pixels at current zoom
  let tilePixels = trackLatLng.map(([lat, lng]) =>
    latLngToWorldPixel(lat, lng, zoom)
  );

  // 3) compute bounding box in world pixel coordinates
  function computeBounds(points: { x: number; y: number }[]) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
      cx: (Math.max(...xs) + Math.min(...xs)) / 2,
      cy: (Math.max(...ys) + Math.min(...ys)) / 2,
    };
  }

  let bounds = computeBounds(tilePixels);

  // 4) desired scale: how many world-pixels map to one canvas-pixel
  // We want the track to occupy `fitPercent` 的 box（80~90% 常用）
  let desiredScale = Math.min(box.w / (bounds.w || 1), box.h / (bounds.h || 1));
  desiredScale = desiredScale * fitPercent;

  // Apply marginPercent (extra world-space margin around track)
  const marginFactor = 1 + marginPercent / 100;
  bounds.w *= marginFactor;
  bounds.h *= marginFactor;

  // 5) ensure tile count is reasonable; if too many, reduce zoom stepwise
  // tile indices from world pixel: tileIndex = Math.floor(worldPx / 256)
  function computeTileRangeForView(
    centerWorldX: number,
    centerWorldY: number,
    scale: number,
    z: number
  ) {
    // view width in world-px = box.w / scale
    const viewWorldW = box.w / scale;
    const viewWorldH = box.h / scale;
    const viewMinX = centerWorldX - viewWorldW / 2;
    const viewMinY = centerWorldY - viewWorldH / 2;
    const viewMaxX = centerWorldX + viewWorldW / 2;
    const viewMaxY = centerWorldY + viewWorldH / 2;

    const xMinTile = Math.floor(viewMinX / 256);
    const xMaxTile = Math.floor(viewMaxX / 256);
    const yMinTile = Math.floor(viewMinY / 256);
    const yMaxTile = Math.floor(viewMaxY / 256);

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
  }

  // center world pixel (we will center track in box)
  let centerWorldX = bounds.cx;
  let centerWorldY = bounds.cy;

  // compute tile range; if > maxTiles reduce zoom until <= maxTiles or zoom==0
  let tileRange = computeTileRangeForView(
    centerWorldX,
    centerWorldY,
    desiredScale,
    zoom
  );
  while (tileRange.count > maxTiles && zoom > 0) {
    zoom = zoom - 1;
    // recompute world pixels at new zoom
    tilePixels = trackLatLng.map(([lat, lng]) =>
      latLngToWorldPixel(lat, lng, zoom)
    );
    bounds = computeBounds(tilePixels);
    bounds.w *= marginFactor;
    bounds.h *= marginFactor;
    desiredScale =
      Math.min(box.w / (bounds.w || 1), box.h / (bounds.h || 1)) * fitPercent;
    centerWorldX = bounds.cx;
    centerWorldY = bounds.cy;
    tileRange = computeTileRangeForView(
      centerWorldX,
      centerWorldY,
      desiredScale,
      zoom
    );
  }

  // Final tileRange ready
  const { xMinTile, xMaxTile, yMinTile, yMaxTile } = tileRange;
  const tileCols = tileRange.cols;
  const tileRows = tileRange.rows;
  const totalTiles = tileRange.count;

  // 6) Build tile URLs (row-major)
  const tileUrls: string[] = [];
  const tileIndexToXY: { x: number; y: number }[] = [];
  for (let ty = yMinTile; ty <= yMaxTile; ty++) {
    for (let tx = xMinTile; tx <= xMaxTile; tx++) {
      tileUrls.push(tileUrl(zoom, tx, ty));
      tileIndexToXY.push({ x: tx, y: ty });
    }
  }

  // 7) Load tiles with concurrency and progress
  let loadedTiles = 0;
  onProgress?.(0);

  const results = await loadTilesConcurrently(
    tileUrls,
    concurrency,
    (loaded, total) => {
      loadedTiles = loaded;
      const p = Math.round((loaded / total) * 100);
      onProgress?.(p);
    }
  );

  // Map results to images; missing images can be skipped
  const tileImages: (HTMLImageElement | null)[] = results.map((r) =>
    r instanceof Error ? null : (r as HTMLImageElement)
  );

  // 8) Compute final scale and offsets for drawing
  // world -> canvas: canvasX = (worldX - viewMinX) * scale + box.x
  const scale = desiredScale; // canvas pixels per world pixel

  // recompute viewMinX/Y
  const viewWorldW = box.w / scale;
  const viewWorldH = box.h / scale;
  const viewMinX = centerWorldX - viewWorldW / 2;
  const viewMinY = centerWorldY - viewWorldH / 2;

  // 9) Draw: rounded clip -> tiles -> track -> icons
  ctx.save();

  // rounded clip
  const r = Math.min(36, Math.min(box.w, box.h) * 0.01);
  ctx.beginPath();
  ctx.moveTo(box.x + r, box.y);
  ctx.arcTo(box.x + box.w, box.y, box.x + box.w, box.y + box.h, r);
  ctx.arcTo(box.x + box.w, box.y + box.h, box.x, box.y + box.h, r);
  ctx.arcTo(box.x, box.y + box.h, box.x, box.y, r);
  ctx.arcTo(box.x, box.y, box.x + box.w, box.y, r);
  ctx.closePath();
  ctx.clip();

  // draw tiles
  for (let i = 0; i < tileImages.length; i++) {
    const img = tileImages[i];
    const { x: tx, y: ty } = tileIndexToXY[i];
    if (!img) continue; // skip failed

    // tile's world top-left pixel
    const tileWorldX = tx * 256;
    const tileWorldY = ty * 256;

    // position on canvas
    const dx = (tileWorldX - viewMinX) * scale + box.x;
    const dy = (tileWorldY - viewMinY) * scale + box.y;
    const dSize = 256 * scale;

    ctx.drawImage(img, dx, dy, dSize, dSize);
  }

  // draw track on top
  ctx.lineWidth = Math.max(
    3,
    Math.min(10, Math.round(Math.min(box.w, box.h) / 120))
  );
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const grad = ctx.createLinearGradient(
    box.x,
    box.y,
    box.x + box.w,
    box.y + box.h
  );
  grad.addColorStop(0, "#00aaff");
  grad.addColorStop(1, "#ff5e5e");
  ctx.strokeStyle = grad;

  ctx.beginPath();
  for (let i = 0; i < tilePixels.length; i++) {
    const p = tilePixels[i];
    const cx = (p.x - viewMinX) * scale + box.x;
    const cy = (p.y - viewMinY) * scale + box.y;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();

  // draw start/end icons if provided (centered)
  const startP = tilePixels[0];
  const endP = tilePixels[tilePixels.length - 1];
  if (startIcon) {
    const sx = (startP.x - viewMinX) * scale + box.x - startIcon.width / 2;
    const sy = (startP.y - viewMinY) * scale + box.y - startIcon.height / 2;
    ctx.drawImage(startIcon, sx, sy);
  }
  if (endIcon) {
    const ex = (endP.x - viewMinX) * scale + box.x - endIcon.width / 2;
    const ey = (endP.y - viewMinY) * scale + box.y - endIcon.height / 2;
    ctx.drawImage(endIcon, ex, ey);
  }

  ctx.restore();

  // Done: final progress 100
  onProgress?.(100);
}

export function drawPlanInfoTwoColumns(
  ctx: CanvasRenderingContext2D,
  box: Box,
  data: RidingPlanPro,
  options?: {
    font?: string;
    color?: string;
    lineHeight?: number;
    colGap?: number;
  }
) {
  const font = options?.font ?? "32px sans-serif";
  const color = options?.color ?? "#1c1f33";
  const lineHeight = options?.lineHeight ?? 48;
  const colGap = options?.colGap ?? 30;

  ctx.save();
  ctx.textAlign ="left";   // left/center/right
  ctx.textBaseline = "top";
  ctx.font = font;
  ctx.fillStyle = color;

  // 把需要展示的字段映射成文本
  const fields = [
    ["标题", data.title],
    ["距离", `${data.distance_km} km`],
    ["时长", formatDuration(data.duration_min)],
    ["累计爬升", `${data.elevation_m} m`],
  ];

  const half = Math.ceil(fields.length / 2);

  const col1 = fields.slice(0, half);
  const col2 = fields.slice(half);

  // 每列宽度
  const colWidth = (box.w - colGap) / 2;

  // 第一列起点
  const col1X = box.x;
  const col2X = box.x + colWidth + colGap;
  let y1 = box.y;
  let y2 = box.y;

  // 绘制列 1
  for (const [label, value] of col1) {
    if (value === undefined || value === null) continue;
    ctx.fillText(`${label}: ${value}`, col1X, y1);
    y1 += lineHeight;
  }

  // 绘制列 2
  for (const [label, value] of col2) {
    if (value === undefined || value === null) continue;
    ctx.fillText(`${label}: ${value}`, col2X, y2);
    y2 += lineHeight;
  }

  ctx.restore();
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split("");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && line !== "") {
      ctx.fillText(line, x, y);
      line = words[i];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, y);
  }
}


export async function loadGPX(path: string) {
  const res = await fetch(`/api/gpx?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error("Failed to get signed url");

  const { url } = await res.json();

  const gpxRes = await fetch(url);
  if (!gpxRes.ok) throw new Error("Failed to fetch gpx");

  return await gpxRes.text();
}

export function parseGPX(gpxText: string) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, "application/xml");

  return Array.from(xml.getElementsByTagName("trkpt")).map(pt => ({
    lat: parseFloat(pt.getAttribute("lat")!),
    lon: parseFloat(pt.getAttribute("lon")!),
    ele: pt.querySelector("ele")?.textContent,
  }));
}