import { Badge } from "@/components/ui/Badge";

export default function BadgeBasic() {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Badge>Draft</Badge>
      <Badge status="info">In review</Badge>
      <Badge status="success">Paid</Badge>
      <Badge status="warning">Expiring</Badge>
      <Badge status="danger">Failed</Badge>
    </div>
  );
}
