<script setup lang="ts">
import { Button } from "../../components/ui/button";
import { Toaster, toast } from "../../components/ui/toast";

function save() {
  toast({
    title: "Changes saved",
    description: "Your profile is up to date.",
    status: "success",
  });
}

function archive() {
  toast({
    title: "Message archived",
    action: { label: "Undo", onClick: () => toast({ title: "Message restored" }) },
  });
}

function upload() {
  toast({
    title: "Upload failed",
    description: "The file is larger than 10 MB.",
    status: "danger",
    duration: Infinity,
  });
}
</script>

<template>
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
    <Button variant="outline" @click="save">Save</Button>
    <Button variant="outline" @click="archive">Archive</Button>
    <Button variant="outline" @click="upload">Upload</Button>
  </div>
  <!-- In an app, mount one Toaster at the root instead -->
  <Toaster />
</template>
