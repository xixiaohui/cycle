"use client";

import { useEffect, useState } from "react";
import { RideSessionListItemVM } from "@/modules/ride-session/application/query/RideSessionListItemVM";

import { useRouter } from "next/navigation";
import { Card, CardContent, Typography, Stack } from "@mui/material";

export default function RidesPage() {
  const [rides, setRides] = useState<RideSessionListItemVM[]>([]);

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/ride-sessions?limit=20");

        if (!res.ok) {
          throw new Error("fetch failed");
        }
        const data = await res.json();
        setRides(data);

        console.log(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-4xl text-blue-700 tracking-tighter text-balance">
        CYCLING LIST
      </h1>

      {rides.map((ride) => (
        <Card
          key={ride.id}
          sx={{
            mb: 2,
            cursor: "pointer",
            "&:hover": {
              boxShadow: 6,
            },
          }}
          onClick={() => router.push(`/rides/${ride.id}`)}
        >
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Status: {ride.status}</Typography>

              <Typography variant="body2" color="text.secondary">
                Start: {ride.startedAt ?? "-"}
              </Typography>

              <Typography variant="body2">
                ParticipantCount: {ride.participantCount}
              </Typography>

              <Typography variant="body2">
                IsRiding: {ride.isRiding ? "true" : "false"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
