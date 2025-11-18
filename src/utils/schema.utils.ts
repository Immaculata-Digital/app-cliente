/**
 * Utilidades para determinar o schema baseado no subdomínio
 */

const DEV_SCHEMAS = [
  'preview--app-admin-1.lovable',
  'homolog-app-admin',
  'localhost',
  '127.0.0.1',
];

const DEFAULT_SCHEMA = 'z_demo';

/**
 * Determina o schema baseado no hostname atual
 * 
 * Regras:
 * - Se for preview--app-admin-1.lovable, homolog-app-admin ou localhost: usa z_demo
 * - Se tiver subdomínio: usa o subdomínio como schema
 * - Caso contrário: usa z_demo
 */
export function getSchemaFromHostname(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_SCHEMA;
  }

  const hostname = window.location.hostname;

  // Verifica se é um dos ambientes de desenvolvimento
  if (DEV_SCHEMAS.some(schema => hostname.includes(schema))) {
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
  return DEV_SCHEMAS.some(schema => hostname.includes(schema));
}
