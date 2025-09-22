import type { Meta, StoryObj } from '@storybook/react';
import ActionMenu from './action-menu';
import { Edit, Trash2, Eye, Copy, Archive, Star } from 'lucide-react';

const meta: Meta<typeof ActionMenu> = {
  title: 'Components/ActionMenu',
  component: ActionMenu,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

const sampleActions = [
  {
    key: 'view',
    label: 'Visualizar',
    icon: <Eye className="h-4 w-4" />,
    onClick: () => alert('Visualizar item'),
  },
  {
    key: 'edit',
    label: 'Editar',
    icon: <Edit className="h-4 w-4" />,
    onClick: () => alert('Editar item'),
  },
  {
    key: 'copy',
    label: 'Duplicar',
    icon: <Copy className="h-4 w-4" />,
    onClick: () => alert('Duplicar item'),
  },
  {
    key: 'archive',
    label: 'Arquivar',
    icon: <Archive className="h-4 w-4" />,
    intent: 'warning' as const,
    onClick: () => alert('Arquivar item'),
  },
  {
    key: 'delete',
    label: 'Excluir',
    icon: <Trash2 className="h-4 w-4" />,
    intent: 'danger' as const,
    requiresConfirmation: true,
    confirmationTitle: 'Excluir item',
    confirmationDescription: 'Esta ação não pode ser desfeita. Tem certeza que deseja continuar?',
    onClick: () => alert('Item excluído'),
  },
];

export const Default: Story = {
  args: {
    actions: sampleActions,
    size: 'default',
  },
};

export const WithConfirmation: Story = {
  args: {
    actions: [
      {
        key: 'delete',
        label: 'Excluir Item',
        icon: <Trash2 className="h-4 w-4" />,
        intent: 'danger' as const,
        requiresConfirmation: true,
        confirmationTitle: 'Confirmar Exclusão',
        confirmationDescription: 'Esta ação é irreversível. O item será permanentemente removido.',
        onClick: () => alert('Item excluído com confirmação'),
      },
    ],
    size: 'default',
  },
};

export const IntentVariations: Story = {
  args: {
    actions: [
      {
        key: 'favorite',
        label: 'Favoritar',
        icon: <Star className="h-4 w-4" />,
        intent: 'success' as const,
        onClick: () => alert('Item favoritado'),
      },
      {
        key: 'archive',
        label: 'Arquivar',
        icon: <Archive className="h-4 w-4" />,
        intent: 'warning' as const,
        onClick: () => alert('Item arquivado'),
      },
      {
        key: 'delete',
        label: 'Excluir',
        icon: <Trash2 className="h-4 w-4" />,
        intent: 'danger' as const,
        onClick: () => alert('Item excluído'),
      },
    ],
    size: 'default',
  },
};