type Track = {
  id: string;
  name?: string;
};

type Props = {
  tracks: Track[];
  visibleTrackIds: string[];
  highlightTrackId?: string;
  onToggle: (id: string) => void;
  onHighlight: (id: string) => void;
};

export function TrackSwitcher({
  tracks,
  visibleTrackIds,
  highlightTrackId,
  onToggle,
  onHighlight,
}: Props) {
  return (
    <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur rounded shadow p-2 space-y-1">
      {tracks.map((t) => {
        const visible = visibleTrackIds.includes(t.id);
        const active = highlightTrackId === t.id;

        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
              ${active ? "bg-green-100" : "hover:bg-gray-100"}
            `}
            onClick={() => onHighlight(t.id)}
          >
            <input
              type="checkbox"
              checked={visible}
              onChange={() => onToggle(t.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm">
              {t.name ?? t.id.slice(0, 6)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
