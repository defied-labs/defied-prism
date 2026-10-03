import { Avatar } from "@/components/ui/Avatar";

export default function AvatarSizes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Avatar size="sm" alt="Ada Lovelace" />
        <Avatar size="md" alt="Ada Lovelace" />
        <Avatar size="lg" alt="Ada Lovelace" />
        <Avatar size="xl" alt="Ada Lovelace" />
        <Avatar size="lg" shape="square" alt="Acme Inc" />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Avatar size="sm" alt="" fallback="LT" />
        <span>Linus Torvalds</span>
      </div>
    </div>
  );
}
