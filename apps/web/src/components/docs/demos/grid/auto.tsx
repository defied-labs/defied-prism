import { Grid } from "@/components/ui/Grid";

const cell = { border: "1px dashed currentColor", borderRadius: 6, padding: 12 } as const;
const plans = ["Hobby", "Team", "Business", "Enterprise"];

export default function GridAuto() {
  return (
    <Grid as="ul" columns="auto" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {plans.map((plan) => (
        <li key={plan} style={cell}>
          {plan}
        </li>
      ))}
    </Grid>
  );
}
