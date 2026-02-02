/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState } from "react";
import type { Track } from "@/modules/tracking/domain/Track";
import TrackSwitcher from "./TrackSwitcher";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
});

export default function SessionTracksLive({
  tracks,
}: {
  tracks: Track[];
}) {
  const firstId = tracks[0]?.id.toString();


  const [visibleIds, setVisibleIds] = useState<Set<string>>(
    () => (firstId ? new Set([firstId]) : new Set())
  );

  const [activeId, setActiveId] = useState<string | undefined>(
    firstId
  );

  const toggle = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };


  return (
    <div className="relative">
      <TrackSwitcher
        tracks={tracks}
        visibleIds={visibleIds}
        activeId={activeId}
        onToggle={toggle}
        onActive={setActiveId}
      />

      <LeafletMap
        tracks={tracks}
        visibleIds={visibleIds}
        highlightTrackId={activeId}
      />
    </div>
  );
}
