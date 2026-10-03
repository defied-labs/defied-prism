import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";

export default function DrawerBasic() {
  return (
    <Drawer>
      <DrawerTrigger>Filters</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow the list of orders.</DrawerDescription>
        <label>
          <input type="checkbox" name="unpaid" defaultChecked /> Unpaid only
        </label>
        <label>
          <input type="checkbox" name="shipped" /> Shipped
        </label>
        <DrawerFooter>
          <DrawerClose variant="ghost">Cancel</DrawerClose>
          <DrawerClose variant="primary">Apply</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
