import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/Field";
import { Slider } from "@/components/ui/Slider";

export default function SliderCommit() {
  const [saved, setSaved] = useState(1000);
  return (
    <Field style={{ width: "100%", maxWidth: "20rem" }}>
      <FieldLabel>Max price</FieldLabel>
      <Slider defaultValue={1000} min={0} max={5000} step={100} onValueCommit={setSaved} />
      <FieldDescription>Saved: {saved} EUR</FieldDescription>
    </Field>
  );
}
