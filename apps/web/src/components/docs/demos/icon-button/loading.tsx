import { useState } from "react";

import { IconButton } from "@/components/ui/IconButton";

export default function IconButtonLoading() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };
  return (
    <IconButton
      aria-label="Save"
      variant="primary"
      loading={saving}
      onClick={save}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </IconButton>
  );
}
