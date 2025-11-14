import { useState, useEffect } from "react";
import { Gift, Plus, Copy, X, LogOut, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import QRCodeComponent from "react-qr-code";
import { usePontosRecompensas } from "@/hooks/usePontosRecompensas";
import { pontosMovimentacaoService } from "@/services/api-clientes";
import type { PontosRecompensa } from "@/types/cliente-pontos-recompensas";
import type { CreateMovimentacaoRequest, ResgateResponse } from "@/types/cliente-pontos-movimentacao";

// Schema tenant padrão (multi-tenant)
const TENANT_SCHEMA = "z_demo";

// Dados mockados do cliente
const MOCK_CLIENTE = {
  id: 42,
  codigo: "CLT001234",
  nome: "João Silva",
  schema: TENANT_SCHEMA,
};

type ModalType = "codigo" | "confirmar-resgate" | null;
type ModalContext = "resgate" | "somar-pontos";

const ClientArea = () => {
  const { toast } = useToast();
  const { user, logout, isLoading } = useAuth();
  const [modalAberto, setModalAberto] = useState<ModalType>(null);
  const [contextoModal, setContextoModal] = useState<ModalContext>("resgate");
  const [itemSelecionado, setItemSelecionado] = useState<PontosRecompensa | null>(null);
  const [resgatePendente, setResgatePendente] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [codigoResgateGerado, setCodigoResgateGerado] = useState<string | null>(null);
  const [detalhesResgate, setDetalhesResgate] = useState<ResgateResponse | null>(null);

  const { loading, recompensas, fetchRecompensas } = usePontosRecompensas({
    schema: TENANT_SCHEMA,
    id_cliente: user?.clienteId || 0,
  });

  useEffect(() => {
    if (!isLoading && user?.clienteId) {
      fetchRecompensas();
    }
  }, [isLoading, user?.clienteId, fetchRecompensas]);

  const codigoExibido =
    contextoModal === "resgate" && codigoResgateGerado
      ? codigoResgateGerado
      : recompensas?.codigo_cliente || MOCK_CLIENTE.codigo;

  const copiarCodigo = () => {
    if (!codigoExibido) {
      return;
    }
    navigator.clipboard.writeText(codigoExibido);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const abrirModalCodigo = (contexto: ModalContext) => {
    setContextoModal(contexto);
    if (contexto !== "resgate") {
      setCodigoResgateGerado(null);
      setDetalhesResgate(null);
    }
    setShowQR(false);
    setModalAberto("codigo");
  };

  const iniciarResgate = (item: PontosRecompensa) => {
    setItemSelecionado(item);
    setCodigoResgateGerado(null);
    setDetalhesResgate(null);
    setModalAberto("confirmar-resgate");
  };

  const confirmarResgate = async () => {
    if (!itemSelecionado) return;
    if (!user?.clienteId) {
      toast({
        variant: "destructive",
        title: "Sessão expirada",
        description: "Faça login novamente para continuar o resgate.",
      });
      return;
    }

    setResgatePendente(true);

    try {
      const resposta = await pontosMovimentacaoService.resgatarRecompensa(
        TENANT_SCHEMA,
        user.clienteId,
        itemSelecionado.id_item_recompensa,
        `Resgate de ${itemSelecionado.nome_item}`
      );

      setDetalhesResgate(resposta);
      setCodigoResgateGerado(resposta.codigo_resgate ?? null);

      await fetchRecompensas();

      toast({
        title: "Resgate realizado!",
        description: resposta.codigo_resgate
          ? `Código de resgate: ${resposta.codigo_resgate}`
          : "Resgate registrado com sucesso.",
      });

      setContextoModal("resgate");
      setModalAberto("codigo");
      setShowQR(false);
      setItemSelecionado(null);
    } catch (error: any) {
      const mensagem =
        typeof error?.message === "string" && error.message.trim().length > 0
          ? error.message
          : "Não foi possível concluir o resgate. Tente novamente.";

      console.error("[Resgate] Erro ao confirmar resgate:", error);

      toast({
        variant: "destructive",
        title: "Erro ao resgatar",
        description: mensagem,
      });
    } finally {
      setResgatePendente(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Header com Logout */}
      <header className="bg-gradient-primary p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 items-center">
          {/* Primeira coluna vazia para balanceamento */}
          <div></div>
          
          {/* Segunda coluna - Título centralizado */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary-foreground">
              Olá, {user?.clienteNome || user?.nome || MOCK_CLIENTE.nome}
            </h1>
          </div>
          
          {/* Terceira coluna - Botão alinhado à direita */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Cards de Destaque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Saldo */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Saldo de Pontos</h3>
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {loading ? "..." : (recompensas?.quantidade_pontos ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">pontos disponíveis</p>
          </Card>

          {/* Card Código */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Meu Código</h3>
            </div>
            <p className="text-2xl font-mono font-bold text-foreground mb-3">
              {recompensas?.codigo_cliente || MOCK_CLIENTE.codigo}
            </p>
            <Button
              size="sm"
              onClick={() => abrirModalCodigo("somar-pontos")}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Somar Pontos
            </Button>
          </Card>
        </div>

        {/* Catálogo de Itens */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Catálogo de Recompensas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <p className="text-muted-foreground col-span-full text-center">Carregando recompensas...</p>
            ) : recompensas?.recompensas && recompensas.recompensas.length > 0 ? (
              recompensas.recompensas.map((item) => {
                const pontosInsuficientes = (recompensas.quantidade_pontos ?? 0) < item.qtd_pontos;
                
                return (
                  <Card key={item.id_item_recompensa} className="p-4 bg-card border-border">
                    <div className="flex flex-col gap-3">
                      {item.foto && (
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                          <img 
                            src={item.foto} 
                            alt={item.nome_item}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">{item.nome_item}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.qtd_pontos.toLocaleString()} pontos
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={pontosInsuficientes}
                        onClick={() => iniciarResgate(item)}
                      >
                        {pontosInsuficientes ? "Pontos insuficientes" : "Resgatar"}
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <p className="text-muted-foreground col-span-full text-center">Nenhuma recompensa disponível</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Mostrar Código */}
      <Dialog
        open={modalAberto === "codigo"}
        onOpenChange={(open) => {
          if (!open) {
            setModalAberto(null);
            setShowQR(false);
            setCodigoResgateGerado(null);
            setDetalhesResgate(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {contextoModal === "resgate" ? "Código de Resgate" : "Meu Código"}
            </DialogTitle>
            <DialogDescription>
              {contextoModal === "resgate"
                ? "Mostre este código ao operador para concluir o resgate do seu item."
                : "Informe este número ao operador para creditar seus pontos."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {contextoModal === "resgate" ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Código de Resgate</p>
                <p className="text-5xl font-mono font-bold text-foreground tracking-wider">
                  {codigoExibido}
                </p>
                {detalhesResgate && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Saldo atual após resgate:{" "}
                    <span className="font-semibold text-foreground">
                      {detalhesResgate.saldo_atual.toLocaleString()} pontos
                    </span>
                  </p>
                )}
              </div>
            ) : showQR ? (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeComponent value={codigoExibido} size={200} level="H" />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Código do Cliente</p>
                <p className="text-5xl font-mono font-bold text-foreground tracking-wider">
                  {codigoExibido}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 w-full">
              {contextoModal !== "resgate" && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowQR(!showQR)}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {showQR ? "Mostrar Código" : "Exibir QR Code"}
                </Button>
              )}
              {(!showQR || contextoModal === "resgate") && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copiarCodigo}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código
                </Button>
              )}
            </div>
            
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setModalAberto(null);
                setShowQR(false);
                setCodigoResgateGerado(null);
                setDetalhesResgate(null);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Resgate */}
      <Dialog open={modalAberto === "confirmar-resgate"} onOpenChange={() => setModalAberto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
            <DialogDescription>
              Você está prestes a resgatar um item. Esta ação criará uma solicitação pendente.
            </DialogDescription>
          </DialogHeader>
          {itemSelecionado && (
            <div className="py-4">
              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-foreground">{itemSelecionado.nome_item}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {itemSelecionado.qtd_pontos.toLocaleString()} pontos
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Após confirmar, você receberá um código para mostrar ao operador na loja.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModalAberto(null)}
                  disabled={resgatePendente}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmarResgate}
                  disabled={resgatePendente}
                >
                  {resgatePendente ? "Processando..." : "Confirmar Resgate"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientArea;
