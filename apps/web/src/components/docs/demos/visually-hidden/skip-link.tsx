import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

export default function VisuallyHiddenSkipLink() {
  return (
    <div>
      <VisuallyHidden focusable asChild>
        <a href="#main-content">Skip to content</a>
      </VisuallyHidden>
      <p>Click here, then press Tab: the link appears while it has focus.</p>
    </div>
  );
}
