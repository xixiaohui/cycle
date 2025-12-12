"use client";

import { useRef, useState } from "react";
import ShareIcon from "@mui/icons-material/Share";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  ImageListItem,
  Tooltip,
  Typography,
} from "@mui/material";

import polyline from "polyline";
import {
  drawPlanInfoTwoColumns,
  drawPolylineBox,
  drawWrappedText,
  RenderOptions,
  renderRouteMapOptimized,
  SHARE_IAMGE_HEIGHT,
  SHARE_IAMGE_WIDTH,
} from "@/lib/util";
import { RidingPlanPro } from "@/types/ridingPlan";
import { Close, Download } from "@mui/icons-material";
import { textHeightFromFont, themes, wrapText } from "@/lib/poster";
import dayjs from "dayjs";


// ---------------------------
// Props
interface Props {
  title: string;
  distance: string;
  cover: string;
  encodedPolyline: string;
  zoom?: number;
  ridingPlan?: RidingPlanPro;
}

// ---------------------------
// SharePoster 组件
export default function SharePoster({
  title,
  distance,
  cover,
  encodedPolyline,
  ridingPlan,
  zoom = 15,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [look, setLook] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleShare = async () => {
    try {
      setLoading(true);
      setProgress(0);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const dpr = window.devicePixelRatio || 2;
      const width = SHARE_IAMGE_WIDTH;
      // const height = 1920;
      const height = SHARE_IAMGE_HEIGHT;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);

      // await renderPosterMain(
      //   ctx,{title,distance,cover,encodedPolyline,zoom},{width,height,onProgress:((p)=>setProgress(p))}
      // )

      await renderPoster(
        ctx,
        {
          title,
          distance,
          cover,
          encodedPolyline,
          zoom,
          ridingPlan,
        },
        {
          width,
          height,
          margin: 0,
          coverHeight: height,
          watermarkText: "chaohucyclingclub.com",
          onProgress: (p) => setProgress(p),
        }
      );

      // const trackBox = { x: 0, y: 960, w: width / 2, h: width / 2 };
      // drawPolylineBox(ctx, encodedPolyline, trackBox);

      // 导出 JPG
      const urls = canvas.toDataURL("image/png", 0.9);

      // const a = document.createElement("a");
      // a.href = url;
      // a.download = `${title}-海报.jpg`;
      // a.click();

      setUrl(urls);
      setLook(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="下载海报">
        <IconButton onClick={handleShare}>
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Backdrop
        sx={{
          color: "#f3ebd3",
          backgroundColor: "rgba(0,0,0,0.7)", // 蒙层颜色，加深
          zIndex: (theme) => theme.zIndex.drawer + 5000,
        }}
        open={loading}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={70} thickness={4} />
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {progress > 0 ? `渲染中… ${progress}%` : "正在生成海报…"}
          </Typography>
        </Box>
      </Backdrop>

      <Backdrop
        sx={{
          color: "#f3ebd3",
          backgroundColor: "rgba(0,0,0,0.7)", // 蒙层颜色，加深
          zIndex: (theme) => theme.zIndex.drawer + 5000,
        }}
        open={look && !loading}
      >
        <Button
          onClick={() => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `${title}-海报.jpg`;
            a.click();
          }}
        >
          下载
        </Button>
        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            background: "#111",
            paddingTop: 2,
          }}
        >
          {url && (
            <ImageListItem>
              <Box
                component="img"
                src={url}
                sx={{
                  width: 360,
                  height: "auto",
                  boxShadow: "0 0 12px rgba(0,0,0,0.4)",
                }}
              />
            </ImageListItem>
          )}
        </Box>

        <Button
          onClick={() => {
            setLook(false);
          }}
        >
          关闭
        </Button>
      </Backdrop>
    </>
  );
}

// ---------------------------
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

function getCoverSourceRect(
  imgW: number,
  imgH: number,
  targetW: number,
  targetH: number
) {
  const imgRatio = imgW / imgH;
  const targetRatio = targetW / targetH;

  let sw, sh, sx, sy;

  if (imgRatio > targetRatio) {
    // 图片太宽，需要裁掉左右
    sh = imgH;
    sw = imgH * targetRatio;
    sx = (imgW - sw) / 2;
    sy = 0;
  } else {
    // 图片太高，需要裁掉上下
    sw = imgW;
    sh = imgW / targetRatio;
    sx = 0;
    sy = (imgH - sh) / 2;
  }

  return { sx, sy, sw, sh };
}

