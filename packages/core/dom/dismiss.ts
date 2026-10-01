/**
 * Dismissable layers (dialogs, popovers, listboxes). Layers form a stack so
 * Escape and outside clicks only dismiss the topmost one.
 */

export type DismissReason = "escape" | "outside";

interface Layer {
  inside: () => (Element | null | undefined)[];
  dismiss: (reason: DismissReason, event: Event) => void;
  escape: boolean;
  outside: boolean;
}

const stack: Layer[] = [];
let listening: Document | null = null;
/**
 * A click fires pointerdown then a compatibility mousedown. Only the first
 * may dismiss: by the time the mousedown arrives the top layer is gone, and
 * it would dismiss the layer beneath too.
 */
let skipMouseDown = false;

const top = () => stack[stack.length - 1];

function onKeyDown(event: KeyboardEvent) {
  const layer = top();
  if (event.key !== "Escape" || !layer?.escape) return;
  event.stopPropagation();
  layer.dismiss("escape", event);
}

function onPointerDown(event: Event) {
  if (event.type === "pointerdown") {
    skipMouseDown = true;
  } else if (skipMouseDown) {
    skipMouseDown = false;
    return;
  }
  const layer = top();
  if (!layer?.outside) return;
  const target = event.target as Node;
  if (layer.inside().some((el) => el?.contains(target))) return;
  layer.dismiss("outside", event);
}

function listen(doc: Document) {
  if (listening) return;
  listening = doc;
  doc.addEventListener("keydown", onKeyDown, true);
  // pointerdown with a mousedown fallback (older engines, test environments)
  doc.addEventListener("pointerdown", onPointerDown, true);
  doc.addEventListener("mousedown", onPointerDown, true);
}

function unlisten() {
  if (!listening || stack.length > 0) return;
  listening.removeEventListener("keydown", onKeyDown, true);
  listening.removeEventListener("pointerdown", onPointerDown, true);
  listening.removeEventListener("mousedown", onPointerDown, true);
  listening = null;
  skipMouseDown = false;
}

export interface DismissOptions {
  /** Elements that count as "inside" (the layer plus e.g. its trigger). */
  inside: () => (Element | null | undefined)[];
  onDismiss: (reason: DismissReason, event: Event) => void;
  /** Dismiss on Escape (default true). */
  escape?: boolean;
  /** Dismiss on pointer down outside (default true). */
  outside?: boolean;
  document?: Document;
}

/** Registers a dismissable layer on top of the stack. Returns the unregister function. */
export function onDismiss(options: DismissOptions): () => void {
  const layer: Layer = {
    inside: options.inside,
    escape: options.escape ?? true,
    outside: options.outside ?? true,
    dismiss: options.onDismiss,
  };
  stack.push(layer);
  listen(options.document ?? document);
  return () => {
    const index = stack.indexOf(layer);
    if (index !== -1) stack.splice(index, 1);
    unlisten();
  };
}
