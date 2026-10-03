import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/Field";
import { Radio, RadioGroup } from "@/components/ui/RadioGroup";

export default function RadioGroupBasic() {
  const [plan, setPlan] = useState<string | null>("monthly");
  return (
    <Field>
      <FieldLabel>Billing</FieldLabel>
      <RadioGroup value={plan} onValueChange={setPlan}>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
        <Radio value="lifetime" disabled>
          Lifetime
        </Radio>
      </RadioGroup>
      <FieldDescription>Selected: {plan}</FieldDescription>
    </Field>
  );
}
