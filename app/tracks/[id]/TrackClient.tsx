"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { startTracking, stopTracking } from "@/lib/tracking";

const RealtimeTrackMap = dynamic(
  () => import("@/components/RealtimeTrackMap"),
  { ssr: false }
);

export default function TrackClient({ trackId }: { trackId: string }) {
  // const [recording, setRecording] = useState(false);

  return (
    <>
      <RealtimeTrackMap trackId={trackId} />

      {/* <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-1000">
        {!recording ? (
          <button
            className="px-6 py-3 bg-red-500 text-white rounded-full shadow"
            onClick={() => {
                console.log("trackId is",trackId);
                startTracking(trackId);
                setRecording(true);
            }}
          >
            开始记录
          </button>
        ) : (
          <button
            className="px-6 py-3 bg-gray-800 text-white rounded-full shadow"
            onClick={() => {
              stopTracking();
              setRecording(false);
            }}
          >
            结束记录
          </button>
        )}
      </div> */}
    </>
  );
}
