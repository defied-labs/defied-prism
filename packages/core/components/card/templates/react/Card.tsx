import {
  createContext,
  forwardRef,
  useContext,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
} from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

type CardVariants = { variant: "flat" | "raised" | "outlined"; interactive?: boolean };

const CardContext = createContext<CardVariants>({ variant: "outlined" });

/** Elements whose own clicks must not be redirected to the card's link. */
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [tabindex], [contenteditable="true"]';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariants["variant"];
  /**
   * Block-link pattern: clicks on the card's non-interactive area activate its
   * `CardLink` (usually inside `CardTitle`). The link stays the only focusable
   * target and names the destination; other buttons/links inside the card
   * keep working on their own. The card itself never gets a role or tabindex,
   * so there is no nested-interactive trap. Text selection doesn't navigate.
   */
  interactive?: boolean;
}

/** `<Card><CardHeader><CardTitle>…</CardTitle><CardDescription>…</CardDescription></CardHeader><CardContent>…</CardContent><CardFooter>…</CardFooter></Card>` */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "outlined", interactive = false, className, onClick, ...props }, ref) => {
    const variants = { variant, interactive };
    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (!interactive || event.defaultPrevented) return;
      const target = event.target as Element;
      const root = event.currentTarget;
      const interactiveAncestor = target.closest(INTERACTIVE);
      if (interactiveAncestor && root.contains(interactiveAncestor)) return;
      const selection = root.ownerDocument.defaultView?.getSelection?.();
      if (selection && selection.toString().length > 0) return;
      const link = root.querySelector<HTMLElement>('[data-slot="card-link"]');
      if (!link) return;
      const { ctrlKey, metaKey, shiftKey, altKey, button } = event;
      link.dispatchEvent(
        new window.MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey, metaKey, shiftKey, altKey, button }),
      );
    };
    return (
      <CardContext.Provider value={variants}>
        <div
          {...props}
          ref={ref}
          data-slot="card"
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
          onClick={handleClick}
        />
      </CardContext.Provider>
    );
  },
);
Card.displayName = "Card";

function part<E extends HTMLElement>(slot: string, Tag: "div" | "p") {
  const Part = forwardRef<E, HTMLAttributes<E>>(({ className, ...props }, ref) => {
    const variants = useContext(CardContext);
    const Element = Tag as "div";
    return (
      <Element
        {...(props as HTMLAttributes<HTMLDivElement>)}
        ref={ref as never}
        data-slot={`card-${slot}`}
        {...variantData(variants)}
        className={slotClass(slots, slot, variants, className)}
      />
    );
  });
  return Part;
}

export const CardHeader = part<HTMLDivElement>("header", "div");
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level in the document outline: renders h1-h6. Default 3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ level = 3, className, ...props }, ref) => {
    const variants = useContext(CardContext);
    const Tag = `h${level}` as "h3";
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="card-title"
        {...variantData(variants)}
        className={slotClass(slots, "title", variants, className)}
      />
    );
  },
);
CardTitle.displayName = "CardTitle";

export const CardDescription = part<HTMLParagraphElement>("description", "p");
CardDescription.displayName = "CardDescription";

export const CardContent = part<HTMLDivElement>("content", "div");
CardContent.displayName = "CardContent";

export const CardFooter = part<HTMLDivElement>("footer", "div");
CardFooter.displayName = "CardFooter";

/** The card's primary link; an `interactive` card forwards area clicks to it. */
export const CardLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => {
    const variants = useContext(CardContext);
    return (
      <a
        {...props}
        ref={ref}
        data-slot="card-link"
        {...variantData(variants)}
        className={slotClass(slots, "link", variants, className)}
      />
    );
  },
);
CardLink.displayName = "CardLink";
