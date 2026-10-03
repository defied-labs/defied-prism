import { Field, FieldDescription, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function InputField() {
  return (
    <Field required>
      <FieldLabel>Email</FieldLabel>
      <Input type="email" name="email" placeholder="ada@example.com" />
      <FieldDescription>We only use it to send receipts.</FieldDescription>
    </Field>
  );
}
