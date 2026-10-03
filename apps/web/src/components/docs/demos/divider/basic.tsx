import { Divider } from "@/components/ui/Divider";

export default function DividerBasic() {
  return (
    <div style={{ width: "100%", maxWidth: "24rem" }}>
      <p>Account</p>
      <Divider />
      <p>Notifications</p>
    </div>
  );
}
