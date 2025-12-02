/**
 * Tipos para Configurações Globais
 * Compatível com a estrutura da API Admin
 */

export interface ConfiguracoesGlobais {
  id_config_global?: number;
  logo_base64?: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_texto: string;
  cor_destaque_texto: string;
  fonte_titulos: string;
  fonte_textos: string;
  dt_cadastro?: string;
  usu_cadastro?: number;
  dt_altera?: string;
  usu_altera?: number;
}

export interface UpdateConfiguracoesGlobaisRequest {
  logo_base64?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_texto?: string;
  cor_destaque_texto?: string;
  fonte_titulos?: string;
  fonte_textos?: string;
}
