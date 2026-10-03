import { Spinner } from "@/components/ui/Spinner";

export default function SpinnerBasic() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" label="Loading invoices" />
      <Spinner size="lg" style={{ color: "#2563eb" }} />
    </div>
  );
}
