import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

export default function PopoverPlacement() {
  return (
    <Popover>
      <PopoverTrigger>Details</PopoverTrigger>
      <PopoverContent side="right" align="start">
        Last edited 2 hours ago by Ada.
      </PopoverContent>
    </Popover>
  );
}
