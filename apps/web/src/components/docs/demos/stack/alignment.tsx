import { Stack } from "@/components/ui/Stack";

export default function StackAlignment() {
  return (
    <Stack as="ul" gap="xs" align="center" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      <li style={{ border: "1px dashed currentColor", padding: "0.5rem 0.75rem", borderRadius: 6 }}>Short</li>
      <li style={{ border: "1px dashed currentColor", padding: "0.5rem 0.75rem", borderRadius: 6 }}>A much longer item</li>
      <li style={{ border: "1px dashed currentColor", padding: "0.5rem 0.75rem", borderRadius: 6 }}>Medium item</li>
    </Stack>
  );
}
