import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/Drawer";

export default function DrawerSide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Menu
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent side="left" size="sm">
          <DrawerTitle>Menu</DrawerTitle>
          <nav aria-label="Main">
            <ul>
              <li><a href="#overview" onClick={() => setOpen(false)}>Overview</a></li>
              <li><a href="#orders" onClick={() => setOpen(false)}>Orders</a></li>
              <li><a href="#settings" onClick={() => setOpen(false)}>Settings</a></li>
            </ul>
          </nav>
          <DrawerClose>Close</DrawerClose>
        </DrawerContent>
      </Drawer>
    </>
  );
}
