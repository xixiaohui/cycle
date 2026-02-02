"use client";

import type { Track } from "@/modules/tracking/domain/Track";

export default function TrackSwitcher({
  tracks,
  visibleIds,
  activeId,
  onToggle,
  onActive,
}: {
  tracks: Track[];
  visibleIds: Set<string>;
  activeId?: string;
  onToggle: (id: string) => void;
  onActive: (id: string) => void;
}) {
  return (
    <div className="absolute top-3 right-3 z-[1000] w-56 bg-white shadow-lg rounded p-2 space-y-2 text-sm">
      {tracks.map((t) => {
        const id = t.id.toString();
        const checked = visibleIds.has(id);

        return (
          <div
            key={id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
              activeId === id ? "bg-green-100" : ""
            }`}
            onClick={() => onActive(id)}
          >
            <span className="truncate text-black">Track {id.slice(0, 6)}</span>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
