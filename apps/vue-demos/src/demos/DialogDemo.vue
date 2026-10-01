<script setup lang="ts">
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger,
} from "../components/ui/dialog";
</script>

<template>
  <Dialog>
    <DialogTrigger variant="outline">Open dialog</DialogTrigger>
    <DialogContent>
      <DialogTitle>Rendered by Vue</DialogTitle>
      <DialogDescription>
        Focus is trapped, Escape closes it, and the rest of the page is hidden from screen readers.
      </DialogDescription>
      <DialogFooter><DialogClose>Close</DialogClose></DialogFooter>
    </DialogContent>
  </Dialog>
</template>
