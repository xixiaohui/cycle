// app/api/gpx/route.ts

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }

  // console.log("---------------Get---------",path);

   const { data, error } = await supabase.storage
    .from("cycling")
    .createSignedUrl(path||"", 60); // 60 秒

  // console.log("---------------Get---------");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // console.log("---------------Get-----1----");
  
  return NextResponse.json({ url: data.signedUrl });
}

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const path = searchParams.get("path");

//   if (!path) {
//     return NextResponse.json({ error: "missing path" }, { status: 400 });
//   }

//   const { data } = await supabase.storage
//     .from("rides")
//     .getPublicUrl(path); // 60 秒

//   console.log("---------------Get---------");
//   return NextResponse.json({ url: data.publicUrl });
// }