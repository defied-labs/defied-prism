import { Inline } from "@/components/ui/Inline";

const tags = ["design", "react", "vue", "accessibility", "tokens"];

export default function InlineBasic() {
  return (
    <Inline as="ul" gap="xs" aria-label="Tags" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {tags.map((tag) => (
        <li key={tag} style={{ padding: "2px 8px", border: "1px solid currentColor", borderRadius: 999 }}>
          {tag}
        </li>
      ))}
    </Inline>
  );
}
