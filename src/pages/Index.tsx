import React, { useState } from "react";
import ResponsiveTable from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Eye, Plus, Download, Palette, Table } from "lucide-react";

const Index = () => {
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sample data
  const sampleUsers = [
    {
      id: "1",
      name: "Ana Silva",
      email: "ana.silva@email.com",
      role: "Admin",
      status: "active",
      department: "Engineering",
      joinDate: "2022-03-15",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5f5?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao.santos@email.com",
      role: "Developer",
      status: "active",
      department: "Engineering",
      joinDate: "2023-01-20",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Maria Costa",
      email: "maria.costa@email.com",
      role: "Designer",
      status: "inactive",
      department: "Design",
      joinDate: "2022-08-10",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "4",
      name: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      role: "Manager",
      status: "active",
      department: "Management",
      joinDate: "2021-11-05",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "5",
      name: "Carla Mendes",
      email: "carla.mendes@email.com",
      role: "Developer",
      status: "active",
      department: "Engineering",
      joinDate: "2023-06-12",
      avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const columns = [
    {
      key: "name",
      header: "Nome",
      sortable: true,
      renderCell: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar} alt={value} />
            <AvatarFallback>
              {value
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{value}</div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      hiddenOn: "mobile" as const,
    },
    {
      key: "role",
      header: "Função",
      sortable: true,
      renderCell: (value: string) => (
        <Badge variant={value === "Admin" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      renderCell: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value === "active" ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "department",
      header: "Departamento",
      hiddenOn: "mobile" as const,
    },
  ];

  const filteredData = sampleUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];
    const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === "desc" ? -result : result;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-navy-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Palette className="h-4 w-4" />
            Navy Blue Design System
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Design System Moderno
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema completo com tabela responsiva, paleta navy blue e
            componentes profissionais com Storybook integrado.
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Palette className="h-4 w-4 text-primary-foreground" />
                </div>
                Design System
              </CardTitle>
              <CardDescription>
                Paleta navy blue completa com tokens semânticos e gradientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-navy-800 rounded-full"></div>
                <div className="w-6 h-6 bg-navy-600 rounded-full"></div>
                <div className="w-6 h-6 bg-accent rounded-full"></div>
                <div className="w-6 h-6 bg-success rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Table className="h-4 w-4 text-accent-foreground" />
                </div>
                Tabela Responsiva
              </CardTitle>
              <CardDescription>
                Auto-adaptável: tabela no desktop, cards no mobile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                ✓ Busca com debounce<br />
                ✓ Ordenação por colunas<br />
                ✓ Menu de ações<br />
                ✓ Estados: loading/error/empty
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-success rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-success-foreground" />
                </div>
                Storybook
              </CardTitle>
              <CardDescription>
                Documentação interativa com controles e viewports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Execute: <code className="bg-muted px-1 rounded">npx storybook dev -p 6006</code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Table Demo */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Demo: Tabela Responsiva
            </CardTitle>
            <CardDescription>
              Experimente redimensionar a janela para ver a adaptação automática
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveTable
              columns={columns}
              rows={sortedData}
              rowKey="id"
              search={{
                value: searchValue,
                onChange: setSearchValue,
                placeholder: "Buscar usuários...",
              }}
              sorting={{
                sortBy,
                sortDirection,
                onSortChange: (key, direction) => {
                  setSortBy(key);
                  setSortDirection(direction);
                },
              }}
              actions={{
                global: [
                  {
                    key: "add",
                    label: "Adicionar",
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => alert("Adicionar usuário"),
                  },
                  {
                    key: "export",
                    label: "Exportar",
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => alert("Exportar dados"),
                  },
                ],
                perRow: (row) => [
                  {
                    key: "view",
                    label: "Visualizar",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => alert(`Visualizar ${row.name}`),
                  },
                  {
                    key: "edit",
                    label: "Editar",
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => alert(`Editar ${row.name}`),
                  },
                  {
                    key: "delete",
                    label: "Excluir",
                    icon: <Trash2 className="h-4 w-4" />,
                    intent: "danger" as const,
                    requiresConfirmation: true,
                    confirmationTitle: "Excluir usuário",
                    confirmationDescription: `Tem certeza que deseja excluir ${row.name}? Esta ação não pode ser desfeita.`,
                    onClick: () => alert(`Excluir ${row.name}`),
                  },
                ],
              }}
              density="comfortable"
              zebra={true}
              stickyHeader={true}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>
            Design System Navy Blue • Componentes Profissionais • Totalmente
            Responsivo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;