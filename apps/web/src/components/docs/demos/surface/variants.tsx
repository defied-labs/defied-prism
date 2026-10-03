import { Surface } from "@/components/ui/Surface";

const variants = ["flat", "raised", "outlined", "sunken"] as const;

export default function SurfaceVariants() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))", gap: "1rem" }}>
      {variants.map((variant) => (
        <Surface key={variant} variant={variant} padding="md">
          {variant}
        </Surface>
      ))}
    </div>
  );
}
