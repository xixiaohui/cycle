import { NextRequest } from "next/server"


import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSessionQueryService } from "@/modules/ride-session/application/query/RideSessionQueryService"
import { PostgresRideSessionRepository } from "@/modules/ride-session/infrastructure/PostgresRideSessionRepository"


// GET /api/ride-sessions?limit=20
export async function GET(req: NextRequest) {
  try {
    /* 1️⃣ 解析用户身份（示例） */
    // 实际项目中：从 auth / session / token 里拿
    const userId = UserId.from("mock-user-id")

    /* 2️⃣ 解析参数 */
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? 20)

    const rideSessionRepository = new PostgresRideSessionRepository()
    /* 3️⃣ 调用 Application / Query 层 */
    const queryService = new RideSessionQueryService(
      rideSessionRepository
    )

    const result = await queryService.listForUser(userId, limit)

    /* 4️⃣ 返回 UI 可直接消费的 JSON */
    return Response.json(result)
  } catch (err) {
    console.error(err)

    return Response.json(
      { message: "Failed to fetch ride sessions" },
      { status: 500 }
    )
  }
}
