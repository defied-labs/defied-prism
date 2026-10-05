import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "relative inline-flex items-center justify-center shrink-0 overflow-hidden align-middle bg-prism-muted text-prism-muted-fg font-prism-sans font-prism-medium [line-height:1] select-none",
    "variants": {
      "size": {
        "sm": "w-(--prism-control-xs) h-(--prism-control-xs) text-prism-xs",
        "md": "w-(--prism-control-md) h-(--prism-control-md) text-prism-sm",
        "lg": "w-(--prism-control-lg) h-(--prism-control-lg) text-prism-md",
        "xl": "w-(--prism-control-xl) h-(--prism-control-xl) text-prism-lg"
      },
      "shape": {
        "circle": "rounded-prism-full",
        "square": "rounded-prism-md"
      }
    }
  },
  "image": {
    "base": "w-full h-full [object-fit:cover]",
    "variants": {}
  },
  "fallback": {
    "base": "[text-transform:uppercase]",
    "variants": {}
  }
});

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type AvatarStatus = "loading" | "loaded" | "fallback";

/** "Ada Lovelace" -> "AL"; "Cher" -> "C". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0]!)[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1]!)[0] ?? "") : "";
  return first + last;
}

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string;
  /**
   * Required. The person's name: the avatar is exposed as `role="img"` with
   * this name, and the default initials come from it. Pass `""` when the
   * avatar is decorative (the name is printed next to it): it is then hidden
   * from assistive technology.
   */
  alt: string;
  /** Shown while the image loads or when it fails. Defaults to initials of `alt`. */
  fallback?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  /** Extra props for the `<img>`. */
  imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
  onStatusChange?: (status: AvatarStatus) => void;
}

/**
 * The root carries the accessible name, so it is announced once whether the
 * image or the fallback is showing; the `<img>` and initials are presentational.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    { src, alt, fallback, size = "md", shape = "circle", imageProps, onStatusChange, className, ...props },
    ref,
  ) => {
    const variants = { size, shape };
    const [status, setStatus] = useState<AvatarStatus>(src ? "loading" : "fallback");
    const imgRef = useRef<HTMLImageElement>(null);
    const onStatusRef = useRef(onStatusChange);
    onStatusRef.current = onStatusChange;
    const statusRef = useRef(status);

    const update = (next: AvatarStatus) => {
      if (statusRef.current === next) return;
      statusRef.current = next;
      setStatus(next);
      onStatusRef.current?.(next);
    };

    // Reset on src change; pick up images that are already complete (cache).
    useIsoLayoutEffect(() => {
      if (!src) return update("fallback");
      const img = imgRef.current;
      update(img?.complete && img.naturalWidth > 0 ? "loaded" : "loading");
    }, [src]);

    const a11y = alt === "" ? { "aria-hidden": true as const } : { role: "img", "aria-label": alt };

    return (
      <span
        {...a11y}
        {...props}
        ref={ref}
        data-slot="avatar"
        data-state={status}
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      >
        {src && status !== "fallback" && (
          <img
            {...imageProps}
            key={src}
            ref={imgRef}
            src={src}
            alt=""
            hidden={status !== "loaded"}
            data-slot="avatar-image"
            {...variantData(variants)}
            className={slotClass(slots, "image", variants, imageProps?.className)}
            onLoad={(event) => {
              imageProps?.onLoad?.(event);
              update("loaded");
            }}
            onError={(event) => {
              imageProps?.onError?.(event);
              update("fallback");
            }}
          />
        )}
        {status !== "loaded" && (
          <span
            aria-hidden="true"
            data-slot="avatar-fallback"
            {...variantData(variants)}
            className={slotClass(slots, "fallback", variants)}
          >
            {fallback ?? getInitials(alt)}
          </span>
        )}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";
