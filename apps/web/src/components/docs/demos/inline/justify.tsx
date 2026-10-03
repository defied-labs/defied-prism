import { Button } from "@/components/ui/Button";
import { Inline } from "@/components/ui/Inline";

export default function InlineJustify() {
  return (
    <Inline as="footer" justify="between" style={{ width: "100%" }}>
      <span>3 items selected</span>
      <Inline gap="sm">
        <Button variant="ghost">Cancel</Button>
        <Button>Archive</Button>
      </Inline>
    </Inline>
  );
}
