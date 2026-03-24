import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type DonationStatus,
  EntityType,
  type FoodDonation,
  type ImpactCounters,
  type NGO,
  type StorageCondition,
  type UserProfile,
  type Volunteer,
} from "../backend";
import { useActor } from "./useActor";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Food Donations ───────────────────────────────────────────────────────────

export function useGetAllDonations() {
  const { actor, isFetching } = useActor();

  return useQuery<FoodDonation[]>({
    queryKey: ["allDonations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingDonations() {
  const { actor, isFetching } = useActor();

  return useQuery<FoodDonation[]>({
    queryKey: ["pendingDonations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingDonationsSortedByTimestamp();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableDonationsForVolunteers() {
  const { actor, isFetching } = useActor();

  return useQuery<FoodDonation[]>({
    queryKey: ["availableDonationsForVolunteers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableDonationsForVolunteers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useCreateFoodDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      donorName: string;
      foodType: string;
      quantity: number;
      unit: string;
      cookTime: bigint;
      storageCondition: StorageCondition;
      city: string;
      neighborhood: string;
      latitude: number;
      longitude: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createFoodDonation(
        params.donorName,
        params.foodType,
        params.quantity,
        params.unit,
        params.cookTime,
        params.storageCondition,
        params.city,
        params.neighborhood,
        params.latitude,
        params.longitude,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDonations"] });
      queryClient.invalidateQueries({ queryKey: ["pendingDonations"] });
    },
  });
}

export function useUpdateDonationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: DonationStatus }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateFoodDonationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDonations"] });
      queryClient.invalidateQueries({ queryKey: ["pendingDonations"] });
    },
  });
}

export function useClaimDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      donationId,
      volunteerId,
    }: { donationId: bigint; volunteerId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.claimDonation(donationId, volunteerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availableDonationsForVolunteers"],
      });
      queryClient.invalidateQueries({ queryKey: ["allDonations"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("already claimed")) {
        console.warn("Donation already claimed:", error.message);
      }
    },
  });
}

export function useCancelClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      donationId,
      volunteerId,
    }: { donationId: bigint; volunteerId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.cancelClaim(donationId, volunteerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availableDonationsForVolunteers"],
      });
      queryClient.invalidateQueries({ queryKey: ["allDonations"] });
    },
  });
}

// ─── NGOs ─────────────────────────────────────────────────────────────────────

export function useGetAllNgos() {
  const { actor, isFetching } = useActor();

  return useQuery<NGO[]>({
    queryKey: ["allNgos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNgosSortedByRating();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetNgosByCity(city: string) {
  const { actor, isFetching } = useActor();

  return useQuery<NGO[]>({
    queryKey: ["ngosByCity", city],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNgosByCity(city);
    },
    enabled: !!actor && !isFetching && !!city,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useRateNgo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ngoId,
      rating,
    }: { ngoId: bigint; rating: number }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.rateNgo(ngoId, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNgos"] });
    },
  });
}

export function useGetMyNgoRating(ngoId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ["myNgoRating", ngoId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyNgoRating(ngoId);
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Volunteers ───────────────────────────────────────────────────────────────

export function useGetAllVolunteers() {
  const { actor, isFetching } = useActor();

  return useQuery<Volunteer[]>({
    queryKey: ["allVolunteers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVolunteersSortedByName();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetVolunteersByCity(city: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Volunteer[]>({
    queryKey: ["volunteersByCity", city],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVolunteersByCity(city);
    },
    enabled: !!actor && !isFetching && !!city,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

// ─── Impact ───────────────────────────────────────────────────────────────────

export function useGetImpactCounters() {
  const { actor, isFetching } = useActor();

  return useQuery<ImpactCounters>({
    queryKey: ["impactCounters"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getImpactCounters();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalMealsSaved: BigInt(50000),
      totalPeopleFed: BigInt(25000),
      co2Reduced: 12500.0,
      cityBreakdown: [
        ["Mumbai", BigInt(30000)],
        ["Pune", BigInt(15000)],
        ["Nagpur", BigInt(5000)],
      ],
    },
  });
}

export function useUpdateImpactCounters() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      mealsSaved: bigint;
      peopleFed: bigint;
      co2: number;
      city: string;
      cityCount: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateImpactCounters(
        params.mealsSaved,
        params.peopleFed,
        params.co2,
        params.city,
        params.cityCount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["impactCounters"] });
    },
  });
}
