import { Stack } from "@/components/ui/Stack";

export default function StackBasic() {
  return (
    <Stack gap="md">
      <div style={{ border: "1px dashed currentColor", padding: "0.5rem 0.75rem", borderRadius: 6 }}>Account</div>
      <div style={{ border: "1px dashed currentColor", padding: "0.5rem 0.75rem", borderRadius: 6 }}>Billing</div>
      <div style={{ border: "1px dashed currentColor", padding: "0.5rem 0.75rem", borderRadius: 6 }}>Notifications</div>
    </Stack>
  );
}
