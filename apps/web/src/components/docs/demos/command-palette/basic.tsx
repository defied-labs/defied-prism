import { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  CommandSeparator,
} from "@/components/ui/CommandPalette";

export default function CommandPaletteBasic() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("nothing yet");
  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open commands (Ctrl/⌘ J)
      </Button>
      <p>Last command: {last}</p>
      <CommandPalette open={open} onOpenChange={setOpen} shortcut="mod+j" onSelect={setLast}>
        <CommandInput />
        <CommandList>
          <CommandGroup heading="Projects">
            <CommandItem value="new-project" keywords={["create", "add"]}>
              New project
            </CommandItem>
            <CommandItem value="open-recent">Open recent</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem value="settings" keywords={["preferences"]}>
              Settings
            </CommandItem>
            <CommandItem value="billing" disabled>
              Billing
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandEmpty>No commands match.</CommandEmpty>
      </CommandPalette>
    </div>
  );
}
