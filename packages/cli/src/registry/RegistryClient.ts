import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentManifest } from "./ComponentManifest";
import { ManifestValidator } from "./ManifestValidator";
import { StyleEvaluator } from "./StyleEvaluator";

export type RegistryClient = RegistryClientInterface;

export interface RegistryClientInterface {
  getManifest(component: string): Promise<ComponentManifest>;
  getStyle(component: string): Promise<any>;
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

  async getStyle(component: string) {
    const file = path.join(
      this.registryPath,
      "components",
      component,
      "style.ts",
    );

    let content: string;
    try {
      content = await fs.readFile(file, "utf8");
    } catch (err: any) {
      throw new Error(`[prism] Style definition style.ts not found for component "${component}" at path "${file}".`);
    }

    return StyleEvaluator.evaluate(content, component);
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

export class RepositoryRegistryClient implements RegistryClientInterface {
  constructor(private repositoryUrl: string) {}

  async getManifest(component: string): Promise<ComponentManifest> {
    const url = `${this.repositoryUrl}/components/${component}/manifest.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`[prism] Failed to fetch manifest for component "${component}" from ${url} (HTTP ${response.status}).`);
    }
    const data = await response.json();
    return ManifestValidator.validate(data, component);
  }

  async getStyle(component: string) {
    const url = `${this.repositoryUrl}/components/${component}/style.ts`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`[prism] Failed to fetch style for component "${component}" from ${url} (HTTP ${response.status}).`);
    }
    const text = await response.text();
    return StyleEvaluator.evaluate(text, component);
  }

  async getFile(component: string, file: string) {
    const url = `${this.repositoryUrl}/components/${component}/${file}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`[prism] Failed to fetch file "${file}" for component "${component}" from ${url} (HTTP ${response.status}).`);
    }
    return response.text();
  }
}
