export interface PrismConfig {
  framework: "react" | "vue";
  styling: "tailwind" | "css-modules" | "css";
  componentsPath: string;
  registryPath?: string;
  components?: string[];
}
