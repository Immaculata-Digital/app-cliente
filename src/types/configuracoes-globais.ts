/**
 * Tipos para Configurações Globais
 * Compatível com a estrutura da API Admin
 */

export interface ConfiguracoesGlobais {
  id_config_global?: number;
  logo_base64?: string;
  cor_fundo?: string;
  cor_card?: string;
  cor_texto_card?: string;
  cor_valor_card?: string;
  cor_botao?: string;
  cor_texto_botao?: string;
  fonte_titulos?: string;
  fonte_textos?: string;
  arquivo_politica_privacidade?: string;
  arquivo_termos_uso?: string;
  dt_cadastro?: string;
  usu_cadastro?: number;
  dt_altera?: string;
  usu_altera?: number;
}

export interface UpdateConfiguracoesGlobaisRequest {
  logo_base64?: string;
  cor_fundo?: string;
  cor_card?: string;
  cor_texto_card?: string;
  cor_valor_card?: string;
  cor_botao?: string;
  cor_texto_botao?: string;
  fonte_titulos?: string;
  fonte_textos?: string;
  arquivo_politica_privacidade?: string;
  arquivo_termos_uso?: string;
}
