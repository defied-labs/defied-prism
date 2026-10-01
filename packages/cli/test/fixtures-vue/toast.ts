import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => {
  const store = m.createToastStore();
  store.add({ title: "Saved", description: "Your changes were saved.", duration: Infinity });
  return h(m.Toaster, { store, ...props });
}) satisfies VueFixture;
