<script setup lang="ts">
import { ref } from "vue";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Delete project</Button>
  <Dialog v-model:open="open">
    <DialogContent role="alertdialog">
      <DialogTitle>Delete this project?</DialogTitle>
      <DialogDescription>This can't be undone. An alertdialog ignores outside clicks.</DialogDescription>
      <DialogFooter>
        <DialogClose variant="ghost">Cancel</DialogClose>
        <Button variant="destructive" @click="open = false">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
