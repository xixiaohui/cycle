"use server";

import { StartRideSession } from "@/modules/ride-session/application/StartRideSession";
import { EndRideSession } from "@/modules/ride-session/application/EndRideSession";
import { SupabaseRideSessionRepository } from "@/modules/ride-session/infrastructure/SupabaseRideSessionRepository";
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId";
import { revalidatePath } from "next/cache";
import { EventBus } from "@/modules/shared/domain/EventBus";
import { JoinRideSession } from "@/modules/ride-session/application/JoinRideSession";
import { UserId } from "@/modules/sharing/identity/UserId";

export async function startRideAction(id: string) {
  const useCase = new StartRideSession(
    new SupabaseRideSessionRepository(),
    new EventBus()
  );

  await useCase.execute({ rideSessionId: RideSessionId.from(id) });

  revalidatePath(`/rides/${id}`);
}

export async function endRideAction(id: string) {
  const useCase = new EndRideSession(new SupabaseRideSessionRepository());

  await useCase.execute({ sessionId: RideSessionId.from(id) });

  revalidatePath(`/rides/${id}`);
}

export async function joinRideAction(rideSessionId: string, userId: string) {
  const useCase = new JoinRideSession(new SupabaseRideSessionRepository());

  await useCase.execute({
    rideSessionId: RideSessionId.from(rideSessionId),
    userId: UserId.from(userId),
  });

  revalidatePath(`/rides/${rideSessionId}`);
}
