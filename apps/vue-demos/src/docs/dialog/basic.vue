<script setup lang="ts">
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
</script>

<template>
  <Dialog>
    <DialogTrigger variant="outline">Edit profile</DialogTrigger>
    <DialogContent>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Changes are saved when you press Save.</DialogDescription>
      <label>Name <input name="name" value="Ada Lovelace" /></label>
      <DialogFooter>
        <DialogClose variant="ghost">Cancel</DialogClose>
        <DialogClose>Save</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
