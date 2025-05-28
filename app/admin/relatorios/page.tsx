"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportarExcel } from "@/app/backofficer/relatorios/exportar-excel";

export default function DealersPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const [reportTypes, setReportTypes] = useState({
    fechamentos: false,
    cotacoes: false,
    servicos: false,
  });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex h-screen bg-muted/40">
          <div className="flex-1 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-primary">Relatórios da Empresa</h1>
            </div>

            <Card className="max-w-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-muted-foreground">
                  Gerar Relatório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seletor de datas */}
                <div className="space-y-2">
                  <Label className="font-medium text-base text-foreground">Período</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal "
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span className="text-muted-foreground">Escolha um intervalo</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) =>
                          setDateRange({
                            from: range?.from,
                            to: range?.to,
                          })
                        }
                        numberOfMonths={2}
                         className="bg-blue-500"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <Label className="font-medium text-base text-foreground">Tipo de Relatório</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fechamentos"
                        checked={reportTypes.fechamentos}
                        onCheckedChange={(checked) =>
                          setReportTypes((prev) => ({
                            ...prev,
                            fechamentos: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="fechamentos">Fechamentos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cotacoes"
                        checked={reportTypes.cotacoes}
                        onCheckedChange={(checked) =>
                          setReportTypes((prev) => ({
                            ...prev,
                            cotacoes: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="cotacoes">Cotações</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicos"
                        checked={reportTypes.servicos}
                        onCheckedChange={(checked) =>
                          setReportTypes((prev) => ({
                            ...prev,
                            servicos: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="servicos">Serviços</Label>
                    </div>
                  </div>
                </div>

                {/* Botão de gerar relatório */}
                <div className="pt-4">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
                  onClick={async () => {
                    if (!dateRange.from || !dateRange.to) {
                      alert("Por favor, selecione um intervalo de datas.");
                      return;
                    }

                    const params = new URLSearchParams({
                      started_at_gte: dateRange.from.toISOString().split("T")[0],
                      started_at_lte: dateRange.to.toISOString().split("T")[0],
                    });

                    if (reportTypes.fechamentos) params.append("fechamentos", "true");
                    if (reportTypes.cotacoes) params.append("cotacoes", "true");
                    if (reportTypes.servicos) params.append("servicos", "true");

                    const url = `/api/v1/relatorios/stats?${params.toString()}`;

                    try {
                      const res = await fetch(url);
                      const data = await res.json();

                      
                      exportarExcel(data.reports,  'Desconhecido');

                      console.log("Relatórios encontrados:", data.reports);
                    } catch (error) {
                      console.error("Erro ao buscar relatórios:", error);
                      alert("Erro ao gerar relatório. Tente novamente.");
                    }
                  }}
                >
                  Gerar Relatório
                </Button>


                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
