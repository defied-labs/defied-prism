import { createApp, h, reactive, type Component } from "vue";

import type { DemoName, Mount } from "./api";

import ButtonDemo from "./demos/ButtonDemo.vue";
import CalendarDemo from "./demos/CalendarDemo.vue";
import DataTableDemo from "./demos/DataTableDemo.vue";
import DialogDemo from "./demos/DialogDemo.vue";
import FieldDemo from "./demos/FieldDemo.vue";
import SelectDemo from "./demos/SelectDemo.vue";
import ToastDemo from "./demos/ToastDemo.vue";

const demos: Record<DemoName, Component> = {
  button: ButtonDemo,
  field: FieldDemo,
  select: SelectDemo,
  dialog: DialogDemo,
  toast: ToastDemo,
  calendar: CalendarDemo,
  "data-table": DataTableDemo,
};

export type { DemoName, MountedDemo } from "./api";

/** Mounts a Vue demo into `el`; the host (a React page) drives it through `update`. */
export const mount: Mount = (el, name, props = {}) => {
  const state = reactive({ ...props });
  const app = createApp({ render: () => h(demos[name], { ...state }) });
  app.mount(el);
  return {
    update(next) {
      for (const key of Object.keys(state)) if (!(key in next)) delete state[key];
      Object.assign(state, next);
    },
    unmount: () => app.unmount(),
  };
};
