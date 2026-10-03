import { Heading } from "@/components/ui/Heading";

export default function HeadingSize() {
  return (
    <div>
      <Heading level={2} size="display">
        Ship faster
      </Heading>
      <Heading level={2} size="sm">
        Recent activity
      </Heading>
    </div>
  );
}
