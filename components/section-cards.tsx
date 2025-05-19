"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/src/app/hooks/useDashboardData";

export function SectionCards() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) return <p className="text-center text-gray-500">Carregando...</p>;
  if (error) return <p className="text-center text-red-500">Erro ao carregar dados</p>;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Receita */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Receita</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R$ {data.receita?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </CardTitle>
          <div className="absolute right-4 top-4">
            {typeof data.receitaVariacao === "number" ? (
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {data.receitaVariacao >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                {data.receitaVariacao.toFixed(1)}%
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-lg text-xs">Sem dados</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Fechamentos */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Fechamentos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.fechamentos?.total ?? 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            {typeof data.fechamentos?.variacao === "number" ? (
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {data.fechamentos.variacao >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                {data.fechamentos.variacao.toFixed(1)}%
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-lg text-xs">Sem dados</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Cotações */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Cotações</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.cotacoes?.total ?? 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            {typeof data.cotacoes?.variacao === "number" ? (
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {data.cotacoes.variacao >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                {data.cotacoes.variacao.toFixed(1)}%
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-lg text-xs">Sem dados</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Taxa de Conversão */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Taxa de conversão</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {typeof data.taxaConversao?.atual === "number" ? `${data.taxaConversao.atual.toFixed(1)}%` : "Sem dados"}
          </CardTitle>
          <div className="absolute right-4 top-4">
            {typeof data.taxaConversao?.variacao === "number" ? (
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {data.taxaConversao.variacao >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                {data.taxaConversao.variacao.toFixed(1)}%
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-lg text-xs">Sem dados</Badge>
            )}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
