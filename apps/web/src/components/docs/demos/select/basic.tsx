import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/Field";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/Select";

export default function SelectBasic() {
  const [fruit, setFruit] = useState<string | null>(null);
  return (
    <Field>
      <FieldLabel>Fruit</FieldLabel>
      <Select value={fruit} onValueChange={setFruit} placeholder="Pick a fruit">
        <SelectTrigger />
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
          <SelectItem value="durian" disabled>
            Durian
          </SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>Selected: {fruit ?? "none"}</FieldDescription>
    </Field>
  );
}
