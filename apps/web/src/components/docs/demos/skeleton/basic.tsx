import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function SkeletonBasic() {
  return (
    <SkeletonGroup label="Loading profile" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <Skeleton variant="circle" style={{ width: 40, height: 40 }} />
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <Skeleton style={{ width: 160 }} />
        <Skeleton style={{ width: 100 }} />
      </div>
    </SkeletonGroup>
  );
}
