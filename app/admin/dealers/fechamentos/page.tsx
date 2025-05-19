"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Dealer {
  id: number;
  name: string;
  routing: string;
  zelle: string;
  account: string;
  monthlyClosings: number;
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    routing: "",
    zelle: "",
    account: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const response = await axios.get("/api/v1/dealers");
      setDealers(response.data.dealers);
    } catch (error) {
      console.error("Erro ao buscar dealers:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post("/api/v1/dealers", formData);
      toast.success("Dealer criado com sucesso");
      setFormData({ name: "", routing: "", zelle: "", account: "" });
      setShowForm(false);
      fetchDealers(); // atualiza lista
    } catch (error) {
      console.error("Erro ao criar dealer:", error);
      toast.error("Erro ao criar dealer");
    } finally {
      setLoading(false);
    }
  };

  const filteredDealers = dealers.filter((dealer) =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex h-screen">
          <div className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Estatística Dealers</h1>
            </div>

            {showForm && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-lg border">
                <Input
                  placeholder="Nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  placeholder="Routing"
                  value={formData.routing}
                  onChange={(e) => setFormData({ ...formData, routing: e.target.value })}
                />
                <Input
                  placeholder="Zelle"
                  value={formData.zelle}
                  onChange={(e) => setFormData({ ...formData, zelle: e.target.value })}
                />
                <Input
                  placeholder="Account"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                />
                <div className="col-span-full">
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    Salvar Dealer
                  </Button>
                </div>
              </div>
            )}

            <Input
              placeholder="Buscar por nome do dealer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />

            <ScrollArea className="h-[65vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDealers.map((dealer) => (
                  <Card key={dealer.id} className="relative shadow-md">
                    <CardContent className="p-4 space-y-2">
                      <h2 className="text-lg font-semibold">{dealer.name}</h2>
                      <p className="text-sm">
                        Fechamentos solicitados no mês: {dealer.monthlyClosings}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
