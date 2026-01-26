import pool from "@/lib/db";


export async function POST(
  _: Request,
  { params }: { params: { id: string } }
) {
  await pool.query(
    `
    UPDATE tracks
    SET finished_at = now()
    WHERE id = $1
    `,
    [params.id]
  );

  return Response.json({ success: true });
}
