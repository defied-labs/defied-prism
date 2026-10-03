import { Heading } from "@/components/ui/Heading";

export default function HeadingBasic() {
  return (
    <div>
      <Heading level={2}>Billing</Heading>
      <Heading level={3}>Payment method</Heading>
      <Heading level={4}>Card ending in 4242</Heading>
    </div>
  );
}
