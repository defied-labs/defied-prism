<script setup lang="ts">
import { ref } from "vue";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "../../components/ui/drawer";
import { Button } from "../../components/ui/button";

const open = ref(false);
</script>

<template>
  <Button variant="outline" @click="open = true">Menu</Button>
  <Drawer v-model:open="open">
    <DrawerContent side="left" size="sm">
      <DrawerTitle>Menu</DrawerTitle>
      <nav aria-label="Main">
        <ul>
          <li><a href="#overview" @click="open = false">Overview</a></li>
          <li><a href="#orders" @click="open = false">Orders</a></li>
          <li><a href="#settings" @click="open = false">Settings</a></li>
        </ul>
      </nav>
      <DrawerClose>Close</DrawerClose>
    </DrawerContent>
  </Drawer>
</template>
