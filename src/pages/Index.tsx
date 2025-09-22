import React, { useState } from "react";
import ResponsiveTable from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Wallet, 
  BarChart3,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download,
  Palette, 
  Table 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Sample data for the table
  const sampleUsers = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      status: 'active',
      cashback: 250.75,
      transactions: 12,
      created: '2024-01-15',
      avatar: '👨‍💼'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      status: 'pending',
      cashback: 180.50,
      transactions: 8,
      created: '2024-02-10',
      avatar: '👩‍💼'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@exemplo.com',
      status: 'inactive',
      cashback: 95.25,
      transactions: 3,
      created: '2024-03-05',
      avatar: '👨‍🎓'
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@exemplo.com',
      status: 'active',
      cashback: 420.90,
      transactions: 25,
      created: '2024-01-20',
      avatar: '👩‍🎨'
    },
    {
      id: '5',
      name: 'Carlos Ferreira',
      email: 'carlos@exemplo.com',
      status: 'pending',
      cashback: 75.00,
      transactions: 2,
      created: '2024-03-12',
      avatar: '👨‍🔧'
    }
  ];

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let result = sampleUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy as keyof typeof a];
        const bVal = b[sortBy as keyof typeof b];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    
    return result;
  }, [searchTerm, sortBy, sortDir]);

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      colSpanMobile: true,
      renderCell: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <span className="text-lg">{row.avatar}</span>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      sortable: true,
      renderCell: (value: any) => {
        const variants = {
          active: 'success',
          pending: 'warning',
          inactive: 'destructive'
        } as const;
        
        const labels = {
          active: 'Ativo',
          pending: 'Pendente',
          inactive: 'Inativo'
        };
        
        return (
          <Badge variant={variants[value as keyof typeof variants] || 'default'}>
            {labels[value as keyof typeof labels] || value}
          </Badge>
        );
      }
    },
    {
      key: 'cashback',
      header: 'Cashback',
      align: 'right' as const,
      sortable: true,
      renderCell: (value: any) => (
        <div className="font-mono">
          R$ {value.toFixed(2).replace('.', ',')}
        </div>
      )
    },
    {
      key: 'transactions',
      header: 'Transações',
      align: 'center' as const,
      sortable: true,
      hiddenOn: ['sm'],
      renderCell: (value: any) => (
        <Badge variant="navy" size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'created',
      header: 'Criado em',
      sortable: true,
      hiddenOn: ['sm'],
      renderCell: (value: any) => {
        const date = new Date(value);
        return date.toLocaleDateString('pt-BR');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold">
              Design System
              <span className="block text-accent-light">Cashback Admin</span>
            </h1>
            <p className="mb-8 text-xl text-navy-100 max-w-2xl mx-auto">
              Sistema completo para administração de cashback
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Tabela Responsiva */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Tabela Responsiva</h2>
          <div className="space-y-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                Componente completo de tabela que se adapta automaticamente para cards no mobile. 
                Inclui busca, ordenação, menu de ações e estados de loading/error.
              </p>
              <p>
                <strong>Desktop:</strong> Layout em tabela tradicional com colunas dinâmicas<br/>
                <strong>Mobile:</strong> Cards responsivos com labels e valores organizados
              </p>
            </div>
            
            <ResponsiveTable
              columns={columns}
              rows={filteredData}
              rowKey="id"
              search={{
                value: searchTerm,
                onChange: setSearchTerm,
                placeholder: "Buscar usuários..."
              }}
              sorting={{
                sortBy,
                sortDir,
                onSortChange: (key, dir) => {
                  setSortBy(key);
                  setSortDir(dir);
                }
              }}
              actions={{
                global: (
                  <Button variant="gradient">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Usuário
                  </Button>
                ),
                perRow: (row) => [
                  {
                    key: 'view',
                    label: 'Visualizar',
                    icon: Eye,
                    onClick: () => toast({
                      title: "Usuário visualizado",
                      description: `Visualizando ${row.name}`
                    })
                  },
                  {
                    key: 'edit',
                    label: 'Editar',
                    icon: Edit,
                    onClick: () => toast({
                      title: "Editar usuário",
                      description: `Editando ${row.name}`
                    })
                  },
                  {
                    key: 'delete',
                    label: 'Excluir',
                    icon: Trash2,
                    intent: 'danger' as const,
                    confirm: {
                      title: 'Confirmar exclusão',
                      message: `Tem certeza que deseja excluir ${row.name}? Esta ação não pode ser desfeita.`,
                      confirmLabel: 'Excluir',
                      cancelLabel: 'Cancelar'
                    },
                    onClick: () => toast({
                      title: "Usuário excluído",
                      description: `${row.name} foi excluído com sucesso`,
                      variant: "destructive"
                    })
                  }
                ]
              }}
              onRowClick={(row) => {
                toast({
                  title: "Linha clicada",
                  description: `Clicou em ${row.name}`
                });
              }}
              zebra={true}
              density="comfortable"
            />
          </div>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Paleta de Cores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Navy Blues */}
            <div className="space-y-2">
              <div className="h-20 bg-navy-950 rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Navy 950</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-navy-800 rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Navy 800</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-navy-600 rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Navy 600</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-navy-400 rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Navy 400</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-navy-200 rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Navy 200</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-navy-50 rounded-lg shadow-md border"></div>
              <p className="text-sm font-medium">Navy 50</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="space-y-2">
              <div className="h-16 bg-success rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-warning rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Warning</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-destructive rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Destructive</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-accent rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Accent</p>
            </div>
          </div>
        </section>

        {/* Gradients */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Gradientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 bg-gradient-primary rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Gradient Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-gradient-accent rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Gradient Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-gradient-success rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Gradient Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-gradient-hero rounded-lg shadow-md"></div>
              <p className="text-sm font-medium">Gradient Hero</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Botões</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Variantes</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="navy">Navy</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="gradient">Gradient</Button>
                <Button variant="cashback">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Cashback
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Tamanhos</h3>
              <div className="flex items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Outline & Ghost</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Badges</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Variantes</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="navy">Navy</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="cashback">Cashback</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Status Light</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="success-light">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Ativo
                </Badge>
                <Badge variant="warning-light">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Pendente
                </Badge>
                <Badge variant="destructive-light">
                  <Info className="mr-1 h-3 w-3" />
                  Inativo  
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Tamanhos</h3>
              <div className="flex items-center gap-4">
                <Badge size="sm">Small</Badge>
                <Badge size="default">Default</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cashback Card */}
            <Card className="border-success/20 bg-gradient-to-br from-success-bg to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-success flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Cashback Total
                  </CardTitle>
                  <Badge variant="success">+12.5%</Badge>
                </div>
                <CardDescription>Valor acumulado este mês</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-success">R$ 1.247,83</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <TrendingUp className="inline mr-1 h-4 w-4" />
                  +R$ 138,45 vs mês anterior
                </p>
              </CardContent>
            </Card>

            {/* Users Card */}
            <Card className="border-accent/20 bg-gradient-to-br from-accent-light/10 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-accent flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Usuários Ativos
                  </CardTitle>
                  <Badge variant="accent">+8.2%</Badge>
                </div>
                <CardDescription>Usuários únicos este mês</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">2.847</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Star className="inline mr-1 h-4 w-4" />
                  +217 novos usuários
                </p>
              </CardContent>
            </Card>

            {/* Revenue Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-navy-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Receita Total
                  </CardTitle>
                  <Badge variant="navy">+15.7%</Badge>
                </div>
                <CardDescription>Faturamento acumulado</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">R$ 94.528,17</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Wallet className="inline mr-1 h-4 w-4" />
                  Meta: R$ 100.000,00
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Components */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Componentes de Formulário</h2>
          
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Exemplo de Formulário</CardTitle>
              <CardDescription>Componentes de entrada customizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@cashback.com"
                  className="focus:ring-accent focus:border-accent" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor do Cashback</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0,00"
                  className="focus:ring-success focus:border-success" 
                />
              </div>
              <div className="flex gap-2">
                <Button variant="gradient" className="flex-1">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Processar
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Shadows & Effects */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Sombras & Efeitos</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <p className="text-sm font-medium">Shadow SM</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow border">
              <p className="text-sm font-medium">Shadow Default</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg border">
              <p className="text-sm font-medium">Shadow LG</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-glow border">
              <p className="text-sm font-medium">Shadow Glow</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Tipografia</h2>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Heading 1 - 4xl</h1>
            <h2 className="text-3xl font-bold text-foreground">Heading 2 - 3xl</h2>
            <h3 className="text-2xl font-semibold text-foreground">Heading 3 - 2xl</h3>
            <h4 className="text-xl font-semibold text-foreground">Heading 4 - xl</h4>
            <p className="text-base text-foreground">
              Parágrafo regular - Base. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="text-sm text-muted-foreground">
              Texto secundário - Small. Sed do eiusmod tempor incididunt ut labore.
            </p>
            <p className="text-xs text-muted-foreground">
              Texto auxiliar - Extra Small. Et dolore magna aliqua.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;