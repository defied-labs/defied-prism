import { useCallback, useRef, useState, type Ref, type RefCallback } from "react";

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`), the convention every Prism component follows for
 * `value`/`open`/`selected`-style props.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const currentRef = useRef(current);
  currentRef.current = current;

  const set = useCallback(
    (next: T) => {
      if (Object.is(next, currentRef.current)) return;
      if (!controlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [controlled],
  );

  return [current, set];
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Merges several refs (forwarded + internal) into one callback ref. */
export function useComposedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  return useCallback((node: T | null) => {
    for (const ref of refsRef.current) assignRef(ref, node);
  }, []);
}
