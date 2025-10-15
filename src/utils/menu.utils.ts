import { User } from "@/types/permissions";

export type MenuItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiredPermissions?: string[];
};

export const filterMenuByPermissions = (
  menuItems: MenuItem[],
  user: User | null
): MenuItem[] => {
  if (!user) return [];

  const userPermissions = user.grupos.flatMap(grupo => 
    grupo.permissoes.map(p => p.nome)
  );

  return menuItems.filter(item => {
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }
    return item.requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  });
};

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;

  const userPermissions = user.grupos.flatMap(grupo => 
    grupo.permissoes.map(p => p.nome)
  );

  return userPermissions.includes(permission);
};
