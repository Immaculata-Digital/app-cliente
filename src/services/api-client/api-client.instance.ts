/**
 * API Client Instance (Admin)
 * 
 * @deprecated Use `createHttpClient` from `http-client.factory.ts` instead
 * Mantido para compatibilidade, mas recomenda-se usar a factory
 */

export { apiClientAdmin } from './http-client.factory';
export { HttpClient } from './http-client';
export type { RequestConfig, ApiResponse, PaginatedResponse } from './http-client';
