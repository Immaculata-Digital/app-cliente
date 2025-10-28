# API Clientes - Exemplos de Uso

## 📋 Visão Geral

Este documento demonstra como usar a API de Clientes para gerenciar movimentações de pontos.

## 🎯 Serviço Principal

O serviço está em `src/services/api-clientes/pontos-movimentacao.service.ts` e oferece os seguintes métodos:

### Métodos Disponíveis

1. **createMovimentacao** - Criar crédito/débito de pontos
2. **getExtrato** - Listar movimentações com filtros
3. **buscarPorTexto** - Buscar por termo
4. **updateMovimentacao** - Atualizar movimentação existente
5. **estornarMovimentacao** - Estornar movimentação
6. **getCliente** - Obter dados do cliente

---

## 💻 Exemplos de Uso

### 1. Usando o Hook (Recomendado)

```typescript
import { usePontosMovimentacao } from '@/hooks/usePontosMovimentacao';

function ClienteAreaComponent() {
  const schema = "z_demo";
  const id_cliente = 1;
  
  const {
    loading,
    error,
    extrato,
    cliente,
    fetchExtrato,
    createMovimentacao,
    fetchCliente,
  } = usePontosMovimentacao(schema, id_cliente);

  // Buscar extrato ao carregar
  useEffect(() => {
    fetchExtrato();
    fetchCliente();
  }, [fetchExtrato, fetchCliente]);

  // Criar resgate
  const handleResgate = async (pontos: number, id_item: number) => {
    try {
      const resultado = await createMovimentacao({
        tipo: 'DEBITO',
        origem: 'RESGATE',
        pontos,
        id_item_recompensa: id_item,
        descricao: 'Resgate de prêmio',
      });
      
      console.log('Novo saldo:', resultado.saldo_atual);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {cliente && (
        <div>
          <h2>{cliente.nome}</h2>
          <p>Saldo: {cliente.saldo_pontos} pontos</p>
        </div>
      )}
      
      {extrato && (
        <ul>
          {extrato.movimentacoes.map(mov => (
            <li key={mov.id_pontos_movimentacao}>
              {mov.descricao} - {mov.pontos} pts
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### 2. Usando o Serviço Diretamente

```typescript
import { pontosMovimentacaoService } from '@/services/api-clientes';

