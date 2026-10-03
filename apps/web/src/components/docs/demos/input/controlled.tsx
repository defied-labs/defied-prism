import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function InputControlled() {
  const [username, setUsername] = useState("ada");
  return (
    <Field>
      <FieldLabel>Username</FieldLabel>
      <Input value={username} onChange={(event) => setUsername(event.target.value)} />
      <FieldDescription>Your profile: prism.dev/{username || "…"}</FieldDescription>
    </Field>
  );
}
