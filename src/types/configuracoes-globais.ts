/**
 * Tipos para Configurações Globais
 */

export interface ConfiguracoesGlobais {
  id_configuracao_global?: number;
  logo_base64?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_texto?: string;
  fonte_primaria?: string;
  fonte_secundaria?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateConfiguracoesGlobaisRequest {
  logo_base64?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_texto?: string;
  fonte_primaria?: string;
  fonte_secundaria?: string;
}
