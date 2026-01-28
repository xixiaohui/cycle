/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SessionHeader({ session }: { session: any }) {
  return (
    <div className="border rounded-lg p-4">
      <h1 className="text-xl font-semibold">Ride Session</h1>

      <div className="mt-2 text-sm text-gray-600 space-y-1">
        <div>Status: <b>{session.status}</b></div>
        <div>Owner: {session.owner_id}</div>
        <div>Created: {new Date(session.created_at).toLocaleString()}</div>
      </div>
    </div>
  );
}