"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {  SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

interface Dealer {
  id: number;
  name: string;
  routing: string;
  zelle: string;
  account: string;
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", routing: "", zelle: "", account: "" }); // Incluindo account no formData
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const response = await axios.get("/api/v1/dealers/list");
      setDealers(response.data.dealers);
    } catch (error) {
      console.error("Erro ao buscar dealers:", error);
    }
  };

  const handleAddDealer = async () => {
    setLoading(true);
    try {
      console.log(formData)
      await axios.post("/api/v1/dealers", formData);
      toast("Dealer adicionado com sucesso!");
      setFormData({ name: "", routing: "", zelle: "", account: "" });
      setShowForm(false);
      fetchDealers();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar dealer");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDealer = async (id: number) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este dealer?");
    if (!confirmed) return;

    try {
      await axios.delete("/api/v1/dealers", { data: { id } });
      toast.success("Dealer deletado com sucesso!");
      fetchDealers();
    } catch (error) {
      console.error("Erro ao deletar dealer:", error);
      toast.error("Erro ao deletar dealer");
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
          
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dealers</h1>
              <a className="text-lg font-bold text-blue-700 py-6" href="/admin/dealers/fechamentos">Exibir Fechamentos</a>
              <Button variant="default" onClick={() => setShowForm(!showForm)}>
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? "Cancelar" : "Adicionar Dealer"}
              </Button>
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
                <div className="md:col-span-3 flex justify-end">
                  <Button onClick={handleAddDealer} disabled={loading}>
                    {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
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
                      <button
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteDealer(dealer.id)}
                        title="Deletar Dealer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      <h2 className="text-lg font-semibold">{dealer.name}</h2>
                      <p className="text-sm">Routing: {dealer.routing}</p>
                      <p className="text-sm">Zelle: {dealer.zelle}</p>
                      <p className="text-sm">Account: {dealer.account}</p> 
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
