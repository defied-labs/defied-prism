import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/Field";
import { Slider } from "@/components/ui/Slider";

export default function SliderBasic() {
  const [volume, setVolume] = useState(40);
  return (
    <Field style={{ width: "100%", maxWidth: "20rem" }}>
      <FieldLabel>Volume</FieldLabel>
      <Slider value={volume} onValueChange={setVolume} getValueText={(v) => `${v}%`} />
      <FieldDescription>Volume: {volume}%</FieldDescription>
    </Field>
  );
}
