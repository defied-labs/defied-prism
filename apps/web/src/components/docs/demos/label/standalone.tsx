import { Label } from "@/components/ui/Label";

export default function LabelStandalone() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input id="newsletter" type="checkbox" />
      <Label htmlFor="newsletter">Send me the monthly newsletter</Label>
    </div>
  );
}
