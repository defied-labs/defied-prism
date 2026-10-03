import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Tooltip, { defaultOpen: true }, () => [
    h(m.TooltipTrigger, {}, () => "Save"),
    h(m.TooltipContent, props, () => "Saves your changes"),
  ])) satisfies VueFixture;
