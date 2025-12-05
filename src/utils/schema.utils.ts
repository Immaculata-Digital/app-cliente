/**
 * Utilidades para determinar o schema baseado no subdomínio
 */

const DEFAULT_SCHEMA = 'casona';

/**
 * Determina o schema baseado no hostname atual
 * 
 * Regras:
 * - Se for preview--, *.lovable.*, *.lovableproject.*, homolog-app-admin ou localhost: usa casona
 * - Se tiver subdomínio válido: usa o subdomínio como schema
 * - Caso contrário: usa casona
 */
export function getSchemaFromHostname(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_SCHEMA;
  }

  const hostname = window.location.hostname;

  // Verifica se é ambiente de desenvolvimento/preview
  if (
    hostname.startsWith('preview--') ||
    hostname.includes('.lovable') ||
    hostname.includes('.lovableproject.') ||
    hostname.includes('homolog-app-admin') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    return DEFAULT_SCHEMA;
  }

  // Extrai o subdomínio
  const parts = hostname.split('.');
  
  // Se tem mais de 2 partes (ex: subdomain.domain.com), o primeiro é o subdomínio
  if (parts.length > 2) {
    const subdomain = parts[0];
    
    // Ignora www
    if (subdomain !== 'www') {
      return subdomain;
    }
  }

  return DEFAULT_SCHEMA;
}

/**
 * Verifica se está em modo de desenvolvimento
 */
export function isDevMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname;
  return (
    hostname.startsWith('preview--') ||
    hostname.includes('.lovable') ||
    hostname.includes('.lovableproject.') ||
    hostname.includes('homolog-app-admin') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  );
}
