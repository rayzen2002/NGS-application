import { useQuery } from "@tanstack/react-query";

const fetchDashboardData = async () => {
  const response = await fetch("/api/v1/dashboard");
  if (!response.ok) throw new Error("Erro ao buscar dados da dashboard");
  return response.json();
};

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
  });
}
