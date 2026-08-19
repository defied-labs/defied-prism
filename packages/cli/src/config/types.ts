export interface PrismConfig {
  framework: "react" | "vue";
  styling: "tailwind" | "css-modules";
  componentsPath: string;
  registryPath?: string;
  components?: string[];
}
