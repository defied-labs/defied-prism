import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

// The contract's `dimmed` variant is driven by the `disabled` prop
export default ((m, { dimmed, ...props }) => h(m.Label, { disabled: dimmed, ...props }, () => "Email")) satisfies VueFixture;
