import TrackClient from "./TrackClient";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TrackClient trackId={id} />;
}