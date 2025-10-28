import { useState } from "react";
import { Gift, Plus, Copy, X, LogOut, User, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import QRCodeComponent from "react-qr-code";

// Schema tenant padrão (multi-tenant)
const TENANT_SCHEMA = "z_demo";

// Dados mockados
const MOCK_CLIENTE = {
  id_cliente: "CLT001234",
  nome: "João Silva",
  saldo_pontos: 1250,
  schema: TENANT_SCHEMA,
};

const MOCK_ITEMS = [
  { id: 1, nome: "Açaí 500ml", pontos: 300, tipo: "PEQUENO", disponivel: true },
  { id: 2, nome: "Pizza Grande", pontos: 800, tipo: "PEQUENO", disponivel: true },
  { id: 3, nome: "Hambúrguer Artesanal", pontos: 450, tipo: "PEQUENO", disponivel: true },
  { id: 4, nome: "Cafeteira Elétrica", pontos: 5000, tipo: "GRANDE", disponivel: false },
];

type ModalType = "codigo" | "confirmar-resgate" | null;
type ModalContext = "resgate" | "somar-pontos";

const ClientArea = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [modalAberto, setModalAberto] = useState<ModalType>(null);
  const [contextoModal, setContextoModal] = useState<ModalContext>("resgate");
  const [itemSelecionado, setItemSelecionado] = useState<typeof MOCK_ITEMS[0] | null>(null);
  const [resgatePendente, setResgatePendente] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(MOCK_CLIENTE.id_cliente);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const abrirModalCodigo = (contexto: ModalContext) => {
    setContextoModal(contexto);
    setModalAberto("codigo");
  };

  const iniciarResgate = (item: typeof MOCK_ITEMS[0]) => {
    setItemSelecionado(item);
    setModalAberto("confirmar-resgate");
  };

  const confirmarResgate = async () => {
    if (!itemSelecionado) return;

    setResgatePendente(true);
    
    // Simular chamada API
    // POST /clientes/:schema/:id_cliente/pedidos-resgate
    // Body: { id_item_recompensa, tipo: "PEQUENO", origem: "RESGATE" }
    // Schema: TENANT_SCHEMA (z_demo)
    console.log(`[Mock API] POST /clientes/${TENANT_SCHEMA}/${MOCK_CLIENTE.id_cliente}/pedidos-resgate`, {
      id_item_recompensa: itemSelecionado.id,
      tipo: itemSelecionado.tipo,
      origem: "RESGATE"
    });

    setTimeout(() => {
      setModalAberto(null);
      setResgatePendente(false);
      
      toast({
        title: "Resgate enviado!",
        description: "Mostre seu código ao operador para concluir.",
      });

      // Abrir modal de código automaticamente
      abrirModalCodigo("resgate");
    }, 1000);
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
              Olá, {user?.nome || MOCK_CLIENTE.nome}
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
              {MOCK_CLIENTE.saldo_pontos.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">pontos disponíveis</p>
          </Card>

          {/* Card Código */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Meu Código</h3>
            </div>
            <p className="text-2xl font-mono font-bold text-foreground mb-3">
              {MOCK_CLIENTE.id_cliente}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copiarCodigo}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button
                size="sm"
                onClick={() => abrirModalCodigo("resgate")}
                className="flex-1"
              >
                Mostrar em tela cheia
              </Button>
            </div>
          </Card>
        </div>

        {/* Botão Somar Pontos */}
        <Button
          size="lg"
          className="w-full"
          onClick={() => abrirModalCodigo("somar-pontos")}
        >
          <Plus className="h-5 w-5 mr-2" />
          Somar Pontos
        </Button>

        {/* Catálogo de Itens */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Catálogo de Recompensas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ITEMS.map((item) => (
              <Card key={item.id} className="p-4 bg-card border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.nome}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.pontos.toLocaleString()} pontos
                    </p>
                  </div>
                  {item.tipo === "PEQUENO" && (
                    <Badge variant="secondary" className="text-xs">
                      Resgate presencial
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!item.disponivel || MOCK_CLIENTE.saldo_pontos < item.pontos}
                  onClick={() => iniciarResgate(item)}
                >
                  {!item.disponivel
                    ? "Indisponível"
                    : MOCK_CLIENTE.saldo_pontos < item.pontos
                    ? "Pontos insuficientes"
                    : "Resgatar"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Mostrar Código */}
      <Dialog open={modalAberto === "codigo"} onOpenChange={() => {
        setModalAberto(null);
        setShowQR(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Meu Código</DialogTitle>
            <DialogDescription>
              {contextoModal === "resgate"
                ? "Mostre este número ao operador para concluir o resgate."
                : "Informe este número ao operador para creditar seus pontos."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {showQR ? (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeComponent
                  value={MOCK_CLIENTE.id_cliente}
                  size={200}
                  level="H"
                />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Código do Cliente</p>
                <p className="text-5xl font-mono font-bold text-foreground tracking-wider">
                  {MOCK_CLIENTE.id_cliente}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQR ? "Mostrar Código" : "Exibir QR Code"}
              </Button>
              {!showQR && (
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
                <p className="font-semibold text-foreground">{itemSelecionado.nome}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {itemSelecionado.pontos.toLocaleString()} pontos
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
