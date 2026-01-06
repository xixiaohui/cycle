import { supabase } from "./supabaseClient";

let watchId: number | null = null;
let lastUpload = 0;

export function startTracking(trackId: string) {
  if (watchId !== null) return;
  console.log("--------startTracking----------1");

  if (!("geolocation" in navigator)) {
    console.error("❌ 浏览器不支持定位");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      console.log("📍 定位成功", pos.coords);

      const now = Date.now();
      if (now - lastUpload < 3000) return;
      lastUpload = now;

      const { latitude, longitude, altitude } = pos.coords;

      console.log("--------startTracking----------2");

      const { error } = await supabase.from("track_points").insert({
        track_id: trackId,
        latitude,
        longitude,
        elevation: altitude,
      });

      if (error) {
        console.error("❌ insert error", error);
      } else {
        console.log("✅ insert success");
      }
    },
    (err) => console.error("定位失败", err),
    {
      enableHighAccuracy: false,
      maximumAge: 10000,
    }
  );
}

export function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
