import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from "@/components/ui/Combobox";
import { Field, FieldLabel } from "@/components/ui/Field";

const timezones = ["Europe/Rome", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"];

export default function ComboboxBasic() {
  return (
    <Field>
      <FieldLabel>Time zone</FieldLabel>
      <Combobox name="timezone">
        <ComboboxInput placeholder="Search time zones" />
        <ComboboxContent>
          {timezones.map((tz) => (
            <ComboboxItem key={tz} value={tz}>
              {tz}
            </ComboboxItem>
          ))}
        </ComboboxContent>
        <ComboboxEmpty>No time zone found</ComboboxEmpty>
      </Combobox>
    </Field>
  );
}
