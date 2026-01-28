/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RideSessionStatus } from "@/modules/ride-session/domain/RideSessionStatus";
import { Button, Stack } from "@mui/material";

export default function SessionActions({ session }: { session: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const action = async (type: "start" | "finish") => {
    await fetch(`/api/ride-sessions/${session.id}/${type}`, {
      method: "POST",
    });

    startTransition(() => {
      router.refresh();
    });
  };

  if (RideSessionStatus.from(session.status) === RideSessionStatus.CREATED) {
    return (
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="success"
          disabled={isPending}
          onClick={() => action("start")}
        >
          ▶️ Start Ride
        </Button>
      </Stack>
    );
  }

  if (RideSessionStatus.from(session.status) === RideSessionStatus.RIDING) {
    return (
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="error"
          disabled={isPending}
          onClick={() => action("finish")}
        >
          ⏹ Finish Ride
        </Button>
      </Stack>
    );
  }

  return (
    <div className="text-gray-500">
      Session finished
    </div>
  );
}
