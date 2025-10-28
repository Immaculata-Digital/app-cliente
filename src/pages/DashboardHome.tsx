import { Users, DollarSign, TrendingUp, BarChart3, Gift } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { SimpleTable } from "@/components/dashboard/SimpleTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ds/Button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const DashboardHome = () => {
  const navigate = useNavigate();
  const recentClients = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      status: "active",
      value: "R$ 5.420,00",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      status: "pending",
      value: "R$ 2.350,00",
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@example.com",
      status: "active",
      value: "R$ 8.150,00",
    },
  ];

  const columns = [
    { key: "name" as const, label: "Nome" },
    { key: "email" as const, label: "Email" },
    {
      key: "status" as const,
      label: "Status",
      render: (item: any) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status === "active" ? "Ativo" : "Pendente"}
        </Badge>
      ),
    },
    { key: "value" as const, label: "Valor" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos principais indicadores
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Clientes"
          value="1.234"
          icon={<Users className="h-6 w-6" />}
        />
        <KPICard
          title="Receita Total"
          value="R$ 45.231"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard
          title="Crescimento"
          value="23.5%"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard
          title="Conversão"
          value="18.2%"
          icon={<BarChart3 className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SimpleTable
          title="Clientes Recentes"
          data={recentClients}
          columns={columns}
        />

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Área do Cliente</h3>
                <p className="text-sm text-muted-foreground">
                  Resgate de prêmios e pontos
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Acesse a área do cliente para visualizar o catálogo de recompensas, 
              resgatar prêmios e somar pontos na loja.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/client-area")}
            className="w-full"
          >
            Acessar Área do Cliente
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
