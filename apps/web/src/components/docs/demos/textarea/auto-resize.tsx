import { useState } from "react";

import { Textarea } from "@/components/ui/Textarea";

export default function TextareaAutoResize() {
  const [message, setMessage] = useState("");
  return (
    <label style={{ display: "grid", gap: "0.5rem" }}>
      Message
      <Textarea
        rows={1}
        resize="none"
        autoResize
        fullWidth
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type a few lines..."
      />
      <span>{message.length} characters</span>
    </label>
  );
}
