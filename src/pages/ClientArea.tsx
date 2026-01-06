import { useState, useEffect, useRef } from "react";
import { Gift, Plus, Copy, X, LogOut, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useConfiguracoesGlobais } from "@/contexts/ConfiguracoesGlobaisContext";
import QRCodeComponent from "react-qr-code";
import { usePontosRecompensas } from "@/hooks/usePontosRecompensas";
import { pontosMovimentacaoService } from "@/services/api-clientes";
import { clienteService } from "@/services/api-clientes";
import type { PontosRecompensa } from "@/types/cliente-pontos-recompensas";
import type { CreateMovimentacaoRequest, ResgateResponse } from "@/types/cliente-pontos-movimentacao";
import type { ClienteData } from "@/services/api-clientes/cliente.service";
import { getSchemaFromHostname } from "@/utils/schema.utils";

type ModalType = "codigo" | "confirmar-resgate" | null;
type ModalContext = "resgate" | "somar-pontos";

const ClientArea = () => {
  const { toast } = useToast();
  const { user, logout, isLoading } = useAuth();
  const { configuracoes } = useConfiguracoesGlobais();
  const [modalAberto, setModalAberto] = useState<ModalType>(null);
  const [contextoModal, setContextoModal] = useState<ModalContext>("resgate");
  const [itemSelecionado, setItemSelecionado] = useState<PontosRecompensa | null>(null);
  const [resgatePendente, setResgatePendente] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [codigoResgateGerado, setCodigoResgateGerado] = useState<string | null>(null);
  const [detalhesResgate, setDetalhesResgate] = useState<ResgateResponse | null>(null);
  const [resgateNaoRetiraLoja, setResgateNaoRetiraLoja] = useState(false);
  const [clienteData, setClienteData] = useState<ClienteData | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [itensComCodigo, setItensComCodigo] = useState<Map<number, ResgateResponse>>(new Map());
  const codigosVerificadosRef = useRef<Set<number>>(new Set());

  const schema = getSchemaFromHostname();
  const { loading, recompensas, fetchRecompensas } = usePontosRecompensas({
    schema: schema,
    id_cliente: user?.clienteId || 0,
  });

  // Resetar cache quando o cliente mudar
  useEffect(() => {
    if (user?.clienteId) {
      codigosVerificadosRef.current.clear();
      setItensComCodigo(new Map());
      setClienteData(null);
    }
  }, [user?.clienteId]);

  // Buscar dados do cliente apenas uma vez
  useEffect(() => {
    const buscarDadosCliente = async () => {
      if (!user?.clienteId || loadingCliente || clienteData) {
        console.log('[ClientArea] Pulando busca de cliente:', { 
          temClienteId: !!user?.clienteId, 
          loadingCliente, 
          temClienteData: !!clienteData 
        });
        return;
      }
      
      setLoadingCliente(true);
      try {
        console.log('[ClientArea] Buscando dados do cliente:', { schema, clienteId: user.clienteId });
        const cliente = await clienteService.getCliente(schema, user.clienteId);
        console.log('[ClientArea] Dados do cliente recebidos:', cliente);
        setClienteData(cliente);
      } catch (error: any) {
        console.error('[ClientArea] Erro ao buscar dados do cliente:', error);
        // Mostra toast de erro para o usuário
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: error?.message || "Não foi possível carregar os dados do cliente.",
        });
      } finally {
        setLoadingCliente(false);
      }
    };

    if (!isLoading && user?.clienteId) {
      buscarDadosCliente();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user?.clienteId]);

  // Buscar recompensas apenas uma vez quando o cliente estiver disponível
  useEffect(() => {
    const buscarRecompensas = async () => {
      if (!isLoading && user?.clienteId && !loading) {
        console.log('[ClientArea] Buscando recompensas:', { 
          schema, 
          clienteId: user.clienteId, 
          jaTemRecompensas: !!recompensas 
        });
        
        // Sempre tenta buscar, mesmo se já tiver recompensas (para atualizar)
        try {
          await fetchRecompensas();
        } catch (error: any) {
          console.error('[ClientArea] Erro ao buscar recompensas:', error);
          // Não mostra toast aqui para não poluir a UI, o hook já trata
        }
      }
    };

    buscarRecompensas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user?.clienteId]);

  // Verificar códigos existentes apenas quando recompensas forem carregadas
  useEffect(() => {
    const verificarCodigosExistentes = async () => {
      if (!user?.clienteId || !recompensas?.recompensas || recompensas.recompensas.length === 0 || loading) {
        return;
      }

      // Verificar quais itens ainda não foram verificados
      const itensParaVerificar = recompensas.recompensas.filter(
        item => !codigosVerificadosRef.current.has(item.id_item_recompensa)
      );

      if (itensParaVerificar.length === 0) {
        return; // Todos os itens já foram verificados
      }

      const codigosMap = new Map(itensComCodigo); // Começar com os códigos existentes
      
      // Verificar códigos apenas para itens não verificados
      for (const item of itensParaVerificar) {
        try {
          const codigoExistente = await pontosMovimentacaoService.buscarCodigoExistente(
            schema,
            user.clienteId,
            item.id_item_recompensa
          );
          
          if (codigoExistente && codigoExistente.codigo_resgate && !codigoExistente.resgate_utilizado) {
            codigosMap.set(item.id_item_recompensa, codigoExistente);
          }
          
          // Marcar como verificado
          codigosVerificadosRef.current.add(item.id_item_recompensa);
        } catch (error) {
          // Ignorar erros (404 significa que não existe código)
          console.debug(`[ClientArea] Nenhum código encontrado para item ${item.id_item_recompensa}`);
          // Marcar como verificado mesmo em caso de erro
          codigosVerificadosRef.current.add(item.id_item_recompensa);
        }
      }

      setItensComCodigo(codigosMap);
    };

    verificarCodigosExistentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recompensas?.recompensas?.length, user?.clienteId, loading]);

  const codigoExibido =
    contextoModal === "resgate" && codigoResgateGerado
      ? codigoResgateGerado
      : recompensas?.codigo_cliente || (clienteData ? `CLI-${clienteData.id_cliente}` : '');

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
      setResgateNaoRetiraLoja(false);
    }
    setShowQR(false);
    setModalAberto("codigo");
  };

  const iniciarResgate = async (item: PontosRecompensa) => {
    if (!user?.clienteId) {
      toast({
        variant: "destructive",
        title: "Sessão expirada",
        description: "Faça login novamente para continuar o resgate.",
      });
      return;
    }

    const itemNaoRetiraLoja = Boolean(item.nao_retirar_loja);
    setItemSelecionado(item);
    setResgateNaoRetiraLoja(itemNaoRetiraLoja);
    setResgatePendente(true);

    try {
      // Primeiro, verificar se já existe um código não utilizado (usar cache ou buscar)
      let codigoExistente = itensComCodigo.get(item.id_item_recompensa);
      
      if (!codigoExistente) {
        // Se não está no cache, buscar na API
        codigoExistente = await pontosMovimentacaoService.buscarCodigoExistente(
          schema,
          user.clienteId,
          item.id_item_recompensa
        );
        
        // Atualizar cache se encontrou
        if (codigoExistente && codigoExistente.codigo_resgate && !codigoExistente.resgate_utilizado) {
          setItensComCodigo(prev => new Map(prev).set(item.id_item_recompensa, codigoExistente!));
        }
      }

      if (codigoExistente && codigoExistente.codigo_resgate && !codigoExistente.resgate_utilizado) {
        // Se encontrou código existente, mostrar modal com o código diretamente
        setDetalhesResgate(codigoExistente);
        setCodigoResgateGerado(codigoExistente.codigo_resgate);
        setContextoModal("resgate");
        setResgateNaoRetiraLoja(itemNaoRetiraLoja); // Preservar o estado do item
        setModalAberto("codigo");
        setShowQR(false);
        setItemSelecionado(null);
      } else {
        // Se não encontrou, mostrar modal de confirmação para gerar novo
        setCodigoResgateGerado(null);
        setDetalhesResgate(null);
        setResgateNaoRetiraLoja(itemNaoRetiraLoja); // Preservar o estado do item
        setModalAberto("confirmar-resgate");
      }
    } catch (error: any) {
      console.error("[Resgate] Erro ao buscar código existente:", error);
      // Em caso de erro, mostrar modal de confirmação normalmente
      setCodigoResgateGerado(null);
      setDetalhesResgate(null);
      setModalAberto("confirmar-resgate");
    } finally {
      setResgatePendente(false);
    }
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
        schema,
        user.clienteId,
        itemSelecionado.id_item_recompensa,
        `Resgate de ${itemSelecionado.nome_item}`
      );

      setDetalhesResgate(resposta);
      setCodigoResgateGerado(resposta.codigo_resgate ?? null);

      // Atualizar cache de códigos
      if (resposta.codigo_resgate && !resposta.resgate_utilizado && itemSelecionado) {
        setItensComCodigo(prev => new Map(prev).set(itemSelecionado.id_item_recompensa, resposta));
      }

      await fetchRecompensas();

      const itemEhNaoRetira = Boolean(itemSelecionado?.nao_retirar_loja);
      const contatoComFranquia = itemEhNaoRetira || Boolean(resposta.solicitacao_enviada);
      const tituloToast = contatoComFranquia ? "Solicitação enviada!" : "Resgate realizado!";
      const descricaoToast = contatoComFranquia
        ? `A franquia recebeu sua solicitação e entrará em contato em breve.${
            resposta.codigo_resgate ? ` Guarde o código ${resposta.codigo_resgate}.` : ""
          }`
        : resposta.codigo_resgate
          ? `Código de resgate: ${resposta.codigo_resgate}`
          : "Resgate registrado com sucesso.";

      toast({
        title: tituloToast,
        description: descricaoToast,
      });

      setContextoModal("resgate");
      setResgateNaoRetiraLoja(itemEhNaoRetira);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header com Logout */}
      <header className="p-6" style={{ backgroundColor: 'hsl(var(--card))' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Título - alinhado à esquerda no mobile, centralizado no desktop */}
          <div className="flex-1 md:text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: 'hsl(var(--card-foreground))' }}>
              Olá, {clienteData?.nome_completo || user?.clienteNome || user?.nome || 'Cliente'}
            </h1>
          </div>
          
          {/* Botão alinhado à direita */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              style={{ 
                color: 'hsl(var(--card-foreground))',
              }}
              className="hover:opacity-80"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Logo centralizada acima dos cards */}
        {configuracoes?.logo_base64 && (
          <div className="flex justify-center mb-6">
            <img 
              src={configuracoes.logo_base64}
              alt="Logo" 
              className="h-32 md:h-40 w-auto object-contain"
            />
          </div>
        )}

        {/* Cards de Destaque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Saldo */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>Saldo de Pontos</h3>
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'hsl(var(--card-value-color))' }}>
              {loading || loadingCliente ? "..." : (() => {
                const pontos = recompensas?.quantidade_pontos ?? clienteData?.saldo ?? 0;
                const numPontos = Number(pontos);
                return (isNaN(numPontos) ? 0 : numPontos).toLocaleString('pt-BR');
              })()}
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--card-foreground))' }}>pontos disponíveis</p>
          </Card>

          {/* Card Código */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>Meu Código</h3>
            </div>
            <p className="text-2xl font-mono font-bold mb-3" style={{ color: 'hsl(var(--card-value-color))' }}>
              {recompensas?.codigo_cliente || (clienteData ? `CLI-${clienteData.id_cliente}` : '')}
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
                const possuiCodigoExistente = itensComCodigo.has(item.id_item_recompensa);
                
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
                        <h3 className="font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>{item.nome_item}</h3>
                        <p className="text-sm mt-1" style={{ color: 'hsl(var(--card-value-color))' }}>
                          {(item.qtd_pontos || 0).toLocaleString()} pontos
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={pontosInsuficientes}
                        onClick={() => iniciarResgate(item)}
                      >
                        {pontosInsuficientes
                          ? "Pontos insuficientes"
                          : possuiCodigoExistente
                            ? "Visualizar código"
                            : "Resgatar"}
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
            setResgateNaoRetiraLoja(false);
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
                ? resgateNaoRetiraLoja
                  ? "Recebemos sua solicitação! A franquia responsável entrará em contato e usará este código como referência do seu pedido."
                  : "Mostre este código ao operador para concluir o resgate do seu item."
                : "Informe este número ao operador para creditar seus pontos."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {contextoModal === "resgate" ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Código de Resgate</p>
                <p className="text-5xl font-mono font-bold text-gray-900 tracking-wider">
                  {codigoExibido}
                </p>
                {detalhesResgate && (
                  <p className="text-xs text-gray-600 mt-4">
                    Saldo atual após resgate:{" "}
                    <span className="font-semibold text-gray-900">
                      {(detalhesResgate.saldo_atual || 0).toLocaleString()} pontos
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
                <p className="text-sm text-gray-600 mb-2">Código do Cliente</p>
                <p className="text-5xl font-mono font-bold text-gray-900 tracking-wider">
                  {codigoExibido}
                </p>
              </div>
            )}
            
            {contextoModal === "resgate" && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 bg-blue-600 text-white border-0 hover:bg-blue-700"
                  onClick={copiarCodigo}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código
                </Button>
              </div>
            )}
            
            <Button
              variant="secondary"
              className="w-full bg-blue-600 text-white border-0 hover:bg-blue-700"
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
      <Dialog
        open={modalAberto === "confirmar-resgate"}
        onOpenChange={(open) => {
          if (!open) {
            setModalAberto(null);
            setItemSelecionado(null);
            setResgateNaoRetiraLoja(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
            <DialogDescription>
              {resgateNaoRetiraLoja
                ? "Este item não pode ser retirado diretamente na loja. Ao confirmar, enviaremos uma solicitação para a franquia responsável e ela entrará em contato com você."
                : "Você está prestes a resgatar um item. Esta ação criará uma solicitação pendente."}
            </DialogDescription>
          </DialogHeader>
          {itemSelecionado && (
            <div className="py-4">
              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-900">{itemSelecionado.nome_item}</p>
                <p className="text-sm text-gray-900 mt-1">
                  {(itemSelecionado.qtd_pontos || 0).toLocaleString()} pontos
                </p>
              </div>
              {resgateNaoRetiraLoja && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-md p-3 mb-4">
                  <strong className="block font-semibold mb-1">Funcionamento deste resgate</strong>
                  <span>
                    Confirmando abaixo, geraremos um código e notificaremos a franquia. Ela entrará em contato com
                    você para combinar o envio/retirada do item.
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                {resgateNaoRetiraLoja
                  ? "Guarde o código que será exibido em seguida. Ele será utilizado pela franquia para acompanhar sua solicitação."
                  : "Após confirmar, você receberá um código para mostrar ao operador na loja."}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setModalAberto(null);
                    setItemSelecionado(null);
                    setResgateNaoRetiraLoja(false);
                  }}
                  disabled={resgatePendente}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-blue-600 text-white border-0 hover:bg-blue-700"
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
