import pool from "@/lib/db";


export async function POST(
  _: Request,
  context : { params: Promise<{ id: string }> }
) {

  const { id } = await context.params;
  await pool.query(
    `
    UPDATE tracks
    SET finished_at = now()
    WHERE id = $1
    `,
    [id]
  );

  return Response.json({ success: true });
}
