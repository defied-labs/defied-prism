import { Checkbox } from "@/components/ui/Checkbox";
import { Field, FieldDescription } from "@/components/ui/Field";

export default function CheckboxBasic() {
  return (
    <Field>
      <Checkbox name="terms" required>
        Accept the terms of service
      </Checkbox>
      <FieldDescription>You can withdraw consent in your account settings.</FieldDescription>
    </Field>
  );
}
