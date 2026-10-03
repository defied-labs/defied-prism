import type { InjectionKey } from "vue";

export type SkeletonVariant = "text" | "rect" | "circle";

/** The group's default shape, as a getter so prop changes reach the shapes. */
export const SkeletonKey: InjectionKey<() => SkeletonVariant> = Symbol("Skeleton");
