import { Grid } from "@/components/ui/Grid";

const cell = { border: "1px dashed currentColor", borderRadius: 6, padding: 12, textAlign: "center" } as const;

export default function GridBasic() {
  return (
    <Grid columns={3} gap="sm">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} style={cell}>
          {n}
        </div>
      ))}
    </Grid>
  );
}
