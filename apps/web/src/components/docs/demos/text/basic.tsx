import { Text } from "@/components/ui/Text";

export default function TextBasic() {
  return (
    <div>
      <Text tone="lead" size="lg">
        Invoices are sent on the first of every month.
      </Text>
      <Text>You can change the billing date from the account settings.</Text>
      <Text size="sm" tone="muted">
        Last updated 2 days ago
      </Text>
    </div>
  );
}
