import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, fetchTweets } from "../lib/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
}

export function useTweets() {
  return useQuery({
    queryKey: ["tweets"],
    queryFn: fetchTweets,
  });
}
