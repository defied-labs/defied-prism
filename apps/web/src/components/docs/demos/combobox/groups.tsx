import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
} from "@/components/ui/Combobox";
import { Field, FieldLabel } from "@/components/ui/Field";

export default function ComboboxGroups() {
  const [value, setValue] = useState<string | null>("pear");
  return (
    <Field>
      <FieldLabel>Snack</FieldLabel>
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxInput />
        <ComboboxContent>
          <ComboboxGroup>
            <ComboboxLabel>Fruit</ComboboxLabel>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="pear">Pear</ComboboxItem>
          </ComboboxGroup>
          <ComboboxGroup>
            <ComboboxLabel>Nuts</ComboboxLabel>
            <ComboboxItem value="almond">Almond</ComboboxItem>
            <ComboboxItem value="cashew" disabled>
              Cashew (sold out)
            </ComboboxItem>
          </ComboboxGroup>
        </ComboboxContent>
      </Combobox>
      <p>Value: {value ?? "none"}</p>
    </Field>
  );
}
