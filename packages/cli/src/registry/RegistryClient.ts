import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentManifest } from "./ComponentManifest";
import { ManifestValidator } from "./ManifestValidator";
import { RecipeValidator } from "./RecipeValidator";
import type { Recipe } from "@defied/prism-style-engine";

export type RegistryClient = RegistryClientInterface;

export interface RegistryClientInterface {
  getManifest(component: string): Promise<ComponentManifest>;
  getRecipe(component: string): Promise<Recipe>;
  getFile(component: string, file: string): Promise<string>;
}

export class LocalRegistryClient implements RegistryClientInterface {
  private registryPath: string;

  constructor(regPath: string) {
    this.registryPath = path.resolve(regPath);
  }

  async getManifest(component: string): Promise<ComponentManifest> {
    const file = path.join(
      this.registryPath,
      "components",
      component,
      "manifest.json",
    );

    let content: string;
    try {
      content = await fs.readFile(file, "utf8");
    } catch (err: any) {
      throw new Error(`[prism] Component "${component}" not found in registry at path "${file}".`);
    }

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch (err: any) {
      throw new Error(`[prism] Failed to parse manifest JSON for component "${component}": ${err?.message ?? err}`);
    }

    return ManifestValidator.validate(data, component);
  }

  async getRecipe(component: string): Promise<Recipe> {
    const file = path.join(
      this.registryPath,
      "components",
      component,
      "recipe.json",
    );

    let content: string;
    try {
      content = await fs.readFile(file, "utf8");
    } catch (err: any) {
      throw new Error(`[prism] Recipe recipe.json not found for component "${component}" at path "${file}".`);
    }

    return RecipeValidator.parse(content, component);
  }

  async getFile(component: string, file: string) {
    const target = path.join(this.registryPath, "components", component, file);

    try {
      return await fs.readFile(target, "utf8");
    } catch (err: any) {
      throw new Error(`[prism] File "${file}" for component "${component}" not found at path "${target}".`);
    }
  }
}

export class RegistryClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "RegistryClientError";
  }
}

export interface RemoteRegistryOptions {
  baseUrl: string;
  token?: string;
  timeout?: number;
  cache?: Map<string, { data: any; expires: number }>;
}

export class RemoteRegistryClient implements RegistryClientInterface {
  private baseUrl: string;
  private token?: string;
  private timeout: number;
  private cache: Map<string, { data: any; expires: number }>;

  constructor(options: RemoteRegistryOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
    this.timeout = options.timeout ?? 30000;
    this.cache = options.cache ?? new Map();
  }

  private getCacheKey(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: any, ttlMs = 60000): void {
    this.cache.set(key, { data, expires: Date.now() + ttlMs });
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...options.headers,
        },
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await this.fetchWithTimeout(url);
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new RegistryClientError(
        `Failed to fetch ${url}: ${response.status} ${response.statusText} ${text}`,
        "FETCH_FAILED",
        response.status,
      );
    }
    return response.json() as Promise<T>;
  }

  private async fetchText(url: string): Promise<string> {
    const response = await this.fetchWithTimeout(url);
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new RegistryClientError(
        `Failed to fetch ${url}: ${response.status} ${response.statusText} ${text}`,
        "FETCH_FAILED",
        response.status,
      );
    }
    return response.text();
  }

  async getManifest(component: string): Promise<ComponentManifest> {
    const cacheKey = this.getCacheKey(`/components/${component}/manifest.json`);
    const cached = this.getCached<ComponentManifest>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/components/${component}/manifest.json`;
    const data = await this.fetchJson<any>(url);
    const manifest = ManifestValidator.validate(data, component);
    this.setCache(cacheKey, manifest);
    return manifest;
  }

  async getRecipe(component: string): Promise<Recipe> {
    const cacheKey = this.getCacheKey(`/components/${component}/recipe.json`);
    const cached = this.getCached<Recipe>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/components/${component}/recipe.json`;
    const recipe = RecipeValidator.validate(await this.fetchJson<unknown>(url), component);
    this.setCache(cacheKey, recipe);
    return recipe;
  }

  async getFile(component: string, file: string) {
    const cacheKey = this.getCacheKey(`/components/${component}/${file}`);
    const cached = this.getCached<string>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/components/${component}/${file}`;
    const text = await this.fetchText(url);
    this.setCache(cacheKey, text);
    return text;
  }

  clearCache(): void {
    this.cache.clear();
  }

  setToken(token: string | undefined): void {
    this.token = token;
    this.clearCache(); // Clear cache when auth changes
  }
}

export function createRegistryClient(
  registryPath: string,
  options?: RemoteRegistryOptions,
): RegistryClientInterface {
  // If it looks like a URL, use remote client
  if (
    registryPath.startsWith("http://") ||
    registryPath.startsWith("https://")
  ) {
    return new RemoteRegistryClient({
      baseUrl: registryPath,
      ...options,
    });
  }
  // Otherwise use local filesystem client
  return new LocalRegistryClient(registryPath);
}
