import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Field, FieldError, FieldLabel } from "@/components/ui/Field";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";

export default function FormBasic() {
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const next = {
      name: name ? undefined : "Enter your name.",
      email: email.includes("@") ? undefined : "Enter an email address like ada@example.com.",
    };
    setErrors(next);
    setSent(!next.name && !next.email);
  }

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Field required>
        <FieldLabel>Name</FieldLabel>
        <Input name="name" />
        <FieldError>{errors.name}</FieldError>
      </Field>
      <Field required>
        <FieldLabel>Email</FieldLabel>
        <Input name="email" type="email" />
        <FieldError>{errors.email}</FieldError>
      </Field>
      <Button type="submit">Join waitlist</Button>
      {sent && <p>Thanks, you're on the list.</p>}
    </Form>
  );
}
