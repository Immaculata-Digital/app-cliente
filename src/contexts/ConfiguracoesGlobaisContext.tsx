/**
 * Context para Configurações Globais
 * 
 * Gerencia o tema e configurações visuais da aplicação baseado nas configurações do backend
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { configuracoesGlobaisService } from '@/services/api-admin/configuracoes-globais.service';
import { getSchemaFromHostname } from '@/utils/schema.utils';
import type { ConfiguracoesGlobais } from '@/types/configuracoes-globais';

interface ConfiguracoesGlobaisContextType {
  configuracoes: ConfiguracoesGlobais | null;
  isLoading: boolean;
  loadConfiguracoes: () => Promise<void>;
  applyTheme: (config: ConfiguracoesGlobais) => void;
}

const ConfiguracoesGlobaisContext = createContext<ConfiguracoesGlobaisContextType | undefined>(undefined);

// Cores padrão (azul original)
const DEFAULT_CONFIG: ConfiguracoesGlobais = {
  cor_primaria: '#3b82f6', // blue-500
  cor_secundaria: '#f8fafc',
  cor_texto: '#0f172a',
  fonte_primaria: 'Inter, system-ui, sans-serif',
  fonte_secundaria: 'Inter, system-ui, sans-serif',
};

/**
 * Converte HEX para HSL
 */
function hexToHSL(hex: string): string {
  // Remove o # se presente
  hex = hex.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lValue = Math.round(l * 100);
  
  return `${h} ${s}% ${lValue}%`;
}

export function ConfiguracoesGlobaisProvider({ children }: { children: ReactNode }) {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesGlobais | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Aplica o tema baseado nas configurações
   */
  const applyTheme = (config: ConfiguracoesGlobais) => {
    const root = document.documentElement;

    // Aplica cor primária
    if (config.cor_primaria) {
      const primaryHSL = hexToHSL(config.cor_primaria);
      root.style.setProperty('--primary', primaryHSL);
      
      // Gera variações da cor primária
      const [h, s, l] = primaryHSL.split(' ').map(v => parseFloat(v));
      root.style.setProperty('--primary-light', `${h} ${s}% ${Math.min(l + 10, 100)}%`);
      root.style.setProperty('--primary-dark', `${h} ${Math.max(s - 10, 0)}% ${Math.max(l - 10, 0)}%`);
      root.style.setProperty('--primary-hover', `${h} ${s}% ${Math.max(l - 5, 0)}%`);
      
      // Atualiza o gradiente
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${h} ${Math.max(s - 10, 0)}% ${Math.max(l - 20, 10)}%), hsl(${h} ${Math.max(s - 5, 0)}% ${l}%))`);
    }

    // Aplica cor secundária
    if (config.cor_secundaria) {
      const secondaryHSL = hexToHSL(config.cor_secundaria);
      root.style.setProperty('--secondary', secondaryHSL);
    }

    // Aplica cor do texto
    if (config.cor_texto) {
      const textHSL = hexToHSL(config.cor_texto);
      root.style.setProperty('--foreground', textHSL);
      root.style.setProperty('--card-foreground', textHSL);
    }

    // Aplica fontes
    if (config.fonte_primaria) {
      root.style.setProperty('font-family', config.fonte_primaria);
    }
  };

  /**
   * Carrega configurações do backend
   */
  const loadConfiguracoes = async () => {
    setIsLoading(true);
    try {
      const schema = getSchemaFromHostname();
      console.log('[ConfiguracoesGlobais] Schema detectado:', schema);
      
      const configs = await configuracoesGlobaisService.getConfiguracoes(schema);
      console.log('[ConfiguracoesGlobais] Configurações recebidas:', configs);
      
      if (configs && configs.length > 0) {
        const config = configs[0];
        console.log('[ConfiguracoesGlobais] Primeira configuração:', config);
        console.log('[ConfiguracoesGlobais] Logo base64 presente?', !!config.logo_base64);
        setConfiguracoes(config);
        applyTheme(config);
      } else {
        console.log('[ConfiguracoesGlobais] Nenhuma configuração encontrada, usando padrão');
        // Aplica configuração padrão
        setConfiguracoes(DEFAULT_CONFIG);
        applyTheme(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('[ConfiguracoesGlobais] Erro ao carregar configurações globais:', error);
      // Em caso de erro, aplica configuração padrão
      setConfiguracoes(DEFAULT_CONFIG);
      applyTheme(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega configurações ao montar o componente
  useEffect(() => {
    loadConfiguracoes();
  }, []);

  return (
    <ConfiguracoesGlobaisContext.Provider
      value={{
        configuracoes,
        isLoading,
        loadConfiguracoes,
        applyTheme,
      }}
    >
      {children}
    </ConfiguracoesGlobaisContext.Provider>
  );
}

export function useConfiguracoesGlobais() {
  const context = useContext(ConfiguracoesGlobaisContext);
  if (context === undefined) {
    throw new Error('useConfiguracoesGlobais must be used within a ConfiguracoesGlobaisProvider');
  }
  return context;
}
