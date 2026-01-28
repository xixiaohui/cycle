import pool from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log(id)

  await pool.query(
    `
    UPDATE ride_sessions
    SET status = 'RIDING', started_at = NOW()
    WHERE id = $1 AND status = 'CREATED'
    `,
    [id],
  );

  return new Response(null, { status: 204 });
}
