import { Badge, BadgeIcon } from "@/components/ui/Badge";

export default function BadgeVariants() {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <Badge status="success" variant="subtle">
        <BadgeIcon>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </BadgeIcon>
        Subtle
      </Badge>
      <Badge status="success" variant="solid">
        Solid
      </Badge>
      <Badge status="success" variant="outline">
        Outline
      </Badge>
      <Badge status="success" size="sm">
        Small
      </Badge>
    </div>
  );
}
