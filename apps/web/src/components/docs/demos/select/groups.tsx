import { Field, FieldLabel } from "@/components/ui/Field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/Select";

export default function SelectGroups() {
  return (
    <Field>
      <FieldLabel>Time zone</FieldLabel>
      <Select name="timezone" defaultValue="europe/rome">
        <SelectTrigger />
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="europe/london">London</SelectItem>
            <SelectItem value="europe/rome">Rome</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="america/new_york">New York</SelectItem>
            <SelectItem value="america/los_angeles">Los Angeles</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
