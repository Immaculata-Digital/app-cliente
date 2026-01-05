/**
 * Utilidades para determinar o schema baseado no subdomínio
 */

const DEFAULT_SCHEMA = import.meta.env.VITE_SCHEMA_DEFAULT ?? 'casona';

/**
 * Determina o schema baseado no hostname atual
 * 
 * Padrões suportados:
 * - HOMOLOG: homolog-nome.concordiaerp.com → extrai "nome"
 * - PROD: nome.concordiaerp.com → extrai "nome"
 * 
 * Regras:
 * - Se for preview--, *.lovable.*, *.lovableproject.*, homolog-app-admin ou localhost: usa DEFAULT_SCHEMA
 * - Se for um domínio concordiaerp.com: extrai o schema removendo prefixo "homolog-" se existir
 * - Se tiver subdomínio válido: usa o subdomínio como schema
 * - Caso contrário: usa DEFAULT_SCHEMA
 */
export function getSchemaFromHostname(): string {
  if (typeof window === 'undefined') {
    console.log('[getSchemaFromHostname] Schema usando DEFAULT (window undefined):', {
      schema: DEFAULT_SCHEMA,
      origem: 'window undefined'
    })
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
    console.log('[getSchemaFromHostname] Schema usando DEFAULT (dev/preview):', {
      hostname,
      schema: DEFAULT_SCHEMA,
      origem: 'desenvolvimento/preview'
    })
    return DEFAULT_SCHEMA;
  }

  // Se for um domínio concordiaerp.com (homolog ou prod)
  if (hostname.includes('.concordiaerp.com')) {
    // Remove o domínio base
    let schema = hostname.replace('.concordiaerp.com', '');
    
    // Remove prefixo "homolog-" se existir
    if (schema.startsWith('homolog-')) {
      schema = schema.replace('homolog-', '');
    }
    
    // Validar que é um nome de schema válido (letras, números, underscore, hífen)
    if (schema && /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(schema)) {
      console.log('[getSchemaFromHostname] Schema extraído da URL:', {
        hostname,
        schema,
        origem: 'concordiaerp.com'
      })
      return schema;
    }
  }

  // Fallback: extrai o subdomínio (para desenvolvimento)
  const parts = hostname.split('.');
  
  // Se tem mais de 2 partes (ex: subdomain.domain.com), o primeiro é o subdomínio
  if (parts.length > 2) {
    const subdomain = parts[0];
    
    // Ignora www
    if (subdomain !== 'www' && /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(subdomain)) {
      console.log('[getSchemaFromHostname] Schema extraído do subdomínio:', {
        hostname,
        schema: subdomain,
        origem: 'subdomínio'
      })
      return subdomain;
    }
  }

  console.log('[getSchemaFromHostname] Schema usando DEFAULT (fallback):', {
    hostname,
    schema: DEFAULT_SCHEMA,
    origem: 'fallback padrão'
  })
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
