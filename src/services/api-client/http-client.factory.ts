import { AxiosHttpClient, HttpClient } from "./http-client";

export class HttpClientFactory {
  static create(baseURL: string, defaultHeaders?: Record<string, string>): HttpClient {
    return new AxiosHttpClient(baseURL, defaultHeaders);
  }
}
