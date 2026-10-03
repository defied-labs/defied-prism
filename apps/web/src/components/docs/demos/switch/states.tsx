import { Switch } from "@/components/ui/Switch";

export default function SwitchStates() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <Switch size="sm" defaultChecked>
        Compact mode
      </Switch>
      <Switch disabled>Beta features (unavailable)</Switch>
      <Switch disabled defaultChecked>
        Two-factor authentication (required)
      </Switch>
    </div>
  );
}