// Criar crédito de pontos
async function creditarPontos() {
  try {
    const resultado = await pontosMovimentacaoService.createMovimentacao(
      'z_demo',  // schema
      1,         // id_cliente
      {
        tipo: 'CREDITO',
        origem: 'MANUAL',
        pontos: 500,
        descricao: 'Bônus de boas-vindas',
      }
    );
    
    console.log('Movimentação criada:', resultado.movimentacao);
    console.log('Novo saldo:', resultado.saldo_atual);
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_BALANCE') {
      console.error('Saldo insuficiente');
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Criar débito (resgate)
async function resgatarPremio() {
  try {
    const resultado = await pontosMovimentacaoService.createMovimentacao(
      'z_demo',
      1,
      {
        tipo: 'DEBITO',
        origem: 'RESGATE',
        pontos: 300,
        descricao: 'Resgate: Açaí 500ml',
        id_item_recompensa: 1,
      }
    );
    
    console.log('Resgate realizado!');
    console.log('Saldo restante:', resultado.saldo_atual);
  } catch (error: any) {
    console.error('Erro no resgate:', error.message);
  }
}

// Buscar extrato com filtros
async function buscarExtrato() {
  try {
    const extrato = await pontosMovimentacaoService.getExtrato(
      'z_demo',
      1,
      {
        page: 1,
        limit: 20,
        tipo: 'CREDITO',
        dt_ini: '2024-01-01',
        dt_fim: '2024-12-31',
        order: 'desc',
      }
    );
    
    console.log('Movimentações:', extrato.movimentacoes);
    console.log('Total:', extrato.meta.total);
    console.log('Saldo atual:', extrato.saldo_atual);
  } catch (error: any) {
    console.error('Erro ao buscar extrato:', error);
  }
}

// Buscar por texto
async function buscarPorTexto() {
  try {
    const resultado = await pontosMovimentacaoService.buscarPorTexto(
      'z_demo',
      1,
      'açaí',  // termo de busca
      {
        page: 1,
        limit: 10,
      }
    );
    
    console.log('Encontrados:', resultado.movimentacoes);
  } catch (error: any) {
    console.error('Erro na busca:', error);
  }
}

// Estornar movimentação
async function estornar() {
  try {
    const resultado = await pontosMovimentacaoService.estornarMovimentacao(
      'z_demo',
      1,
      3  // id da movimentação
    );
    
    console.log('Movimentação estornada:', resultado.movimentacao);
    console.log('Saldo após estorno:', resultado.saldo_atual);
  } catch (error: any) {
    if (error.message === 'MOVIMENTACAO_NOT_FOUND') {
      console.error('Movimentação não encontrada');
    } else if (error.message === 'ALREADY_REVERSED') {
      console.error('Já estornada');
    }
  }
}

// Obter dados do cliente
async function obterCliente() {
  try {
    const cliente = await pontosMovimentacaoService.getCliente('z_demo', 1);
    
    console.log('Cliente:', cliente.nome);
    console.log('Código:', cliente.codigo);
    console.log('Saldo:', cliente.saldo_pontos);
  } catch (error: any) {
    console.error('Erro ao buscar cliente:', error);
  }
}
```

---

## 🔄 Tratamento de Erros

### Erros Comuns

```typescript
try {
  await createMovimentacao(data);
} catch (error: any) {
  switch (error.message) {
    case 'INSUFFICIENT_BALANCE':
      // Saldo insuficiente
      toast.error('Você não tem pontos suficientes');
      break;
      
    case 'INVALID_POINTS':
      // Pontos inválidos (negativos ou zero)
      toast.error('Quantidade de pontos inválida');
      break;
      
    case 'MOVIMENTACAO_NOT_FOUND':
      // Movimentação não encontrada
      toast.error('Movimentação não encontrada');
      break;
      
    case 'ALREADY_REVERSED':
      // Tentando estornar algo já estornado
      toast.error('Esta movimentação já foi estornada');
      break;
      
    default:
      toast.error('Erro ao processar movimentação');
  }
}
```

---

## 📊 Tipos TypeScript

Todos os tipos estão em `src/types/cliente-pontos-movimentacao.ts`:

- `ClientePontosMovimentacao` - Movimentação completa
- `CreateMovimentacaoRequest` - Criar nova movimentação
- `UpdateMovimentacaoRequest` - Atualizar movimentação
- `MovimentacaoResponse` - Resposta com movimentação + saldo
- `ExtratoResponse` - Lista de movimentações + meta
- `ExtratoFilters` - Filtros para busca
- `Cliente` - Dados do cliente
- `TipoMovimentacao` - 'CREDITO' | 'DEBITO' | 'ESTORNO'
- `OrigemMovimentacao` - 'MANUAL' | 'RESGATE' | 'AJUSTE' | 'PROMO' | 'OUTRO'
- `StatusMovimentacao` - 'PENDENTE' | 'CONFIRMADO' | 'ESTORNADO' | 'CANCELADO'

---

## 🎭 Dados Mockados

**Enquanto a API não estiver disponível**, o sistema usa automaticamente dados mockados.

O mock está em `src/services/mocks/pontos-movimentacao.mock.ts` e simula:
- Cliente com 1.250 pontos
- Histórico de 3 movimentações
- Criação de novas movimentações
- Atualização de saldo em tempo real

**Quando a API estiver pronta**, basta configurar a URL correta no `.env` e tudo funcionará automaticamente!

```env
VITE_API_HOMOLOG_CLIENTES_URL=https://homolog-api-clientes.seudominio.com.br/api
```

---

## 🚀 Integração Completa na ClientArea

Veja o exemplo completo em `src/pages/ClientArea.tsx` que já está preparado para:
- ✅ Exibir saldo de pontos
- ✅ Listar itens resgatáveis
- ✅ Criar solicitações de resgate
- ✅ Exibir código do cliente
- ✅ Botão "Somar pontos"

---

## 📝 Próximos Passos

1. ✅ Estrutura da API criada
2. ✅ Serviços com fallback para mock
3. ✅ Hook customizado para facilitar uso
4. ✅ Tratamento de erros
5. ⏳ Conectar com API real (quando disponível)
6. ⏳ Implementar polling para status pendente → confirmado
7. ⏳ Adicionar notificações push (opcional)
