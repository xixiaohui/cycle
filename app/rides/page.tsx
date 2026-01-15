
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default async function RidesPage() {




  const { data: rides } = await supabase
    .from("ride_sessions")
    .select("id, status, started_at, ended_at")
    .order("created_at", { ascending: false })

  return (
    <div style={{ padding: 24 }}>
      <h1>骑行列表</h1>

      <ul>
        {rides?.map(r => (
          <li key={r.id}>
            <Link href={`/rides/${r.id}`}>
              {r.status} · {r.started_at ?? "未开始"}
            </Link>
            {" | "}
            <Link href={`/rides/${r.id}/replay`}>
              回放
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
