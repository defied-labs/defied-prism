import { Link } from "@/components/ui/Link";

export default function LinkBasic() {
  return (
    <p>
      Read the <Link href="#install">installation guide</Link> or browse the{" "}
      <Link href="#components" tone="neutral" underline="hover">
        component list
      </Link>
      .
    </p>
  );
}
