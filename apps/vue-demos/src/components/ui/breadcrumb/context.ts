import { inject, type InjectionKey } from "vue";

export type BreadcrumbSize = "sm" | "md";
export type BreadcrumbVariants = { size: BreadcrumbSize };

export const BreadcrumbKey: InjectionKey<() => BreadcrumbVariants> = Symbol("Breadcrumb");

export function useBreadcrumb(part: string): () => BreadcrumbVariants {
  const context = inject(BreadcrumbKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <Breadcrumb>.`);
  return context;
}
