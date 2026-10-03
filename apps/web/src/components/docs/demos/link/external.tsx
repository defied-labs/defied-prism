import { Link } from "@/components/ui/Link";

export default function LinkExternal() {
  return (
    <p>
      Colors follow the{" "}
      <Link href="https://www.w3.org/TR/WCAG22/" external>
        WCAG 2.2 contrast rules
      </Link>
      .
    </p>
  );
}
