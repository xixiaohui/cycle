export default async function ReplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params
  console.log("----------1-----------");


  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      reply
    </div>
  );
}
