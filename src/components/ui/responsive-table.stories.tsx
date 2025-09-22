import type { Meta, StoryObj } from '@storybook/react';
import ResponsiveTable from './responsive-table';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { Edit, Trash2, Eye, Plus, Download, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof ResponsiveTable> = {
  title: 'Components/ResponsiveTable',
  component: ResponsiveTable,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    density: {
      control: { type: 'select' },
      options: ['comfortable', 'compact'],
    },
    responsive: {
      control: { type: 'select' },
      options: ['auto', 'table', 'cards'],
    },
    zebra: {
      control: 'boolean',
    },
    stickyHeader: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResponsiveTable>;

// Sample data
const sampleUsers = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    role: 'Admin',
    status: 'active',
    department: 'Engineering',
    joinDate: '2022-03-15',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5f5?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    role: 'Developer',
    status: 'active',
    department: 'Engineering',
    joinDate: '2023-01-20',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Maria Costa',
    email: 'maria.costa@email.com',
    role: 'Designer',
    status: 'inactive',
    department: 'Design',
    joinDate: '2022-08-10',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    role: 'Manager',
    status: 'active',
    department: 'Management',
    joinDate: '2021-11-05',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '5',
    name: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    role: 'Developer',
    status: 'active',
    department: 'Engineering',
    joinDate: '2023-06-12',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
  },
];

const baseColumns = [
  {
    key: 'name',
    header: 'Nome',
    sortable: true,
    renderCell: (value: string, row: any) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.avatar} alt={value} />
          <AvatarFallback>{value.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="font-medium">{value}</div>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    hiddenOn: 'mobile' as const,
  },
  {
    key: 'role',
    header: 'Função',
    sortable: true,
    renderCell: (value: string) => (
      <Badge variant={value === 'Admin' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    renderCell: (value: string) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>
        {value === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    ),
  },
  {
    key: 'department',
    header: 'Departamento',
    hiddenOn: 'mobile' as const,
  },
];

// Story Template with state management
const TableWithState = (args: any) => {
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = sampleUsers.filter(user =>
    user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];
    const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'desc' ? -result : result;
  });

  return (
    <ResponsiveTable
      {...args}
      rows={sortedData}
      search={{
        value: searchValue,
        onChange: setSearchValue,
        placeholder: 'Buscar usuários...',
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
            key: 'add',
            label: 'Adicionar',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => alert('Adicionar usuário'),
          },
          {
            key: 'export',
            label: 'Exportar',
            icon: <Download className="h-4 w-4" />,
            onClick: () => alert('Exportar dados'),
          },
        ],
        perRow: (row) => [
          {
            key: 'view',
            label: 'Visualizar',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => alert(`Visualizar ${row.name}`),
          },
          {
            key: 'edit',
            label: 'Editar',
            icon: <Edit className="h-4 w-4" />,
            onClick: () => alert(`Editar ${row.name}`),
          },
          {
            key: 'delete',
            label: 'Excluir',
            icon: <Trash2 className="h-4 w-4" />,
            intent: 'danger' as const,
            requiresConfirmation: true,
            confirmationTitle: 'Excluir usuário',
            confirmationDescription: `Tem certeza que deseja excluir ${row.name}? Esta ação não pode ser desfeita.`,
            onClick: () => alert(`Excluir ${row.name}`),
          },
        ],
      }}
    />
  );
};

export const DesktopDefault: Story = {
  render: TableWithState,
  args: {
    columns: baseColumns,
    rowKey: 'id',
    density: 'comfortable',
    zebra: false,
    stickyHeader: true,
    responsive: 'auto',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const MobileCards: Story = {
  render: TableWithState,
  args: {
    columns: baseColumns,
    rowKey: 'id',
    density: 'comfortable',
    zebra: false,
    stickyHeader: false,
    responsive: 'cards',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const CustomCells: Story = {
  render: (args) => {
    const customColumns = [
      {
        key: 'user',
        header: 'Usuário',
        renderCell: (value: any, row: any) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={row.avatar} alt={row.name} />
              <AvatarFallback>{row.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.name}</div>
              <div className="text-sm text-muted-foreground">{row.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Função & Depto',
        renderCell: (value: string, row: any) => (
          <div className="space-y-1">
            <Badge variant="outline">{row.role}</Badge>
            <div className="text-sm text-muted-foreground">{row.department}</div>
          </div>
        ),
      },
      {
        key: 'stats',
        header: 'Estatísticas',
        renderCell: (value: any, row: any) => (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="font-medium text-success">98%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="font-medium text-primary">124</div>
              <div className="text-muted-foreground">Tasks</div>
            </div>
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Ações',
        renderCell: (value: any, row: any) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];

    return (
      <ResponsiveTable
        {...args}
        columns={customColumns}
        rows={sampleUsers}
      />
    );
  },
  args: {
    rowKey: 'id',
    density: 'comfortable',
    zebra: true,
    stickyHeader: true,
  },
};