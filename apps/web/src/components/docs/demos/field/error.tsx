import { useState } from "react";

import { Field, FieldError, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function FieldErrorDemo() {
  const [slug, setSlug] = useState("My Project");
  const error = /^[a-z0-9-]+$/.test(slug) ? "" : "Use lowercase letters, numbers and dashes.";
  return (
    <Field>
      <FieldLabel>Project URL</FieldLabel>
      <Input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
