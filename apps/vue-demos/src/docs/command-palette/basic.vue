<script setup lang="ts">
import { ref } from "vue";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  CommandSeparator,
} from "../../components/ui/command-palette";
import { Button } from "../../components/ui/button";

const open = ref(false);
const last = ref("nothing yet");
</script>

<template>
  <div>
    <Button variant="outline" @click="open = true">Open commands (Ctrl/⌘ J)</Button>
    <p>Last command: {{ last }}</p>
    <CommandPalette v-model:open="open" shortcut="mod+j" @select="last = $event">
      <CommandInput />
      <CommandList>
        <CommandGroup heading="Projects">
          <CommandItem value="new-project" :keywords="['create', 'add']">New project</CommandItem>
          <CommandItem value="open-recent">Open recent</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem value="settings" :keywords="['preferences']">Settings</CommandItem>
          <CommandItem value="billing" disabled>Billing</CommandItem>
        </CommandGroup>
      </CommandList>
      <CommandEmpty>No commands match.</CommandEmpty>
    </CommandPalette>
  </div>
</template>
