"use client";

import { useRef } from "react";
import IosShareIcon from "@mui/icons-material/IosShare";
import { IconButton } from "@mui/material";

// ---------------------------
// Google Polyline 解码函数（浏览器可用）
function decodePolyline(str: string): [number, number][] {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates: [number, number][] = [];

  while (index < str.length) {
    let result = 1,
      shift = 0,
      b: number;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;

    coordinates.push([lat * 1e-5, lng * 1e-5] as [number, number]);
  }
  return coordinates;
}

// ---------------------------
// Props
interface Props {
  title: string;
  distance: string;
  cover: string;
  encodedPolyline: string;
  zoom?: number;
}

// ---------------------------
// SharePoster 组件
export default function SharePoster({
  title,
  distance,
  cover,
  encodedPolyline,
  zoom = 15,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 2;
    const width = 1080;
    const height = 1920;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);

    // -----------------------------
    // 背景
    ctx.fillStyle = "#f6f7fb";
    ctx.fillRect(0, 0, width, height);

    // -----------------------------
    // 封面
    const coverH = 620;
    await drawRoundedImage(ctx, await loadImage(cover), 60, 60, width - 120, coverH, 40);

    // -----------------------------
    // 标题文字
    ctx.fillStyle = "#111";
    ctx.font = "bold 58px sans-serif";
    ctx.fillText(title, 60, 760);

    ctx.fillStyle = "#666";
    ctx.font = "42px sans-serif";
    ctx.fillText(`距离：${distance}`, 60, 830);

    // -----------------------------
    // 地图区域
    const mapBox = { x: 60, y: 900, w: 960, h: 960 };
    drawRoundedRect(ctx, mapBox.x, mapBox.y, mapBox.w, mapBox.h, 36, "#fff", "#ddd");

    // -----------------------------
    // 解码 polyline
    const track: [number, number][] = decodePolyline(encodedPolyline);

    // -----------------------------
    // 生成瓦片
    const { tileUrls, xMin, yMin, xMax, yMax } = getTileUrls(track, zoom);

    // -----------------------------
    // 绘制瓦片
    await drawMapTiles(ctx, mapBox, tileUrls, 256);

    // -----------------------------
    // 绘制轨迹（投影到瓦片像素）
    drawTrackAligned(ctx, track, mapBox, zoom, xMin, yMin, xMax, yMax, 5);

    // -----------------------------
    // 导出 JPG
    const url = canvas.toDataURL("image/jpeg", 0.92);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-海报.jpg`;
    a.click();
  };

  return (
    <>
      <IconButton onClick={handleShare}>
        <IosShareIcon />
      </IconButton>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}

// ---------------------------
// 工具函数
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  shadow: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.shadowColor = shadow;
  ctx.shadowBlur = 20;
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

async function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

// ---------------------------
// 绘制瓦片
async function drawMapTiles(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  tiles: string[][],
  tileSize = 256
) {
  ctx.save();
  const r = 36;
  ctx.beginPath();
  ctx.moveTo(box.x + r, box.y);
  ctx.arcTo(box.x + box.w, box.y, box.x + box.w, box.y + box.h, r);
  ctx.arcTo(box.x + box.w, box.y + box.h, box.x, box.y + box.h, r);
  ctx.arcTo(box.x, box.y + box.h, box.x, box.y, r);
  ctx.arcTo(box.x, box.y, box.x + box.w, box.y, r);
  ctx.closePath();
  ctx.clip();

  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      const url = tiles[i][j];
      const img = await loadImage(url);
      ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height); // 调整绘制逻辑
      ctx.drawImage(img, box.x + j * tileSize, box.y + i * tileSize, tileSize, tileSize);
    }
  }
  ctx.restore();
}

// ---------------------------
// 绘制轨迹，和瓦片完全对齐
function drawTrackAligned(
  ctx: CanvasRenderingContext2D,
  track: [number, number][],
  box: { x: number; y: number; w: number; h: number },
  zoom: number,
  xMinTile: number,
  yMinTile: number,
  xMaxTile: number,
  yMaxTile: number,
  marginPercent = 5
) {
  const points = track.map(([lat, lng]) => latLngToTilePixel(lat, lng, zoom));

  const minX = xMinTile * 256;
  const maxX = (xMaxTile + 1) * 256;
  const minY = yMinTile * 256;
  const maxY = (yMaxTile + 1) * 256;

  const scale = Math.min(box.w / (maxX - minX), box.h / (maxY - minY)) * (1 - marginPercent / 100);
  const xOffset = box.x - minX * scale + (box.w - (maxX - minX) * scale) / 2;
  const yOffset = box.y - minY * scale + (box.h - (maxY - minY) * scale) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#ff3b30";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255,59,48,0.3)";
  ctx.shadowBlur = 10;

  points.forEach((p, i) => {
    const x = p.x * scale + xOffset;
    const y = p.y * scale + yOffset;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.restore();
}

// ---------------------------
// 经纬度 → 瓦片像素
function latLngToTilePixel(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const xTile = ((lng + 180) / 360) * n;
  const yTile = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n;

  return { x: xTile * 256, y: yTile * 256 };
}

// ---------------------------
// 根据轨迹生成瓦片 URL，并返回瓦片范围
function getTileUrls(track: [number, number][], zoom: number) {
  const lats = track.map((p) => p[0]);
  const lngs = track.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const lat2tile = (lat: number, z: number) =>
    Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, z));
  const lng2tile = (lng: number, z: number) => Math.floor(((lng + 180) / 360) * Math.pow(2, z));

  const xMin = lng2tile(minLng, zoom);
  const xMax = lng2tile(maxLng, zoom);
  const yMin = lat2tile(maxLat, zoom);
  const yMax = lat2tile(minLat, zoom);

  const subdomains = ["a", "b", "c"];
  const tileUrls: string[][] = [];

  for (let y = yMin; y <= yMax; y++) {
    const row: string[] = [];
    for (let x = xMin; x <= xMax; x++) {
      const s = subdomains[Math.floor(Math.random() * subdomains.length)];
      row.push(`https://${s}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`);
    }
    tileUrls.push(row);
  }

  return { tileUrls, xMin, yMin, xMax, yMax };
}
