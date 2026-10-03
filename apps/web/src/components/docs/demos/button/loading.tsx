import { useState } from "react";

import { Button } from "@/components/ui/Button";

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Button loading={saving} onClick={save}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
      <Button variant="outline" disabled>
        Archived
      </Button>
    </div>
  );
}
