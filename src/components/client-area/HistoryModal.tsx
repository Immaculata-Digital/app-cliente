
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Calendar, ShoppingBag, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { pontosMovimentacaoService } from "@/services/api-clientes";
import type { ClientePontosMovimentacao } from "@/types/cliente-pontos-movimentacao";
import { getSchemaFromHostname } from "@/utils/schema.utils";
import { useAuth } from "@/contexts/AuthContext";

interface HistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({ isOpen, onOpenChange }: HistoryModalProps) {
  const { user } = useAuth();
  const schema = getSchemaFromHostname();
  const [loading, setLoading] = useState(false);
  const [movimentacoes, setMovimentacoes] = useState<ClientePontosMovimentacao[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (isOpen && user?.clienteId) {
      void fetchHistory();
    }
  }, [isOpen, user?.clienteId]);

  const fetchHistory = async () => {
    if (!user?.clienteId) return;

    setLoading(true);
    try {
      const response = await pontosMovimentacaoService.getExtrato(
        schema,
        user.clienteId,
        { limit: 50, order: 'desc' }
      );
      setMovimentacoes(response.movimentacoes);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovimentacoes = movimentacoes.filter(mov => {
    if (activeTab === "all") return true;
    if (activeTab === "resgates") return mov.tipo === "DEBITO" && mov.origem === "RESGATE";
    return true;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Histórico de Atividades</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full">
          <div className="px-6 pb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Extrato Completo</TabsTrigger>
              <TabsTrigger value="resgates">Meus Resgates</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 bg-muted/10 relative border-t">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : filteredMovimentacoes.length > 0 ? (
              <ScrollArea className="h-[50vh] w-full">
                <div className="p-4 space-y-3">
                  {filteredMovimentacoes.map((mov) => (
                    <div
                      key={mov.id_pontos_movimentacao}
                      className="flex flex-col p-4 rounded-lg bg-card border shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {mov.tipo === 'CREDITO' ? (
                            <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
                              <ArrowUpCircle className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-full bg-rose-100 text-rose-600">
                              <ArrowDownCircle className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-sm block">
                              {mov.tipo === 'CREDITO' ? 'Pontos Recebidos' : 'Resgate Realizado'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(mov.dt_cadastro)}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-bold font-mono text-base ${
                            mov.tipo === "CREDITO"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {mov.tipo === "CREDITO" ? "+" : "-"}
                          {mov.pontos}
                        </span>
                      </div>
                      
                      {mov.observacao && (
                        <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground mt-1">
                          {mov.observacao}
                        </div>
                      )}
                      
                      {mov.codigo_resgate && (
                          <div className="mt-2 flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/10">
                              <span className="text-xs font-medium text-primary">Código:</span>
                              <span className="text-xs font-mono font-bold">{mov.codigo_resgate}</span>
                          </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center h-64">
                <ShoppingBag className="h-12 w-12 mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">
                  {activeTab === "resgates" 
                    ? "Nenhum resgate encontrado." 
                    : "Nenhuma movimentação registrada."}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  {activeTab === "resgates"
                    ? "Faça resgates utilizando seus pontos acumulados."
                    : "Suas compras e atividades aparecerão aqui."}
                </p>
              </div>
            )}
          </div>
        </Tabs>
        
        <div className="p-4 border-t bg-background">
             <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Fechar
             </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
