import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => {
  const store = m.createToastStore();
  store.add({ title: "Saved", description: "Your changes were saved.", duration: Infinity });
  return h(m.Toaster, { store, ...props });
}) satisfies Fixture;
