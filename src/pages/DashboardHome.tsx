import { Users, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { SimpleTable } from "@/components/dashboard/SimpleTable";
import { Badge } from "@/components/ui/badge";

const DashboardHome = () => {
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

      <div>
        <SimpleTable
          title="Clientes Recentes"
          data={recentClients}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default DashboardHome;
