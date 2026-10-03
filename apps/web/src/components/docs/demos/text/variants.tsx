import { Text } from "@/components/ui/Text";

export default function TextVariants() {
  return (
    <div style={{ maxWidth: "16rem" }}>
      <Text tone="success" weight="medium">
        Payment received
      </Text>
      <Text tone="warning" weight="medium">
        Card expires next month
      </Text>
      <Text tone="danger" weight="semibold">
        Payment failed
      </Text>
      <Text truncate>Invoice-2026-10-acme-corporation-international-holdings.pdf</Text>
      <Text>
        Total:{" "}
        <Text as="span" weight="bold">
          $1,240.00
        </Text>
      </Text>
    </div>
  );
}
