import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function LabelField() {
  return (
    <Field required>
      <Label>Full name</Label>
      <Input name="name" autoComplete="name" />
    </Field>
  );
}
