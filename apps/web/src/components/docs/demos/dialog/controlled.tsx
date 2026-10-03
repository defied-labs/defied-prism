import { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/Dialog";

export default function DialogControlled() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete project</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent role="alertdialog">
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>This can't be undone. An alertdialog ignores outside clicks.</DialogDescription>
          <DialogFooter>
            <DialogClose variant="ghost">Cancel</DialogClose>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
