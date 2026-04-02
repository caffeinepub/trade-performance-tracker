import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TradeInput } from "../backend.d";
import { useActor } from "./useActor";

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrades() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      if (!actor) return [];
      const trades = await actor.getTrades();
      return [...trades].sort((a, b) => Number(b.date) - Number(a.date));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlyPnl() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["monthly-pnl"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlyPnl();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssetBreakdown() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["asset-breakdown"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssetBreakdown();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTrade() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: (input: TradeInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addTrade(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-pnl"] });
      queryClient.invalidateQueries({ queryKey: ["asset-breakdown"] });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteTrade(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-pnl"] });
      queryClient.invalidateQueries({ queryKey: ["asset-breakdown"] });
    },
  });
}
