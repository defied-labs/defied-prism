import { Radio, RadioGroup } from "@/components/ui/RadioGroup";

export default function RadioGroupHorizontal() {
  return (
    <RadioGroup aria-label="Size" orientation="horizontal" size="sm" defaultValue="m">
      <Radio value="s">S</Radio>
      <Radio value="m">M</Radio>
      <Radio value="l">L</Radio>
    </RadioGroup>
  );
}
