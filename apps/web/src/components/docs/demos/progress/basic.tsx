import { Progress } from "@/components/ui/Progress";

export default function ProgressBasic() {
  return (
    <div style={{ display: "grid", gap: "1rem", width: "100%", maxWidth: "24rem" }}>
      <Progress aria-label="Uploading files" value={3} max={10} valueText="3 of 10 files" />
      <Progress aria-label="Preparing export" indeterminate />
    </div>
  );
}
