<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
</script>

<template>
  <Drawer>
    <DrawerTrigger>Filters</DrawerTrigger>
    <DrawerContent>
      <DrawerTitle>Filters</DrawerTitle>
      <DrawerDescription>Narrow the list of orders.</DrawerDescription>
      <label><input type="checkbox" name="unpaid" checked /> Unpaid only</label>
      <label><input type="checkbox" name="shipped" /> Shipped</label>
      <DrawerFooter>
        <DrawerClose variant="ghost">Cancel</DrawerClose>
        <DrawerClose variant="primary">Apply</DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
