import { Button } from "@/components/ui/Button";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

export default function VisuallyHiddenBasic() {
  return (
    <Button variant="outline">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <VisuallyHidden>Close notifications</VisuallyHidden>
    </Button>
  );
}
