import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function FieldGroupDemo() {
  return (
    <FieldGroup legend="Shipping address" disabled>
      <Field>
        <FieldLabel>Street</FieldLabel>
        <Input name="street" defaultValue="12 Analytical Row" />
      </Field>
      <Field>
        <FieldLabel>City</FieldLabel>
        <Input name="city" defaultValue="London" />
      </Field>
    </FieldGroup>
  );
}
