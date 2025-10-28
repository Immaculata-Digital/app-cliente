export interface Menu {
  id_menu: number;
  titulo: string;
  chave: string;
  url?: string;
  icone?: string;
  ordem: number;
  id_menu_pai?: number;
  dt_cadastro: string;
  usu_cadastro: number;
  dt_altera?: string;
  usu_altera?: number;
  ativo: boolean;
}

export interface MenuTree extends Menu {
  children?: MenuTree[];
}
