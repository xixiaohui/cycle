/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SessionTimeline({ session }: { session: any }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-medium mb-2">Timeline</h2>

      <ul className="text-sm space-y-1">
        <li>📝 Created: {new Date(session.created_at).toLocaleString()}</li>

        {session.started_at && (
          <li>▶️ Started: {new Date(session.started_at).toLocaleString()}</li>
        )}

        {session.ended_at && (
          <li>⏹ Ended: {new Date(session.ended_at).toLocaleString()}</li>
        )}
      </ul>
    </div>
  );
}
