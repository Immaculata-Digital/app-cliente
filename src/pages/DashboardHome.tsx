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
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (item: any) => (
        <Badge variant={item.status === "active" ? "success" : "secondary"}>
          {item.status === "active" ? "Ativo" : "Pendente"}
        </Badge>
      ),
    },
    { key: "value", label: "Valor" },
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
          icon={Users}
          trend={{ value: "+12.5% vs mês anterior", positive: true }}
        />
        <KPICard
          title="Receita Total"
          value="R$ 45.231"
          icon={DollarSign}
          trend={{ value: "+8.2% vs mês anterior", positive: true }}
        />
        <KPICard
          title="Crescimento"
          value="23.5%"
          icon={TrendingUp}
          trend={{ value: "+4.1% vs mês anterior", positive: true }}
        />
        <KPICard
          title="Conversão"
          value="18.2%"
          icon={BarChart3}
          trend={{ value: "-2.3% vs mês anterior", positive: false }}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Clientes Recentes</h2>
        <SimpleTable
          data={recentClients}
          columns={columns}
          caption="Últimos clientes cadastrados no sistema"
        />
      </div>
    </div>
  );
};

export default DashboardHome;
