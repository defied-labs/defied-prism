import { Divider } from "@/components/ui/Divider";

export default function DividerVertical() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "1.5rem" }}>
      <span>Docs</span>
      <Divider orientation="vertical" decorative />
      <span>Blog</span>
      <Divider orientation="vertical" decorative />
      <span>Changelog</span>
    </div>
  );
}
