import { Field, FieldDescription, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function FieldBasic() {
  return (
    <Field required>
      <FieldLabel>Username</FieldLabel>
      <Input name="username" defaultValue="ada" />
      <FieldDescription>Shown on your public profile.</FieldDescription>
    </Field>
  );
}
