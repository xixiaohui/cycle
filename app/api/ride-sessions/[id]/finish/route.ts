import pool from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    await pool.query(
      `
    UPDATE ride_sessions
    SET status = 'ENDED', ended_at = NOW()
    WHERE id = $1 AND status = 'RIDING'
    `,
      [id],
    );

  return new Response(null, { status: 204 });
}
