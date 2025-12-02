/**
 * Context para Configurações Globais
 * 
 * Gerencia o tema e configurações visuais da aplicação baseado nas configurações do backend
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { configuracoesGlobaisService } from '@/services/api-admin/configuracoes-globais.service';
import { clientesConcordiaService } from '@/services/api-admin/clientes-concordia.service';
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
  cor_destaque_texto: '#3b82f6',
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
    console.log(`[ConfiguracoesGlobais] Fonte do sistema detectada: ${cleanFontName}, não precisa carregar`);
    return;
  }
  
  // Formata o nome da fonte para URL do Google Fonts (substitui espaços por +)
  const fontNameClean = cleanFontName.replace(/\s+/g, '+');
  
  // Verifica se o link já foi adicionado
  const linkId = `google-font-${fontNameClean.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const existingLink = document.getElementById(linkId);
  if (existingLink) {
    console.log(`[ConfiguracoesGlobais] Fonte já carregada: ${cleanFontName}`);
    return; // Já foi carregado
  }
  
  // Cria o link para carregar a fonte do Google Fonts
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontNameClean}:wght@300;400;500;600;700&display=swap`;
  link.crossOrigin = 'anonymous';
  
  // Adiciona evento para log quando carregar
  link.onload = () => {
    console.log(`[ConfiguracoesGlobais] Fonte do Google Fonts carregada com sucesso: ${cleanFontName}`);
  };
  
  link.onerror = () => {
    console.warn(`[ConfiguracoesGlobais] Erro ao carregar fonte do Google Fonts: ${cleanFontName}`);
  };
  
  document.head.appendChild(link);
  console.log(`[ConfiguracoesGlobais] Carregando fonte do Google Fonts: ${cleanFontName}`);
}

/**
 * Atualiza o favicon dinamicamente com a logo
 */
function updateFavicon(logoBase64?: string): void {
  if (!logoBase64) {
    return;
  }

  // Remove favicon existente se houver
  const existingFavicon = document.querySelector('link[rel="icon"]') || 
                          document.querySelector('link[rel="shortcut icon"]');
  if (existingFavicon) {
    existingFavicon.remove();
  }

  // Cria novo link para o favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png'; // Assume PNG, mas funciona com outros formatos também
  link.href = logoBase64;
  
  document.head.appendChild(link);
  console.log('[ConfiguracoesGlobais] Favicon atualizado com a logo');
}

/**
 * Atualiza o título da página com o nome do cliente
 */
function updatePageTitle(nomeCliente?: string | null): void {
  if (nomeCliente) {
    document.title = nomeCliente;
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

    // Aplica cor de destaque do texto
    if (config.cor_destaque_texto) {
      const accentHSL = hexToHSL(config.cor_destaque_texto);
      root.style.setProperty('--accent', accentHSL);
      root.style.setProperty('--ring', accentHSL);
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
      console.log('[ConfiguracoesGlobais] Schema detectado:', schema);
      
      const config = await configuracoesGlobaisService.getFirst(schema);
      console.log('[ConfiguracoesGlobais] Configuração recebida:', config);
      
      if (config) {
        console.log('[ConfiguracoesGlobais] Logo base64 presente?', !!config.logo_base64);
        setConfiguracoes(config);
        applyTheme(config);
        // Atualiza o favicon com a logo
        updateFavicon(config.logo_base64);
      } else {
        console.log('[ConfiguracoesGlobais] Nenhuma configuração encontrada, usando padrão');
        // Aplica configuração padrão
        setConfiguracoes(DEFAULT_CONFIG);
        applyTheme(DEFAULT_CONFIG);
      }

      // Busca o nome do cliente pelo schema para atualizar o título
      const nomeCliente = await clientesConcordiaService.getNomeBySchema(schema);
      updatePageTitle(nomeCliente);
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
