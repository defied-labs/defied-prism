<script setup lang="ts">
import { ref } from "vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const last = ref("none");
</script>

<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>File</DropdownMenuLabel>
          <DropdownMenuItem @select="last = 'Rename'">Rename</DropdownMenuItem>
          <DropdownMenuItem @select="last = 'Duplicate'">Duplicate</DropdownMenuItem>
          <DropdownMenuItem disabled>Move to…</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="last = 'Delete'">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <p>Last action: {{ last }}</p>
  </div>
</template>
