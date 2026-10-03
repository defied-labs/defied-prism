import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export default function DropdownMenuBasic() {
  const [last, setLast] = useState("none");
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>File</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setLast("Rename")}>Rename</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLast("Duplicate")}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem disabled>Move to…</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setLast("Delete")}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p>Last action: {last}</p>
    </div>
  );
}
