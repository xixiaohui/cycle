import pool from "@/lib/db";



export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
//   const userId = getUserId(req);
//   if (!userId) return new Response("Unauthorized", { status: 401 });

  await pool.query(
    `
    INSERT INTO riding_plan_participants (plan_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [params.id, "userId"]
  );

  return Response.json({ success: true });
}