async function drawRoundedImageChange(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  // 计算裁剪区域
  const { sx, sy, sw, sh } = getCoverSourceRect(img.width, img.height, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.clip();

  // 用 9 参数版本 drawImage 实现 cover 裁剪
  ctx.drawImage(
    img,
    sx,
    sy,
    sw,
    sh, // 裁剪区域
    x,
    y,
    w,
    h // 目标区域
  );

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

async function renderRouteMap({
  ctx,
  box,
  encodedPolyline,
  tileUrl,
  startIcon,
  endIcon,
  zoom = 15,
  marginPercent = 5, // 留白
  onProgress,
}: RenderOptions) {
  // --------------------------

  // 1. Decode polyline → 经纬度数组
  // --------------------------
  const track = polyline.decode(encodedPolyline); // [ [lat,lng], ... ]

  // --------------------------
  // 2. 经纬度 → 瓦片像素坐标
  // --------------------------
  const tilePixels = track.map(([lat, lng]) =>
    latLngToTilePixel(lat, lng, zoom)
  );

  const xs = tilePixels.map((p) => p.x);
  const ys = tilePixels.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // --------------------------
  // 3. 计算需要的 tile 范围（包含轨迹）
  // --------------------------
  const xMinTile = Math.floor(minX / 256);
  const xMaxTile = Math.floor(maxX / 256);
  const yMinTile = Math.floor(minY / 256);
  const yMaxTile = Math.floor(maxY / 256);

  const tileRows = yMaxTile - yMinTile + 1;
  const tileCols = xMaxTile - xMinTile + 1;

  // 计算 tile 总数
  const totalTiles = (yMaxTile - yMinTile + 1) * (xMaxTile - xMinTile + 1);
  let loaded = 0;

  // --------------------------
  // 4. 预加载 Tiles
  // --------------------------
  const tileImages = [];
  for (let ty = yMinTile; ty <= yMaxTile; ty++) {
    const row = [];
    for (let tx = xMinTile; tx <= xMaxTile; tx++) {
      const url = tileUrl(zoom, tx, ty);
      const img = await loadImage(url);

      //loading----------------------start
      loaded++;

      if (onProgress) {
        const percent = Math.round((loaded / totalTiles) * 100);
        onProgress(percent);
      }
      //loading----------------------end

      row.push(img);
    }
    tileImages.push(row);
  }

  // --------------------------
  // 5. 在 box 中自动缩放 + 居中
  // --------------------------
  const mapPixelW = (xMaxTile - xMinTile + 1) * 256;
  const mapPixelH = (yMaxTile - yMinTile + 1) * 256;

  const scale =
    Math.min(box.w / mapPixelW, box.h / mapPixelH) * (1 - marginPercent / 100);

  const xOffset =
    box.x + (box.w - mapPixelW * scale) / 2 - xMinTile * 256 * scale;
  const yOffset =
    box.y + (box.h - mapPixelH * scale) / 2 - yMinTile * 256 * scale;

  // --------------------------
  // 6. 圆角裁剪
  // --------------------------
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

  // --------------------------
  // 7. 绘制 tiles
  // --------------------------
  for (let i = 0; i < tileRows; i++) {
    for (let j = 0; j < tileCols; j++) {
      const img = tileImages[i][j];
      const px = (xMinTile + j) * 256;
      const py = (yMinTile + i) * 256;

      ctx.drawImage(
        img,
        px * scale + xOffset,
        py * scale + yOffset,
        256 * scale,
        256 * scale
      );
    }
  }

  // --------------------------
  // 8. 绘制渐变轨迹
  // --------------------------
  const grad = ctx.createLinearGradient(
    box.x,
    box.y,
    box.x + box.w,
    box.y + box.h
  );
  grad.addColorStop(0, "#00f");
  grad.addColorStop(1, "#f00");

  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.strokeStyle = grad;
  ctx.lineCap = "round";

  tilePixels.forEach((p, i) => {
    const x = p.x * scale + xOffset;
    const y = p.y * scale + yOffset;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // --------------------------
  // 9. 绘制起点终点
  // --------------------------
  const start = tilePixels[0];
  const end = tilePixels[tilePixels.length - 1];

  if (startIcon)
    ctx.drawImage(
      startIcon,
      start.x * scale + xOffset - startIcon.width / 2,
      start.y * scale + yOffset - startIcon.height / 2
    );

  if (endIcon)
    ctx.drawImage(
      endIcon,
      end.x * scale + xOffset - endIcon.width / 2,
      end.y * scale + yOffset - endIcon.height / 2
    );

  ctx.restore();
}

interface PosterLayoutOptions {
  width: number;
  height: number;
  margin?: number;
  coverHeight?: number;
  lineWidth?: number;
  strokeStyle?: string;
  titleFont?: string;
  distanceFont?: string;
  watermarkFont?: string;
  watermarkText?: string;
  describtionFont?:string;
  onProgress?: (p: number) => void; // 新增进度回调
}

interface PosterData {
  title: string;
  distance: string;
  cover: string;
  encodedPolyline: string;
  zoom?: number;
  ridingPlan?: RidingPlanPro;
}

/**
 * 渲染海报到 canvas 上
 */
export async function renderPoster(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  options: PosterLayoutOptions
) {
  const {
    width,
    height,
    margin = 60,
    coverHeight = 480,
    lineWidth = 6,
    strokeStyle = "#ff3b30",
    titleFont = "147px 'Noto Serif SC', 'STSong', 'SimSun', serif",
    distanceFont = "97px 'Noto Serif SC', 'STSong', 'SimSun', serif",
    watermarkFont = "37px 'Noto Serif SC', 'STSong', 'SimSun', serif",
    describtionFont = "37px 'Noto Serif SC', 'STSong', 'SimSun', serif",
    watermarkText = "chaohucyclingclub.com",
    onProgress,
  } = options;

  const zoom = data.zoom ?? 15;

  // -----------------------------
  // 1. 背景
  ctx.fillStyle = "#1c1f33";
  ctx.fillRect(0, 0, width, height);

  // -----------------------------
  // 2. 地图区域全幅铺满
  const mapBox = { x: 0, y: 0, w: width, h: height };
  drawRoundedRect(
    ctx,
    mapBox.x,
    mapBox.y,
    mapBox.w,
    mapBox.h,
    0,
    "#1c1f33",
    "#1c1f33"
  );

  // -----------------------------
  // 封面叠加
  // await drawRoundedImageChange(
  //   ctx,
  //   await loadImage(data.cover.replace("/800/450", "/1080/1920")),
  //   margin,
  //   margin,
  //   width - margin * 2,
  //   coverHeight,
  //   10
  // );

  // -----------------------------------
  // 瓦片地图
  const startIcon = await emojiToImage("⏱️", 32);
  const endIcon = await emojiToImage("🏁", 32);

  const tileBox = { x: 0, y: 0, w: width, h: height };
  await renderRouteMapOptimized({
    ctx,
    box: tileBox,
    encodedPolyline: data.encodedPolyline,
    tileUrl: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    startIcon,
    endIcon,
    zoom,
    onProgress: onProgress,
  });

  //-------------------------------------------
  // 运动轨迹
  // const trackBox = { x: 0, y: 960, w: width / 2, h: width / 2 };
  // drawPolylineBox(ctx, data.encodedPolyline, trackBox);

  // ----------------------------
  // const rindingPlanBox = {
  //   x: 0,
  //   y: 0,
  //   w: width,
  //   h: height,
  // };

  // const opts: RenderOptionsNew = {
  //   theme:'default'
  // };
  // drawPosterText(ctx,data.ridingPlan!,width,height,opts)

  // 4. 标题文字
  ctx.save();
  //sport_blue fresh_green dark_gold default
  const current_theme = themes["default"];
  let start_height = 1054;
  let start_width = 64;
  ctx.fillStyle = current_theme.bgColor;
  ctx.globalAlpha = Number(current_theme.maskColor); // 40% 透明度
  ctx.fillRect(0, start_height, width, height - start_height - 100);
  ctx.globalAlpha = 1.0; // 恢复

  start_height +=100;
  ctx.fillStyle = current_theme.titleColor;
  ctx.font = titleFont;
  ctx.textAlign = "left"; // left/center/right
  ctx.textBaseline = "top";
  ctx.fillText(`${data.distance}`, start_width, start_height);
  const metrics = ctx.measureText(data.distance);
  const actualHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  ctx.font = watermarkFont;
  ctx.textAlign = "left"; // left/center/right
  ctx.textBaseline = "middle";
  ctx.fillText(
    "km",
    start_width + metrics.width + 7,
    start_height + actualHeight
  );

  start_width = start_width + width / 2;

  ctx.font = distanceFont;
  const hour_width = ctx.measureText(
    `${Math.floor((data.ridingPlan?.duration_min || 60) / 60)}`
  ).width;
  const min_width = ctx.measureText(
    `${Math.floor((data.ridingPlan?.duration_min || 60) % 60)}`
  ).width;

  ctx.font = watermarkFont;
  const character_width = ctx.measureText(`h`).width;

  ctx.font = distanceFont;
  ctx.textAlign = "left"; // left/center/right
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${Math.floor((data.ridingPlan?.duration_min || 60) / 60)}`,
    start_width,
    start_height + actualHeight - 7
  );
  
  ctx.font = watermarkFont;
  ctx.textAlign = "left"; // left/center/right
  ctx.textBaseline = "middle";
  ctx.fillText(
    "h",
    start_width + hour_width + 5,
    start_height + actualHeight
  );

  ctx.font = distanceFont;
  ctx.textAlign = "left"; // left/center/right
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${Math.floor((data.ridingPlan?.duration_min || 60) % 60)}`,
    start_width + hour_width + character_width + 5,
    start_height + actualHeight - 7
  );


  ctx.font = watermarkFont;
  ctx.textAlign = "left"; // left/center/right
  ctx.textBaseline = "middle";
  ctx.fillText(
    "m",
    start_width + hour_width + character_width + min_width + 5,
    start_height + actualHeight
  );

  ctx.font = watermarkFont;
  ctx.textAlign = "left"; // left/center/right
  ctx.textBaseline = "top";
  ctx.fillText(
    dayjs(data.ridingPlan?.start_time).format("YYYY-MM-DD"),
    start_width,
    start_height + 150
  );

  start_width = start_width - width / 2;
  ctx.font = describtionFont;
  // ctx.fillText(
  //   data.ridingPlan?.description||"",
  //   start_width,
  //   start_height + 303
  // );

  drawWrappedText(ctx,
    data.ridingPlan?.description || "",
    start_width,
    start_height + 303,
    SHARE_IAMGE_WIDTH-100,          // 最大宽度
    55             // 行高
);

  ctx.restore();

  // // -----------------------------

  drawWatermarkBar(ctx, {
    text: watermarkText,
    width: width,
    height: height,
    barColor: current_theme.bgColor,
    textColor: current_theme.titleColor,
    globalAlpha: Number(current_theme.maskColor),
  });
}

/**
 * 渲染海报到 canvas 上
 */
export async function renderPosterMain(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  options: PosterLayoutOptions
) {
  const {
    width,
    height,
    margin = 60,
    coverHeight = 480,
    lineWidth = 6,
    strokeStyle = "#ff3b30",
    titleFont = "bold 58px sans-serif",
    distanceFont = "42px sans-serif",
    watermarkFont = "28px sans-serif",
    watermarkText = "chaohucyclingclub.com",
    onProgress,
  } = options;

  const zoom = data.zoom ?? 15;

  // -----------------------------
  // 背景
  ctx.fillStyle = "#1c1f33";
  ctx.fillRect(0, 0, width, height);

  // -----------------------------
  // 封面
  const coverH = 620;
  await drawRoundedImage(
    ctx,
    await loadImage(data.cover),
    60,
    60,
    width - 120,
    coverH,
    40
  );

  // -----------------------------
  // 标题文字
  ctx.fillStyle = "#f3ebd3";
  ctx.font = "bold 58px sans-serif";
  ctx.fillText(data.title, 60, 760);

  ctx.fillStyle = "#f3ebd3";
  ctx.font = "42px sans-serif";
  ctx.fillText(`距离：${data.distance}km`, 60, 830);

  // -----------------------------
  // 地图区域
  const mapBox = { x: 60, y: 900, w: 960, h: 960 };
  drawRoundedRect(
    ctx,
    mapBox.x,
    mapBox.y,
    mapBox.w,
    mapBox.h,
    36,
    "#1c1f33",
    "#1c1f33"
  );

  const startIcon = await emojiToImage("⏱️", 32);
  const endIcon = await emojiToImage("🏁", 32);

  await renderRouteMap({
    ctx,
    box: mapBox,
    encodedPolyline: data.encodedPolyline,
    tileUrl: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    startIcon: startIcon,
    endIcon: endIcon,
    zoom: zoom,
    onProgress: onProgress, // <- 渲染进度
  });

  // -----------------------------
  // 5. 底部水印
  ctx.fillStyle = "#f3ebd3";
  ctx.font = watermarkFont;
  ctx.textAlign = "center";
  ctx.fillText(watermarkText, width / 2, height - 60);
}

/**
 * 在画布底部绘制：背景色条 + 居中文字水印
 */
function drawWatermarkBar(
  ctx: CanvasRenderingContext2D,
  options: {
    text: string;
    width: number;
    height: number;
    font?: string;
    barHeight?: number;
    textColor?: string;
    barColor?: string;
    paddingBottom?: number;
    globalAlpha?: number;
  }
) {
  const {
    text,
    width,
    height,
    font = "57px 'Noto Serif SC', 'STSong', 'SimSun', serif",
    barHeight = 100,
    textColor = "#f3ebd3",
    barColor = "#1c1f33",
    paddingBottom = 20,
    globalAlpha = 0.4,
  } = options;

  ctx.save();

  // 背景色条
  ctx.fillStyle = barColor;
  ctx.globalAlpha = globalAlpha; // 40% 透明度
  ctx.fillRect(0, height - barHeight, width, barHeight);
  ctx.globalAlpha = 1.0; // 恢复

  // 文字
  ctx.font = font;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(text, width / 2, height - barHeight / 2 + paddingBottom / 2);

  ctx.restore();
}

type RenderOptionsNew = {
  width?: number;
  height?: number;
  theme?: string;
  showQr?: boolean;
  showLogo?: boolean;
  showAvatar?: boolean;
  bottomGradient?: boolean;
};

function drawPosterText(
  ctx: CanvasRenderingContext2D,
  rp: RidingPlanPro,
  width: number,
  height: number,
  opts: RenderOptionsNew = {}
) {
  const theme = themes[opts.theme || "default"] || themes.default;
  ctx.save();

  // TOP TITLE AREA
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Title background mask for readability
  if (opts.bottomGradient !== undefined && opts.bottomGradient) {
    // If they asked bottomGradient we will draw bottom later. Here draw subtle top mask:
    ctx.fillStyle = theme.maskColor || "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, width, 320);
  }

  ctx.fillStyle = theme.titleColor;
  ctx.font = "bold 72px Inter, sans-serif";
  const title = rp.title || "骑行记录";
  // handle long title -> wrap into max width
  const maxTitleW = width * 0.9;
  const titleLines = wrapText(ctx, title, maxTitleW);
  const titleYStart = 140;
  const lineH = textHeightFromFont(ctx.font) + 8;
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], width / 2, titleYStart + i * lineH);
  }

  // subtitle
  if (rp.description) {
    ctx.font = "36px Inter, sans-serif";
    ctx.fillStyle = theme.subtitleColor;
    ctx.fillText(
      rp.description,
      width / 2,
      titleYStart + titleLines.length * lineH + 46
    );
  }

  // BOTTOM INFO AREA
  const baseY = height - 260;
  const leftX = width * 0.08;
  const rightX = width * 0.92;
  ctx.font = "36px Inter, sans-serif";
  ctx.fillStyle = theme.infoColor;
  ctx.textAlign = "left";
  ctx.fillText(`距离：${rp.distance_km ?? ""} km`, leftX, baseY);
  ctx.textAlign = "right";
  ctx.fillText(`用时：${rp.duration_min ?? ""} 分钟`, rightX, baseY);

  ctx.textAlign = "left";
  ctx.fillText(
    `平均速度：${Math.round(rp.distance_km / rp.duration_min / 60) ?? ""} km/h`,
    leftX,
    baseY + 64
  );
  ctx.textAlign = "right";
  ctx.fillText(`日期：${rp.start_time ?? ""}`, rightX, baseY + 64);

  // watermark small
  ctx.font = "20px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = theme.subtitleColor;
  ctx.fillText("Powered by chaohucyclingclub", width / 2, height - 36);

  ctx.restore();
}
