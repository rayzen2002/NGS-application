"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsCotacoes } from "@/hooks/use-cotacoes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

interface ChartData {
  date: string;
  cotacoes: number;
  fechamentos: number;
}

type TimeRange = "7d" | "30d" | "90d";

const chartConfig = {
  fechamentos: {
    label: "Fechamentos",
    color: "hsl(var(--chart-1))",
  },
  cotacoes: {
    label: "Cotações",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


export function ChartAreaInteractive() {
  const isCotacoes = useIsCotacoes();
  const [timeRange, setTimeRange] = React.useState<TimeRange>("30d");
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isCotacoes) {
      setTimeRange("7d");
    }
  }, [isCotacoes]);

  React.useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/v1/chart-data");
        if (!response.ok) throw new Error("Erro ao buscar dados");
        const data: ChartData[] = await response.json();
        const sortedData = data.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setChartData(sortedData);
      } catch (err) {
        setError("Falha ao carregar os dados.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, []);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    const rangeInDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - rangeInDays);

    return chartData.filter((item) => new Date(item.date) >= startDate);
  }, [chartData, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Fechamentos</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Total nos últimos 3 meses
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <p className="text-center">Carregando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {Object.entries(chartConfig).map(([key, config]) => (
                <Area
                key={key}
                dataKey={key}
                name={config.label}
                type="natural"
                fill={config.color}
                stroke={config.color}
              />
              
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
