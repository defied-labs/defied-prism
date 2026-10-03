import { useState } from "react";

import { Switch } from "@/components/ui/Switch";

export default function SwitchBasic() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Switch checked={checked} onCheckedChange={setChecked}>
        Email notifications
      </Switch>
      <span>{checked ? "On" : "Off"}</span>
    </div>
  );
}
