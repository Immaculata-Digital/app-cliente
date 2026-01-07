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

// Cores padrão
const DEFAULT_CONFIG: ConfiguracoesGlobais = {
  cor_fundo: '#f8fafc',
  cor_card: '#ffffff',
  cor_texto_card: '#000000',
  cor_valor_card: '#000000',
  cor_botao: '#3b82f6',
  cor_texto_botao: '#ffffff',
  fonte_titulos: 'Inter, system-ui, sans-serif',
  fonte_textos: 'Inter, system-ui, sans-serif',
};

/**
 * Lista de fontes do sistema que NÃO precisam ser carregadas do Google Fonts
 */
const SYSTEM_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 
  'Verdana', 'Trebuchet MS', 'Comic Sans MS', 'Impact', 'Tahoma', 
  'Lucida Console', 'Courier', 'Monaco', 'serif', 'sans-serif', 'monospace'
];

/**
 * Carrega uma fonte do Google Fonts dinamicamente
 */
function loadGoogleFont(fontName: string): void {
  if (!fontName) return;
  
  // Remove espaços e formata para URL do Google Fonts
  // Pega apenas o primeiro nome da fonte (antes da vírgula, se houver)
  const fontFamily = fontName.split(',')[0].trim();
  
  // Remove aspas se houver
  const cleanFontName = fontFamily.replace(/['"]/g, '');
  
  // Verifica se é uma fonte do sistema (não precisa carregar)
  const isSystemFont = SYSTEM_FONTS.some(font => 
    cleanFontName.toLowerCase() === font.toLowerCase() ||
    cleanFontName.toLowerCase().includes('system')
  );
  
  if (isSystemFont) {
    return;
  }
  
  // Formata o nome da fonte para URL do Google Fonts (substitui espaços por +)
  const fontNameClean = cleanFontName.replace(/\s+/g, '+');
  
  // Verifica se o link já foi adicionado
  const linkId = `google-font-${fontNameClean.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const existingLink = document.getElementById(linkId);
  if (existingLink) {
    return; // Já foi carregado
  }
  
  // Cria o link para carregar a fonte do Google Fonts
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontNameClean}:wght@300;400;500;600;700&display=swap`;
  link.crossOrigin = 'anonymous';
  
  link.onerror = () => {
    console.warn(`[ConfiguracoesGlobais] Erro ao carregar fonte do Google Fonts: ${cleanFontName}`);
  };
  
  document.head.appendChild(link);
}

/**
 * Atualiza o favicon dinamicamente com a logo
 */
function updateFavicon(logoBase64?: string): void {
  if (!logoBase64) {
    return;
  }

  try {
    // Remove favicon existente se houver
    const existingFavicon = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Cria novo link para o favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png'; // Favicons geralmente são PNG
    link.href = logoBase64;
    
    document.head.appendChild(link);

    // Também atualiza apple-touch-icon para dispositivos iOS
    const existingAppleIcon = document.querySelector('link[rel*="apple-touch-icon"]') as HTMLLinkElement;
    if (existingAppleIcon) {
      existingAppleIcon.remove();
    }
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = logoBase64;
    document.head.appendChild(appleIcon);
  } catch (error) {
    console.error('Erro ao atualizar favicon:', error);
  }
}

/**
 * Atualiza o título da página com o schema (capitalizado)
 */
function updatePageTitle(schema: string): void {
  if (schema) {
    // Capitaliza a primeira letra do schema para usar como título
    const schemaCapitalized = schema.charAt(0).toUpperCase() + schema.slice(1);
    document.title = schemaCapitalized;
  } else {
    // Fallback para título padrão
    document.title = 'App Clientes';
  }
}

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

    // Aplica cor do fundo
    if (config.cor_fundo) {
      const backgroundHSL = hexToHSL(config.cor_fundo);
      root.style.setProperty('--background', backgroundHSL);
    }

    // Aplica cor dos cards
    if (config.cor_card) {
      const cardHSL = hexToHSL(config.cor_card);
      root.style.setProperty('--card', cardHSL);
      root.style.setProperty('--secondary', cardHSL);
    }

    // Aplica cor dos textos de card
    if (config.cor_texto_card) {
      const textCardHSL = hexToHSL(config.cor_texto_card);
      root.style.setProperty('--card-foreground', textCardHSL);
      root.style.setProperty('--muted-foreground', textCardHSL);
    }

    // Aplica cor dos valores de card
    if (config.cor_valor_card) {
      const valorCardHSL = hexToHSL(config.cor_valor_card);
      root.style.setProperty('--card-value-color', valorCardHSL);
    }

    // Aplica cor dos botões
    if (config.cor_botao) {
      const buttonHSL = hexToHSL(config.cor_botao);
      root.style.setProperty('--primary', buttonHSL);
      
      // Gera variações da cor do botão
      const [h, s, l] = buttonHSL.split(' ').map(v => parseFloat(v));
      root.style.setProperty('--primary-light', `${h} ${s}% ${Math.min(l + 10, 100)}%`);
      root.style.setProperty('--primary-dark', `${h} ${Math.max(s - 10, 0)}% ${Math.max(l - 10, 0)}%`);
      root.style.setProperty('--primary-hover', `${h} ${s}% ${Math.max(l - 5, 0)}%`);
      
      // Atualiza o gradiente (usado no header)
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${h} ${Math.max(s - 10, 0)}% ${Math.max(l - 20, 10)}%), hsl(${h} ${Math.max(s - 5, 0)}% ${l}%))`);
    }

    // Aplica cor do texto dos botões
    if (config.cor_texto_botao) {
      const buttonTextHSL = hexToHSL(config.cor_texto_botao);
      root.style.setProperty('--primary-foreground', buttonTextHSL);
    }

    // Aplica cor de foreground padrão (para textos gerais)
    if (config.cor_texto_card) {
      const foregroundHSL = hexToHSL(config.cor_texto_card);
      root.style.setProperty('--foreground', foregroundHSL);
      root.style.setProperty('--secondary-foreground', foregroundHSL);
    }

    // Aplica fontes
    if (config.fonte_titulos) {
      // Carrega fonte do Google Fonts se necessário
      loadGoogleFont(config.fonte_titulos);
      
      root.style.setProperty('--font-heading', config.fonte_titulos);
      // Aplica fonte de títulos usando uma classe CSS
      const style = document.createElement('style');
      style.id = 'dynamic-font-heading';
      style.textContent = `
        h1, h2, h3, h4, h5, h6,
        .font-heading,
        [class*="heading"] {
          font-family: ${config.fonte_titulos} !important;
        }
      `;
      // Remove estilo anterior se existir
      const existingStyle = document.getElementById('dynamic-font-heading');
      if (existingStyle) {
        existingStyle.remove();
      }
      document.head.appendChild(style);
    }

    if (config.fonte_textos) {
      // Carrega fonte do Google Fonts se necessário
      loadGoogleFont(config.fonte_textos);
      
      root.style.setProperty('--font-body', config.fonte_textos);
      root.style.fontFamily = config.fonte_textos;
      // Aplica fonte de textos no body
      const style = document.createElement('style');
      style.id = 'dynamic-font-body';
      style.textContent = `
        body, p, span, div, input, textarea, select, button, a {
          font-family: ${config.fonte_textos} !important;
        }
      `;
      // Remove estilo anterior se existir
      const existingStyle = document.getElementById('dynamic-font-body');
      if (existingStyle) {
        existingStyle.remove();
      }
      document.head.appendChild(style);
    }
  };

  /**
   * Carrega configurações do backend
   */
  const loadConfiguracoes = async () => {
    setIsLoading(true);
    try {
      const schema = getSchemaFromHostname();
      
      const config = await configuracoesGlobaisService.getFirst(schema);
      
      if (config) {
        setConfiguracoes(config);
        applyTheme(config);
        // Atualiza o favicon com a logo
        updateFavicon(config.logo_base64);
      } else {
        // Aplica configuração padrão
        setConfiguracoes(DEFAULT_CONFIG);
        applyTheme(DEFAULT_CONFIG);
      }

      // Atualiza o título da página com o schema (capitalizado)
      updatePageTitle(schema);
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
